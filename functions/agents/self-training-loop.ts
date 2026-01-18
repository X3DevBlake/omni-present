export default async function selfTrainingLoop(data, context) {
  const { agent_id } = data;
  
  const agent = await context.entities.Agent.get(agent_id);
  const recentKPIs = await context.entities.AgentKPI.filter({ agent_id }).sort('-created_date').limit(20);
  const interactions = await context.entities.AgentInteractionLog.filter({ agent_id }).sort('-created_date').limit(100);
  const currentSkills = await context.entities.AgentSkill.filter({ agent_id });
  const memory = await context.entities.AgentMemory.filter({ agent_id }).sort('-importance').limit(50);
  
  const performanceTrend = recentKPIs.map((kpi, i) => ({
    index: i,
    success_rate: kpi.success_rate,
    efficiency: kpi.efficiency,
    response_time: kpi.response_time
  }));
  
  const successPatterns = interactions.filter(i => i.status === 'success').slice(0, 20);
  const failurePatterns = interactions.filter(i => i.status === 'failed').slice(0, 20);
  
  const trainingPlan = await context.integrations.Core.InvokeLLM({
    prompt: `Design a self-improvement training plan for AI agent: ${agent.name}

Performance Trend (last 20 periods):
- Avg Success Rate: ${(recentKPIs.reduce((s, k) => s + k.success_rate, 0) / recentKPIs.length).toFixed(1)}%
- Avg Efficiency: ${(recentKPIs.reduce((s, k) => s + k.efficiency, 0) / recentKPIs.length).toFixed(1)}
- Trend: ${performanceTrend[0]?.success_rate > performanceTrend[performanceTrend.length - 1]?.success_rate ? 'Declining' : 'Improving'}

Current Skills:
${currentSkills.map(s => `${s.skill_name}: ${s.proficiency}%`).join('\n')}

Success Patterns: ${successPatterns.length} successful actions
Failure Patterns: ${failurePatterns.length} failed actions

Key Memories:
${memory.slice(0, 5).map(m => m.content).join('\n')}

Design a training plan that:
1. Addresses performance gaps
2. Reinforces successful patterns
3. Adds missing critical skills
4. Implements progressive difficulty
5. Includes self-assessment checkpoints

The agent should autonomously execute this plan.`,
    response_json_schema: {
      type: "object",
      properties: {
        training_objectives: { type: "array", items: { type: "string" } },
        skills_to_improve: {
          type: "array",
          items: {
            type: "object",
            properties: {
              skill_name: { type: "string" },
              current_level: { type: "number" },
              target_level: { type: "number" },
              training_method: { type: "string" },
              estimated_duration_hours: { type: "number" }
            }
          }
        },
        new_skills_to_acquire: {
          type: "array",
          items: {
            type: "object",
            properties: {
              skill_name: { type: "string" },
              reasoning: { type: "string" },
              priority: { type: "string" }
            }
          }
        },
        training_exercises: {
          type: "array",
          items: {
            type: "object",
            properties: {
              exercise_name: { type: "string" },
              description: { type: "string" },
              difficulty: { type: "number" },
              success_criteria: { type: "string" }
            }
          }
        },
        self_assessment_metrics: { type: "array", items: { type: "string" } },
        estimated_total_duration_hours: { type: "number" }
      }
    }
  });
  
  const trainingSession = await context.entities.AgentTrainingSession.create({
    agent_id,
    training_type: 'autonomous_self_improvement',
    objectives: trainingPlan.training_objectives,
    status: 'active',
    started_at: new Date().toISOString(),
    planned_exercises: trainingSession.training_exercises
  });
  
  for (const skillImprovement of trainingPlan.skills_to_improve) {
    const skill = currentSkills.find(s => s.skill_name === skillImprovement.skill_name);
    if (skill) {
      await context.entities.AgentSkill.update(skill.id, {
        target_proficiency: skillImprovement.target_level,
        training_plan: skillImprovement.training_method
      });
    }
  }
  
  for (const newSkill of trainingPlan.new_skills_to_acquire) {
    await context.entities.AgentSkill.create({
      agent_id,
      skill_name: newSkill.skill_name,
      proficiency: 0,
      target_proficiency: 70,
      acquisition_reason: newSkill.reasoning
    });
  }
  
  await context.entities.AgentMemory.create({
    agent_id,
    content: `Initiated self-training loop. Objectives: ${trainingPlan.training_objectives.join(', ')}`,
    memory_type: 'training',
    importance: 90
  });
  
  return { 
    training_session, 
    training_plan,
    autonomous_initiation: true,
    next_checkpoint: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
}