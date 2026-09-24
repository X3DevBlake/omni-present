import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { swarm_id, objective, participating_agent_ids, coordination_protocol } = await req.json();

    // Fetch participating agents
    const agents = [];
    for (const agentId of participating_agent_ids) {
      const agentData = await base44.entities.AgentProfile.filter({ agent_id: agentId }, '', 1);
      if (agentData.length > 0) {
        agents.push({
          agent_id: agentId,
          role_in_swarm: 'participant',
          contribution_score: 0,
          skills: agentData[0].specializations || []
        });
      }
    }

    // AI-powered swarm coordination
    const coordinationResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze these agents for swarm intelligence coordination:
      
Objective: ${objective}
Protocol: ${coordination_protocol}
Agents: ${JSON.stringify(agents.map(a => ({ id: a.agent_id, skills: a.skills })))}

Determine:
1. Optimal role assignment for each agent
2. Collective decision-making strategy
3. Expected emergent behaviors
4. Swarm intelligence score (0-100)
5. Coordination efficiency prediction

Return detailed analysis.`,
      response_json_schema: {
        type: "object",
        properties: {
          role_assignments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                agent_id: { type: "string" },
                assigned_role: { type: "string" },
                role_justification: { type: "string" }
              }
            }
          },
          collective_strategy: { type: "string" },
          emergent_behaviors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                behavior_type: { type: "string" },
                complexity_score: { type: "number" },
                predictability: { type: "number" }
              }
            }
          },
          swarm_intelligence_score: { type: "number" },
          efficiency_prediction: { type: "number" }
        }
      }
    });

    // Update agent roles based on AI analysis
    const updatedAgents = agents.map(agent => {
      const roleAssignment = coordinationResult.role_assignments?.find(r => r.agent_id === agent.agent_id);
      return {
        ...agent,
        role_in_swarm: roleAssignment?.assigned_role || 'participant',
        contribution_score: Math.random() * 100 // Will be calculated during actual tasks
      };
    });

    // Create or update swarm
    const swarmData = {
      swarm_id: swarm_id || `swarm_${Date.now()}`,
      swarm_name: `Swarm for ${objective}`,
      participating_agents: updatedAgents,
      swarm_objective: objective,
      collective_decision: {
        decision_type: 'pending',
        consensus_level: 0,
        minority_opinions: [],
        final_action: ''
      },
      emergent_behavior: coordinationResult.emergent_behaviors?.[0] || {
        behavior_type: 'unknown',
        emergence_timestamp: new Date().toISOString(),
        complexity_score: 0,
        predictability: 0
      },
      swarm_intelligence_score: coordinationResult.swarm_intelligence_score || 50,
      coordination_protocol: coordination_protocol,
      performance_metrics: {
        tasks_completed: 0,
        efficiency_score: coordinationResult.efficiency_prediction || 0,
        adaptability_index: 0
      },
      is_active: true
    };

    const swarm = await base44.asServiceRole.entities.SwarmIntelligence.create(swarmData);

    return Response.json({
      success: true,
      swarm,
      ai_analysis: coordinationResult,
      message: 'Swarm intelligence orchestrated successfully'
    });

  } catch (error) {
    console.error('Swarm orchestration error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});