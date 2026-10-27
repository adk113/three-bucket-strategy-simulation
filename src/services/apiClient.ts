/**
 * Backend API Client for 3-Bucket Strategy Mobile & Web App
 * Connects to Render backend API with offline fallback.
 */

// Default backend Render URL (configurable via EXPO_PUBLIC_API_URL)
export const RENDER_API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_URL || 
  'https://three-bucket-api.onrender.com';

export interface BackendHealthResponse {
  status: string;
  service: string;
  version: string;
  uptime: number;
  timestamp: string;
}

export interface MarketBenchmarksResponse {
  assetClasses: Record<string, any>;
  historicalInflation: Record<string, string>;
}

export const apiClient = {
  /**
   * Check backend server health
   */
  async checkHealth(): Promise<BackendHealthResponse | null> {
    try {
      const response = await fetch(`${RENDER_API_BASE_URL}/healthz`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Fetch live/historical asset benchmarks from backend
   */
  async getMarketBenchmarks(): Promise<MarketBenchmarksResponse | null> {
    try {
      const response = await fetch(`${RENDER_API_BASE_URL}/api/market/benchmarks`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (response.ok) {
        const json = await response.json();
        return json.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Run server-side simulation
   */
  async runServerSimulation(inputs: any) {
    try {
      const response = await fetch(`${RENDER_API_BASE_URL}/api/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(inputs),
      });
      if (response.ok) {
        const json = await response.json();
        return json.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Save strategy to cloud via backend
   */
  async saveStrategyToCloud(name: string, inputs: any) {
    try {
      const response = await fetch(`${RENDER_API_BASE_URL}/api/strategies/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ name, inputs }),
      });
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};
