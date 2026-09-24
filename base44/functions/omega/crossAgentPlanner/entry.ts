import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { problem_description, complexity_level, agent_pool } = await req.json();

    // Decompose complex problem into sub-problems
    const problem_decomposition = {
      main_problem: problem_description,
      complexity_score: complexity_level || 0.7,
      sub_problems: [
        { 
          id: 'sp1', 
          description: 'Data gathering and analysis', 
          required_capabilities: ['perception', 'data_fusion'],
          estimated_effort: 0.3 
        },
        { 
          id: 'sp2', 
          description: 'Strategic planning and optimization', 
          required_capabilities: ['reasoning', 'optimization', 'prediction'],
          estimated_effort: 0.5 
        },
        { 
          id: 'sp3', 
          description: 'Execution and monitoring', 
          required_capabilities: ['action', 'feedback_control'],
          estimated_effort: 0.2 
        }
      ]
    };

    // Agent assignment via capability matching
    const agent_assignments = problem_decomposition.sub_problems.map(sp => {
      const best_agent = agent_pool?.find(a => 
        sp.required_capabilities.some(cap => a.skills?.includes(cap))
      ) || { agent_id: `auto_agent_${sp.id}`, skills: sp.required_capabilities };

      return {
        sub_problem_id: sp.id,
        assigned_agent: best_agent.agent_id,
        capability_match: 0.75 + Math.random() * 0.2,
        coordination_protocol: 'hierarchical'
      };
    });

    // Generate coordination plan
    const coordination_plan = {
      execution_order: ['sp1', 'sp2', 'sp3'],
      synchronization_points: [
        { after: 'sp1', before: 'sp2', sync_type: 'data_handoff' },
        { after: 'sp2', before: 'sp3', sync_type: 'strategy_validation' }
      ],
      communication_topology: 'hub_spoke',
      estimated_completion_time_hours: 4.5
    };

    // Ethical compliance check
    const ethics_check = await base44.functions.invoke('omega/ethicsMonitor', {
      agent_id: 'planner_agent',
      decision_context: `Cross-agent planning for: ${problem_description}`,
      options: [
        { action: 'Execute distributed plan', stakeholders: agent_assignments.map(a => a.assigned_agent) }
      ]
    });

    return Response.json({
      success: true,
      problem_decomposition,
      agent_assignments,
      coordination_plan,
      ethical_compliance: ethics_check.data?.ethical_score || 0.85,
      ready_for_execution: ethics_check.data?.ethical_score > 0.7
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});