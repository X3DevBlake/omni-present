export default async function mistralAgentGenerator(request, context) {
  const { agentGoal, agentContext } = request.body;

  const mistralApiKey = context.secrets.MISTRAL_API_KEY;
  
  if (!mistralApiKey) {
    return {
      statusCode: 400,
      body: { error: 'Mistral API key not configured' }
    };
  }

  const prompt = `You are an AI agent architect. Create a comprehensive agent specification based on:

Goal: ${agentGoal}
Context: ${agentContext}

Generate a complete agent configuration including:
1. Agent name and type (trader, analyst, explorer, strategist, etc.)
2. Personality traits (risk tolerance, decision style, communication approach)
3. Initial skills (3-5 relevant skills with categories)
4. Behavior tree structure (goals, decision nodes)
5. Memory configuration (what to remember, importance weights)
6. Training recommendations
7. Recommended integrations and tools

Return ONLY valid JSON matching this schema.`;

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${mistralApiKey}`
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: [
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    })
  });

  if (!response.ok) {
    return {
      statusCode: response.status,
      body: { error: 'Mistral API error', details: await response.text() }
    };
  }

  const result = await response.json();
  const agentSpec = JSON.parse(result.choices[0].message.content);

  return {
    statusCode: 200,
    body: agentSpec
  };
}