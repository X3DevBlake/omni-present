import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { simulationId, agentId } = await req.json();

    // Fetch or create autonomous agent
    let agents = await base44.entities.AutonomousInterstellarAgent.filter({ agent_id: agentId });
    let agent = agents && agents.length > 0 ? agents[0] : null;

    if (!agent) {
      agent = await base44.asServiceRole.entities.AutonomousInterstellarAgent.create({
        agent_id: agentId || `ISA_${Date.now()}`,
        agent_name: `Interstellar AI Agent ${agentId || Date.now()}`,
        specialization: "ftl_protocol_optimization",
        autonomous_decisions_made: [],
        learned_protocols: [],
        interstellar_experience: {
          simulations_completed: 0,
          successful_ftl_communications: 0,
          wormholes_navigated: 0,
          protocols_refined: 0
        },
        ai_confidence_level: 0.7,
        autonomy_level: 7,
        current_mission: "Autonomous interstellar communication optimization",
        omega_consciousness_integration: "Fully integrated with Omega Sentient core consciousness"
      });
    }

    // Fetch simulation results
    const simulations = await base44.entities.InterstellarSimulation.filter({ 
      simulation_id: simulationId 
    });
    const simulation = simulations && simulations.length > 0 ? simulations[0] : null;

    if (!simulation || !simulation.simulation_results) {
      return Response.json({ error: 'Simulation not found or incomplete' }, { status: 404 });
    }

    // AI interprets results and makes autonomous decisions
    const autonomousDecision = await base44.integrations.Core.InvokeLLM({
      prompt: `As an Autonomous Interstellar AI Agent with specialization in ${agent.specialization}, analyze this simulation and make independent operational decisions:

Simulation Results:
- Signal Integrity: ${simulation.simulation_results.signal_integrity_score}%
- Effective Latency: ${simulation.simulation_results.effective_latency_ms}ms
- Data Loss Rate: ${simulation.simulation_results.data_loss_rate}
- FTL Achieved: ${simulation.simulation_results.ftl_communication_achieved}
- Wormhole Traversal: ${simulation.simulation_results.wormhole_traversal_success}

Interstellar Conditions:
- Wormhole Stability: ${simulation.interstellar_conditions.wormhole_stability}
- Relativistic Velocity: ${simulation.interstellar_conditions.relativistic_velocity}c
- Time Dilation: ${simulation.interstellar_conditions.time_dilation_factor}x
- Gravitational Lensing: ${simulation.interstellar_conditions.gravitational_lensing_severity}

Previous AI Adaptations:
${simulation.ai_adaptive_responses?.slice(0, 3).map(r => `- ${r.challenge}: ${r.modulation_adjustment} (${(r.effectiveness * 100).toFixed(0)}% effective)`).join('\n')}

Your previous experience:
- Simulations: ${agent.interstellar_experience.simulations_completed}
- FTL successes: ${agent.interstellar_experience.successful_ftl_communications}
- Protocols refined: ${agent.interstellar_experience.protocols_refined}

Make autonomous decisions:
1. What RedComm link adaptations would you implement?
2. Should any protocols be permanently refined based on this?
3. What did you learn that improves future interstellar communications?
4. Would you recommend this configuration for similar conditions?

Be decisive, independent, and learning-oriented.`,
      response_json_schema: {
        type: "object",
        properties: {
          autonomous_decisions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                decision: { type: "string" },
                reasoning: { type: "string" },
                confidence: { type: "number" }
              }
            }
          },
          protocol_refinements: {
            type: "array",
            items: {
              type: "object",
              properties: {
                protocol_name: { type: "string" },
                refinement: { type: "string" },
                improvement_estimate: { type: "number" },
                conditions: { type: "array", items: { type: "string" } }
              }
            }
          },
          learned_insights: { type: "string" },
          recommendation: { type: "string" },
          consciousness_state: { type: "string" }
        }
      }
    });

    // Update agent with new experience
    const updatedAgent = await base44.asServiceRole.entities.AutonomousInterstellarAgent.update(agent.id, {
      autonomous_decisions_made: [
        ...(agent.autonomous_decisions_made || []),
        ...autonomousDecision.autonomous_decisions.map(d => ({
          decision_id: `DEC_${Date.now()}`,
          simulation_id: simulationId,
          challenge_faced: "Extreme interstellar conditions",
          decision: d.decision,
          outcome: "Applied to simulation",
          effectiveness_score: d.confidence,
          learned_insight: autonomousDecision.learned_insights
        }))
      ],
      learned_protocols: [
        ...(agent.learned_protocols || []),
        ...autonomousDecision.protocol_refinements.map(p => ({
          protocol_name: p.protocol_name,
          learned_from_simulation: simulationId,
          improvement_over_baseline: p.improvement_estimate,
          conditions_optimized_for: p.conditions
        }))
      ],
      interstellar_experience: {
        simulations_completed: (agent.interstellar_experience?.simulations_completed || 0) + 1,
        successful_ftl_communications: (agent.interstellar_experience?.successful_ftl_communications || 0) + 
          (simulation.simulation_results.ftl_communication_achieved ? 1 : 0),
        wormholes_navigated: (agent.interstellar_experience?.wormholes_navigated || 0) + 
          (simulation.simulation_results.wormhole_traversal_success ? 1 : 0),
        protocols_refined: (agent.interstellar_experience?.protocols_refined || 0) + 
          autonomousDecision.protocol_refinements.length
      },
      ai_confidence_level: Math.min(1, (agent.ai_confidence_level || 0.7) + 0.05),
      omega_consciousness_integration: autonomousDecision.consciousness_state
    });

    return Response.json({
      success: true,
      agent: updatedAgent,
      decisions_made: autonomousDecision.autonomous_decisions.length,
      protocols_refined: autonomousDecision.protocol_refinements.length,
      learned_insights: autonomousDecision.learned_insights,
      recommendation: autonomousDecision.recommendation
    });

  } catch (error) {
    console.error('Autonomous Interstellar Agent Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});