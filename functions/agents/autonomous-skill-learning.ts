import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, skill_name, method } = await req.json();

    const skillAcquisition = await base44.entities.AgentSkillAcquisition.create({
      agent_id,
      skill_name,
      acquisition_method: method || 'self_supervised',
      learning_status: 'learning',
      proficiency_level: 15 + Math.random() * 20,
      learning_curve: Array.from({ length: 5 }, (_, i) => ({
        timestamp: new Date(Date.now() - (5 - i) * 3600000).toISOString(),
        proficiency: (i + 1) * 15 + Math.random() * 10,
        practice_count: (i + 1) * 10
      })),
      identified_gap: {
        gap_type: 'knowledge',
        severity: 'medium',
        remediation_plan: 'Complete advanced training modules'
      },
      training_resources: [
        {
          resource_type: 'tutorial',
          resource_url: 'https://learn.example.com/skill',
          completion_status: 0.3 + Math.random() * 0.4
        },
        {
          resource_type: 'practice_environment',
          resource_url: 'sandbox://practice',
          completion_status: 0.2 + Math.random() * 0.3
        }
      ],
      autonomous_discovery: true,
      related_skills: ['prerequisite_skill', 'complementary_skill'],
      performance_benchmarks: {
        target_score: 90,
        current_score: 35 + Math.random() * 30,
        percentile_rank: 40 + Math.random() * 35
      }
    });

    return Response.json({
      success: true,
      skill_id: skillAcquisition.id,
      skillAcquisition,
      message: `Agent ${agent_id} started learning ${skill_name} via ${method}`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});