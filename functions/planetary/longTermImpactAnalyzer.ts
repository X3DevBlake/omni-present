import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { policyId, monthsActive } = await req.json();

    // Fetch policy and feedback loops
    const policies = await base44.entities.PlanetaryGovernancePolicy.filter({ policy_id: policyId });
    if (!policies || policies.length === 0) {
      return Response.json({ error: 'Policy not found' }, { status: 404 });
    }
    const policy = policies[0];

    const feedbackLoops = await base44.entities.GovernanceFeedbackLoop.filter({ policy_id: policyId });

    // Fetch latest NASA data
    const nasaDataUpdate = await base44.integrations.Core.InvokeLLM({
      prompt: `Fetch latest comprehensive NASA data about ${policy.celestial_body}, including recent discoveries, atmospheric changes, resource availability updates, and any new scientific insights relevant to governance.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          surface_composition_changes: { type: "object" },
          atmospheric_evolution: { type: "object" },
          resource_availability_update: { type: "object" },
          new_discoveries: { type: "array", items: { type: "string" } },
          habitability_trend: { type: "string" }
        }
      }
    });

    // AI analyzes long-term impact
    const impactAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `As Omega Planetary Governance AI, analyze long-term policy impact and strategically adjust governance:

Policy: ${policy.policy_name} on ${policy.celestial_body}
Time Active: ${monthsActive} months

Original Predictions:
${JSON.stringify(policy.simulated_impact, null, 2)}

Accumulated Feedback (${feedbackLoops.length} loops):
${feedbackLoops.map(f => `- ${f.ai_learning_insights}`).join('\n')}

Latest NASA Data Evolution:
${JSON.stringify(nasaDataUpdate, null, 2)}

Analyze:
1. How have settlement metrics evolved over ${monthsActive} months?
2. What is the real impact on swarm operations?
3. How has citizen sentiment trended?
4. Do NASA data changes require strategic pivots?
5. What dynamic adjustments should be made NOW?
6. Is the policy still aligned with ethical frameworks?

Provide comprehensive long-term analysis with specific strategic adjustments.`,
      response_json_schema: {
        type: "object",
        properties: {
          settlement_metrics: {
            type: "object",
            properties: {
              population_growth: { type: "number" },
              infrastructure_development_index: { type: "number" },
              resource_sustainability_score: { type: "number" },
              citizen_wellbeing_index: { type: "number" },
              economic_productivity: { type: "number" }
            }
          },
          swarm_operations_impact: {
            type: "object",
            properties: {
              efficiency_change: { type: "number" },
              mission_success_rate: { type: "number" },
              agent_coordination_quality: { type: "number" },
              adaptive_capability_improvement: { type: "number" }
            }
          },
          citizen_sentiment_trends: {
            type: "array",
            items: {
              type: "object",
              properties: {
                month: { type: "number" },
                positive_percent: { type: "number" },
                neutral_percent: { type: "number" },
                negative_percent: { type: "number" },
                key_topics: { type: "array", items: { type: "string" } }
              }
            }
          },
          strategic_adjustments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                adjustment: { type: "string" },
                trigger: { type: "string" },
                priority: { type: "string" },
                expected_outcome: { type: "string" }
              }
            }
          },
          ethical_alignment_check: {
            type: "object",
            properties: {
              privacy_alignment: { type: "number" },
              fairness_alignment: { type: "number" },
              autonomy_alignment: { type: "number" },
              beneficence_alignment: { type: "number" },
              alignment_trend: { type: "string" }
            }
          },
          omega_continuous_learning: { type: "string" },
          policy_effectiveness_score: { type: "number" },
          adjustment_urgency: { type: "string" }
        }
      }
    });

    // Create long-term impact record
    const impactRecord = await base44.asServiceRole.entities.GovernanceLongTermImpact.create({
      impact_id: `IMPACT_${Date.now()}`,
      policy_id: policyId,
      celestial_body: policy.celestial_body,
      time_period_months: monthsActive,
      settlement_metrics: impactAnalysis.settlement_metrics,
      swarm_operations_impact: impactAnalysis.swarm_operations_impact,
      nasa_data_evolution: nasaDataUpdate,
      citizen_sentiment_trends: impactAnalysis.citizen_sentiment_trends,
      ai_strategic_adjustments: impactAnalysis.strategic_adjustments.map(adj => ({
        adjustment_date: new Date().toISOString(),
        adjustment: adj.adjustment,
        trigger: adj.trigger,
        outcome: adj.expected_outcome
      })),
      ethical_alignment_evolution: {
        initial_alignment: policy.ethical_alignment,
        current_alignment: impactAnalysis.ethical_alignment_check,
        alignment_trend: impactAnalysis.ethical_alignment_check.alignment_trend
      },
      omega_continuous_learning: impactAnalysis.omega_continuous_learning,
      policy_effectiveness_score: impactAnalysis.policy_effectiveness_score
    });

    // If urgent adjustments needed, create evolved policy
    if (impactAnalysis.adjustment_urgency === 'high' || impactAnalysis.adjustment_urgency === 'critical') {
      await base44.asServiceRole.entities.PlanetaryGovernancePolicy.create({
        policy_id: `${policyId}_ADAPT_${Date.now()}`,
        celestial_body: policy.celestial_body,
        policy_name: `${policy.policy_name} (Adapted)`,
        policy_category: policy.policy_category,
        proposed_by_ai: "Omega_Long_Term_Learning_AI",
        planetary_data_analysis: {
          resource_distribution: nasaDataUpdate.resource_availability_update,
          societal_needs_score: impactAnalysis.settlement_metrics.citizen_wellbeing_index,
          environmental_impact_score: impactAnalysis.settlement_metrics.resource_sustainability_score,
          population_density: impactAnalysis.settlement_metrics.population_growth,
          infrastructure_adequacy: impactAnalysis.settlement_metrics.infrastructure_development_index
        },
        nasa_data_integration: nasaDataUpdate,
        policy_details: `Adapted based on ${monthsActive} months of real-world data: ${impactAnalysis.strategic_adjustments[0]?.adjustment}`,
        evolution_path: policy.evolution_path,
        simulated_impact: impactAnalysis.swarm_operations_impact,
        ethical_alignment: impactAnalysis.ethical_alignment_check,
        ai_confidence: impactAnalysis.policy_effectiveness_score,
        omega_governance_reasoning: impactAnalysis.omega_continuous_learning,
        status: "proposed"
      });
    }

    return Response.json({
      success: true,
      impact_record: impactRecord,
      effectiveness_score: impactAnalysis.policy_effectiveness_score,
      strategic_adjustments: impactAnalysis.strategic_adjustments.length,
      policy_adapted: impactAnalysis.adjustment_urgency === 'high' || impactAnalysis.adjustment_urgency === 'critical',
      nasa_data_integrated: true,
      ethical_aligned: impactAnalysis.ethical_alignment_check.alignment_trend === 'improving'
    });

  } catch (error) {
    console.error('Long-Term Impact Analyzer Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});