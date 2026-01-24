import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, source_node_id, target_node_ids, state_path, delta_payload } = await req.json();

    if (action === 'generate_delta') {
      // Generate a new delta for state synchronization
      const vector_clock = {};
      vector_clock[source_node_id] = Date.now();
      
      const delta = await base44.asServiceRole.entities.CRDTStateDelta.create({
        delta_id: `delta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        source_node_id,
        target_node_ids: target_node_ids || [],
        delta_type: 'LWW-Register_update',
        state_path,
        delta_payload,
        vector_clock,
        join_semilattice_operation: 'union',
        payload_size_bytes: JSON.stringify(delta_payload).length,
        propagation_status: (target_node_ids || []).map(node_id => ({
          node_id,
          received: false,
          applied: false,
          timestamp: new Date().toISOString()
        })),
        eventual_consistency_achieved: false,
        anti_entropy_protocol_active: true,
        network_partition_tolerance: true,
        sync_priority: 'normal'
      });

      return Response.json({
        success: true,
        delta_id: delta.delta_id,
        message: 'Delta generated and queued for propagation',
        delta
      });
    }

    if (action === 'apply_delta') {
      const { delta_id, receiving_node_id } = await req.json();
      
      const deltas = await base44.entities.CRDTStateDelta.filter({ delta_id });
      const delta = deltas[0];
      
      if (!delta) {
        return Response.json({ error: 'Delta not found' }, { status: 404 });
      }
      
      // Update propagation status
      const updated_propagation = delta.propagation_status.map(status => {
        if (status.node_id === receiving_node_id) {
          return {
            ...status,
            received: true,
            applied: true,
            timestamp: new Date().toISOString()
          };
        }
        return status;
      });
      
      // Check if all nodes have received
      const all_received = updated_propagation.every(s => s.applied);
      
      await base44.asServiceRole.entities.CRDTStateDelta.update(delta.id, {
        propagation_status: updated_propagation,
        eventual_consistency_achieved: all_received
      });

      return Response.json({
        success: true,
        delta_applied: true,
        eventual_consistency_achieved: all_received,
        state_path: delta.state_path,
        merged_value: delta.delta_payload
      });
    }

    if (action === 'anti_entropy_sync') {
      const { node_a_id, node_b_id } = await req.json();
      
      // Find all deltas that node_b might be missing
      const all_deltas = await base44.entities.CRDTStateDelta.filter({
        source_node_id: node_a_id
      });
      
      const missing_deltas = all_deltas.filter(delta => {
        const node_b_status = delta.propagation_status?.find(s => s.node_id === node_b_id);
        return !node_b_status || !node_b_status.applied;
      });
      
      return Response.json({
        success: true,
        missing_delta_count: missing_deltas.length,
        missing_deltas: missing_deltas.map(d => ({
          delta_id: d.delta_id,
          state_path: d.state_path,
          payload_size_bytes: d.payload_size_bytes
        })),
        sync_required: missing_deltas.length > 0
      });
    }

    return Response.json({
      error: 'Invalid action. Use "generate_delta", "apply_delta", or "anti_entropy_sync"'
    }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});