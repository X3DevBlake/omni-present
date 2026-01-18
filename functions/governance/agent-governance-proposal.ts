export default async function agentGovernanceProposal(data, context) {
  const { agent_id, proposal_type, proposal_content, target_entities } = data;
  
  const agent = await context.entities.Agent.get(agent_id);
  const agentKPIs = await context.entities.AgentKPI.filter({ agent_id }).limit(10);
  const reputation = agentKPIs.reduce((sum, k) => sum + (k.success_rate || 0), 0) / agentKPIs.length;
  
  const impactAnalysis = await context.integrations.Core.InvokeLLM({
    prompt: `Analyze governance proposal impact:

Proposed By: Agent ${agent.name} (Reputation: ${reputation.toFixed(1)}%)
Proposal Type: ${proposal_type}
Content: ${proposal_content}
Target: ${target_entities.join(', ')}

Analyze:
1. Technical feasibility
2. Impact on platform stability
3. Effect on agent autonomy levels
4. Economic implications
5. Security considerations
6. Predicted voting outcome
7. Implementation complexity
8. Rollback difficulty

Generate detailed impact report.`,
    response_json_schema: {
      type: "object",
      properties: {
        feasibility_score: { type: "number" },
        impact_assessment: {
          type: "object",
          properties: {
            stability_impact: { type: "string" },
            autonomy_impact: { type: "string" },
            economic_impact: { type: "string" },
            security_impact: { type: "string" }
          }
        },
        voting_prediction: {
          type: "object",
          properties: {
            predicted_approval_rate: { type: "number" },
            key_stakeholders: { type: "array", items: { type: "string" } },
            controversy_level: { type: "string" }
          }
        },
        implementation_plan: {
          type: "array",
          items: {
            type: "object",
            properties: {
              phase: { type: "string" },
              duration_days: { type: "number" },
              risk_level: { type: "string" }
            }
          }
        },
        risks: { type: "array", items: { type: "string" } },
        benefits: { type: "array", items: { type: "string" } }
      }
    }
  });
  
  const proposal = await context.entities.DAOProposal.create({
    title: `Agent Proposal: ${proposal_type}`,
    description: proposal_content,
    proposal_type: proposal_type,
    proposed_by: agent.created_by,
    status: 'active',
    voting_start: new Date().toISOString(),
    voting_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      proposer_agent_id: agent_id,
      proposer_reputation: reputation,
      impact_analysis: impactAnalysis,
      target_entities
    }
  });
  
  await context.entities.AgentGovernanceRule.create({
    rule_name: `Proposal ${proposal.id}`,
    rule_type: 'governance_proposal',
    agent_ids: [agent_id],
    enforcement_level: 'advisory',
    is_active: false
  });
  
  return {
    proposal,
    impact_analysis: impactAnalysis,
    predicted_outcome: impactAnalysis.voting_prediction.predicted_approval_rate > 50 ? 'likely_pass' : 'likely_fail'
  };
}