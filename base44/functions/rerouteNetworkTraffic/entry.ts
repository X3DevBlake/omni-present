import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { source_node_id, target_node_id } = await req.json();

    if (!source_node_id || !target_node_id) {
      return Response.json({ 
        error: 'source_node_id and target_node_id required' 
      }, { status: 400 });
    }

    // Fetch both nodes
    const [sourceNodes, targetNodes] = await Promise.all([
      base44.entities.RedCommNetworkNode.filter({ id: source_node_id }),
      base44.entities.RedCommNetworkNode.filter({ id: target_node_id })
    ]);

    const sourceNode = sourceNodes[0];
    const targetNode = targetNodes[0];

    if (!sourceNode || !targetNode) {
      return Response.json({ error: 'One or both nodes not found' }, { status: 404 });
    }

    if (targetNode.status !== 'online') {
      return Response.json({ 
        error: 'Target node must be online for rerouting' 
      }, { status: 400 });
    }

    // Simulate traffic rerouting
    const reroute_result = {
      source_node_id,
      target_node_id,
      timestamp: new Date().toISOString(),
      traffic_volume_gb: Math.floor(Math.random() * 500 + 100),
      reroute_latency_ms: Math.floor(Math.random() * 100 + 50),
      success: true,
      new_route_path: [
        source_node_id,
        `intermediate_${Math.random().toString(36).substr(2, 8)}`,
        target_node_id
      ],
      estimated_improvement: {
        latency_reduction: Math.floor(Math.random() * 30 + 10) + '%',
        bandwidth_gain: Math.floor(Math.random() * 20 + 5) + '%'
      }
    };

    // Update source node metadata
    await base44.asServiceRole.entities.RedCommNetworkNode.update(source_node_id, {
      last_reroute: new Date().toISOString(),
      reroute_target: target_node_id
    });

    // Log the rerouting event
    await base44.asServiceRole.entities.SystemMetric.create({
      metric_id: `reroute_${Date.now()}`,
      component_type: 'network_node',
      component_id: source_node_id,
      metric_name: 'traffic_reroute',
      metric_value: reroute_result.traffic_volume_gb,
      metric_unit: 'GB',
      contextual_metadata: {
        target_node_id,
        latency_reduction: reroute_result.estimated_improvement.latency_reduction
      }
    });

    return Response.json(reroute_result);
  } catch (error) {
    console.error('Rerouting error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});