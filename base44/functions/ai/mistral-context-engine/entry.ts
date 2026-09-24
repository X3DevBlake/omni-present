// Mistral Context Engine - provides context-aware AI assistance across the platform

export default async function mistralContextEngine(request, context) {
  const { query, contextType, additionalContext } = request.body;

  const mistralApiKey = context.secrets.MISTRAL_API_KEY;
  
  if (!mistralApiKey) {
    return {
      statusCode: 400,
      body: { error: 'Mistral API key not configured' }
    };
  }

  // Build context-specific system prompts
  const systemPrompts = {
    navigation: "You are a navigation assistant helping users find the right hub in the platform. Be concise and helpful.",
    analysis: "You are a financial and data analysis expert. Provide clear, actionable insights.",
    training: "You are an AI training specialist. Help users optimize their agent training strategies.",
    strategy: "You are a strategic advisor. Provide thoughtful recommendations for complex decisions.",
    general: "You are a helpful AI assistant integrated into an advanced financial and AI platform."
  };

  const systemPrompt = systemPrompts[contextType] || systemPrompts.general;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `${query}\n\nAdditional Context: ${JSON.stringify(additionalContext)}` }
  ];

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mistralApiKey}`
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: { error: 'Mistral API error', details: await response.text() }
      };
    }

    const result = await response.json();
    const aiResponse = result.choices[0].message.content;

    return {
      statusCode: 200,
      body: {
        response: aiResponse,
        contextType: contextType,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: { error: error.message }
    };
  }
}