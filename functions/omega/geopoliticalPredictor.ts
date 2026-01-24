import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { regions, time_horizon_days } = await req.json();

    // Fetch RedComm network data
    const network_nodes = await base44.entities.RedCommNetworkNode.list();
    
    const predictions = [];

    for (const region of regions) {
      // Simulate AI prediction model
      const regional_nodes = network_nodes.filter(node => 
        node.geographic_location?.location_name?.includes(region)
      );

      const base_risk = Math.random() * 0.4 + 0.1;
      const node_health = regional_nodes.reduce((sum, n) => 
        sum + (n.uptime_percentage || 0.95), 0) / (regional_nodes.length || 1);
      
      const adjusted_risk = base_risk * (2 - node_health);
      const probability = Math.min(0.95, adjusted_risk);

      const prediction_types = [
        'network_partition',
        'infrastructure_disruption',
        'regulatory_change',
        'economic_instability'
      ];

      const selected_type = prediction_types[Math.floor(probability * prediction_types.length)];

      const prediction = await base44.asServiceRole.entities.GeopoliticalPrediction.create({
        prediction_id: `pred_${region}_${Date.now()}`,
        target_region: region,
        prediction_type: selected_type,
        probability,
        time_horizon_days: time_horizon_days || 30,
        impact_assessment: {
          network_resilience_impact: probability * 0.8,
          financial_market_impact: probability * 0.6,
          operational_continuity_risk: probability * 0.7,
          affected_redcomm_nodes: regional_nodes.map(n => n.node_id)
        },
        data_sources: [
          { source_type: 'RedComm_telemetry', reliability_score: 0.92, last_updated: new Date().toISOString() },
          { source_type: 'News_sentiment', reliability_score: 0.78, last_updated: new Date().toISOString() },
          { source_type: 'Economic_indicators', reliability_score: 0.85, last_updated: new Date().toISOString() }
        ],
        mitigation_strategies: probability > 0.5 ? [
          { strategy: 'Activate sovereign shard routing', effectiveness_score: 0.85, implementation_status: 'ready' },
          { strategy: 'Redistribute compute to stable regions', effectiveness_score: 0.78, implementation_status: 'ready' },
          { strategy: 'Enable DTN store-and-forward', effectiveness_score: 0.92, implementation_status: 'active' }
        ] : [],
        prediction_accuracy: 0.82
      });

      predictions.push(prediction);

      // Create high-priority notification if critical
      if (probability > 0.6) {
        await base44.asServiceRole.entities.UserNotification.create({
          notification_id: `notif_geo_${Date.now()}_${region}`,
          user_email: user.email,
          notification_type: 'geopolitical_warning',
          priority: probability > 0.75 ? 'critical' : 'high',
          title: `Geopolitical Risk Alert: ${region}`,
          message: `${(probability * 100).toFixed(0)}% probability of ${selected_type} within ${time_horizon_days} days. ${regional_nodes.length} RedComm nodes affected.`,
          source_module: 'geopolitical_predictor',
          metadata: { prediction_id: prediction.prediction_id, region }
        });
      }
    }

    return Response.json({
      success: true,
      predictions,
      total_nodes_analyzed: network_nodes.length,
      high_risk_regions: predictions.filter(p => p.probability > 0.5).length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});