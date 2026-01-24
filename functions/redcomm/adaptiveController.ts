import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { linkId } = await req.json();

    // Fetch current link health
    const linkHealthRecords = await base44.entities.RedCommLinkHealth.filter({ link_id: linkId }, '-created_date', 1);
    
    if (!linkHealthRecords || linkHealthRecords.length === 0) {
      return Response.json({ error: 'Link not found' }, { status: 404 });
    }

    const linkHealth = linkHealthRecords[0];

    // Use AI to determine optimal adaptive parameters
    const aiRecommendations = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on this RedComm link health data, determine the optimal adaptive modulation and error correction parameters:
      
      Link ID: ${linkHealth.link_id}
      Current Health Score: ${linkHealth.health_score}
      Signal Quality: ${linkHealth.signal_quality}
      Packet Loss Rate: ${linkHealth.packet_loss_rate}
      Interference Sources: ${JSON.stringify(linkHealth.interference_sources)}
      Current Modulation: ${linkHealth.adaptive_parameters?.modulation_scheme || 'QPSK'}
      Current Error Correction: ${linkHealth.adaptive_parameters?.error_correction_level || 'standard'}
      
      Provide optimal parameters that maximize throughput while maintaining reliability.`,
      response_json_schema: {
        type: "object",
        properties: {
          optimal_modulation: {
            type: "string",
            enum: ["BPSK", "QPSK", "8PSK", "16QAM", "64QAM", "256QAM"]
          },
          optimal_error_correction: {
            type: "string",
            enum: ["none", "hamming", "reed_solomon", "turbo", "ldpc"]
          },
          optimal_power_db: { type: "number" },
          expected_throughput_improvement: { type: "number" },
          expected_reliability_impact: { type: "string" },
          rationale: { type: "string" }
        }
      }
    });

    // Update link health with new adaptive parameters
    const updatedLinkHealth = await base44.asServiceRole.entities.RedCommLinkHealth.update(linkHealth.id, {
      adaptive_parameters: {
        modulation_scheme: aiRecommendations.optimal_modulation,
        error_correction_level: aiRecommendations.optimal_error_correction,
        power_level_db: aiRecommendations.optimal_power_db
      },
      self_healing_status: "adjusting",
      omega_sentient_analysis: `AI Adaptive Control: ${aiRecommendations.rationale}`
    });

    // Trigger device update (in real implementation, this would send commands to actual devices)
    const deviceUpdate = {
      device_id: linkHealth.device_a_id,
      command: "update_adaptive_parameters",
      parameters: aiRecommendations,
      timestamp: new Date().toISOString()
    };

    return Response.json({
      success: true,
      link_id: linkId,
      previous_parameters: linkHealth.adaptive_parameters,
      new_parameters: aiRecommendations,
      expected_improvement: aiRecommendations.expected_throughput_improvement,
      device_update: deviceUpdate,
      updated_link_health: updatedLinkHealth
    });

  } catch (error) {
    console.error('RedComm Adaptive Controller Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});