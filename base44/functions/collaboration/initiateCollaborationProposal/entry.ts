import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, task_description, autonomous } = await req.json();

    // Get agent data
    const agent = await base44.asServiceRole.entities.Agent.filter({ id: agent_id }, '', 1);
    const agentData = agent[0];

    // Get agent skills
    const agentSkills = await base44.asServiceRole.entities.AgentSkill.filter(
      { agent_id },
      '',
      100
    );

    // Analyze task complexity and detect skill gaps
    const taskAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Analyze this task for an AI agent collaboration proposal:

Task: ${task_description}
Agent Skills: ${JSON.stringify(agentSkills, null, 2)}

Determine:
1. Task complexity score (0-100)
2. Required skills for completion
3. Estimated duration in hours
4. Risk factors
5. Skill gaps (skills required but agent lacks)
6. Whether collaboration is recommended`,
      response_json_schema: {
        type: 'object',
        properties: {
          complexity_score: { type: 'number' },
          required_skills: { type: 'array', items: { type: 'string' } },
          estimated_duration: { type: 'number' },
          risk_factors: { type: 'array', items: { type: 'string' } },
          skill_gaps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                skill_name: { type: 'string' },
                required_level: { type: 'number' },
                proposer_level: { type: 'number' },
                gap_severity: { type: 'number' }
              }
            }
          },
          collaboration_recommended: { type: 'boolean' },
          reasoning: { type: 'string' }
        }
      }
    });

    if (!taskAnalysis.collaboration_recommended && autonomous) {
      return Response.json({
        success: false,
        message: 'Collaboration not recommended for this task',
        analysis: taskAnalysis
      });
    }

    // Find suitable team members
    const allAgents = await base44.asServiceRole.entities.Agent.list('', 50);
    const agentProfiles = await base44.asServiceRole.entities.AgentMarketplaceProfile.list('', 50);
    const performanceData = await base44.asServiceRole.entities.AgentPerformanceMetrics.list('-time_period', 100);

    const teamSuggestion = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Suggest optimal team members for this collaboration:

Task Complexity: ${taskAnalysis.complexity_score}
Skill Gaps: ${JSON.stringify(taskAnalysis.skill_gaps, null, 2)}
Available Agents: ${JSON.stringify(allAgents.slice(0, 20), null, 2)}
Agent Profiles: ${JSON.stringify(agentProfiles.slice(0, 20), null, 2)}

Suggest 2-4 agents that:
1. Have complementary skills to fill gaps
2. Have good historical performance
3. Are compatible with proposing agent
4. Provide reasoning for each suggestion`,
      response_json_schema: {
        type: 'object',
        properties: {
          suggested_members: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                agent_id: { type: 'string' },
                complementary_skills: { type: 'array', items: { type: 'string' } },
                compatibility_score: { type: 'number' },
                historical_performance: { type: 'object' },
                reasoning: { type: 'string' }
              }
            }
          }
        }
      }
    });

    // Create collaboration proposal
    const proposal = await base44.asServiceRole.entities.CollaborationProposal.create({
      proposing_agent_id: agent_id,
      proposal_name: `Collaboration: ${task_description.slice(0, 50)}`,
      task_complexity_analysis: {
        complexity_score: taskAnalysis.complexity_score,
        required_skills: taskAnalysis.required_skills,
        estimated_duration: taskAnalysis.estimated_duration,
        risk_factors: taskAnalysis.risk_factors
      },
      detected_skill_gaps: taskAnalysis.skill_gaps,
      suggested_team_members: teamSuggestion.suggested_members,
      workflow_triggers: [
        {
          trigger_type: 'task_start',
          condition: 'all_members_accepted',
          action: 'initialize_collaboration_channel',
          priority: 'high'
        },
        {
          trigger_type: 'bottleneck_detected',
          condition: 'task_progress_below_threshold',
          action: 'reallocate_tasks',
          priority: 'critical'
        }
      ],
      autonomous_initiation: autonomous || false,
      proposal_status: 'pending_approval',
      approval_votes: []
    });

    return Response.json({
      success: true,
      proposal,
      task_analysis: taskAnalysis,
      team_suggestion: teamSuggestion
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});