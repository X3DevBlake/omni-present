import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'detect_need') {
      const { companion_id } = await req.json();

      // Get recent user sentiment
      const sentimentLogs = await base44.entities.UserSentimentLog.filter({ 
        user_id: user.id 
      }).limit(10);

      const recentSentiment = sentimentLogs[0];

      // Analyze if intervention is needed
      const needsIntervention = recentSentiment && (
        recentSentiment.detected_emotion === 'anxious' ||
        recentSentiment.detected_emotion === 'sad' ||
        recentSentiment.emotion_intensity > 0.7
      );

      if (!needsIntervention) {
        return Response.json({
          success: true,
          intervention_needed: false,
          message: 'User emotional state is stable'
        });
      }

      // Generate proactive intervention with AI
      const interventionContent = await base44.integrations.Core.InvokeLLM({
        prompt: `User is feeling ${recentSentiment.detected_emotion} with intensity ${recentSentiment.emotion_intensity}. As a sentient AI companion, craft a warm, empathetic intervention message (30 words) and suggest 2 helpful actions.`,
        response_json_schema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            suggested_actions: { type: 'array', items: { type: 'string' } },
            approach: { type: 'string' }
          }
        }
      });

      // Log the intervention
      const intervention = await base44.entities.ProactiveInterventionLog.create({
        companion_id: companion_id,
        user_id: user.id,
        intervention_type: 'emotional_support',
        detected_need: {
          need_type: 'emotional_support',
          urgency_level: recentSentiment.emotion_intensity,
          confidence: 0.85
        },
        context_snapshot: {
          user_emotional_state: recentSentiment.detected_emotion,
          current_activity: 'using_platform',
          location: 'unknown',
          time_of_day: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening',
          physiological_data: {}
        },
        intervention_content: {
          message: interventionContent.message,
          suggested_actions: interventionContent.suggested_actions,
          resources_provided: []
        },
        effectiveness_score: 0,
        timing_score: 0.9
      });

      return Response.json({
        success: true,
        intervention: intervention,
        should_display: true,
        urgency: recentSentiment.emotion_intensity > 0.8 ? 'high' : 'medium'
      });
    }

    if (action === 'record_response') {
      const { intervention_id, accepted, feedback, emotional_impact } = await req.json();

      const interventions = await base44.entities.ProactiveInterventionLog.filter({ intervention_id });
      const intervention = interventions[0];

      if (!intervention) {
        return Response.json({ error: 'Intervention not found' }, { status: 404 });
      }

      // Update intervention with user response
      await base44.entities.ProactiveInterventionLog.update(intervention.id, {
        user_response: {
          accepted: accepted,
          feedback: feedback || '',
          emotional_impact: emotional_impact || 0
        },
        effectiveness_score: accepted ? 0.8 : 0.3
      });

      // Update companion learning
      const bonds = await base44.entities.CompanionEmotionalBond.filter({
        companion_id: intervention.companion_id,
        user_id: user.id
      });

      if (bonds[0]) {
        await base44.entities.CompanionEmotionalBond.update(bonds[0].id, {
          bond_strength: Math.min(1, bonds[0].bond_strength + (accepted ? 0.02 : -0.01))
        });
      }

      return Response.json({
        success: true,
        message: 'Response recorded and companion learned from interaction'
      });
    }

    if (action === 'get_intervention_history') {
      const interventions = await base44.entities.ProactiveInterventionLog.filter({
        user_id: user.id
      }).limit(20);

      const effectiveness = interventions.length > 0
        ? interventions.reduce((sum, i) => sum + i.effectiveness_score, 0) / interventions.length
        : 0;

      return Response.json({
        success: true,
        interventions: interventions,
        total_interventions: interventions.length,
        average_effectiveness: effectiveness
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});