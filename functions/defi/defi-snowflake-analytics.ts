import { base44 } from '@/api/base44Client';

export async function setupDeFiSnowflakeWarehouse(userEmail) {
  try {
    const warehouse = await base44.integrations.Core.InvokeLLM({
      prompt: `Setup DeFi Snowflake Data Warehouse:
      
User: ${userEmail}

Create comprehensive Snowflake schema:
1. Portfolio Tables
   - daily_snapshots (date, values, composition)
   - position_history (all positions over time)
   - balance_ledger (detailed balance tracking)
   
2. Yield Tables
   - yield_earnings (daily earnings by farm)
   - apy_tracking (historical APY changes)
   - pool_performance (pool metrics over time)
   
3. Transaction Tables
   - transactions (all onchain transactions)
   - swaps (token swaps with rates)
   - gas_costs (detailed gas analysis)
   
4. Risk Tables
   - liquidation_risks (risk metrics over time)
   - impermanent_loss (IL tracking)
   - smart_contract_risks (audit findings)
   
5. Analytics Views
   - monthly_returns
   - ytd_performance
   - gas_efficiency
   - roi_analysis
   - comparative_metrics

Setup automatic daily data sync.`,
    });

    return warehouse;
  } catch (error) {
    console.error('Error setting up warehouse:', error);
    throw error;
  }
}

export async function syncDeFiDataToSnowflakeDaily(userEmail, defiData) {
  try {
    // Automated daily sync
    const sync = await base44.integrations.Core.InvokeLLM({
      prompt: `Sync DeFi data to Snowflake daily:
      
User: ${userEmail}
Data: ${JSON.stringify(defiData)}

Sync:
1. Current portfolio snapshot
2. All transaction activity from past 24h
3. Updated yield metrics
4. Risk assessments
5. Gas price data
6. Pool/Farm metrics
7. Price data for all tokens

Timestamp each record and handle incremental updates.`,
    });

    return sync;
  } catch (error) {
    console.error('Error syncing data:', error);
    throw error;
  }
}

export async function generateSnowflakeAnalytics(userEmail, dateRange) {
  try {
    const analytics = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate DeFi analytics from Snowflake:
      
User: ${userEmail}
DateRange: ${dateRange}

Query Snowflake for:
1. Total gains/losses
2. Average daily yield
3. Yield by protocol breakdown
4. Gas costs analysis
5. ROI calculations
6. Volatility metrics
7. Best performing periods
8. Risk metrics over time
9. Liquidity trends
10. Recommendations based on patterns`,
      response_json_schema: {
        type: 'object',
        properties: {
          totalGains: { type: 'number' },
          avgDailyYield: { type: 'number' },
          protocolBreakdown: { type: 'object' },
          gasAnalysis: { type: 'object' },
          roi: { type: 'number' },
          riskMetrics: { type: 'object' },
        },
      },
    });

    return analytics;
  } catch (error) {
    console.error('Error generating analytics:', error);
    throw error;
  }
}

export async function createDeFiDataVisualization(userEmail) {
  try {
    // Create Snowflake-connected visualization queries
    const visualization = await base44.integrations.Core.InvokeLLM({
      prompt: `Create Snowflake visualization queries for DeFi:
      
User: ${userEmail}

Create SQL queries for:
1. Portfolio Value Over Time (line chart)
2. Yield by Protocol (pie chart)
3. Daily Returns (bar chart)
4. Gas Costs Trend (area chart)
5. Risk Metrics (gauge charts)
6. APY Comparison (comparison chart)
7. ROI by Month (column chart)
8. Token Distribution (treemap)

Setup automatic daily refresh.`,
    });

    return visualization;
  } catch (error) {
    console.error('Error creating visualization:', error);
    throw error;
  }
}