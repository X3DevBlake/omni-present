import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_email, interaction_type, context } = await req.json();

    // Fetch user's interaction history
    const activities = await base44.entities.UserActivity.filter({ 
      user_email 
    }, '-created_date', 50);

    // AI analyzes patterns
    const learningResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze user preferences based on their interaction history and latest context.
      
      Interaction type: ${interaction_type}
      Context: ${JSON.stringify(context)}
      Recent activities: ${activities.length} interactions
      
      Predict:
      1. Preferred dashboard widgets
      2. Optimal notification timing
      3. Content preferences
      4. UI complexity level`,
      response_json_schema: {
        type: 'object',
        properties: {
          preferred_widgets: { type: 'array', items: { type: 'string' } },
          notification_timing: { type: 'string' },
          content_focus: { type: 'array', items: { type: 'string' } },
          ui_complexity: { type: 'string' },
          confidence_score: { type: 'number' }
        }
      }
    });

    // Update learned preferences
    const existingPrefs = await base44.entities.LearnedPreferences.filter({ user_email });
    
    if (existingPrefs.length > 0) {
      await base44.asServiceRole.entities.LearnedPreferences.update(existingPrefs[0].id, {
        preference_vector: learningResponse,
        learning_iterations: (existingPrefs[0].learning_iterations || 0) + 1,
        last_updated: new Date().toISOString()
      });
    } else {
      await base44.asServiceRole.entities.LearnedPreferences.create({
        user_email,
        preference_vector: learningResponse,
        learning_iterations: 1
      });
    }

    return Response.json({
      success: true,
      learned_preferences: learningResponse,
      personalization_improved: true
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});