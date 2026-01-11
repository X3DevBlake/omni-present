import { base44 } from '@/api/base44Client';

/**
 * Advanced Anomaly Detection Engine
 * Subscriptions, investment shifts, fraud detection, AI explanations
 */

/**
 * Detect subscription and recurring bill anomalies
 */
export async function detectSubscriptionAnomalies(userEmail, transactions, subscriptionData) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze subscription and recurring billing patterns:
      
      User: ${userEmail}
      Recent Transactions: ${JSON.stringify(transactions.filter(t => t.category === 'subscriptions').slice(-50))}
      Known Subscriptions: ${JSON.stringify(subscriptionData)}
      
      Detect:
      1. Unused subscriptions (no activity in 60+ days)
      2. Duplicate subscriptions (same service, multiple charges)
      3. Unexpected price increases
      4. New subscriptions not tracked in user's list
      5. Seasonal spike patterns
      6. Total monthly subscription cost vs historical average
      7. Subscriptions exceeding budget limits
      
      For each: severity, monthly cost impact, recommendation`,
      response_json_schema: {
        type: 'object',
        properties: {
          anomalies: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                service: { type: 'string' },
                severity: { type: 'string' },
                monthlyImpact: { type: 'number' },
                explanation: { type: 'string' },
                recommendation: { type: 'string' },
              },
            },
          },
          totalUnusedMonthly: { type: 'number' },
          potentialSavings: { type: 'number' },
          annualImpact: { type: 'number' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error detecting subscription anomalies:', error);
    throw error;
  }
}

/**
 * Detect unusual investment allocation shifts
 */
export async function detectInvestmentShifts(userEmail, currentPortfolio, historicalPortfolio, userGoals) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze investment allocation shifts:
      
      User: ${userEmail}
      Current Portfolio: ${JSON.stringify(currentPortfolio)}
      Historical Portfolio (30 days ago): ${JSON.stringify(historicalPortfolio)}
      User Goals/Risk Profile: ${JSON.stringify(userGoals)}
      
      Identify:
      1. Unexpected allocation changes (>5% variance)
      2. Drift from target allocation
      3. Sector concentration increases
      4. Risk profile misalignment
      5. Possible unauthorized access patterns
      6. Trades not matching stated strategy
      7. Frequency of changes vs historical pattern
      
      For each shift: magnitude, alignment with goals, potential risks, recommended action`,
      response_json_schema: {
        type: 'object',
        properties: {
          shifts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                assetClass: { type: 'string' },
                previousAllocation: { type: 'number' },
                currentAllocation: { type: 'number' },
                changePercent: { type: 'number' },
                alignmentWithGoals: { type: 'string' },
                riskLevel: { type: 'string' },
                explanation: { type: 'string' },
                recommendation: { type: 'string' },
              },
            },
          },
          overallDriftFromTarget: { type: 'number' },
          recommendedRebalancing: { type: 'object' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error detecting investment shifts:', error);
    throw error;
  }
}

/**
 * Detect fraudulent and suspicious transactions
 */
export async function detectFraudulentActivity(userEmail, transactions, accountHistory, deviceInfo) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Detect fraudulent and suspicious transactions:
      
      User: ${userEmail}
      Recent Transactions: ${JSON.stringify(transactions.slice(-100))}
      Account History: ${JSON.stringify(accountHistory)}
      Device Info: ${JSON.stringify(deviceInfo)}
      
      Analyze:
      1. Unusual transaction amounts or patterns
      2. Transactions from new merchants
      3. High-risk merchant categories
      4. Geographic anomalies (location mismatches)
      5. Time-of-day unusual activity
      6. Device/IP mismatches
      7. Velocity checks (too many transactions in short time)
      8. Amount spikes vs historical average
      9. Duplicate or near-duplicate transactions
      10. Account access from new locations/devices
      
      Fraud Risk Assessment:
      - Score: 0-100
      - Confidence level
      - Recommended actions
      - Whether to flag for manual review
      
      For each risk: severity, indicators, confidence score, suggested action`,
      response_json_schema: {
        type: 'object',
        properties: {
          fraudRiskScore: { type: 'number' },
          flaggedTransactions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                transactionId: { type: 'string' },
                amount: { type: 'number' },
                merchant: { type: 'string' },
                riskIndicators: { type: 'array', items: { type: 'string' } },
                confidenceScore: { type: 'number' },
                severity: { type: 'string' },
                recommendation: { type: 'string' },
              },
            },
          },
          suspiciousPatterns: {
            type: 'array',
            items: { type: 'string' },
          },
          immediateActions: { type: 'array', items: { type: 'string' } },
          accountSecurityStatus: { type: 'string' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error detecting fraudulent activity:', error);
    throw error;
  }
}

/**
 * Generate AI explanations for anomalies
 */
export async function generateAnomalyExplanation(userEmail, anomaly, contextData) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate comprehensive explanation for financial anomaly:
      
      User: ${userEmail}
      Anomaly: ${JSON.stringify(anomaly)}
      Context: ${JSON.stringify(contextData)}
      
      Provide:
      1. Plain-English explanation of what happened
      2. Why this is unusual (comparison to baseline)
      3. Root cause analysis
      4. Impact assessment (financial and behavioral)
      5. Risk level and why
      6. Recommended immediate actions
      7. Long-term mitigation strategies
      8. Related alerts to watch for
      9. Timeline for resolution
      10. Questions to ask user (if applicable)
      
      Tone: helpful, non-alarming but honest, educational`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          rootCauseAnalysis: { type: 'string' },
          impactAssessment: { type: 'string' },
          immediateActions: { type: 'array', items: { type: 'string' } },
          longTermStrategies: { type: 'array', items: { type: 'string' } },
          relatedRisks: { type: 'array', items: { type: 'string' } },
          timeline: { type: 'string' },
          educationalInsights: { type: 'string' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error generating explanation:', error);
    throw error;
  }
}

/**
 * Run comprehensive anomaly scan
 */
export async function runComprehensiveAnomalyScan(userEmail, financialData) {
  try {
    const [subscriptionAnomalies, investmentShifts, fraudulentActivity] = await Promise.all([
      detectSubscriptionAnomalies(userEmail, financialData.transactions, financialData.subscriptions),
      detectInvestmentShifts(userEmail, financialData.currentPortfolio, financialData.historicalPortfolio, financialData.goals),
      detectFraudulentActivity(userEmail, financialData.transactions, financialData.accountHistory, financialData.deviceInfo),
    ]);

    const allAnomalies = [
      ...(subscriptionAnomalies.anomalies || []).map(a => ({ ...a, category: 'subscription' })),
      ...(investmentShifts.shifts || []).map(a => ({ ...a, category: 'investment' })),
      ...(fraudulentActivity.flaggedTransactions || []).map(a => ({ ...a, category: 'fraud' })),
    ];

    // Prioritize by severity
    const prioritized = allAnomalies.sort((a, b) => {
      const severityScore = { critical: 4, high: 3, medium: 2, low: 1 };
      return (severityScore[b.severity] || 0) - (severityScore[a.severity] || 0);
    });

    return {
      scanDate: new Date().toISOString(),
      totalAnomalies: prioritized.length,
      byCategory: {
        subscription: subscriptionAnomalies.anomalies?.length || 0,
        investment: investmentShifts.shifts?.length || 0,
        fraud: fraudulentActivity.flaggedTransactions?.length || 0,
      },
      criticalAlerts: prioritized.filter(a => a.severity === 'critical'),
      allAnomalies: prioritized,
      fraudRiskScore: fraudulentActivity.fraudRiskScore,
      potentialSavings: subscriptionAnomalies.potentialSavings || 0,
    };
  } catch (error) {
    console.error('Error running anomaly scan:', error);
    throw error;
  }
}

export default {
  detectSubscriptionAnomalies,
  detectInvestmentShifts,
  detectFraudulentActivity,
  generateAnomalyExplanation,
  runComprehensiveAnomalyScan,
};