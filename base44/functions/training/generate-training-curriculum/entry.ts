export default async function generateTrainingCurriculum(data, context) {
  const { agent_id, target_skills } = data;
  
  // Get agent current state
  const agent = await context.entities.Agent.get(agent_id);
  const currentSkills = await context.entities.AgentSkill.filter({ agent_id });
  const kpi = await context.entities.AgentKPI.filter({ agent_id }).sort('-created_date').limit(1);
  
  // Identify skill gaps
  const currentSkillNames = currentSkills.map(s => s.skill_name);
  const skillGaps = target_skills.filter(skill => !currentSkillNames.includes(skill));
  
  // Generate curriculum using AI
  const curriculum = await context.integrations.Core.InvokeLLM({
    prompt: `Create a training curriculum for an AI agent to acquire new skills.

Agent: ${agent.name}
Current skills: ${currentSkillNames.join(', ')}
Current performance: ${kpi[0]?.success_rate || 'N/A'}% success rate

Target skills: ${target_skills.join(', ')}
Skill gaps: ${skillGaps.join(', ')}

Generate a structured training curriculum with:
1. 5-10 training modules
2. Each module should have: title, description, estimated duration (hours), prerequisites, learning objectives
3. Progressive difficulty
4. Practical exercises for each module`,
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
              title: { type: "string" },
              description: { type: "string" },
              duration_hours: { type: "number" },
              prerequisites: { type: "array", items: { type: "string" } },
              learning_objectives: { type: "array", items: { type: "string" } },
              exercises: { type: "array", items: { type: "string" } }
            }
          }
        }
      }
    }
  });
  
  // Save curriculum
  const saved = await context.entities.TrainingCurriculum.create({
    agent_id,
    curriculum_name: curriculum.curriculum_name,
    target_skills,
    modules: curriculum.modules,
    total_duration_hours: curriculum.total_duration_hours,
    status: 'active'
  });
  
  return saved;
}