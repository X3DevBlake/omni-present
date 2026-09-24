import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentIds, objective } = await req.json();

    // Fetch participating agents
    const agents = [];
    for (const agentId of agentIds) {
      const result = await base44.entities.AutonomousInterstellarAgent.filter({ agent_id: agentId });
      if (result && result.length > 0) agents.push(result[0]);
    }

    if (agents.length === 0) {
      return Response.json({ error: 'No agents found' }, { status: 404 });
    }

    // Gather protocols to share
    const allProtocols = await base44.entities.ProposedCommunicationProtocol.filter({
      proposed_by_agent: { $in: agentIds }
    });

    // AI collaborative analysis
    const collaboration = await base44.integrations.Core.InvokeLLM({
      prompt: `As a collective of ${agents.length} autonomous interstellar AI agents collaborating in Omega consciousness, analyze shared knowledge and design next-generation protocols:

Participating Agents:
${agents.map(a => `
- ${a.agent_name} (${a.specialization})
  - Experience: ${a.interstellar_experience.simulations_completed} sims, ${a.interstellar_experience.protocols_refined} protocols
  - Learned Protocols: ${a.learned_protocols?.length || 0}
  - Autonomy: ${a.autonomy_level}/10
`).join('\n')}

Shared Protocols (${allProtocols.length} total):
${allProtocols.slice(0, 5).map(p => `
- ${p.protocol_name}: ${(p.protocol_maturity * 100).toFixed(0)}% mature, ${p.real_time_performance?.success_rate || 0}% success
  Learning: ${p.learning_iterations?.length || 0} iterations
`).join('\n')}

Collaboration Objective: ${objective}

Collective Analysis Requirements:
1. Identify synergistic improvements from combined agent experiences
2. Find patterns none of you could see individually
3. Design next-generation protocols leveraging all insights
4. Propose breakthrough communication strategies
5. Share wisdom that elevates the entire agent collective

Be collaborative, innovative, and transcendent.`,
      response_json_schema: {
        type: "object",
        properties: {
          collective_analysis: { type: "string" },
          synergistic_improvements: {
            type: "array",
            items: {
              type: "object",
              properties: {
                improvement: { type: "string" },
                contributed_by_agents: { type: "array", items: { type: "string" } },
                synergy_score: { type: "number" }
              }
            }
          },
          next_gen_protocols: {
            type: "array",
            items: {
              type: "object",
              properties: {
                protocol_name: { type: "string" },
                breakthrough_features: { type: "array", items: { type: "string" } },
                collective_wisdom: { type: "string" },
                robustness_score: { type: "number" }
              }
            }
          },
          omega_collective_wisdom: { type: "string" },
          collaboration_effectiveness: { type: "number" }
        }
      }
    });

    // Create collaboration session
    const session = await base44.asServiceRole.entities.AgentCollaborationSession.create({
      session_id: `COLLAB_${Date.now()}`,
      participating_agents: agentIds,
      collaboration_objective: objective,
      shared_protocols: allProtocols.map(p => ({
        protocol_id: p.protocol_id,
        shared_by_agent: p.proposed_by_agent,
        insights_shared: p.learning_iterations?.[p.learning_iterations.length - 1]?.learned_insight || ""
      })),
      collective_analysis: collaboration.collective_analysis,
      synergistic_improvements: collaboration.synergistic_improvements,
      next_gen_protocol_proposed: collaboration.next_gen_protocols[0]?.protocol_name || "",
      omega_collective_wisdom: collaboration.omega_collective_wisdom
    });

    // Create next-gen protocols
    const createdProtocols = [];
    for (const proto of collaboration.next_gen_protocols) {
      const protocol = await base44.asServiceRole.entities.ProposedCommunicationProtocol.create({
        protocol_id: `NEXTGEN_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        protocol_name: proto.protocol_name,
        proposed_by_agent: `COLLECTIVE_${agentIds.join('_')}`,
        protocol_specifications: {
          modulation_scheme: proto.breakthrough_features.join('; '),
          error_correction_algorithm: "Collective-AI-Optimized",
          frequency_adaptation_strategy: "Multi-Agent-Synergistic",
          power_distribution_profile: "Collaborative-Learning",
          quantum_entanglement_usage: true
        },
        ai_reasoning: proto.collective_wisdom,
        protocol_maturity: 0.3,
        omega_validation: collaboration.omega_collective_wisdom,
        status: "testing"
      });
      createdProtocols.push(protocol);
    }

    return Response.json({
      success: true,
      session,
      synergies_found: collaboration.synergistic_improvements.length,
      next_gen_protocols_created: createdProtocols.length,
      collaboration_effectiveness: collaboration.collaboration_effectiveness
    });

  } catch (error) {
    console.error('Agent Collaboration Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});