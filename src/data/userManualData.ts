export interface ManualSubSection {
  id: string;
  title: string;
  readTime: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  contentParagraphs: string[];
  keyRulesOrTips?: string[];
  formulaOrProtocol?: string;
  appActionGuide?: {
    step: number;
    instruction: string;
  }[];
}

export interface ManualSection {
  id: string;
  category: 'philosophy' | 'setup' | 'cross_border' | 'models' | 'analysis';
  title: string;
  iconName: string;
  shortDesc: string;
  subsections: ManualSubSection[];
}

export const USER_MANUAL_CATEGORIES = [
  { id: 'all', label: 'All Guides' },
  { id: 'philosophy', label: '3-Bucket Philosophy' },
  { id: 'setup', label: 'Simulation Setup' },
  { id: 'cross_border', label: 'Multi-Market Assets' },
  { id: 'models', label: 'Analytical Models' },
  { id: 'analysis', label: 'Charts & Waterfall Refills' },
] as const;

export const USER_MANUAL_SECTIONS: ManualSection[] = [
  {
    id: 'section_1_philosophy',
    category: 'philosophy',
    title: '1. Introduction to the 3-Bucket Philosophy',
    iconName: 'Shield',
    shortDesc: 'Eliminate Sequence-of-Returns Risk by segmenting your retirement wealth across distinct time horizons.',
    subsections: [
      {
        id: 'philosophy_core_concept',
        title: 'The Core Dilemma: Sequence-of-Returns Risk',
        readTime: '2 min',
        level: 'Beginner',
        summary: 'Why withdrawing living expenses during market crashes destroys traditional single-portfolio retirement plans.',
        contentParagraphs: [
          'In retirement, timing is everything. If you retire right before a severe bear market (like 2000 or 2008) and fund your daily groceries by selling stocks that just crashed 30% to 50%, you lock in permanent capital destruction.',
          'Even if the market later recovers to all-time highs, your portfolio may never recover because you sold shares at the bottom. This lethal mathematical phenomenon is called Sequence-of-Returns Risk.',
          'The 3-Bucket Strategy solves this by uncoupling your daily living expenses from equity market volatility. You never sell stocks when they are bleeding.'
        ],
        keyRulesOrTips: [
          'Rule #1: Daily living expenses must only be paid from guaranteed cash, never volatile equities.',
          'Rule #2: Bucket 2 (Debt/Fixed Income) acts as an armored buffer to absorb prolonged recessions.',
          'Rule #3: Bucket 3 (Equities) must have at least 8 to 12 years of unhindered compounding runway.'
        ]
      },
      {
        id: 'philosophy_bucket_1',
        title: 'Bucket 1 (Cash & High Liquidity — Years 1 to 3 or 4)',
        readTime: '2 min',
        level: 'Beginner',
        summary: 'Immediate day-to-day liquidity with zero nominal capital risk.',
        contentParagraphs: [
          'Bucket 1 is your family’s emotional and financial peace of mind. It stores 1 to 3 (or 4) full years of living expenses in cash and cash-equivalent instruments.',
          'Because your immediate cash needs are guaranteed for several years, short-term stock market panics, geopolitical events, or economic recessions have zero impact on your day-to-day lifestyle.',
          'Suitable instruments include high-yield savings accounts, short-term bank fixed deposits, Treasury bills, and liquid money market mutual funds.'
        ],
        keyRulesOrTips: [
          'Target Size: Annual Living Expense × Bucket 1 Tenure (e.g. ₹6 Lakhs/yr × 3 Y = ₹18 Lakhs).',
          'Primary Objective: 100% Capital preservation and instant liquidity, not high return generation.'
        ]
      },
      {
        id: 'philosophy_bucket_2',
        title: 'Bucket 2 (Income & Stability Buffer — Years 4 to 10 or 12)',
        readTime: '3 min',
        level: 'Intermediate',
        summary: 'The defensive moat protecting equities during multi-year downturns.',
        contentParagraphs: [
          'Bucket 2 holds 3 to 8 (or up to 10) years of living expenses in conservative, income-generating debt and fixed-income assets.',
          'Its primary operational job is twofold: (1) Generate steady yield to refill Bucket 1 cash each year, and (2) Provide 5+ years of shelter during bear markets so Bucket 3 equities are NEVER liquidated under distress.',
          'Suitable instruments include sovereign government bonds, AAA corporate bonds, target maturity debt funds, and conservative dividend/annuity assets.'
        ],
        formulaOrProtocol: 'B2 Buffer Endurance = B2 Corpus / Next Year Living Expense (Should be >= 4.0x)',
        keyRulesOrTips: [
          'During bull markets, Bucket 2 receives rebalanced capital gains harvested from Bucket 3.',
          'During bear markets, Bucket 2 sustains Bucket 1 all by itself, giving stocks time to rebound.'
        ]
      },
      {
        id: 'philosophy_bucket_3',
        title: 'Bucket 3 (Long-Term Growth & Inflation Defense — Years 11+ or 13+)',
        readTime: '3 min',
        level: 'Advanced',
        summary: 'Unconstrained equity compounding to defeat multi-decade inflation.',
        contentParagraphs: [
          'Over a 30 to 50-year retirement, inflation is a silent portfolio killer. A 6% inflation rate cuts purchasing power in half every 12 years.',
          'Cash and debt cannot beat long-term inflation. Only equities and growth assets possess the pricing power to compound ahead of inflation.',
          'Because Buckets 1 and 2 give you 7 to 14 years of combined cash flow runway, Bucket 3 is completely insulated from short-term market noise. It can ride out deep crashes and generate substantial real surplus.'
        ],
        keyRulesOrTips: [
          'Suitable Instruments: Broad-market index funds (Nifty 50, S&P 500, MSCI World), bluechip equity mutual funds, and global asset ETFs.',
          'When Bucket 3 surges above its target floor, excess profits are systematically harvested into Bucket 2.'
        ]
      }
    ]
  },
  {
    id: 'section_2_simulation_setup',
    category: 'setup',
    title: '2. Step-by-Step App Simulation Guide',
    iconName: 'Sliders',
    shortDesc: 'Configure your corpus, monthly withdrawals, bucket time horizons, and return parameters.',
    subsections: [
      {
        id: 'setup_corpus_and_withdrawal',
        title: 'Setting Up Corpus, Start Date & Monthly Withdrawal',
        readTime: '3 min',
        level: 'Beginner',
        summary: 'How to enter starting capital, retirement date, and calculate a safe withdrawal rate.',
        contentParagraphs: [
          'Start by entering your Initial Retirement Corpus (e.g. ₹2 Crores or $1,000,000). You can type directly or tap the inline quick-picker (50L to 10Cr).',
          'Next, set your Retirement Start Date using the interactive calendar picker. You can choose Today, Next Year Jan 1, or milestones 3 to 5 years into the future.',
          'Enter your Expected Monthly Withdrawal needed for living expenses. For example, ₹60,000/month equates to ₹7,20,000/year.'
        ],
        appActionGuide: [
          { step: 1, instruction: 'Enter total accumulated capital in the "Initial Retirement Corpus" input.' },
          { step: 2, instruction: 'Tap the Date Picker to set your retirement start milestone.' },
          { step: 3, instruction: 'Enter desired monthly living expenses in the "Expected Monthly Withdrawal" input.' },
          { step: 4, instruction: 'Tap "Suggest Safe" (SWR) to let the actuarial engine auto-calculate a sustainable monthly baseline.' }
        ],
        keyRulesOrTips: [
          'The "Suggest Safe SWR" feature computes country-specific safe withdrawal boundaries (e.g. 3.5% to 4.5% rule adjusted for local inflation).'
        ]
      },
      {
        id: 'setup_bucket_tenures',
        title: 'Configuring Bucket Tenures & Time Horizons',
        readTime: '3 min',
        level: 'Intermediate',
        summary: 'Customizing how many years of expenses are locked into Cash, Debt Buffer, and Equities.',
        contentParagraphs: [
          'The app features an interactive timeline flow ribbon: [🟢 B1: Y1–B1] ➔ [🟡 B2: Y(B1+1)–(B1+B2)] ➔ [🟣 B3: Y(B1+B2+1)+].',
          'Use the [+] and [−] steppers or quick chips to customize Bucket 1 tenure (1 to 10 years) and Bucket 2 tenure (2 to 15 years).',
          'Notice how Bucket 3 compounding runway automatically adjusts in real-time. If B1 = 3Y and B2 = 5Y, Bucket 3 is guaranteed 8 full years of liquidation immunity!'
        ],
        appActionGuide: [
          { step: 1, instruction: 'Adjust Bucket 1 tenure (default 3 years). Observe the live target cash required.' },
          { step: 2, instruction: 'Adjust Bucket 2 tenure (default 5 years). Observe the live target debt buffer required.' },
          { step: 3, instruction: 'Review the auto-determined Bucket 3 runway card to ensure adequate long-term compounding.' }
        ]
      },
      {
        id: 'setup_bucket_roi',
        title: 'Customizing Expected Bucket ROI & Inflation',
        readTime: '2 min',
        level: 'Intermediate',
        summary: 'Fine-tuning annual return rates for Cash, Debt, and Equities with net real return indicators.',
        contentParagraphs: [
          'Under "Bucket Expected ROI (% Annual Returns)", you can customize the annual nominal returns for each bucket.',
          'The app shows Net Real Return tags (e.g. "+5.5% Real") calculated automatically after subtracting your Expected Inflation rate.',
          'Tap the "Expected Inflation" box to select historical baseline inflation (0% to 10%) or enter custom decimal rates.'
        ],
        keyRulesOrTips: [
          'Tap "Reset to Benchmark" anytime to reload verified historical central bank and market index averages for your selected country.'
        ]
      }
    ]
  },
  {
    id: 'section_3_cross_border',
    category: 'cross_border',
    title: '3. Multi-Market & Cross-Border Modeling Guide',
    iconName: 'Globe',
    shortDesc: 'Model localized country parameters and blend international equity exposures to eliminate home-country bias.',
    subsections: [
      {
        id: 'cross_border_market_selection',
        title: 'Selecting a Base Country Market',
        readTime: '2 min',
        level: 'Beginner',
        summary: 'Loading real-world inflation, volatility, and bond yields for 10 international economies.',
        contentParagraphs: [
          'Retirement in India (INR) operates under different macroeconomic dynamics than in the US (USD) or UK (GBP). Inflation, risk-free bond yields, and stock market volatility vary significantly.',
          'Selecting a base country automatically loads calibrated parameters: nominal mean returns, historical standard deviations, and currency denominations across India, US, UK, Eurozone, Singapore, Australia, Canada, Japan, UAE, and Switzerland.',
          'All calculations, currency symbols, and axis values instantly re-index to the chosen economic jurisdiction.'
        ]
      },
      {
        id: 'cross_border_asset_blending',
        title: 'Blending Foreign Equities in Bucket 3',
        readTime: '3 min',
        level: 'Advanced',
        summary: 'Diversifying across global markets to hedge domestic currency depreciation.',
        contentParagraphs: [
          'Relying solely on your domestic stock market exposes your retirement to single-country geopolitical and regulatory risks.',
          'Under the Country Selector bar, configure the Foreign Allocation Slider (e.g., 70% Domestic Equity + 30% US S&P 500 / Global Index).',
          'The simulation dynamically computes a blended return and blended volatility curve, reflecting real-world cross-border diversification benefits.'
        ],
        formulaOrProtocol: 'Blended Return = (Weight_Domestic × Return_Domestic) + (Weight_Foreign × Return_Foreign)'
      }
    ]
  },
  {
    id: 'section_4_analytical_models',
    category: 'models',
    title: '4. Advanced Analytical Models & Scenario Stress Testing',
    iconName: 'Cpu',
    shortDesc: 'Go beyond static averages: compare Monte Carlo risk cones, historical crisis replays, and stress shocks.',
    subsections: [
      {
        id: 'models_monte_carlo',
        title: 'Monte Carlo Stochastic Risk Cones (P10, P50, P90)',
        readTime: '4 min',
        level: 'Advanced',
        summary: 'Simulating 1,000 randomized market futures to identify your true probability of success.',
        contentParagraphs: [
          'Single-line projection graphs give a false sense of certainty. In reality, markets experience randomized sequence volatility.',
          'Our Monte Carlo engine executes 1,000 distinct paths with randomized annual returns and inflation volatility.',
          'The resulting Risk Cone illustrates expanding uncertainty over time:',
          '• P90 (Top 10% Bull Outcome): Optimistic trajectory where early bull markets create generational legacy surplus.',
          '• P50 (Median Trajectory): The realistic baseline path with 50% probability of outperforming or underperforming.',
          '• P10 (Stress Bear Floor): The 90% confidence survival threshold. If your portfolio survives at P10, your plan is virtually bulletproof!'
        ],
        keyRulesOrTips: [
          'In retirement planning, a P10 survival rate of 85%+ represents institutional-grade safety.'
        ]
      },
      {
        id: 'models_historical_backtesting',
        title: 'Historical Crisis Backtesting (2008 GFC, 2000 Dot-Com, 1973)',
        readTime: '3 min',
        level: 'Intermediate',
        summary: 'Replaying actual historical market crises to prove strategy resilience.',
        contentParagraphs: [
          'Instead of synthetic math, Historical Backtesting subjects your portfolio to exact historical crisis return sequences:',
          '• 2008 Global Financial Crisis: Equities dropped -37.5% while high-quality debt surged, followed by a multi-year recovery.',
          '• 2000 Dot-Com Tech Crash: Three brutal consecutive down years in growth equities.',
          '• 1973 Stagflation Shock: Double-digit inflation combined with a severe economic recession.',
          '• 2020 Pandemic Shock: Rapid crash followed by swift stimulus rebound and 2022 rate hikes.'
        ]
      },
      {
        id: 'models_stress_testing_and_goals',
        title: 'Macro Stress Shocks & Goals-Based Wealth Management (GBWM)',
        readTime: '3 min',
        level: 'Intermediate',
        summary: 'Evaluating sudden simultaneous shocks and major planned life milestones.',
        contentParagraphs: [
          'Deterministic Stress Testing applies severe hypothetical shocks: e.g. an instant 30% stock crash coupled with an 8% inflation spike.',
          'Goals-Based Wealth Management (GBWM) incorporates lump-sum capital milestones (e.g., Year 5 Child Education ₹25 Lakhs, Year 12 Vacation Home ₹50 Lakhs).',
          'The model tracks whether prioritized bucket allocations fund every milestone without jeopardizing routine retirement living expenses.'
        ]
      }
    ]
  },
  {
    id: 'section_5_analysis_and_export',
    category: 'analysis',
    title: '5. Reading Outputs, Waterfall Refills & Data Exports',
    iconName: 'BarChart2',
    shortDesc: 'Interpret projection trajectories, understand automated rebalancing waterfall mechanics, and export spreadsheets.',
    subsections: [
      {
        id: 'analysis_charts_and_inspector',
        title: 'Navigating the Interactive Chart & Inspector Card',
        readTime: '2 min',
        level: 'Beginner',
        summary: 'Using tabs, zoom buttons, and the interactive timeline scrubber.',
        contentParagraphs: [
          'Switch chart views using the top tabs: [📊 Stacked Breakdown], [🎲 Monte Carlo Cone], [⚡ Active Model], and [⚖️ Cross-Model Overlay].',
          'Use the zoom horizon chips (10Y, 20Y, 30Y, 50Y, 80Y) to inspect near-term or multi-decade longevity.',
          'Touch or scrub across the chart: the Interactive Year Inspector Card instantly updates to show exact ending balances (B1 Cash, B2 Debt, B3 Equity), annual withdrawals, and rebalancing transfers for that chosen year.'
        ]
      },
      {
        id: 'analysis_waterfall_refill_protocol',
        title: 'The Year-on-Year Bucket Transfer & Refill Protocol',
        readTime: '3 min',
        level: 'Advanced',
        summary: 'How capital flows annually: Living expenses paid ➔ B2 refills B1 ➔ B3 harvests to B2 ➔ Bear Defense.',
        contentParagraphs: [
          'Expand the "Year-on-Year Bucket Transfer Schedule" table below the chart to see the chronological waterfall mechanics:',
          'Step 1 (Living Expense): Debited exclusively from Bucket 1 Cash at the beginning of the year.',
          'Step 2 (B2 ➔ B1 Refill): If Bucket 1 falls below its target cash floor, Bucket 2 transfers the required cash replenishment.',
          'Step 3 (B3 ➔ B2 Harvest): If Bucket 3 generates profits above its target equity baseline, excess gains are systematically harvested into Bucket 2.',
          '🛡️ Bear Market Defense Protocol: During crash years (r3 < 0), if Bucket 2 has >= 1.5x annual living expenses, all equity liquidations are FROZEN (B3 ➔ B2 = ₹0). Bucket 2 absorbs living expenses alone, protecting your stocks from fire-sales!'
        ],
        formulaOrProtocol: 'Defensive Trigger: If (r3 < 0 AND B2 > 1.5 × Expense) THEN B3_to_B2_Harvest = 0'
      },
      {
        id: 'analysis_export_breakdown',
        title: 'Exporting Data Breakdown (CSV & Excel)',
        readTime: '2 min',
        level: 'Beginner',
        summary: 'Exporting complete year-by-year mathematical simulation spreadsheets for personal records or advisor review.',
        contentParagraphs: [
          'Tap the "Export Calculation Breakdown" button in the Action Bar.',
          'The app compiles a structured CSV / spreadsheet containing every single simulated year: Starting Balances, Inflation-Adjusted Withdrawals, B2-to-B1 Refills, B3-to-B2 Harvests, Friction Costs, and Ending Balances.',
          'On mobile, this opens the native iOS / Android share sheet to save to Files, Google Drive, or send via email.'
        ]
      }
    ]
  }
];
