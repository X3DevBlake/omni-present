export default async function invokeGemini(request, context) {
  const { prompt, context: additionalContext, systemInstruction, includeVision, imagePaths } = request.body;

  const apiKey = context.secrets.GEMINI_API_KEY;
  const model = context.secrets.GEMINI_MODEL || 'gemini-1.5-pro-latest';

  if (!apiKey) {
    return {
      statusCode: 400,
      body: { error: 'GEMINI_API_KEY not configured' }
    };
  }

  const startTime = Date.now();

  try {
    const endpoint = includeVision 
      ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const parts = [{ text: prompt }];

    // Add images if vision is enabled
    if (includeVision && imagePaths && imagePaths.length > 0) {
      for (const imagePath of imagePaths) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: imagePath // Base64 encoded image
          }
        });
      }
    }

    const requestBody = {
      contents: [{
        parts: parts
      }]
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const executionTime = Date.now() - startTime;

    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Store interaction
    await context.entities.GeminiInteraction.create({
      user_email: context.user.email,
      interaction_type: includeVision ? 'analysis' : 'chat',
      prompt: prompt,
      response: responseText,
      context: additionalContext || {},
      model_used: model,
      tokens_used: data.usageMetadata?.totalTokenCount || 0,
      execution_time_ms: executionTime,
      status: 'success',
      autonomous: false
    });

    return {
      statusCode: 200,
      body: {
        response: responseText,
        model: model,
        tokensUsed: data.usageMetadata?.totalTokenCount || 0,
        executionTime: executionTime
      }
    };
  } catch (error) {
    await context.entities.GeminiInteraction.create({
      user_email: context.user.email,
      interaction_type: 'chat',
      prompt: prompt,
      response: error.message,
      model_used: model,
      execution_time_ms: Date.now() - startTime,
      status: 'failed',
      autonomous: false
    });

    return {
      statusCode: 500,
      body: { error: error.message }
    };
  }
}