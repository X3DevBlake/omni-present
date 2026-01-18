export default async function fraudDetectionML(data, context) {
  const { user_email, transaction_data } = data;
  
  const userTransactions = await context.entities.PaymentTransaction.filter({ 
    user_email 
  }).sort('-created_date').limit(100);
  
  const userProfile = {
    avg_transaction_amount: userTransactions.reduce((s, t) => s + t.amount, 0) / userTransactions.length,
    common_merchants: [...new Set(userTransactions.map(t => t.merchant))],
    typical_categories: [...new Set(userTransactions.map(t => t.category))],
    transaction_frequency: userTransactions.length / 30,
    typical_hours: userTransactions.map(t => new Date(t.created_date).getHours())
  };
  
  const fraudAnalysis = await context.integrations.Core.InvokeLLM({
    prompt: `Analyze transaction for fraud using ML-based detection:

New Transaction:
- Amount: $${transaction_data.amount}
- Merchant: ${transaction_data.merchant}
- Category: ${transaction_data.category}
- Time: ${new Date().toISOString()}
- Location: ${transaction_data.location || 'Unknown'}

User Profile:
- Avg Transaction: $${userProfile.avg_transaction_amount.toFixed(2)}
- Common Merchants: ${userProfile.common_merchants.slice(0, 5).join(', ')}
- Common Categories: ${userProfile.typical_categories.join(', ')}
- Transaction Frequency: ${userProfile.transaction_frequency.toFixed(1)}/day

Analyze for:
1. Amount anomaly
2. Merchant anomaly
3. Geographic anomaly
4. Time anomaly
5. Velocity anomaly (rapid transactions)
6. Pattern deviation`,
    response_json_schema: {
      type: "object",
      properties: {
        fraud_score: { type: "number" },
        risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
        anomalies_detected: {
          type: "array",
          items: {
            type: "object",
            properties: {
              anomaly_type: { type: "string" },
              severity: { type: "string" },
              deviation_percentage: { type: "number" },
              description: { type: "string" }
            }
          }
        },
        recommendation: { type: "string", enum: ["approve", "review", "decline", "challenge"] },
        confidence: { type: "number" },
        similar_fraud_patterns: { type: "array", items: { type: "string" } }
      }
    }
  });
  
  if (fraudAnalysis.risk_level === 'high' || fraudAnalysis.risk_level === 'critical') {
    await context.entities.FraudAlert.create({
      user_email,
      transaction_data,
      fraud_score: fraudAnalysis.fraud_score,
      risk_level: fraudAnalysis.risk_level,
      anomalies: fraudAnalysis.anomalies_detected,
      status: 'pending_review',
      auto_blocked: fraudAnalysis.fraud_score > 85
    });
    
    await context.integrations.Core.SendEmail({
      to: user_email,
      subject: '🚨 Suspicious Transaction Detected',
      body: `A potentially fraudulent transaction was detected on your account:\n\nAmount: $${transaction_data.amount}\nMerchant: ${transaction_data.merchant}\nRisk Level: ${fraudAnalysis.risk_level}\n\nPlease verify if this transaction was authorized.`
    });
  }
  
  return {
    fraud_analysis: fraudAnalysis,
    transaction_approved: fraudAnalysis.recommendation === 'approve',
    requires_review: fraudAnalysis.recommendation === 'review' || fraudAnalysis.recommendation === 'challenge'
  };
}