import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      operation,
      task_description,
      team_id,
      embodiment_ids = []
    } = await req.json();

    if (operation === 'form_team') {
      const embodiments = await base44.asServiceRole.entities.PhysicallyEmbodiedAgent.list('-created_date', 20);
      
      const teamFormationPrompt = `You are forming an optimal team of physically embodied AI agents.

TASK: "${task_description}"

AVAILABLE AGENTS:
${embodiments.slice(0, 10).map(e => `
ID: ${e.embodiment_id}
Platform: ${e.embodiment_platform}
Capabilities: ${e.physical_capabilities?.map(c => `${c.capability_name} (${(c.proficiency_level * 100).toFixed(0)}%)`).join(', ')}
Autonomy: ${e.autonomous_behavior ? 'Advanced' : 'Basic'}
`).join('\n---\n')}

Design optimal team:
1. Select best agents for task
2. Assign roles based on capabilities
3. Plan task allocation
4. Design communication protocol
5. Predict synergies
6. Estimate completion time
7. Define coordination strategy

Provide team formation plan.`;

      const teamPlan = await base44.integrations.Core.InvokeLLM({
        prompt: teamFormationPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            selected_agents: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  embodiment_id: { type: "string" },
                  role: { type: "string" },
                  skill_contribution: { type: "array", items: { type: "string" } }
                }
              }
            },
            task_allocation: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  subtask: { type: "string" },
                  assigned_to: { type: "string" },
                  estimated_duration_minutes: { type: "number" }
                }
              }
            },
            communication_protocol: {
              type: "object",
              properties: {
                protocol_type: { type: "string" },
                update_frequency_hz: { type: "number" },
                data_sharing_enabled: { type: "boolean" }
              }
            },
            predicted_synergy_score: { type: "number" },
            estimated_completion_hours: { type: "number" }
          }
        }
      });

      const team = await base44.asServiceRole.entities.EmbodiedAgentTeam.create({
        team_id: `team-${Date.now()}`,
        team_name: `Team for: ${task_description.substring(0, 30)}`,
        member_embodiments: teamPlan.selected_agents?.map(a => ({
          embodiment_id: a.embodiment_id,
          role: a.role,
          skill_contribution: a.skill_contribution,
          join_timestamp: new Date().toISOString()
        })) || [],
        collaborative_task: {
          task_description,
          complexity_score: teamPlan.selected_agents?.length || 1,
          requires_coordination: true,
          estimated_completion_hours: teamPlan.estimated_completion_hours
        },
        communication_protocol: teamPlan.communication_protocol || {},
        task_allocation: teamPlan.task_allocation?.map(t => ({
          subtask: t.subtask,
          assigned_to: t.assigned_to,
          status: 'pending',
          progress: 0
        })) || [],
        team_performance: {
          synergy_score: teamPlan.predicted_synergy_score,
          efficiency_rating: 0,
          coordination_quality: 0
        },
        team_status: 'active',
        shared_execution_data: [],
        skill_transfer_network: []
      });

      return Response.json({
        success: true,
        team_id: team.id,
        team_plan: teamPlan
      });
    }

    if (operation === 'coordinate_action') {
      const [team, embodiments] = await Promise.all([
        base44.asServiceRole.entities.EmbodiedAgentTeam.filter({ team_id }),
        base44.asServiceRole.entities.PhysicallyEmbodiedAgent.list('-created_date', 20)
      ]);

      const teamEntity = team[0];
      
      const coordinationPrompt = `You are coordinating multi-agent action execution.

TEAM: ${teamEntity.team_name}
MEMBERS: ${teamEntity.member_embodiments?.length}
TASK: ${teamEntity.collaborative_task?.task_description}

CURRENT ALLOCATION:
${teamEntity.task_allocation?.map(t => `${t.subtask} → ${t.assigned_to} (${t.status})`).join('\n')}

Coordinate next action:
1. Determine priority subtask
2. Synchronize agent actions
3. Share execution insights
4. Adjust roles dynamically
5. Predict coordination needs
6. Optimize efficiency

Provide coordination plan.`;

      const coordination = await base44.integrations.Core.InvokeLLM({
        prompt: coordinationPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            next_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  agent_id: { type: "string" },
                  action: { type: "string" },
                  coordination_with: { type: "array", items: { type: "string" } }
                }
              }
            },
            execution_insights: { type: "array", items: { type: "string" } },
            dynamic_role_adjustments: { type: "array", items: { type: "object" } }
          }
        }
      });

      return Response.json({
        success: true,
        coordination
      });
    }

    return Response.json({ error: 'Invalid operation' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});