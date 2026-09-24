import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { high_level_goal, environmental_context } = await req.json();

    // AI analyzes environment and defines mission objectives
    const missionPlanPrompt = `You are an AI Mission Commander for a hierarchical agent swarm.

High-Level Goal: ${high_level_goal}
Environmental Context: ${JSON.stringify(environmental_context || {})}

Define a comprehensive mission plan:
1. Break down the high-level goal into 3-5 specific, measurable objectives
2. Assess environmental threats, resources, and opportunities
3. Create 5-10 concrete tasks to achieve objectives
4. Assign tasks to agent types based on capabilities`;

    const missionPlan = await base44.integrations.Core.InvokeLLM({
      prompt: missionPlanPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          objectives: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                objective_id: { type: 'string' },
                description: { type: 'string' },
                priority: { type: 'number' },
                success_criteria: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          environmental_analysis: {
            type: 'object',
            properties: {
              threat_assessment: { type: 'number' },
              resource_constraints: { type: 'object' },
              opportunity_score: { type: 'number' }
            }
          },
          tasks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                task_id: { type: 'string' },
                task_description: { type: 'string' },
                required_agent_type: { type: 'string' },
                estimated_duration_hours: { type: 'number' },
                performance_expectation: { type: 'number' }
              }
            }
          },
          reasoning: { type: 'string' }
        }
      }
    });

    // Fetch available agents with personalization profiles
    const agents = await base44.entities.Agent.list();
    const profiles = await base44.entities.AgentPersonalizationProfile.list();

    // AI assigns tasks to optimal agents
    const taskAssignments = [];
    
    for (const task of missionPlan.tasks || []) {
      // Find best agent for task
      const matchPrompt = `Match task to optimal agent:

Task: ${task.task_description}
Required Type: ${task.required_agent_type}

Available Agents: ${agents.slice(0, 10).map(a => `${a.id}: ${a.specialization}, Performance: ${a.performance_score || 0.8}`).join('; ')}

Choose the best agent and explain why.`;

      const match = await base44.integrations.Core.InvokeLLM({
        prompt: matchPrompt,
        response_json_schema: {
          type: 'object',
          properties: {
            agent_id: { type: 'string' },
            reasoning: { type: 'string' }
          }
        }
      });

      taskAssignments.push({
        task_id: task.task_id,
        agent_id: match.agent_id,
        task_description: task.task_description,
        estimated_duration_hours: task.estimated_duration_hours,
        performance_expectation: task.performance_expectation
      });
    }

    // Create swarm configuration for mission
    const swarmConfig = {
      config_id: `config_${Date.now()}`,
      swarm_id: `swarm_${Date.now()}`,
      mission_objective: high_level_goal,
      environmental_conditions: missionPlan.environmental_analysis,
      agent_assignments: taskAssignments.map(ta => ({
        agent_id: ta.agent_id,
        role: 'mission_specialist',
        task_id: ta.task_id,
        priority: 0.8
      })),
      topology_structure: 'adaptive',
      optimization_metrics: {
        predicted_efficiency: 0.85,
        resilience_score: 0.9,
        resource_utilization: 0.75,
        communication_overhead: 0.15
      },
      ai_recommended: true,
      active: true
    };

    await base44.entities.SwarmConfiguration.create(swarmConfig);

    // Create mission command record
    const missionCommand = {
      command_id: `cmd_${Date.now()}`,
      high_level_goal,
      ai_defined_objectives: missionPlan.objectives || [],
      environmental_analysis: missionPlan.environmental_analysis,
      task_assignments: taskAssignments,
      swarm_config_id: swarmConfig.config_id,
      mission_status: 'active',
      self_healing_events: [],
      ai_commander_reasoning: missionPlan.reasoning
    };

    await base44.entities.MissionCommand.create(missionCommand);

    return Response.json({
      success: true,
      mission_command: missionCommand,
      swarm_config: swarmConfig,
      tasks_created: taskAssignments.length
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: 'Failed to execute AI mission commander'
    }, { status: 500 });
  }
});