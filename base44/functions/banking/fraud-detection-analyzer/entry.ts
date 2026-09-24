import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { transactionAmount, merchantCategory, timeOfDay, location } = body;

    // Simple fraud detection rules
    const riskScore = calculateRiskScore({
      amount: transactionAmount,
      category: merchantCategory,
      time: timeOfDay,
      location,
    });

    const isFraudulent = riskScore > 70;

    return Response.json({
      success: true,
      riskScore,
      isFraudulent,
      recommendation: isFraudulent ? 'BLOCK' : 'APPROVE',
      reasons: getReasons(riskScore, { transactionAmount, merchantCategory }),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateRiskScore(data) {
  let score = 0;

  // Large transaction
  if (data.amount > 5000) score += 20;
  else if (data.amount > 1000) score += 10;

  // Unusual merchant
  if (['cryptocurrency', 'wire_transfer'].includes(data.category)) score += 25;

  // Late night transaction
  if (data.time > 22 || data.time < 6) score += 15;

  // Location mismatch (would integrate with user history)
  if (Math.random() > 0.8) score += 15;

  return Math.min(score, 100);
}

function getReasons(score, data) {
  const reasons = [];
  if (data.amount > 1000) reasons.push('Large transaction amount');
  if (data.category === 'cryptocurrency') reasons.push('Cryptocurrency merchant');
  return reasons;
}