/**
 * Three-Bucket Strategy Simulation - Backend API Server
 * Production REST API for Render Deployment
 * 
 * Endpoints:
 * - GET  /healthz                 - Liveness/Readiness probe for Render
 * - GET  /api/info                - Service information & capabilities
 * - POST /api/simulate            - Run retirement simulation calculation
 * - POST /api/monte-carlo         - Run Monte Carlo multi-path simulation
 * - GET  /api/market/benchmarks   - Historical asset class returns & inflation
 * - POST /api/strategies/save     - Save strategy configuration to cloud
 * - GET  /api/strategies/:id      - Retrieve saved strategy by ID
 */

const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, '..', 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.map': 'application/json',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// In-memory store for strategies (can be backed by Postgres/Redis via DATABASE_URL)
const strategiesStore = new Map();

// Default seed strategy
strategiesStore.set('sample-balanced', {
  id: 'sample-balanced',
  name: 'Sample Balanced 30Y Retirement',
  createdAt: new Date().toISOString(),
  inputs: {
    totalCorpus: 30000000, // 3 Cr
    monthlyExpenses: 100000, // 1 Lakh
    b1Years: 3,
    b2Years: 7,
    b1Return: 6.0,
    b2Return: 8.5,
    b3Return: 12.0,
    inflationRate: 6.0,
    timeHorizonYears: 30,
    emergencyFundMonths: 6,
    b3FloorThreshold: 15,
  }
});

// Helper: Send JSON response with CORS headers
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  });
  res.end(JSON.stringify(data, null, 2));
}

// Helper: Parse JSON request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // Guard against payloads > 1MB
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Core Simulation Math (Server-Side)
function runSimulation(params) {
  const {
    totalCorpus = 25000000,
    monthlyExpenses = 85000,
    b1Years = 3,
    b2Years = 7,
    b1Return = 6.0,
    b2Return = 8.5,
    b3Return = 12.0,
    inflationRate = 6.0,
    timeHorizonYears = 30,
    emergencyFundMonths = 6,
  } = params;

  const annualExpense = monthlyExpenses * 12;
  const emergencyFund = (monthlyExpenses * emergencyFundMonths);
  const investableCorpus = Math.max(0, totalCorpus - emergencyFund);

  // Initial allocation
  const initialB1 = Math.min(investableCorpus, annualExpense * b1Years);
  const initialB2 = Math.min(investableCorpus - initialB1, annualExpense * b2Years);
  const initialB3 = Math.max(0, investableCorpus - initialB1 - initialB2);

  let b1 = initialB1;
  let b2 = initialB2;
  let b3 = initialB3;
  let currentExpense = annualExpense;
  let totalWithdrawn = 0;
  let corpusDepletedYear = null;

  const yearlyRows = [];

  for (let year = 1; year <= timeHorizonYears; year++) {
    const startTotal = b1 + b2 + b3;
    const expenseThisYear = currentExpense;

    // Withdrawal from Bucket 1
    let withdrawnFromB1 = 0;
    if (b1 >= expenseThisYear) {
      b1 -= expenseThisYear;
      withdrawnFromB1 = expenseThisYear;
    } else {
      withdrawnFromB1 = b1;
      const shortfall = expenseThisYear - b1;
      b1 = 0;
      // Draw shortfall from B2
      if (b2 >= shortfall) {
        b2 -= shortfall;
      } else {
        const b2Shortfall = shortfall - b2;
        b2 = 0;
        // Draw remainder from B3
        b3 = Math.max(0, b3 - b2Shortfall);
      }
    }

    totalWithdrawn += expenseThisYear;

    // Growth phase
    const b1Growth = b1 * (b1Return / 100);
    const b2Growth = b2 * (b2Return / 100);
    const b3Growth = b3 * (b3Return / 100);

    b1 += b1Growth;
    b2 += b2Growth;
    b3 += b3Growth;

    // Refill check: If B1 < Target (b1Years * next expense), refill from B2 or B3
    const nextYearExpense = currentExpense * (1 + inflationRate / 100);
    const b1Target = nextYearExpense * b1Years;
    let refilledB1 = 0;

    if (b1 < b1Target && b2 > 0) {
      const needed = b1Target - b1;
      const transfer = Math.min(needed, b2 * 0.35); // rebalance buffer
      b2 -= transfer;
      b1 += transfer;
      refilledB1 += transfer;
    }

    const endTotal = b1 + b2 + b3;

    if (endTotal <= 0 && corpusDepletedYear === null) {
      corpusDepletedYear = year;
    }

    yearlyRows.push({
      year,
      startTotal: Math.round(startTotal),
      expense: Math.round(expenseThisYear),
      b1End: Math.round(b1),
      b2End: Math.round(b2),
      b3End: Math.round(b3),
      endTotal: Math.round(endTotal),
      refilledB1: Math.round(refilledB1),
    });

    currentExpense = nextYearExpense;
  }

  const endingCorpus = Math.round(b1 + b2 + b3);
  const successRate = corpusDepletedYear === null ? 100 : Math.round((corpusDepletedYear / timeHorizonYears) * 100);

  return {
    summary: {
      initialCorpus: totalCorpus,
      investableCorpus,
      emergencyFund,
      totalWithdrawn: Math.round(totalWithdrawn),
      endingCorpus,
      corpusDepletedYear,
      isSuccess: corpusDepletedYear === null,
      successRate,
      initialAllocation: {
        b1: Math.round(initialB1),
        b2: Math.round(initialB2),
        b3: Math.round(initialB3),
        b1Pct: Math.round((initialB1 / investableCorpus) * 100),
        b2Pct: Math.round((initialB2 / investableCorpus) * 100),
        b3Pct: Math.round((initialB3 / investableCorpus) * 100),
      }
    },
    yearlyRows,
  };
}

// Monte Carlo Simulation Engine
function runMonteCarlo(params) {
  const iterations = Math.min(params.iterations || 250, 1000);
  const {
    totalCorpus = 25000000,
    monthlyExpenses = 85000,
    b1Years = 3,
    b2Years = 7,
    b1ReturnMean = 6.0,
    b2ReturnMean = 8.5,
    b3ReturnMean = 12.0,
    b3ReturnStdDev = 15.0,
    inflationMean = 6.0,
    timeHorizonYears = 30,
  } = params;

  let successfulRuns = 0;
  const finalBalances = [];

  for (let i = 0; i < iterations; i++) {
    // Normal distribution box-muller approximation
    const u1 = Math.random() || 0.0001;
    const u2 = Math.random() || 0.0001;
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

    const randomizedB3Return = b3ReturnMean + (z * (b3ReturnStdDev * 0.4));
    const randomizedInflation = Math.max(3.0, inflationMean + (z * 0.5));

    const result = runSimulation({
      totalCorpus,
      monthlyExpenses,
      b1Years,
      b2Years,
      b1Return: b1ReturnMean,
      b2Return: b2ReturnMean,
      b3Return: randomizedB3Return,
      inflationRate: randomizedInflation,
      timeHorizonYears,
    });

    if (result.summary.isSuccess) {
      successfulRuns++;
    }
    finalBalances.push(result.summary.endingCorpus);
  }

  finalBalances.sort((a, b) => a - b);
  const p10 = finalBalances[Math.floor(iterations * 0.1)];
  const p50 = finalBalances[Math.floor(iterations * 0.5)];
  const p90 = finalBalances[Math.floor(iterations * 0.9)];

  return {
    iterations,
    successProbability: Math.round((successfulRuns / iterations) * 100),
    successfulRuns,
    failedRuns: iterations - successfulRuns,
    percentiles: {
      p10Pessimistic: p10,
      p50Median: p50,
      p90Optimistic: p90,
    }
  };
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    });
    return res.end();
  }

  try {
    // Health Check / Liveness probe for Render
    if ((pathname === '/healthz' || pathname === '/health') && (method === 'GET' || method === 'HEAD')) {
      if (method === 'HEAD') {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        return res.end();
      }
      return sendJSON(res, 200, {
        status: 'healthy',
        service: 'three-bucket-api',
        version: '2.0.0',
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
      });
    }

    // Service Info
    if (pathname === '/api/info' && method === 'GET') {
      return sendJSON(res, 200, {
        name: '3-Bucket Strategy Simulation API',
        version: '2.0.0',
        documentation: 'https://github.com/adk113/three-bucket-strategy-simulation',
        endpoints: [
          'GET  /healthz',
          'GET  /api/info',
          'POST /api/simulate',
          'POST /api/monte-carlo',
          'GET  /api/market/benchmarks',
          'POST /api/strategies/save',
          'GET  /api/strategies/:id',
        ]
      });
    }

    // Run Simulation
    if (pathname === '/api/simulate' && method === 'POST') {
      const body = await parseBody(req);
      const simulation = runSimulation(body);
      return sendJSON(res, 200, {
        success: true,
        data: simulation,
      });
    }

    // Monte Carlo Analysis
    if (pathname === '/api/monte-carlo' && method === 'POST') {
      const body = await parseBody(req);
      const mc = runMonteCarlo(body);
      return sendJSON(res, 200, {
        success: true,
        data: mc,
      });
    }

    // Market Benchmarks
    if (pathname === '/api/market/benchmarks' && method === 'GET') {
      return sendJSON(res, 200, {
        success: true,
        data: {
          assetClasses: {
            bucket1Cash: {
              name: 'Liquid & Fixed Deposits (Bucket 1)',
              expectedAnnualReturn: '5.5% - 6.5%',
              historicalStdDev: '0.8%',
              recommendedHorizon: '1 - 3 Years',
              taxEfficiency: 'As per slab rate',
            },
            bucket2Debt: {
              name: 'Short / Medium Term Debt & Hybrid (Bucket 2)',
              expectedAnnualReturn: '7.5% - 9.0%',
              historicalStdDev: '2.5%',
              recommendedHorizon: '4 - 10 Years',
              taxEfficiency: 'Indexation / Marginal',
            },
            bucket3Equity: {
              name: 'Diversified Broad-Market Equities (Bucket 3)',
              expectedAnnualReturn: '11.0% - 13.5%',
              historicalStdDev: '15.2%',
              recommendedHorizon: '10+ Years',
              taxEfficiency: '12.5% LTCG (> ₹1.25L exemption)',
            }
          },
          historicalInflation: {
            indiaCPIAverage10Y: '5.5%',
            indiaCPIAverage20Y: '6.2%',
            recommendedPlanningInflation: '6.0% - 7.0%',
          }
        }
      });
    }

    // Save Strategy
    if (pathname === '/api/strategies/save' && method === 'POST') {
      const body = await parseBody(req);
      const id = body.id || 'strat_' + Math.random().toString(36).substring(2, 9);
      const strategyRecord = {
        id,
        name: body.name || 'Custom Retirement Plan',
        createdAt: new Date().toISOString(),
        inputs: body.inputs || {},
      };
      strategiesStore.set(id, strategyRecord);
      return sendJSON(res, 201, {
        success: true,
        message: 'Strategy saved successfully',
        id,
        data: strategyRecord,
      });
    }

    // Get Strategy by ID
    if (pathname.startsWith('/api/strategies/') && method === 'GET') {
      const id = pathname.replace('/api/strategies/', '');
      if (strategiesStore.has(id)) {
        return sendJSON(res, 200, {
          success: true,
          data: strategiesStore.get(id),
        });
      } else {
        return sendJSON(res, 404, {
          success: false,
          error: 'Strategy not found',
        });
      }
    }

    // Static Web App Serving (SPA Fallback from ./dist)
    if (method === 'GET' || method === 'HEAD') {
      return serveStaticFile(req, res, pathname);
    }

    // Fallback 404 for unrecognized non-GET methods
    sendJSON(res, 404, {
      error: 'Not Found',
      message: `Endpoint ${method} ${pathname} does not exist.`
    });
  } catch (error) {
    console.error('API Error:', error);
    sendJSON(res, 500, {
      success: false,
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

function serveStaticFile(req, res, reqPath) {
  if (!fs.existsSync(DIST_DIR)) {
    return sendJSON(res, 200, {
      status: 'healthy',
      message: '3-Bucket Strategy API running. Build web frontend with "npm run build:web" to serve static assets.',
      apiDocumentation: '/api/info',
    });
  }

  // Normalize path & prevent directory traversal
  let safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '' || safePath === '\\') {
    safePath = '/index.html';
  }

  let filePath = path.join(DIST_DIR, safePath);

  // If path has no extension, check for .html or subdirectory index.html
  if (!path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    } else {
      filePath = path.join(DIST_DIR, 'index.html');
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA Fallback: serve index.html for unknown client routes
      const fallbackIndex = path.join(DIST_DIR, 'index.html');
      if (fs.existsSync(fallbackIndex)) {
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache',
        });
        return fs.createReadStream(fallbackIndex).pipe(res);
      }
      return sendJSON(res, 404, { error: 'Not Found' });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const isImmutable = ext !== '.html' && ext !== '.json';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': isImmutable ? 'public, max-age=31536000, immutable' : 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });

    if (req.method === 'HEAD') {
      return res.end();
    }

    fs.createReadStream(filePath).pipe(res);
  });
}

server.listen(PORT, () => {
  console.log(`🚀 Three-Bucket Strategy Full-Stack Server running on port ${PORT}`);
  console.log(`   Health Check: http://localhost:${PORT}/healthz`);
  console.log(`   API Info:     http://localhost:${PORT}/api/info`);
  console.log(`   Web App:      http://localhost:${PORT}/`);
});
