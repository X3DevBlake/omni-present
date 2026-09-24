export default async function agentDecisionEngine(data, context) {
  const { agent_id, scenario, options } = data;
  
  // Get agent configuration and personality
  const agent = await context.entities.Agent.get(agent_id);
  if (!agent) throw new Error('Agent not found');
  
  const personality = await context.entities.AgentPersonality.filter({ agent_id });
  const memory = await context.entities.AgentMemory.filter({ agent_id }).sort('-created_date').limit(10);
  
  // Build decision context
  const decisionContext = {
    agent: agent.name,
    personality: personality[0]?.traits || {},
    recentMemory: memory.map(m => m.content).join('. '),
    scenario,
    options
  };
  
  // Use AI to make decision
  const decision = await context.integrations.Core.InvokeLLM({
    prompt: `You are ${agent.name}, an AI agent with the following traits: ${JSON.stringify(decisionContext.personality)}. 
Recent context: ${decisionContext.recentMemory}

Scenario: ${scenario}

Available options: ${JSON.stringify(options, null, 2)}

Make the best decision based on your personality and context. Explain your reasoning.`,
    response_json_schema: {
      type: "object",
      properties: {
        chosen_option: { type: "string" },
        reasoning: { type: "string" },
        confidence: { type: "number" }
      }
    }
  });
  
  // Log decision
  await context.entities.AgentMemory.create({
    agent_id,
    content: `Decision: ${decision.chosen_option}. Reasoning: ${decision.reasoning}`,
    memory_type: 'decision',
    importance: decision.confidence
  });
  
  return decision;
}