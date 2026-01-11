import { base44 } from '@/api/base44Client';

export async function invokeGemini(prompt, options = {}) {
  // Use Gemini through base44 LLM integration
  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: options.useWebSearch || false,
    response_json_schema: options.jsonSchema,
    file_urls: options.fileUrls
  });

  return result;
}

export async function geminiMultiModalAnalysis(prompt, imageUrls = [], videoUrls = []) {
  const allMedia = [...imageUrls, ...videoUrls];
  
  const analysis = await base44.integrations.Core.InvokeLLM({
    prompt: `Multi-modal analysis: ${prompt}`,
    file_urls: allMedia,
    add_context_from_internet: true,
    response_json_schema: {
      type: 'object',
      properties: {
        visual_insights: { type: 'array', items: { type: 'string' } },
        detected_objects: { type: 'array', items: { type: 'object' } },
        contextual_understanding: { type: 'string' },
        actionable_recommendations: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  return analysis;
}

export async function geminiRealtimeCollaborationAnalysis(collaborationId) {
  const collab = await base44.entities.AgentCollaboration.filter({ workspace_id: collaborationId });
  const communications = await base44.entities.AgentCommunication.filter({ collaboration_id: collaborationId });

  const analysis = await base44.integrations.Core.InvokeLLM({
    prompt: `Analyze multi-agent collaboration: ${communications.length} messages. Identify communication patterns, sentiment shifts, decision quality, and collaboration effectiveness. Provide deep insights.`,
    response_json_schema: {
      type: 'object',
      properties: {
        communication_quality: { type: 'number' },
        sentiment_analysis: { type: 'object' },
        key_decisions: { type: 'array', items: { type: 'object' } },
        collaboration_dynamics: { type: 'object' },
        improvement_suggestions: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  return analysis;
}

export async function geminiPredictiveForecasting(dataPoints, forecastHorizon) {
  const forecast = await base44.integrations.Core.InvokeLLM({
    prompt: `Advanced forecasting: Analyze ${dataPoints.length} data points and predict next ${forecastHorizon} periods. Use sophisticated pattern recognition and trend analysis.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: 'object',
      properties: {
        predictions: { type: 'array', items: { type: 'object' } },
        confidence_intervals: { type: 'array', items: { type: 'number' } },
        trend_analysis: { type: 'string' },
        risk_factors: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  return forecast;
}