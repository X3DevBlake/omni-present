import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { feed_type, filters } = await req.json();

    if (feed_type === 'network_telemetry') {
      // Real-time RedComm network node telemetry
      const nodes = await base44.entities.RedCommNetworkNode.list();
      
      const telemetry_data = nodes.map(node => ({
        node_id: node.node_id,
        node_type: node.node_type,
        location: node.geographic_location?.location_name,
        status: node.node_status,
        uptime: node.uptime_percentage,
        latency_ms: node.connected_nodes?.reduce((sum, cn) => sum + (cn.latency_ms || 0), 0) / (node.connected_nodes?.length || 1),
        bandwidth_gbps: node.thz_link_config?.bandwidth_gbps || 0,
        compute_available: node.compute_capacity?.tflops || 0
      }));

      // Detect network partitions
      const partitions = telemetry_data.filter(t => t.status === 'offline' || t.status === 'degraded');

      return Response.json({
        success: true,
        telemetry_data,
        total_nodes: telemetry_data.length,
        online_nodes: telemetry_data.filter(t => t.status === 'online').length,
        partitions_detected: partitions.length,
        avg_latency_ms: telemetry_data.reduce((sum, t) => sum + t.latency_ms, 0) / telemetry_data.length,
        total_bandwidth_tbps: telemetry_data.reduce((sum, t) => sum + t.bandwidth_gbps, 0) / 1000
      });
    }

    if (feed_type === 'geopolitical_events') {
      // Aggregate geopolitical event data
      const predictions = await base44.entities.GeopoliticalPrediction.list('-created_date', 20);
      
      const events_by_region = {};
      predictions.forEach(pred => {
        if (!events_by_region[pred.target_region]) {
          events_by_region[pred.target_region] = [];
        }
        events_by_region[pred.target_region].push({
          type: pred.prediction_type,
          probability: pred.probability,
          time_horizon: pred.time_horizon_days,
          network_impact: pred.impact_assessment?.network_resilience_impact
        });
      });

      return Response.json({
        success: true,
        events_by_region,
        total_predictions: predictions.length,
        high_risk_events: predictions.filter(p => p.probability > 0.6).length
      });
    }

    if (feed_type === 'crdt_sync_status') {
      // CRDT synchronization health across RedComm fabric
      const deltas = await base44.entities.CRDTStateDelta.list('-created_date', 50);
      
      const sync_metrics = {
        total_deltas: deltas.length,
        pending_propagation: deltas.filter(d => !d.eventual_consistency_achieved).length,
        avg_propagation_time_ms: deltas.reduce((sum, d) => {
          const propagated = d.propagation_status?.filter(s => s.applied) || [];
          return sum + (propagated.length > 0 ? 100 : 0);
        }, 0) / deltas.length,
        network_partition_tolerance_active: deltas.some(d => d.network_partition_tolerance)
      };

      return Response.json({
        success: true,
        sync_metrics,
        consistency_status: sync_metrics.pending_propagation === 0 ? 'converged' : 'syncing'
      });
    }

    return Response.json({ error: 'Invalid feed_type' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});