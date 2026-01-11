import { base44 } from '@/api/base44Client';

export async function orchestrateDeFiWorkflows(userEmail, defiConfig) {
  try {
    // Master orchestration of all DeFi workflows
    const [workflows, analysis, documentation, alerts] = await Promise.all([
      createDeFiZapierWorkflows(userEmail, defiConfig),
      generateDeFiAnalysis(defiConfig),
      generateDeFiDocumentation(userEmail, defiConfig),
      setupDeFiAlerts(userEmail, defiConfig),
    ]);

    // Sync all data to Snowflake
    await syncDeFiDataToSnowflake(userEmail, { workflows, analysis, documentation });

    // Send notifications
    await notifyDeFiStatus(userEmail, { workflows, analysis });

    return {
      workflows,
      analysis,
      documentation,
      alerts,
      orchestratedAt: new Date(),
    };
  } catch (error) {
    console.error('Error orchestrating DeFi workflows:', error);
    throw error;
  }
}

async function createDeFiZapierWorkflows(userEmail, defiConfig) {
  try {
    const workflows = await base44.integrations.Core.InvokeLLM({
      prompt: `Create comprehensive DeFi Zapier workflows:
      
User: ${userEmail}
Config: ${JSON.stringify(defiConfig)}

Create workflows for:
1. Yield Farming Optimization
   - Monitor pool APYs
   - Auto-rebalance on threshold
   - Sync results to Google Docs
   
2. Portfolio Rebalancing
   - Track portfolio drift
   - Trigger rebalancing notifications
   - Log decisions in Google Docs
   
3. Risk Management
   - Monitor liquidation risks
   - Alert via Twilio when needed
   - Document in Google Docs
   
4. Gas Fee Optimization
   - Monitor network gas prices
   - Schedule transactions for low fees
   - Report to Snowflake
   
5. Cross-Chain Monitoring
   - Track bridge transactions
   - Monitor arbitrage opportunities
   - Gemini analysis and recommendations

For each workflow include:
- Trigger conditions
- Actions (Zapier app connections)
- Google Docs integration
- Snowflake sync
- Notification settings`,
      response_json_schema: {
        type: 'object',
        properties: {
          workflows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                trigger: { type: 'string' },
                actions: { type: 'array', items: { type: 'string' } },
                googleDocsIntegration: { type: 'object' },
                snowflakeSync: { type: 'object' },
              },
            },
          },
        },
      },
    });

    return workflows.workflows;
  } catch (error) {
    console.error('Error creating DeFi workflows:', error);
    throw error;
  }
}

async function generateDeFiAnalysis(defiConfig) {
  try {
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate comprehensive DeFi analysis with Gemini:
      
Config: ${JSON.stringify(defiConfig)}

Analyze:
1. Yield Farm Performance
   - APY analysis and trends
   - Risk assessment
   - Optimization recommendations
   
2. Portfolio Health
   - Current composition
   - Diversification score
   - Rebalancing suggestions
   
3. Market Opportunities
   - Arbitrage opportunities
   - Emerging high-yield pools
   - Cross-chain opportunities
   
4. Risk Metrics
   - Smart contract risks
   - Impermanent loss exposure
   - Liquidation distance
   
5. Gas Efficiency
   - Current gas costs
   - Optimal transaction timing
   - Historical patterns`,
      response_json_schema: {
        type: 'object',
        properties: {
          yieldAnalysis: { type: 'object' },
          portfolioHealth: { type: 'object' },
          opportunities: { type: 'array', items: { type: 'object' } },
          risks: { type: 'array', items: { type: 'object' } },
          gasAnalysis: { type: 'object' },
          recommendations: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return analysis;
  } catch (error) {
    console.error('Error generating analysis:', error);
    throw error;
  }
}

async function generateDeFiDocumentation(userEmail, defiConfig) {
  try {
    const doc = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate DeFi strategy document in Google Docs:
      
User: ${userEmail}
Config: ${JSON.stringify(defiConfig)}

Create comprehensive Google Docs document with:
1. Executive Summary
2. Current Portfolio Snapshot
3. Strategy Overview
4. Active Yield Farms with details
5. Risk Analysis
6. Monthly Performance Report
7. Recommendations and Next Steps
8. Transaction Log
9. Gas Optimization Guide
10. Emergency Procedures

Format as professional report with charts/tables references.`,
    });

    return doc;
  } catch (error) {
    console.error('Error generating documentation:', error);
    throw error;
  }
}

async function setupDeFiAlerts(userEmail, defiConfig) {
  try {
    const alerts = await base44.integrations.Core.InvokeLLM({
      prompt: `Setup DeFi monitoring alerts:
      
User: ${userEmail}
Config: ${JSON.stringify(defiConfig)}

Create alerts for:
1. High Impact Events
   - APY drops below threshold
   - Smart contract risks detected
   - Liquidation risk > 80%
   
2. Opportunities
   - High-yield pools emerging
   - Arbitrage opportunities detected
   - Gas prices optimal for transaction
   
3. Notifications via Twilio
   - Critical alerts (phone call)
   - Important alerts (SMS)
   - Info alerts (Slack)

Include voiceover scripts with ElevenLabs for phone alerts.`,
    });

    return alerts;
  } catch (error) {
    console.error('Error setting up alerts:', error);
    throw error;
  }
}

async function syncDeFiDataToSnowflake(userEmail, data) {
  try {
    await base44.integrations.Core.InvokeLLM({
      prompt: `Sync DeFi data to Snowflake:
      
User: ${userEmail}
Data: ${JSON.stringify(data)}

Create Snowflake tables:
1. defi_workflows - workflow executions
2. defi_analysis - periodic analysis
3. defi_portfolio - portfolio snapshots
4. defi_transactions - all transactions
5. defi_yields - yield farm performance
6. defi_risks - risk assessments
7. defi_alerts - alert history

Setup automatic daily sync.`,
    });
  } catch (error) {
    console.error('Error syncing to Snowflake:', error);
    throw error;
  }
}

async function notifyDeFiStatus(userEmail, data) {
  try {
    // Generate voiceover summary
    const summary = await generateDeFiSummaryVoiceover(data);

    // Send via Twilio
    await base44.integrations.Core.InvokeLLM({
      prompt: `Send DeFi status notification via Twilio:
      
User: ${userEmail}
Summary: ${summary}

Create professional voiceover and send phone notification with:
1. Portfolio performance summary
2. Key opportunities identified
3. Critical alerts if any
4. Recommended actions`,
    });
  } catch (error) {
    console.error('Error notifying status:', error);
    throw error;
  }
}

async function generateDeFiSummaryVoiceover(data) {
  try {
    const summary = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate DeFi summary voiceover script:
      
Analysis: ${JSON.stringify(data.analysis)}

Create 2-minute professional voiceover script covering:
1. Daily portfolio value and change
2. Top performing yields
3. Risk highlights
4. Recommended actions`,
    });

    // Generate audio with ElevenLabs
    const audio = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate professional voiceover audio:
      
Script: ${summary}
Voice: professional-financial
Duration: 2 minutes

Create natural-sounding financial advisor tone audio.`,
    });

    return audio;
  } catch (error) {
    console.error('Error generating voiceover:', error);
    throw error;
  }
}