import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { task_name, agent_ids, task_description } = await req.json();

    // Get all participating agents
    const agents = await Promise.all(
      agent_ids.map(id => base44.entities.Agent.filter({ id }))
    );
    const validAgents = agents.filter(a => a.length > 0).map(a => a[0]);

    if (validAgents.length < 2) {
      return Response.json({ error: 'At least 2 agents required for collaboration' }, { status: 400 });
    }

    // Get spatial map for coordination
    const spatialMaps = await base44.entities.SpatialMap.filter({}).limit(1);
    const spatialMap = spatialMaps[0];

    // Use AI to decompose task and assign roles
    const coordination = await base44.integrations.Core.InvokeLLM({
      prompt: `Coordinate multi-agent collaborative task:

Task: ${task_name}
Description: ${task_description}
Available agents: ${validAgents.length}
Agent skills: ${validAgents.map(a => a.agent_name).join(', ')}

Plan collaboration:
1. coordination_strategy (hierarchical, democratic, swarm, specialist_roles, emergent)
2. role_assignments (array of {agent_id, role, subtasks array})
3. task_decomposition (5-8 subtasks with dependencies)
4. knowledge_sharing_plan (what agents should share)
5. spatial_coordination (how agents divide physical space)
6. expected_emergent_behaviors (collaborative patterns that may emerge)
7. success_criteria (how to measure collaboration quality)`,
      response_json_schema: {
        type: "object",
        properties: {
          coordination_strategy: { type: "string" },
          role_assignments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                agent_index: { type: "number" },
                role: { type: "string" },
                subtasks: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          },
          task_decomposition: {
            type: "array",
            items: {
              type: "object",
              properties: {
                subtask: { type: "string" },
                assigned_to_index: { type: "number" },
                dependencies: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          },
          knowledge_sharing_plan: {
            type: "array",
            items: { type: "string" }
          },
          spatial_zones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                zone_name: { type: "string" },
                agent_index: { type: "number" }
              }
            }
          },
          expected_emergent_behaviors: {
            type: "array",
            items: { type: "string" }
          },
          success_criteria: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    // Create collaborative task
    const collaborativeTask = await base44.entities.AgentCollaborativeTask.create({
      task_name,
      participating_agents: coordination.role_assignments.map(role => ({
        agent_id: validAgents[role.agent_index].id,
        role: role.role,
        assigned_subtasks: role.subtasks,
        contribution_score: 0
      })),
      coordination_strategy: coordination.coordination_strategy,
      task_decomposition: coordination.task_decomposition.map(task => ({
        subtask: task.subtask,
        assigned_to: validAgents[task.assigned_to_index]?.id,
        dependencies: task.dependencies,
        status: 'pending'
      })),
      knowledge_sharing: [],
      emergent_behaviors: coordination.expected_emergent_behaviors.map(behavior => ({
        behavior_description: behavior,
        participating_agents: agent_ids,
        effectiveness_score: 0
      })),
      physical_workspace: {
        spatial_map_id: spatialMap?.id,
        coordination_zones: coordination.spatial_zones.map(zone => ({
          zone_name: zone.zone_name,
          assigned_agent: validAgents[zone.agent_index]?.id,
          boundaries: {}
        }))
      },
      progress: 0,
      collaboration_quality_score: 0,
      task_status: 'active'
    });

    return Response.json({
      success: true,
      collaborative_task: collaborativeTask,
      coordination_plan: coordination,
      agents_involved: validAgents.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});