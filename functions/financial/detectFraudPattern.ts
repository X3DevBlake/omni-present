import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    const recentTransactions = await base44.asServiceRole.entities.PaymentTransaction.filter({
      created_by: data.created_by
    }, '-created_date', 20);

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze transaction for fraud:
      
Current: ${JSON.stringify(data)}
Recent History: ${JSON.stringify(recentTransactions.slice(0, 5))}

Check for: unusual amounts, rapid transactions, geographic anomalies`,
      response_json_schema: {
        type: "object",
        properties: {
          is_suspicious: { type: "boolean" },
          risk_score: { type: "number" },
          reason: { type: "string" }
        }
      }
    });

    if (analysis.is_suspicious || analysis.risk_score > 70) {
      await base44.asServiceRole.entities.FraudAlert.create({
        transaction_id: event.entity_id,
        risk_score: analysis.risk_score,
        reason: analysis.reason,
        status: 'pending_review'
      });

      await base44.integrations.Core.SendEmail({
        to: 'security@base44.ai',
        subject: '🚨 Fraud Alert',
        body: `Suspicious transaction detected\nRisk: ${analysis.risk_score}%\n${analysis.reason}`
      });
    }

    return Response.json({ success: true, analysis });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});