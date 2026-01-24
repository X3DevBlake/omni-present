import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { high_level_goal, swarm_id, location } = await req.json();

    // Fetch swarm configuration and agent profiles
    const swarmConfigs = await base44.entities.SwarmConfiguration.filter({ swarm_id });
    const agentProfiles = await base44.entities.AgentPersonalizationProfile.filter({ swarm_id });

    // Fetch environmental data
    const envProfiles = location ? await base44.entities.PlanetaryEnvironmentalProfile.filter({
      celestial_body_name: location
    }) : [];

    const envProfile = envProfiles[0];

    // AI analyzes environment and generates mission objectives
    const missionPrompt = `As an AI Mission Commander, design a comprehensive mission:

High-Level Goal: ${high_level_goal}
Location: ${location || 'Earth'}
${envProfile ? `Environmental Conditions: Gravity ${envProfile.physics_constants?.surface_gravity_ms2}m/s², Radiation ${envProfile.physics_constants?.radiation_exposure_msv_year} mSv/year` : ''}

Available Agents: ${agentProfiles.length}
Agent Capabilities: ${agentProfiles.slice(0, 5).map(p => `Agent ${p.agent_id}: risk_tolerance=${p.behavioral_parameters?.risk_tolerance}, cooperation=${p.behavioral_parameters?.cooperation_level}`).join('; ')}

Generate:
1. Specific mission objectives with priorities
2. Environmental risk assessment
3. Task breakdown (5-8 tasks)
4. Task-agent assignments based on agent profiles`;

    const missionDesign = await base44.integrations.Core.InvokeLLM({
      prompt: missionPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          objectives: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                objective: {type: 'string'},
                priority: {type: 'number'},
                success_criteria: {type: 'array', items: {type: 'string'}}
              }
            }
          },
          environmental_analysis: {
            type: 'object',
            properties: {
              key_factors: {type: 'array', items: {type: 'string'}},
              risk_assessment: {type: 'number'}
            }
          },
          tasks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                task_description: {type: 'string'},
                assigned_agent_id: {type: 'string'},
                reasoning: {type: 'string'}
              }
            }
          },
          reasoning: {type: 'string'}
        }
      }
    });

    // Create mission record
    const mission = {
      mission_id: `mission_${Date.now()}`,
      high_level_goal,
      ai_generated_objectives: missionDesign.objectives || [],
      environmental_analysis: {
        location: location || 'Earth',
        key_factors: missionDesign.environmental_analysis?.key_factors || [],
        risk_assessment: missionDesign.environmental_analysis?.risk_assessment || 0.3
      },
      assigned_swarm_id: swarm_id,
      task_assignments: (missionDesign.tasks || []).map(t => ({
        task_id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        agent_id: t.assigned_agent_id,
        task_description: t.task_description,
        assigned_reasoning: t.reasoning
      })),
      ai_commander_reasoning: missionDesign.reasoning,
      adaptation_events: [],
      mission_status: 'executing',
      performance_metrics: {
        completion_percentage: 0,
        efficiency_score: 1.0,
        adaptation_count: 0
      }
    };

    await base44.entities.AIGeneratedMission.create(mission);

    return Response.json({
      success: true,
      mission
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: 'Failed to generate AI mission'
    }, { status: 500 });
  }
});