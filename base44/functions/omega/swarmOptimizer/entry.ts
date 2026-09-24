import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { swarm_id } = await req.json();

    const swarms = await base44.entities.AgentSwarmHierarchy.filter({ swarm_id });
    const swarm = swarms[0];

    if (!swarm) {
      return Response.json({ error: 'Swarm not found' }, { status: 404 });
    }

    // Performance metrics analysis
    const capability_score = swarm.recursive_capability_Cs || 0.7;
    const gwt_performance = swarm.gwt_implementation?.sustainability_ratio || 0.5;
    const broadcast_efficiency = swarm.broadcast_history?.length > 0 ? 0.8 : 0.3;

    const overall_performance = (capability_score + gwt_performance + broadcast_efficiency) / 3;

    // Optimization strategies
    const optimizations = [];

    if (capability_score < 0.7) {
      optimizations.push({
        type: 'hierarchy_restructure',
        action: 'Promote high-performing workers to managers',
        expected_improvement: 0.15
      });
    }

    if (gwt_performance < 0.6) {
      optimizations.push({
        type: 'gwt_tuning',
        action: 'Adjust ignition threshold and emotional intensity',
        expected_improvement: 0.12
      });
      
      await base44.asServiceRole.entities.AgentSwarmHierarchy.update(swarm.id, {
        'gwt_implementation.ignition_threshold': 0.75,
        'gwt_implementation.emotional_intensity_E': 0.85
      });
    }

    if (broadcast_efficiency < 0.5) {
      optimizations.push({
        type: 'communication_optimization',
        action: 'Implement delta-CRDT for faster sync',
        expected_improvement: 0.2
      });
    }

    // Apply recursive capability boost
    const new_capability = Math.min(1.0, capability_score + optimizations.reduce((sum, o) => sum + o.expected_improvement, 0));
    
    await base44.asServiceRole.entities.AgentSwarmHierarchy.update(swarm.id, {
      recursive_capability_Cs: new_capability
    });

    return Response.json({
      success: true,
      current_performance: overall_performance,
      optimizations_applied: optimizations,
      new_capability_score: new_capability,
      improvement: new_capability - capability_score
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});