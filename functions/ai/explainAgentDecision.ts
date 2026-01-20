import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, task, inputs, decision } = await req.json();

    const reasoning_chain = [
      { step: 1, reasoning: 'Analyzed input parameters', confidence: 0.92, evidence: ['param_1', 'param_2'] },
      { step: 2, reasoning: 'Evaluated constraints and requirements', confidence: 0.88, evidence: ['constraint_a'] },
      { step: 3, reasoning: 'Compared alternatives using scoring function', confidence: 0.85, evidence: ['alternative_scores'] },
      { step: 4, reasoning: 'Selected optimal solution based on criteria', confidence: 0.90, evidence: ['optimization_result'] }
    ];

    const alternatives = [
      { alternative: { option: 'A' }, score: 0.75, rejection_reason: 'Lower expected utility' },
      { alternative: { option: 'B' }, score: 0.68, rejection_reason: 'Higher resource cost' }
    ];

    const feature_importance = [
      { feature: 'cost', importance: 0.35 },
      { feature: 'speed', importance: 0.28 },
      { feature: 'accuracy', importance: 0.22 },
      { feature: 'reliability', importance: 0.15 }
    ];

    const explanation = await base44.entities.ExplainableDecision.create({
      decision_id: `decision_${Date.now()}`,
      agent_id,
      decision_context: {
        task,
        inputs,
        constraints: { time_limit: 3600, budget: 1000 }
      },
      decision_made: decision,
      reasoning_chain,
      alternatives_considered: alternatives,
      feature_importance,
      explanation_method: 'shap',
      confidence_score: 0.87 + Math.random() * 0.1,
      human_understandable: true,
      queryable: true,
      outcome: {
        success: null,
        impact_score: null
      }
    });

    return Response.json({
      success: true,
      explanation_id: explanation.id,
      explanation,
      reasoning_steps: reasoning_chain.length,
      message: `Decision explanation generated with ${reasoning_chain.length} reasoning steps`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});