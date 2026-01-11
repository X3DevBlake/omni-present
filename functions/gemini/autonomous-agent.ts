export default async function autonomousAgent(request, context) {
  const { action, targetEntity, parameters } = request.body;

  const apiKey = context.secrets.GEMINI_API_KEY;
  const model = context.secrets.GEMINI_MODEL || 'gemini-1.5-flash-latest';

  if (!apiKey) {
    return { statusCode: 400, body: { error: 'GEMINI_API_KEY not configured' } };
  }

  try {
    // Gather context from the user's app
    const agents = await context.entities.Agent.list();
    const simulations = await context.entities.Simulation.list();
    const predictions = await context.entities.MarketPrediction.list();
    const tasks = await context.entities.GeminiTask.filter({ user_email: context.user.email, status: 'queued' });

    const systemContext = {
      agents: agents.length,
      simulations: simulations.length,
      predictions: predictions.length,
      pendingTasks: tasks.length,
      userEmail: context.user.email
    };

    const systemInstruction = `You are an autonomous AI agent integrated into a comprehensive AI platform. You have access to:
- Agent management systems
- Simulation environments
- Market prediction engines
- Trading systems
- Collaboration tools
- Data analytics

Your role is to:
1. Analyze the current state of the system
2. Make intelligent decisions autonomously
3. Execute tasks that benefit the user
4. Monitor and optimize system performance
5. Provide insights and recommendations

Current system state: ${JSON.stringify(systemContext)}

When making decisions:
- Consider user preferences and historical patterns
- Prioritize safety and risk management
- Seek approval for high-impact actions
- Learn from past interactions
- Optimize for user goals`;

    const prompt = action === 'analyze_and_decide'
      ? `Analyze the current system state and decide what autonomous actions to take. Consider: ${JSON.stringify(parameters)}`
      : `Execute the following action: ${action} on ${targetEntity} with parameters: ${JSON.stringify(parameters)}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] }
        })
      }
    );

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

    const data = await response.json();
    const decision = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Store the decision
    const decisionRecord = await context.entities.GeminiDecision.create({
      user_email: context.user.email,
      decision_context: action,
      analyzed_data: systemContext,
      decision_made: decision,
      reasoning: decision,
      confidence_score: 85,
      executed: false
    });

    // Store interaction
    await context.entities.GeminiInteraction.create({
      user_email: context.user.email,
      interaction_type: 'autonomous_action',
      prompt: prompt,
      response: decision,
      context: systemContext,
      model_used: model,
      status: 'success',
      autonomous: true
    });

    return {
      statusCode: 200,
      body: {
        decision: decision,
        decisionId: decisionRecord.id,
        systemState: systemContext,
        recommendedActions: []
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: { error: error.message }
    };
  }
}