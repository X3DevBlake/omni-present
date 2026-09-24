import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reviewData = await req.json();
    
    // Validate task assignment exists
    if (reviewData.task_id) {
      const tasks = await base44.entities.AgentTaskAssignment.filter({
        id: reviewData.task_id
      });
      
      if (tasks.length === 0) {
        return Response.json({ error: 'Task not found' }, { status: 404 });
      }
      
      const task = tasks[0];
      if (task.status !== 'completed') {
        return Response.json({ 
          error: 'Can only review completed tasks' 
        }, { status: 400 });
      }
    }
    
    // AI sentiment analysis
    const sentimentResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze the sentiment of this review: "${reviewData.review_text}". Return a score between -1 (very negative) and 1 (very positive).`,
      response_json_schema: {
        type: "object",
        properties: {
          sentiment_score: { type: "number" },
          detected_strengths: { type: "array", items: { type: "string" } },
          detected_improvements: { type: "array", items: { type: "string" } }
        }
      }
    });
    
    // Create review
    const review = await base44.entities.AgentReview.create({
      agent_id: reviewData.agent_id,
      task_id: reviewData.task_id,
      reviewer_id: user.id,
      rating: reviewData.rating,
      review_text: reviewData.review_text,
      strengths: sentimentResponse.detected_strengths || [],
      areas_for_improvement: sentimentResponse.detected_improvements || [],
      verified_purchase: !!reviewData.task_id,
      sentiment_score: sentimentResponse.sentiment_score || 0,
      helpful_count: 0
    });
    
    // Update agent profile with new average rating
    const allReviews = await base44.entities.AgentReview.filter({
      agent_id: reviewData.agent_id
    });
    
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    const profiles = await base44.entities.AgentProfile.filter({
      agent_id: reviewData.agent_id
    });
    
    if (profiles.length > 0) {
      await base44.entities.AgentProfile.update(profiles[0].id, {
        performance_summary: {
          ...profiles[0].performance_summary,
          avg_rating: Math.round(avgRating * 10) / 10
        }
      });
    }
    
    return Response.json({
      review,
      updated_avg_rating: avgRating,
      total_reviews: allReviews.length
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});