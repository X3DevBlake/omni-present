import { base44 } from '@/api/base44Client';

export async function analyzeComplexOpportunitiesAndRisks(userEmail, portfolioData, marketData) {
  try {
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Perform advanced DeFi opportunity and risk analysis:
      
User: ${userEmail}
Portfolio: ${JSON.stringify(portfolioData)}
Market: ${JSON.stringify(marketData)}

Analyze:
1. Complex Multi-Leg Opportunities
   - Cross-chain arbitrage with bridges
   - Yield farming + derivatives combos
   - MEV extraction opportunities
   - Flash loan arbitrage patterns
   
2. Hidden Risks
   - Correlated asset collapse scenarios
   - Smart contract interaction risks
   - Cascading liquidation risks
   - Black swan events
   
3. Market Inefficiencies
   - DEX vs CEX price discrepancies
   - Oracle manipulation opportunities
   - Liquidity concentration risks
   - Slippage optimization angles
   
4. Emerging Trends
   - New protocol opportunities
   - Upcoming airdrops and governance
   - Liquidity migration patterns`,
      response_json_schema: {
        type: 'object',
        properties: {
          opportunities: { type: 'array', items: { type: 'object' } },
          risks: { type: 'array', items: { type: 'object' } },
          recommendations: { type: 'array', items: { type: 'string' } },
          confidence: { type: 'number' },
        },
      },
    });

    // Store analysis
    await storeIntelligenceAnalysis(userEmail, analysis);

    return analysis;
  } catch (error) {
    console.error('Error analyzing DeFi:', error);
    throw error;
  }
}

async function storeIntelligenceAnalysis(userEmail, analysis) {
  try {
    await base44.integrations.Core.InvokeLLM({
      prompt: `Store DeFi intelligence analysis:
      
User: ${userEmail}
Analysis: ${JSON.stringify(analysis)}

Save to database for historical tracking and comparison.`,
    });
  } catch (error) {
    console.error('Error storing analysis:', error);
  }
}

export async function suggestNewZapierWorkflows(userEmail, analysis, trendData) {
  try {
    const workflows = await base44.integrations.Core.InvokeLLM({
      prompt: `Suggest new Zapier workflows based on DeFi trends:
      
User: ${userEmail}
Analysis: ${JSON.stringify(analysis)}
Trends: ${JSON.stringify(trendData)}

For each emerging opportunity, suggest:
1. Workflow name
2. Triggers and conditions
3. Actions to automate
4. Risk controls
5. Expected benefit

Example trends:
- New high-yield pools emerging
- Gas prices at optimal levels
- Arbitrage windows opening
- Risk indicators changing`,
      response_json_schema: {
        type: 'object',
        properties: {
          suggestedWorkflows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                benefit: { type: 'string' },
                urgency: { type: 'string' },
              },
            },
          },
        },
      },
    });

    // Send suggestions for approval
    for (const workflow of workflows.suggestedWorkflows) {
      await sendWorkflowSuggestion(userEmail, workflow);
    }

    return workflows.suggestedWorkflows;
  } catch (error) {
    console.error('Error suggesting workflows:', error);
    throw error;
  }
}

async function sendWorkflowSuggestion(userEmail, workflow) {
  try {
    await base44.integrations.Core.InvokeLLM({
      prompt: `Send Zapier workflow suggestion:
      
User: ${userEmail}
Workflow: ${JSON.stringify(workflow)}

Create Slack notification with:
1. Workflow name and description
2. Benefit explanation
3. Urgency level
4. Approve/Reject buttons
5. Customize options`,
    });
  } catch (error) {
    console.error('Error sending suggestion:', error);
  }
}

export async function forecastMarketShifts(userEmail, historicalData, onChainData) {
  try {
    const forecast = await base44.integrations.Core.InvokeLLM({
      prompt: `Forecast market shifts using cross-platform data:
      
User: ${userEmail}
Historical: ${JSON.stringify(historicalData)}
OnChain: ${JSON.stringify(onChainData)}

Predict:
1. Price movements (24h, 7d, 30d)
2. Volatility changes
3. Liquidity shifts
4. Volume surges
5. New trend formations
6. Risk escalations

Include confidence scores and uncertainties.`,
      response_json_schema: {
        type: 'object',
        properties: {
          priceForecasts: { type: 'array', items: { type: 'object' } },
          volatilityPredictions: { type: 'array', items: { type: 'object' } },
          liquidityOutlook: { type: 'object' },
          riskEscalation: { type: 'number' },
          recommendedActions: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return forecast;
  } catch (error) {
    console.error('Error forecasting:', error);
    throw error;
  }
}

export async function offerRiskMitigationStrategies(userEmail, portfolioData, riskProfile) {
  try {
    const strategies = await base44.integrations.Core.InvokeLLM({
      prompt: `Offer personalized risk mitigation strategies:
      
User: ${userEmail}
Portfolio: ${JSON.stringify(portfolioData)}
RiskProfile: ${riskProfile}

Suggest:
1. Hedging strategies
2. Position sizing adjustments
3. Stop-loss placements
4. Insurance options
5. Diversification improvements
6. Rebalancing tactics`,
      response_json_schema: {
        type: 'object',
        properties: {
          strategies: { type: 'array', items: { type: 'object' } },
          expectedOutcome: { type: 'string' },
          implementationSteps: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return strategies;
  } catch (error) {
    console.error('Error offering strategies:', error);
    throw error;
  }
}

export async function detectAnomaliesInUserBehavior(userEmail, behaviorHistory) {
  try {
    const anomalies = await base44.integrations.Core.InvokeLLM({
      prompt: `Detect anomalies in DeFi user behavior:
      
User: ${userEmail}
History: ${JSON.stringify(behaviorHistory)}

Identify:
1. Unusual trading patterns
2. Risk-taking deviations
3. New strategy implementations
4. Account compromise indicators
5. Behavioral shifts

Flag suspicious activity.`,
      response_json_schema: {
        type: 'object',
        properties: {
          anomalies: { type: 'array', items: { type: 'object' } },
          riskLevel: { type: 'string' },
          recommendations: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    // Alert on critical anomalies
    for (const anomaly of anomalies.anomalies) {
      if (anomaly.severity === 'critical') {
        await alertAnomalyDetected(userEmail, anomaly);
      }
    }

    return anomalies;
  } catch (error) {
    console.error('Error detecting anomalies:', error);
    throw error;
  }
}

async function alertAnomalyDetected(userEmail, anomaly) {
  try {
    await base44.integrations.Core.InvokeLLM({
      prompt: `Alert user of detected anomaly:
      
User: ${userEmail}
Anomaly: ${JSON.stringify(anomaly)}

Send via Twilio and Slack:
1. Clear description of anomaly
2. Potential implications
3. Suggested actions
4. Confirmation button to acknowledge`,
    });
  } catch (error) {
    console.error('Error alerting anomaly:', error);
  }
}

export async function detectAnomaliesInDeFiData(marketData, historicalPatterns) {
  try {
    const anomalies = await base44.integrations.Core.InvokeLLM({
      prompt: `Detect anomalies in DeFi market data:
      
Current: ${JSON.stringify(marketData)}
Patterns: ${JSON.stringify(historicalPatterns)}

Detect:
1. Price anomalies and manipulation
2. Volume spikes and drains
3. Liquidity migrations
4. Oracle deviations
5. Smart contract exploits
6. Flash crash patterns`,
      response_json_schema: {
        type: 'object',
        properties: {
          anomalies: { type: 'array', items: { type: 'object' } },
          severity: { type: 'string' },
          autoActions: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    // Execute auto-actions for critical anomalies
    for (const action of anomalies.autoActions) {
      await executeAnomalyAction(action);
    }

    return anomalies;
  } catch (error) {
    console.error('Error detecting market anomalies:', error);
    throw error;
  }
}

async function executeAnomalyAction(action) {
  try {
    await base44.integrations.Core.InvokeLLM({
      prompt: `Execute automatic anomaly response:
      
Action: ${action}

Implement with safeguards and logging.`,
    });
  } catch (error) {
    console.error('Error executing action:', error);
  }
}