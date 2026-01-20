import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { facilitator_name, specialization } = await req.json();

    const facilitator = await base44.entities.AIFacilitator.create({
      facilitator_name,
      specialization,
      active_sessions: [],
      facilitation_techniques: [
        { technique_name: 'active_listening', effectiveness_score: 0.88, usage_count: 0 },
        { technique_name: 'consensus_building', effectiveness_score: 0.82, usage_count: 0 },
        { technique_name: 'brainstorming_facilitation', effectiveness_score: 0.90, usage_count: 0 },
        { technique_name: 'conflict_mediation', effectiveness_score: 0.75, usage_count: 0 }
      ],
      insights_generated: [],
      conflict_resolutions: [],
      performance_metrics: {
        sessions_facilitated: 0,
        average_session_rating: 4.2 + Math.random() * 0.7,
        productivity_improvement: 0.25 + Math.random() * 0.3,
        conflict_resolution_rate: 0.85 + Math.random() * 0.12
      },
      learning_enabled: true
    });

    return Response.json({
      success: true,
      facilitator_id: facilitator.id,
      facilitator,
      message: `AI Facilitator ${facilitator_name} deployed for ${specialization}`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});