import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { swarm_id, action, agent_proposals, bci_intent } = await req.json();

    // Fetch swarm configuration
    let swarm;
    if (swarm_id) {
      const swarms = await base44.entities.AgentSwarmHierarchy.filter({ swarm_id });
      swarm = swarms[0];
    }

    if (!swarm && action !== 'create') {
      return Response.json({ error: 'Swarm not found' }, { status: 404 });
    }

    // Create new swarm
    if (action === 'create') {
      const hierarchy_levels = [
        {
          level: 0,
          level_name: 'SOB',
          agent_ids: ['ethics_overseer', 'mission_validator'],
          capability_score: 1.0
        },
        {
          level: 1,
          level_name: 'manager',
          agent_ids: ['intent_interpreter', 'trajectory_planner', 'safety_monitor'],
          capability_score: 0.85
        },
        {
          level: 2,
          level_name: 'worker',
          agent_ids: [],
          capability_score: 0.5
        }
      ];

      const newSwarm = await base44.asServiceRole.entities.AgentSwarmHierarchy.create({
        swarm_id: `swarm_${Date.now()}`,
        swarm_name: `HAAS_${user.email.split('@')[0]}`,
        architecture_type: 'HAAS',
        hierarchy_levels,
        gwt_implementation: {
          global_workspace_enabled: true,
          broadcast_mechanism: 'attention_weighted',
          attention_selector: 'infonce_compatibility',
          ignition_threshold: 0.7,
          emotional_intensity_E: 0.5,
          cognitive_effort_C: 0.3,
          sustainability_ratio: 0.5 / 0.3
        },
        recursive_capability_Cs: 5.0,
        interaction_efficacy_decay: 0.05,
        spec_drift_risk: 0.2,
        active_inference_config: {
          free_energy_minimization: true,
          pragmatic_value_weight: 0.7,
          epistemic_value_weight: 0.3
        },
        total_agents: 5,
        swarm_status: 'active'
      });

      return Response.json({
        success: true,
        swarm_id: newSwarm.swarm_id,
        message: 'HAAS swarm initialized',
        hierarchy_levels
      });
    }

    // Global Workspace Theory: Selection-Broadcast Cycle
    if (action === 'broadcast' && agent_proposals) {
      // Calculate E/C ratio for ignition
      const emotional_intensity_E = swarm.gwt_implementation.emotional_intensity_E || 0.5;
      const cognitive_effort_C = swarm.gwt_implementation.cognitive_effort_C || 0.3;
      const sustainability = emotional_intensity_E / cognitive_effort_C;
      
      // Check ignition threshold
      const ignition_threshold = swarm.gwt_implementation.ignition_threshold || 0.7;
      const ignition_triggered = sustainability > ignition_threshold;
      
      // Select most salient proposal using InfoNCE compatibility
      const scored_proposals = agent_proposals.map(proposal => {
        // Simulate InfoNCE compatibility with BCI intent
        const compatibility = Math.random() * (bci_intent ? 1 : 0.5);
        return {
          ...proposal,
          infonce_compatibility: compatibility,
          selected: false
        };
      });
      
      // Sort by compatibility
      scored_proposals.sort((a, b) => b.infonce_compatibility - a.infonce_compatibility);
      
      // Select winner
      if (scored_proposals.length > 0) {
        scored_proposals[0].selected = true;
      }
      
      // Broadcast to all agents
      const broadcast_event = {
        timestamp: new Date().toISOString(),
        selected_action: scored_proposals[0]?.action || 'none',
        competing_proposals: scored_proposals.map(p => p.action),
        infonce_compatibility_score: scored_proposals[0]?.infonce_compatibility || 0,
        ignition_triggered,
        sustainability_ratio: sustainability
      };
      
      // Update swarm with broadcast history
      await base44.asServiceRole.entities.AgentSwarmHierarchy.update(swarm.id, {
        broadcast_history: [
          broadcast_event,
          ...(swarm.broadcast_history || []).slice(0, 99)
        ]
      });

      return Response.json({
        success: true,
        selected_proposal: scored_proposals[0],
        all_proposals: scored_proposals,
        ignition_triggered,
        sustainability_ratio: sustainability,
        broadcast_event
      });
    }

    // Recursive agent instantiation
    if (action === 'instantiate_agent') {
      const { parent_agent_id, task_description } = await req.json();
      
      const child_agent_id = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Calculate recursive capability growth
      const current_Cs = swarm.recursive_capability_Cs || 1;
      const decay = swarm.interaction_efficacy_decay || 0.05;
      const parent_level = swarm.hierarchy_levels.find(level => 
        level.agent_ids.includes(parent_agent_id)
      )?.level || 2;
      
      const interaction_term = Math.exp(-decay * parent_level) * 0.5;
      const new_Cs = current_Cs + interaction_term;
      
      // Add agent to appropriate level
      const updated_levels = swarm.hierarchy_levels.map(level => {
        if (level.level === parent_level + 1) {
          return {
            ...level,
            agent_ids: [...level.agent_ids, child_agent_id]
          };
        }
        return level;
      });
      
      const instantiation_log_entry = {
        timestamp: new Date().toISOString(),
        parent_agent_id,
        child_agent_id,
        instantiation_reason: task_description
      };
      
      await base44.asServiceRole.entities.AgentSwarmHierarchy.update(swarm.id, {
        hierarchy_levels: updated_levels,
        recursive_capability_Cs: new_Cs,
        agent_instantiation_log: [
          instantiation_log_entry,
          ...(swarm.agent_instantiation_log || []).slice(0, 99)
        ],
        total_agents: swarm.total_agents + 1
      });

      return Response.json({
        success: true,
        child_agent_id,
        new_capability_Cs: new_Cs,
        instantiation_log: instantiation_log_entry
      });
    }

    return Response.json({
      success: true,
      swarm,
      actions_available: ['create', 'broadcast', 'instantiate_agent']
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});