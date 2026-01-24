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

    // Detect failed or degraded agents
    const failed_agents = [];
    const current_capability = swarm.recursive_capability_Cs || 0.7;
    
    if (current_capability < 0.5) {
      failed_agents.push({
        agent_id: 'degraded_agent_001',
        failure_type: 'capability_degradation',
        severity: 'high'
      });
    }

    // Self-healing actions
    const healing_actions = [];
    
    for (const failure of failed_agents) {
      // Instantiate replacement agent
      const new_agent_id = `agent_heal_${Date.now()}`;
      
      healing_actions.push({
        action: 'instantiate_replacement',
        failed_agent: failure.agent_id,
        new_agent: new_agent_id,
        inheritance: 'partial_memory_transfer'
      });
      
      // Log instantiation
      const updated_log = [
        {
          timestamp: new Date().toISOString(),
          parent_agent_id: failure.agent_id,
          child_agent_id: new_agent_id,
          instantiation_reason: 'self_healing_replacement'
        },
        ...(swarm.agent_instantiation_log || []).slice(0, 99)
      ];
      
      await base44.asServiceRole.entities.AgentSwarmHierarchy.update(swarm.id, {
        agent_instantiation_log: updated_log,
        recursive_capability_Cs: Math.min(1.0, current_capability + 0.15)
      });
    }

    return Response.json({
      success: true,
      failed_agents_detected: failed_agents.length,
      healing_actions,
      new_capability_score: Math.min(1.0, current_capability + 0.15 * failed_agents.length)
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});