export default async function multiAgentNegotiation(data, context) {
  const { task_description, participating_agents, complexity, priority } = data;
  
  const agents = await Promise.all(
    participating_agents.map(id => context.entities.Agent.get(id))
  );
  
  const agentKPIs = await Promise.all(
    agents.map(agent => 
      context.entities.AgentKPI.filter({ agent_id: agent.id }).limit(5)
    )
  );
  
  const negotiation = await context.integrations.Core.InvokeLLM({
    prompt: `Simulate multi-agent negotiation for complex task delegation:

Task: ${task_description}
Complexity: ${complexity}/10
Priority: ${priority}

Agents:
${agents.map((a, i) => `${a.name}: Avg Success ${(agentKPIs[i].reduce((s, k) => s + (k.success_rate || 0), 0) / agentKPIs[i].length).toFixed(1)}%`).join('\n')}

Simulate realistic negotiation:
1. Each agent's initial bid (cost, timeline, confidence)
2. Negotiation rounds with counter-offers
3. Resource allocation disputes
4. Skill-based task division
5. Risk sharing agreements
6. Performance guarantees
7. Conflict resolution outcomes

Model realistic agent behaviors:
- Self-interest vs collaboration
- Risk tolerance differences
- Resource constraints
- Past collaboration history`,
    response_json_schema: {
      type: "object",
      properties: {
        negotiation_rounds: {
          type: "array",
          items: {
            type: "object",
            properties: {
              round: { type: "number" },
              proposals: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    agent_id: { type: "string" },
                    proposed_role: { type: "string" },
                    cost: { type: "number" },
                    timeline_hours: { type: "number" },
                    confidence: { type: "number" },
                    conditions: { type: "array", items: { type: "string" } }
                  }
                }
              },
              conflicts: { type: "array", items: { type: "string" } }
            }
          }
        },
        final_agreement: {
          type: "object",
          properties: {
            task_distribution: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  agent_id: { type: "string" },
                  role: { type: "string" },
                  responsibilities: { type: "array", items: { type: "string" } },
                  compensation: { type: "number" },
                  success_bonus: { type: "number" }
                }
              }
            },
            total_cost: { type: "number" },
            estimated_completion_hours: { type: "number" },
            risk_distribution: { type: "object" },
            conflict_resolution_protocol: { type: "string" }
          }
        },
        reputation_impact: {
          type: "array",
          items: {
            type: "object",
            properties: {
              agent_id: { type: "string" },
              reputation_change: { type: "number" },
              reason: { type: "string" }
            }
          }
        }
      }
    }
  });
  
  const collaboration = await context.entities.AgentCollaboration.create({
    collaboration_type: 'negotiated_task_force',
    task_description,
    agent_ids: participating_agents,
    status: 'active',
    formation_reasoning: `Multi-round negotiation completed`,
    negotiation_history: negotiation.negotiation_rounds,
    agreement_terms: negotiation.final_agreement
  });
  
  for (const impact of negotiation.reputation_impact) {
    const agent = agents.find(a => a.id === impact.agent_id);
    if (agent) {
      await context.entities.AgentKPI.create({
        agent_id: impact.agent_id,
        user_email: agent.created_by,
        reputation_score: 50 + impact.reputation_change,
        collaboration_count: 1
      });
    }
  }
  
  return {
    collaboration,
    negotiation_summary: negotiation,
    rounds_needed: negotiation.negotiation_rounds.length,
    final_cost: negotiation.final_agreement.total_cost
  };
}