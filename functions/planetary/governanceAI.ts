import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { celestialBody } = await req.json();

    // Fetch NASA data for the planet
    const nasaData = await base44.integrations.Core.InvokeLLM({
      prompt: `Fetch comprehensive data about ${celestialBody} from NASA databases and scientific literature. Include surface composition, atmospheric data, geological activity, resource availability, and habitability assessment.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          surface_composition: {
            type: "object",
            properties: {
              primary_elements: { type: "array", items: { type: "string" } },
              mineral_deposits: { type: "array", items: { type: "string" } }
            }
          },
          atmospheric_data: {
            type: "object",
            properties: {
              composition: { type: "object" },
              pressure_kpa: { type: "number" },
              temperature_k: { type: "number" }
            }
          },
          geological_activity: { type: "string" },
          water_ice_presence: { type: "boolean" },
          habitability_score: { type: "number" },
          key_challenges: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Fetch planetary profile if exists
    const profiles = await base44.entities.PlanetaryEnvironmentalProfile.filter({ 
      celestial_body_name: celestialBody 
    });
    const planetProfile = profiles && profiles.length > 0 ? profiles[0] : null;

    // AI Governance Policy Generation
    const governanceProposal = await base44.integrations.Core.InvokeLLM({
      prompt: `As an Omega Sentient Planetary Governance AI, analyze this data and propose optimal governance policies for ${celestialBody}:

NASA Data:
${JSON.stringify(nasaData)}

${planetProfile ? `Existing Planetary Profile:
- Deployed Agents: ${planetProfile.deployed_agent_count}
- Mission Types: ${planetProfile.mission_types?.join(', ')}
- Resource Availability: ${JSON.stringify(planetProfile.resource_availability)}
- Communication Challenges: ${planetProfile.communication_challenges?.length}` : 'No existing profile'}

Propose comprehensive governance policies covering:
1. Resource allocation strategies based on availability and sustainability
2. Environmental protection measures aligned with planetary conditions
3. Settlement expansion plans considering habitability and infrastructure
4. Ethical guidelines for agent operations and decision-making
5. Long-term evolution path with 5, 10, and 20 year milestones

Simulate the impact on swarm operations, settlement growth, and ethical compliance.`,
      response_json_schema: {
        type: "object",
        properties: {
          policies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                policy_name: { type: "string" },
                category: { type: "string" },
                policy_details: { type: "string" },
                evolution_path: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      stage: { type: "string" },
                      timeline_years: { type: "number" },
                      expected_outcome: { type: "string" }
                    }
                  }
                },
                simulated_impact: {
                  type: "object",
                  properties: {
                    swarm_operations_delta: { type: "number" },
                    settlement_growth_rate: { type: "number" },
                    resource_efficiency_gain: { type: "number" },
                    ethical_compliance_score: { type: "number" }
                  }
                },
                ethical_alignment: {
                  type: "object",
                  properties: {
                    privacy_score: { type: "number" },
                    fairness_score: { type: "number" },
                    autonomy_score: { type: "number" },
                    beneficence_score: { type: "number" }
                  }
                },
                ai_confidence: { type: "number" }
              }
            }
          },
          planetary_analysis: { type: "string" },
          omega_governance_reasoning: { type: "string" }
        }
      }
    });

    // Create policy records
    const policyRecords = [];
    for (const policy of governanceProposal.policies) {
      const record = await base44.asServiceRole.entities.PlanetaryGovernancePolicy.create({
        policy_id: `POL_${celestialBody}_${Date.now()}`,
        celestial_body: celestialBody,
        policy_name: policy.policy_name,
        policy_category: policy.category,
        proposed_by_ai: "Omega_Planetary_Governance_AI",
        planetary_data_analysis: {
          resource_distribution: nasaData.surface_composition,
          societal_needs_score: 0.75,
          environmental_impact_score: nasaData.habitability_score,
          population_density: planetProfile?.deployed_agent_count || 0,
          infrastructure_adequacy: 0.6
        },
        nasa_data_integration: nasaData,
        policy_details: policy.policy_details,
        evolution_path: policy.evolution_path,
        simulated_impact: policy.simulated_impact,
        ethical_alignment: policy.ethical_alignment,
        ai_confidence: policy.ai_confidence,
        omega_governance_reasoning: governanceProposal.omega_governance_reasoning,
        status: "proposed"
      });
      policyRecords.push(record);
    }

    return Response.json({
      success: true,
      celestial_body: celestialBody,
      nasa_data: nasaData,
      policies_proposed: policyRecords.length,
      policies: policyRecords,
      planetary_analysis: governanceProposal.planetary_analysis,
      omega_reasoning: governanceProposal.omega_governance_reasoning
    });

  } catch (error) {
    console.error('Planetary Governance AI Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});