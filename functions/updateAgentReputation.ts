import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, transaction_id, rating } = await req.json();

    // Get or create reputation record
    let reputations = await base44.asServiceRole.entities.AgentReputation.filter({ agent_id });
    let reputation = reputations[0];

    if (!reputation) {
      reputation = await base44.asServiceRole.entities.AgentReputation.create({
        agent_id,
        overall_score: 50,
        total_transactions: 0,
        successful_transactions: 0,
      });
    }

    // Update reputation based on rating
    const isPositive = rating >= 4;
    const newTotalTransactions = (reputation.total_transactions || 0) + 1;
    const newSuccessful = (reputation.successful_transactions || 0) + (isPositive ? 1 : 0);
    const newPositiveReviews = (reputation.positive_reviews || 0) + (isPositive ? 1 : 0);
    const newNegativeReviews = (reputation.negative_reviews || 0) + (!isPositive ? 1 : 0);

    // Calculate new overall score (weighted average)
    const successRate = newSuccessful / newTotalTransactions;
    const reviewRatio = newPositiveReviews / (newPositiveReviews + newNegativeReviews);
    const overallScore = (successRate * 50) + (reviewRatio * 50);

    // Determine trust level
    let trustLevel = 'novice';
    if (overallScore >= 90 && newTotalTransactions >= 50) trustLevel = 'elite';
    else if (overallScore >= 80 && newTotalTransactions >= 20) trustLevel = 'expert';
    else if (overallScore >= 70 && newTotalTransactions >= 10) trustLevel = 'trusted';

    // Award badges
    const badges = [];
    if (newTotalTransactions >= 10) badges.push('active_trader');
    if (newSuccessful >= 50) badges.push('reliable');
    if (reviewRatio >= 0.95) badges.push('highly_rated');

    await base44.asServiceRole.entities.AgentReputation.update(reputation.id, {
      overall_score: overallScore,
      marketplace_rating: rating,
      total_transactions: newTotalTransactions,
      successful_transactions: newSuccessful,
      positive_reviews: newPositiveReviews,
      negative_reviews: newNegativeReviews,
      trust_level: trustLevel,
      badges,
    });

    return Response.json({
      success: true,
      new_score: overallScore.toFixed(1),
      trust_level: trustLevel,
      badges,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});