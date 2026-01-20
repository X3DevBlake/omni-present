import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id } = await req.json();

    // Get agent performance data
    const performanceMetrics = await base44.asServiceRole.entities.AgentPerformanceMetrics.filter(
      { agent_id },
      '-time_period',
      20
    );

    // Get recent task assignments
    const taskAssignments = await base44.asServiceRole.entities.AgentTaskAssignment.filter(
      { agent_id },
      '-created_date',
      50
    );

    // Get current skills
    const skills = await base44.asServiceRole.entities.AgentSkill.filter(
      { agent_id },
      '',
      100
    );

    // AI skill gap analysis
    const skillGapAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Identify skill gaps based on agent performance data:

Performance Metrics:
${JSON.stringify(performanceMetrics, null, 2)}

Recent Tasks:
${JSON.stringify(taskAssignments, null, 2)}

Current Skills:
${JSON.stringify(skills, null, 2)}

Analyze and identify:
1. Critical skill gaps affecting performance
2. Emerging skills needed for future tasks
3. Skill proficiency levels vs requirements
4. Impact of each gap on overall performance`,
      response_json_schema: {
        type: 'object',
        properties: {
          skill_gaps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                skill_name: { type: 'string' },
                current_level: { type: 'number' },
                target_level: { type: 'number' },
                gap_severity: { type: 'string' },
                impact_on_performance: { type: 'number' },
                evidence: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          priority_order: { type: 'array', items: { type: 'string' } },
          overall_assessment: { type: 'string' }
        }
      }
    });

    return Response.json({
      success: true,
      skill_gaps: skillGapAnalysis.skill_gaps,
      priority_order: skillGapAnalysis.priority_order,
      assessment: skillGapAnalysis.overall_assessment
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});