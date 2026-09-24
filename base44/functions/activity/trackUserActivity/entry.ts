import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      activity_type,
      activity_details,
      context
    } = await req.json();

    const activity = await base44.entities.UserActivity.create({
      user_id: user.id,
      activity_type,
      activity_details,
      timestamp: new Date().toISOString(),
      context: context || {},
      engagement_score: 50 + Math.random() * 50
    });

    return Response.json({
      success: true,
      activity_id: activity.id,
      message: 'Activity tracked'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});