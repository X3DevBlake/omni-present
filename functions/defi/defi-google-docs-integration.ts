import { base44 } from '@/api/base44Client';

export async function createDeFiStrategyDocument(userEmail, portfolioData) {
  try {
    // Create comprehensive strategy document in Google Docs
    const doc = await base44.integrations.Core.InvokeLLM({
      prompt: `Create DeFi Strategy Document in Google Docs:
      
User: ${userEmail}
Portfolio: ${JSON.stringify(portfolioData)}

Document structure:
1. Cover Page
   - Title: "DeFi Strategy & Portfolio Report"
   - Date: Current
   - Updated: Auto-update indicator
   
2. Executive Summary
   - Total Portfolio Value
   - Overall APY
   - Risk Level
   - Key Metrics
   
3. Portfolio Composition
   - Breakdown by protocol
   - Allocation percentages
   - Value by token
   
4. Active Positions
   - Farm/Pool details
   - APY and earnings
   - Risk factors
   - IL exposure
   
5. Performance Tracking
   - Monthly charts
   - YTD returns
   - Gas costs
   - Net yield
   
6. Upcoming Actions
   - Scheduled transactions
   - Rebalancing plans
   - New opportunities`,
      response_json_schema: {
        type: 'object',
        properties: {
          docId: { type: 'string' },
          docLink: { type: 'string' },
          lastUpdated: { type: 'string' },
        },
      },
    });

    return doc;
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
}

export async function updateDeFiDocumentAutomatically(docId, latestData) {
  try {
    // Auto-update document with latest data
    await base44.integrations.Core.InvokeLLM({
      prompt: `Update DeFi Google Docs automatically:
      
DocID: ${docId}
Data: ${JSON.stringify(latestData)}

Update sections:
1. Refresh all metrics and values
2. Update charts with latest data
3. Add new transaction entries
4. Update risk assessments
5. Generate new recommendations
6. Timestamp update
7. Email notification of changes`,
    });
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

export async function generateMonthlyDeFiReport(userEmail, monthData) {
  try {
    const report = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate Monthly DeFi Report in Google Docs:
      
User: ${userEmail}
MonthData: ${JSON.stringify(monthData)}

Create professional monthly report with:
1. Performance Summary
   - Starting and ending portfolio values
   - Total gains/losses
   - ROI percentage
   
2. Daily Activity Log
   - All transactions
   - Gas costs
   - Swap details
   
3. Yields Earned
   - By protocol/farm
   - Daily compound tracking
   - Reinvestment analysis
   
4. Risk Analysis
   - Liquidation risks tracked
   - Smart contract updates
   - Market volatility
   
5. Comparative Analysis
   - vs benchmarks
   - vs peer performance
   - vs strategy targets
   
6. Recommendations
   - Optimization opportunities
   - Rebalancing needs
   - New strategies to consider`,
    });

    return report;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}

export async function createTransactionLog(userEmail) {
  try {
    const log = await base44.integrations.Core.InvokeLLM({
      prompt: `Create DeFi Transaction Log in Google Docs:
      
User: ${userEmail}

Create structured transaction log template with:
1. Transaction Date/Time
2. Type (Deposit/Withdraw/Swap/Farm)
3. Token In / Token Out
4. Amount
5. Gas Fee
6. Protocol/Pool
7. APY/Returns
8. Notes
9. Status (Pending/Confirmed/Failed)
10. Link to TX Hash

Setup for auto-population from blockchain data.`,
    });

    return log;
  } catch (error) {
    console.error('Error creating log:', error);
    throw error;
  }
}