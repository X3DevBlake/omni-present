import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agents } = await req.json();

    const roleRequirements = {
      coordinator: ['leadership', 'planning', 'communication'],
      executor: ['execution', 'reliability', 'speed'],
      analyst: ['analysis', 'data_processing', 'pattern_recognition'],
      optimizer: ['optimization', 'efficiency', 'performance'],
    };

    // Calculate best fit for each agent
    const assignments = agents.map(agent => {
      const capabilities = agent.capabilities || [];
      let bestRole = 'unassigned';
      let bestScore = 0;

      for (const [role, requirements] of Object.entries(roleRequirements)) {
        const matchCount = requirements.filter(req => 
          capabilities.some(cap => cap.toLowerCase().includes(req.toLowerCase()))
        ).length;
        
        const score = matchCount / requirements.length;
        
        if (score > bestScore) {
          bestScore = score;
          bestRole = role;
        }
      }

      return {
        agent_id: agent.id,
        assigned_role: bestRole,
        confidence: bestScore,
      };
    });

    // Update agent records with assigned roles
    for (const assignment of assignments) {
      await base44.asServiceRole.entities.Agent.update(assignment.agent_id, {
        suggested_role: assignment.assigned_role,
      });
    }

    return Response.json({
      success: true,
      assignments,
      message: `Assigned roles to ${assignments.length} agents`,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});