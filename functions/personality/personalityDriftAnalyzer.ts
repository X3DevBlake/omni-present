import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id } = await req.json();

    // Fetch personality evolution history
    const evolutions = await base44.entities.AgentPersonalityEvolution.filter({ agent_id });
    
    if (evolutions.length === 0) {
      return Response.json({ error: 'No personality data found' }, { status: 404 });
    }

    const sorted = evolutions.sort((a, b) => 
      new Date(a.created_date) - new Date(b.created_date)
    );

    const baseline = sorted[0];
    const current = sorted[sorted.length - 1];

    // Calculate drift metrics
    const calculateDrift = (baseline, current, field) => {
      const baseVal = baseline.personality_snapshot[field] || 0;
      const currVal = current.personality_snapshot[field] || 0;
      return currVal - baseVal;
    };

    const driftMetrics = {
      overall_drift_magnitude: Math.abs(parseFloat(current.version) - parseFloat(baseline.version)),
      empathy_drift: calculateDrift(baseline, current, 'empathy_score'),
      assertiveness_drift: calculateDrift(baseline, current, 'assertiveness'),
      formality_drift: baseline.personality_snapshot.communication_style === current.personality_snapshot.communication_style ? 0 : 1,
      creativity_drift: calculateDrift(baseline, current, 'creativity_index')
    };

    // AI analysis of drift
    const analysisPrompt = `Analyze this agent's personality drift:

Baseline: ${JSON.stringify(baseline.personality_snapshot)}
Current: ${JSON.stringify(current.personality_snapshot)}
Drift Metrics: ${JSON.stringify(driftMetrics)}
Learned Traits: ${current.learned_traits?.length || 0}

Assess:
1. Is this drift healthy or concerning?
2. What triggered the drift?
3. What adjustments are recommended?`;

    const aiAssessment = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          assessment: { type: "string" },
          triggers: { type: "array" },
          recommendations: { type: "array" },
          user_feedback_correlation: { type: "object" }
        }
      }
    });

    // Create analysis record
    const analysis = await base44.asServiceRole.entities.PersonalityDriftAnalysis.create({
      analysis_id: `drift_${agent_id}_${Date.now()}`,
      agent_id,
      baseline_personality: baseline.personality_snapshot,
      current_personality: current.personality_snapshot,
      drift_metrics: driftMetrics,
      drift_triggers: aiAssessment.triggers || [],
      drift_assessment: aiAssessment.assessment || 'healthy',
      recommendations: aiAssessment.recommendations || [],
      user_feedback_correlation: aiAssessment.user_feedback_correlation || {
        positive_feedback_trend: 0.8,
        negative_feedback_trend: 0.2,
        correlation_with_drift: 0.6
      },
      analysis_timestamp: new Date().toISOString()
    });

    return Response.json({
      success: true,
      analysis,
      drift_severity: driftMetrics.overall_drift_magnitude,
      assessment: aiAssessment.assessment
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});