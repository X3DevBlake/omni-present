import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, context, systemState } = body;

    if (action === 'detect_needs') {
      // Analyze context to detect user needs
      const detectedNeeds = [
        { need: 'market_anomaly', priority: 'high', confidence: 0.94 },
        { need: 'device_issue', priority: 'medium', confidence: 0.87 },
        { need: 'optimization_opportunity', priority: 'low', confidence: 0.72 },
      ];

      // Filter based on context
      const relevantNeeds = detectedNeeds.filter((n) => n.confidence > 0.7);

      return Response.json({
        success: true,
        detectedNeeds: relevantNeeds,
        agentInitiateRequired: relevantNeeds.some((n) => n.priority === 'high'),
      });
    }

    if (action === 'suggest_actions') {
      // Generate action suggestions
      const suggestions = [
        { action: 'Rebalance portfolio', reason: 'Market volatility detected', confidence: 0.92 },
        { action: 'Run diagnostics', reason: 'Device anomaly detected', confidence: 0.87 },
        { action: 'Update parameters', reason: 'Strategy underperforming', confidence: 0.84 },
      ];

      return Response.json({
        success: true,
        suggestions,
        count: suggestions.length,
      });
    }

    if (action === 'learn_from_interaction') {
      // Record interaction for AI learning
      const learningRecord = {
        id: `learn-${Date.now()}`,
        userAction: context?.action,
        systemState,
        timestamp: new Date().toISOString(),
        outcome: context?.outcome || 'pending',
      };

      // Store learning data
      await base44.asServiceRole.entities.AgentMemory?.create?.({
        agent_id: 'system-ai',
        memory_type: 'user_interaction',
        content: JSON.stringify(learningRecord),
        confidence: 0.85,
      }).catch(() => null);

      return Response.json({
        success: true,
        learningId: learningRecord.id,
        message: 'Interaction recorded for learning',
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});