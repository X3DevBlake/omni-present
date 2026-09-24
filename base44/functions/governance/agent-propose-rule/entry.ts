export default async function agentProposeRule(data, context) {
  const { agent_id, proposed_rule, reasoning } = data;
  
  const agent = await context.entities.Agent.get(agent_id);
  const existingRules = await context.entities.AgentGovernanceRule.filter({ is_active: true });
  const allAgents = await context.entities.Agent.filter({ created_by: agent.created_by });
  
  const ruleAnalysis = await context.integrations.Core.InvokeLLM({
    prompt: `Analyze a governance rule proposed by AI agent "${agent.name}":

Proposed Rule: ${JSON.stringify(proposed_rule, null, 2)}
Agent's Reasoning: ${reasoning}

Existing Rules: ${existingRules.length} active rules
Total Agents in System: ${allAgents.length}

Evaluate:
1. Rule validity and necessity
2. Potential conflicts with existing rules
3. Impact on agent autonomy
4. System-wide benefits/risks
5. Implementation complexity
6. Recommended enforcement level

Determine if this rule should be put to a vote among agents.`,
    response_json_schema: {
      type: "object",
      properties: {
        recommendation: { type: "string", enum: ["approve", "modify", "reject", "vote_required"] },
        validity_score: { type: "number" },
        impact_assessment: {
          type: "object",
          properties: {
            positive_impacts: { type: "array", items: { type: "string" } },
            negative_impacts: { type: "array", items: { type: "string" } },
            affected_agent_count: { type: "number" }
          }
        },
        conflicts: { type: "array", items: { type: "string" } },
        modifications_suggested: { type: "array", items: { type: "string" } },
        enforcement_recommendation: { type: "string", enum: ["strict", "moderate", "advisory"] },
        implementation_complexity: { type: "string", enum: ["low", "medium", "high"] }
      }
    }
  });
  
  const proposal = await context.entities.DAOProposal.create({
    title: `Governance Rule: ${proposed_rule.rule_name}`,
    description: `Proposed by agent ${agent.name}: ${reasoning}`,
    proposal_type: 'governance_rule',
    proposer_type: 'agent',
    proposer_id: agent_id,
    status: ruleAnalysis.recommendation === 'vote_required' ? 'active' : 'review',
    voting_start: new Date().toISOString(),
    voting_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    options: ['approve', 'reject', 'modify'],
    metadata: {
      proposed_rule,
      analysis: ruleAnalysis,
      proposing_agent: agent.name
    }
  });
  
  if (ruleAnalysis.recommendation === 'approve') {
    await context.entities.AgentGovernanceRule.create({
      rule_name: proposed_rule.rule_name,
      rule_type: proposed_rule.rule_type,
      agent_ids: proposed_rule.agent_ids || allAgents.map(a => a.id),
      enforcement_level: ruleAnalysis.enforcement_recommendation,
      is_active: true,
      proposed_by_agent: agent_id,
      approval_method: 'ai_analysis'
    });
  }
  
  await context.entities.AgentMemory.create({
    agent_id,
    content: `Proposed governance rule: ${proposed_rule.rule_name}. Status: ${ruleAnalysis.recommendation}`,
    memory_type: 'governance',
    importance: 85
  });
  
  return { 
    proposal, 
    analysis: ruleAnalysis,
    voting_required: ruleAnalysis.recommendation === 'vote_required'
  };
}