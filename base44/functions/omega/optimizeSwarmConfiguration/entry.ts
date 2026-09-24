import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mission_objective, environmental_conditions, swarm_id } = await req.json();

    // Fetch agent personalization profiles for the swarm
    const profiles = await base44.entities.AgentPersonalizationProfile.filter({ swarm_id });

    // AI-powered configuration optimization
    const optimizationPrompt = `Optimize HAAS swarm configuration:

Mission Objective: ${mission_objective}
Environmental Conditions: ${JSON.stringify(environmental_conditions)}
Available Agents: ${profiles.length}

Agent Profiles Summary:
${profiles.slice(0, 10).map((p, i) => `Agent ${i + 1}: 
- Risk Tolerance: ${p.behavioral_parameters?.risk_tolerance || 0.5}
- Cooperation: ${p.behavioral_parameters?.cooperation_level || 0.7}
- Specialization: ${p.specialization_score || 0.3}
- Preferred Tasks: ${p.learned_preferences?.preferred_tasks?.join(', ') || 'general'}`).join('\n')}

Recommend:
1. Optimal topology structure (hierarchical/flat/mesh/hybrid/adaptive)
2. Task assignments for each agent
3. Predicted efficiency and resilience scores`;

    const aiRecommendation = await base44.integrations.Core.InvokeLLM({
      prompt: optimizationPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          topology_structure: { type: 'string' },
          agent_assignments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                agent_id: { type: 'string' },
                role: { type: 'string' },
                task_id: { type: 'string' },
                priority: { type: 'number' }
              }
            }
          },
          predicted_efficiency: { type: 'number' },
          resilience_score: { type: 'number' },
          reasoning: { type: 'string' }
        }
      }
    });

    // Calculate optimization metrics
    const complexity = environmental_conditions?.complexity_level || 0.5;
    const threatLevel = environmental_conditions?.threat_level || 0.5;

    const optimizationMetrics = {
      predicted_efficiency: aiRecommendation.predicted_efficiency || 0.75,
      resilience_score: aiRecommendation.resilience_score || 0.8,
      resource_utilization: Math.min(0.95, 0.6 + complexity * 0.3),
      communication_overhead: Math.max(0.1, 0.3 - (profiles.length * 0.01))
    };

    // Create optimized configuration
    const configuration = {
      config_id: `config_${Date.now()}`,
      swarm_id,
      mission_objective,
      environmental_conditions,
      agent_assignments: aiRecommendation.agent_assignments || [],
      topology_structure: aiRecommendation.topology_structure || 'adaptive',
      optimization_metrics: optimizationMetrics,
      ai_recommended: true,
      performance_history: [],
      active: false
    };

    await base44.entities.SwarmConfiguration.create(configuration);

    return Response.json({
      success: true,
      configuration,
      reasoning: aiRecommendation.reasoning,
      agents_assigned: configuration.agent_assignments.length
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: 'Failed to optimize swarm configuration'
    }, { status: 500 });
  }
});