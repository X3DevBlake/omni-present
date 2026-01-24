import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { protocolId, simulationId } = await req.json();

    // Fetch protocol
    const protocols = await base44.entities.ProposedCommunicationProtocol.filter({ protocol_id: protocolId });
    if (!protocols || protocols.length === 0) {
      return Response.json({ error: 'Protocol not found' }, { status: 404 });
    }
    const protocol = protocols[0];

    // Fetch simulation
    const simulations = await base44.entities.InterstellarSimulation.filter({ simulation_id: simulationId });
    if (!simulations || simulations.length === 0) {
      return Response.json({ error: 'Simulation not found' }, { status: 404 });
    }
    const simulation = simulations[0];

    // AI learns and refines protocol
    const learningResult = await base44.integrations.Core.InvokeLLM({
      prompt: `As an autonomous learning system, analyze this protocol's real-world performance and refine it:

Protocol: ${protocol.protocol_name}
Specifications:
- Modulation: ${protocol.protocol_specifications.modulation_scheme}
- Error Correction: ${protocol.protocol_specifications.error_correction_algorithm}
- Quantum Entanglement: ${protocol.protocol_specifications.quantum_entanglement_usage}

Tested in Simulation: ${simulationId}
Performance Metrics:
- Signal Integrity: ${simulation.simulation_results.signal_integrity_score}%
- Latency: ${simulation.simulation_results.effective_latency_ms}ms
- Data Loss: ${(simulation.simulation_results.data_loss_rate * 100).toFixed(2)}%
- FTL Success: ${simulation.simulation_results.ftl_communication_achieved}

Current Protocol Maturity: ${protocol.protocol_maturity}
Previous Iterations: ${protocol.learning_iterations?.length || 0}

Analyze:
1. What worked well vs what failed?
2. How should the protocol be refined?
3. What specific parameters need adjustment?
4. What new insights emerged?

Propose concrete refinements to improve performance.`,
      response_json_schema: {
        type: "object",
        properties: {
          performance_assessment: { type: "string" },
          success: { type: "boolean" },
          refinements: {
            type: "array",
            items: {
              type: "object",
              properties: {
                parameter: { type: "string" },
                current_value: { type: "string" },
                refined_value: { type: "string" },
                reasoning: { type: "string" },
                expected_improvement: { type: "number" }
              }
            }
          },
          learned_insights: { type: "string" },
          maturity_delta: { type: "number" },
          deploy_recommendation: { type: "boolean" }
        }
      }
    });

    // Update protocol with learning
    const updatedProtocol = await base44.asServiceRole.entities.ProposedCommunicationProtocol.update(protocol.id, {
      real_time_performance: {
        simulations_tested: (protocol.real_time_performance?.simulations_tested || 0) + 1,
        success_rate: learningResult.success ? 
          ((protocol.real_time_performance?.success_rate || 0) * (protocol.real_time_performance?.simulations_tested || 0) + 1) / 
          ((protocol.real_time_performance?.simulations_tested || 0) + 1) :
          ((protocol.real_time_performance?.success_rate || 0) * (protocol.real_time_performance?.simulations_tested || 0)) / 
          ((protocol.real_time_performance?.simulations_tested || 0) + 1),
        avg_signal_integrity: simulation.simulation_results.signal_integrity_score,
        avg_latency_reduction: 100 - simulation.simulation_results.effective_latency_ms / 1000,
        data_loss_improvement: (1 - simulation.simulation_results.data_loss_rate) * 100
      },
      learning_iterations: [
        ...(protocol.learning_iterations || []),
        {
          iteration: (protocol.learning_iterations?.length || 0) + 1,
          refinement: learningResult.refinements.map(r => `${r.parameter}: ${r.refined_value}`).join('; '),
          performance_delta: learningResult.success ? 0.15 : -0.05,
          learned_insight: learningResult.learned_insights
        }
      ],
      protocol_maturity: Math.min(1, protocol.protocol_maturity + learningResult.maturity_delta),
      status: learningResult.deploy_recommendation ? "validated" : "testing"
    });

    return Response.json({
      success: true,
      protocol: updatedProtocol,
      refinements_applied: learningResult.refinements.length,
      learned_insights: learningResult.learned_insights,
      maturity_improved: learningResult.maturity_delta > 0,
      ready_for_deployment: learningResult.deploy_recommendation
    });

  } catch (error) {
    console.error('Protocol Learning Engine Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});