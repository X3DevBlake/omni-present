import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, rating, review_text, task_id } = await req.json();

    if (rating < 1 || rating > 5) {
      return Response.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Get existing reputation record
    const records = await base44.asServiceRole.entities.DecentralizedReputationRecord.filter({
      agent_id
    });

    const existingRecord = records[0];

    if (existingRecord) {
      // Add review to existing record
      const updatedReviews = [
        ...(existingRecord.reviews || []),
        {
          reviewer_id: user.id,
          rating,
          review_text,
          task_id,
          verified: true,
          timestamp: new Date().toISOString()
        }
      ];

      // Calculate new average rating
      const avgRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
      const newScore = (avgRating / 5) * 100;

      await base44.asServiceRole.entities.DecentralizedReputationRecord.update(existingRecord.id, {
        reviews: updatedReviews,
        reputation_score: newScore
      });

      // Update agent reputation
      const agentRep = await base44.asServiceRole.entities.AgentReputation.filter({ agent_id });
      if (agentRep[0]) {
        await base44.asServiceRole.entities.AgentReputation.update(agentRep[0].id, {
          marketplace_rating: avgRating,
          overall_score: newScore,
          positive_reviews: updatedReviews.filter(r => r.rating >= 4).length,
          negative_reviews: updatedReviews.filter(r => r.rating <= 2).length
        });
      }
    }

    return Response.json({ 
      success: true,
      review_submitted: true,
      new_avg_rating: existingRecord ? 
        (existingRecord.reviews.reduce((sum, r) => sum + r.rating, 0) + rating) / (existingRecord.reviews.length + 1) : 
        rating
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});