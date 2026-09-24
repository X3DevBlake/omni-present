export default async function selfLearningSystem(data, context) {
  const { agent_id, training_mode = 'reinforcement', experience_data = null } = data;
  
  const agent = await context.entities.Agent.filter({ id: agent_id }).limit(1);
  if (!agent || agent.length === 0) {
    return { error: 'Agent not found' };
  }
  
  const currentAgent = agent[0];
  
  const recentInteractions = await context.entities.AgentInteractionLog.filter({
    agent_id: agent_id
  }).limit(50);
  
  const recentKPIs = await context.entities.AgentKPI.filter({
    agent_id: agent_id
  }).limit(20);
  
  const learningAnalysis = await context.integrations.Core.InvokeLLM({
    prompt: `Analyze agent performance and generate learning improvements:

Agent: ${currentAgent.name}
Training Mode: ${training_mode}
Recent Interactions: ${recentInteractions.length}
Performance Metrics: ${JSON.stringify(recentKPIs.slice(0, 5))}

Based on this data:
1. Identify patterns in successful vs unsuccessful interactions
2. Suggest behavioral adjustments
3. Recommend new skills to acquire
4. Predict performance improvements
5. Generate training curriculum`,
    response_json_schema: {
      type: "object",
      properties: {
        success_patterns: {
          type: "array",
          items: { type: "string" }
        },
        behavioral_adjustments: {
          type: "array",
          items: {
            type: "object",
            properties: {
              current_behavior: { type: "string" },
              recommended_behavior: { type: "string" },
              expected_improvement: { type: "number" }
            }
          }
        },
        new_skills: {
          type: "array",
          items: {
            type: "object",
            properties: {
              skill_name: { type: "string" },
              relevance_score: { type: "number" },
              training_time_hours: { type: "number" }
            }
          }
        },
        predicted_performance_gain: { type: "number" },
        training_curriculum: {
          type: "array",
          items: {
            type: "object",
            properties: {
              lesson: { type: "string" },
              duration_minutes: { type: "number" },
              priority: { type: "number" }
            }
          }
        }
      }
    }
  });
  
  const newAutonomyLevel = Math.min(100, (currentAgent.autonomous_level || 50) + (learningAnalysis?.predicted_performance_gain || 0));
  
  await context.entities.Agent.update(agent_id, {
    autonomous_level: newAutonomyLevel,
    last_training: new Date().toISOString()
  });
  
  for (const skill of (learningAnalysis?.new_skills || []).slice(0, 3)) {
    if (skill?.skill_name) {
      await context.entities.AgentSkill.create({
        agent_id: agent_id,
        skill_name: skill.skill_name,
        proficiency_level: 1,
        category: 'learned',
        is_active: true
      });
    }
  }
  
  await context.entities.TrainingProgress.create({
    agent_id: agent_id,
    training_type: training_mode,
    progress_percentage: 100,
    insights_gained: learningAnalysis?.success_patterns || [],
    performance_improvement: learningAnalysis?.predicted_performance_gain || 0,
    status: 'completed'
  });
  
  const emergentCapabilities = (learningAnalysis?.behavioral_adjustments || [])
    .filter(adj => adj?.expected_improvement > 15)
    .map(adj => adj?.recommended_behavior);
  
  return {
    agent_id,
    training_completed: true,
    learning_analysis: learningAnalysis,
    autonomy_level: {
      previous: currentAgent.autonomous_level || 50,
      new: newAutonomyLevel,
      improvement: newAutonomyLevel - (currentAgent.autonomous_level || 50)
    },
    skills_acquired: learningAnalysis?.new_skills?.length || 0,
    emergent_capabilities: emergentCapabilities,
    next_training_recommended: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
}