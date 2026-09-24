export default async function spawnAutonomousAgent(data, context) {
  const { name, purpose, skills, autonomy_level = 50 } = data;
  
  const agent = await context.entities.Agent.create({
    name,
    description: purpose,
    status: 'active',
    created_by: context.user.email
  });
  
  const personality = await context.integrations.Core.InvokeLLM({
    prompt: `Create a personality profile for an AI agent:
Name: ${name}
Purpose: ${purpose}
Skills: ${skills.join(', ')}

Generate personality traits that would be effective for this purpose.`,
    response_json_schema: {
      type: "object",
      properties: {
        traits: {
          type: "object",
          properties: {
            creativity: { type: "number" },
            assertiveness: { type: "number" },
            risk_tolerance: { type: "number" },
            collaboration: { type: "number" },
            analytical: { type: "number" }
          }
        },
        communication_style: { type: "string" },
        decision_making_approach: { type: "string" }
      }
    }
  });
  
  await context.entities.AgentPersonality.create({
    agent_id: agent.id,
    traits: personality.traits,
    communication_style: personality.communication_style,
    decision_making_approach: personality.decision_making_approach
  });
  
  for (const skill of skills) {
    await context.entities.AgentSkill.create({
      agent_id: agent.id,
      skill_name: skill,
      proficiency: 50 + Math.random() * 30,
      last_used: new Date().toISOString()
    });
  }
  
  await context.entities.AutonomousSetting.create({
    setting_key: `agent_${agent.id}_autonomy`,
    setting_name: `${name} Autonomy Level`,
    description: `Autonomy configuration for ${name}`,
    category: 'agents',
    enabled: true,
    user_email: context.user.email,
    automation_level: autonomy_level
  });
  
  return { agent, personality };
}