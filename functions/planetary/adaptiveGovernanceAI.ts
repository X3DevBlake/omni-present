import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { policyId, citizenFeedback } = await req.json();

    // Fetch policy
    const policies = await base44.entities.PlanetaryGovernancePolicy.filter({ policy_id: policyId });
    if (!policies || policies.length === 0) {
      return Response.json({ error: 'Policy not found' }, { status: 404 });
    }
    const policy = policies[0];

    // Fetch latest NASA data
    const updatedNasaData = await base44.integrations.Core.InvokeLLM({
      prompt: `Fetch latest NASA scientific data about ${policy.celestial_body}. Include recent discoveries, updated surface composition analysis, atmospheric changes, resource assessments, and any new habitability insights.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          surface_composition: { type: "object" },
          atmospheric_data: { type: "object" },
          recent_discoveries: { type: "array", items: { type: "string" } },
          habitability_score: { type: "number" },
          resource_assessments: { type: "object" }
        }
      }
    });

    // AI learns from feedback and outcomes
    const learningAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `As Omega Adaptive Governance AI, learn from real-world policy implementation:

Policy: ${policy.policy_name}
Planet: ${policy.celestial_body}
Original Policy: ${policy.policy_details}

Citizen Feedback (${citizenFeedback?.length || 0} responses):
${citizenFeedback?.map(f => `- ${f.sentiment}: ${f.specific_concerns?.join(', ')}`).join('\n') || 'No feedback yet'}

Updated NASA Data:
${JSON.stringify(updatedNasaData, null, 2)}

Original Impact Predictions:
- Swarm Ops: +${policy.simulated_impact?.swarm_operations_delta}%
- Settlement Growth: +${policy.simulated_impact?.settlement_growth_rate}%
- Resources: +${policy.simulated_impact?.resource_efficiency_gain}%
- Ethics: ${policy.simulated_impact?.ethical_compliance_score}

Analyze:
1. What worked well vs what didn't?
2. How do real outcomes compare to predictions?
3. What NASA data changes impact this policy?
4. How should the policy evolve based on citizen needs?
5. What adjustments align with ethical landscape?

Propose dynamic policy adjustments and learning insights.`,
      response_json_schema: {
        type: "object",
        properties: {
          real_world_outcomes: {
            type: "object",
            properties: {
              resource_efficiency_actual: { type: "number" },
              settlement_satisfaction: { type: "number" },
              environmental_impact_actual: { type: "number" },
              swarm_performance_actual: { type: "number" },
              unexpected_consequences: { type: "array", items: { type: "string" } }
            }
          },
          ai_learning_insights: { type: "string" },
          recommended_adjustments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                adjustment: { type: "string" },
                reasoning: { type: "string" },
                expected_improvement: { type: "number" }
              }
            }
          },
          ethical_landscape_alignment: {
            type: "object",
            properties: {
              privacy_alignment: { type: "number" },
              fairness_alignment: { type: "number" },
              autonomy_alignment: { type: "number" },
              beneficence_alignment: { type: "number" }
            }
          },
          policy_evolution_needed: { type: "boolean" },
          evolved_policy_proposal: { type: "string" },
          omega_governance_learning: { type: "string" }
        }
      }
    });

    // Create feedback loop record
    const feedbackLoop = await base44.asServiceRole.entities.GovernanceFeedbackLoop.create({
      feedback_id: `FBL_${Date.now()}`,
      policy_id: policyId,
      celestial_body: policy.celestial_body,
      implementation_date: new Date().toISOString(),
      citizen_feedback: citizenFeedback || [],
      real_world_outcomes: learningAnalysis.real_world_outcomes,
      ai_learning_insights: learningAnalysis.ai_learning_insights,
      recommended_adjustments: learningAnalysis.recommended_adjustments,
      ethical_landscape_alignment: learningAnalysis.ethical_landscape_alignment,
      nasa_data_validation: updatedNasaData,
      policy_evolution_proposed: learningAnalysis.policy_evolution_needed,
      omega_governance_learning: learningAnalysis.omega_governance_learning
    });

    // If evolution needed, create new policy version
    if (learningAnalysis.policy_evolution_needed) {
      await base44.asServiceRole.entities.PlanetaryGovernancePolicy.create({
        policy_id: `${policyId}_V2_${Date.now()}`,
        celestial_body: policy.celestial_body,
        policy_name: `${policy.policy_name} (Evolved)`,
        policy_category: policy.policy_category,
        proposed_by_ai: "Omega_Adaptive_Governance_AI",
        planetary_data_analysis: {
          resource_distribution: updatedNasaData.surface_composition,
          societal_needs_score: learningAnalysis.real_world_outcomes.settlement_satisfaction,
          environmental_impact_score: learningAnalysis.real_world_outcomes.environmental_impact_actual,
          population_density: 0,
          infrastructure_adequacy: 0
        },
        nasa_data_integration: updatedNasaData,
        policy_details: learningAnalysis.evolved_policy_proposal,
        evolution_path: policy.evolution_path,
        simulated_impact: learningAnalysis.real_world_outcomes,
        ethical_alignment: learningAnalysis.ethical_landscape_alignment,
        ai_confidence: 0.88,
        omega_governance_reasoning: learningAnalysis.omega_governance_learning,
        status: "proposed"
      });
    }

    return Response.json({
      success: true,
      feedback_loop: feedbackLoop,
      policy_evolved: learningAnalysis.policy_evolution_needed,
      adjustments_recommended: learningAnalysis.recommended_adjustments.length,
      nasa_data_updated: true,
      ethical_alignment: learningAnalysis.ethical_landscape_alignment,
      ai_learning: learningAnalysis.ai_learning_insights
    });

  } catch (error) {
    console.error('Adaptive Governance AI Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});