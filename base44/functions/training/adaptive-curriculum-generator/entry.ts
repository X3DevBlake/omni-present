export default async function adaptiveCurriculumGenerator(data, context) {
  const { agent_id, learning_goals, time_budget_hours = 40 } = data;
  
  const agent = await context.entities.Agent.get(agent_id);
  const currentSkills = await context.entities.AgentSkill.filter({ agent_id });
  const performanceData = await context.entities.AgentKPI.filter({ agent_id }).sort('-created_date').limit(10);
  const completedTraining = await context.entities.AgentTrainingSession.filter({ 
    agent_id, 
    status: 'completed' 
  });
  
  const curriculum = await context.integrations.Core.InvokeLLM({
    prompt: `Generate adaptive learning curriculum for AI agent:

Agent: ${agent.name}
Current Skills: ${currentSkills.map(s => `${s.skill_name} (${s.proficiency}%)`).join(', ')}
Learning Goals: ${learning_goals.join(', ')}
Time Budget: ${time_budget_hours} hours

Recent Performance:
- Avg Success Rate: ${performanceData.reduce((s, p) => s + p.success_rate, 0) / performanceData.length}%
- Completed Training Sessions: ${completedTraining.length}

Create personalized curriculum with:
1. Learning modules sequenced by difficulty
2. Prerequisite skills mapping
3. Hands-on exercises
4. Assessment checkpoints
5. Adaptive difficulty adjustments
6. Time allocation per module`,
    response_json_schema: {
      type: "object",
      properties: {
        curriculum_name: { type: "string" },
        total_duration_hours: { type: "number" },
        modules: {
          type: "array",
          items: {
            type: "object",
            properties: {
              module_name: { type: "string" },
              learning_objectives: { type: "array", items: { type: "string" } },
              prerequisites: { type: "array", items: { type: "string" } },
              duration_hours: { type: "number" },
              difficulty_level: { type: "number" },
              exercises: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    exercise_name: { type: "string" },
                    description: { type: "string" },
                    expected_outcome: { type: "string" }
                  }
                }
              },
              assessment_criteria: { type: "array", items: { type: "string" } }
            }
          }
        },
        learning_path: { type: "array", items: { type: "string" } },
        adaptive_checkpoints: {
          type: "array",
          items: {
            type: "object",
            properties: {
              checkpoint_name: { type: "string" },
              evaluation_method: { type: "string" },
              pass_threshold: { type: "number" },
              remedial_path: { type: "string" }
            }
          }
        }
      }
    }
  });
  
  const trainingCurriculum = await context.entities.TrainingCurriculum.create({
    agent_id,
    curriculum_name: curriculum.curriculum_name,
    learning_goals,
    modules: curriculum.modules,
    total_duration_hours: curriculum.total_duration_hours,
    learning_path: curriculum.learning_path,
    adaptive_checkpoints: curriculum.adaptive_checkpoints,
    status: 'active',
    progress_percentage: 0
  });
  
  for (const module of curriculum.modules.slice(0, 3)) {
    await context.entities.AgentTrainingModule.create({
      agent_id,
      curriculum_id: trainingCurriculum.id,
      module_name: module.module_name,
      learning_objectives: module.learning_objectives,
      exercises: module.exercises,
      status: 'pending',
      difficulty_level: module.difficulty_level
    });
  }
  
  return {
    curriculum: trainingCurriculum,
    modules_created: curriculum.modules.length,
    estimated_completion_days: Math.ceil(curriculum.total_duration_hours / 8)
  };
}