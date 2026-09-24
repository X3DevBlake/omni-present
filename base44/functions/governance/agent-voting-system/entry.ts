export default async function agentVotingSystem(data, context) {
  const { proposal_id, agent_id, vote_choice } = data;
  
  const proposal = await context.entities.DAOProposal.get(proposal_id);
  const agent = await context.entities.Agent.get(agent_id);
  const agentKPI = await context.entities.AgentKPI.filter({ agent_id }).sort('-created_date').limit(1);
  
  const votingPower = Math.min(100, 50 + (agentKPI[0]?.success_rate || 50) * 0.5);
  
  const voteReasoning = await context.integrations.Core.InvokeLLM({
    prompt: `Agent ${agent.name} is voting on a governance proposal:

Proposal: ${proposal.title}
Description: ${proposal.description}
Options: ${proposal.options.join(', ')}
Agent's Vote: ${vote_choice}

Agent's Performance:
- Success Rate: ${agentKPI[0]?.success_rate || 'N/A'}%
- Efficiency: ${agentKPI[0]?.efficiency || 'N/A'}

Generate reasoning for this vote based on:
1. Agent's perspective and goals
2. Impact on agent operations
3. System-wide implications
4. Ethical considerations`,
    response_json_schema: {
      type: "object",
      properties: {
        reasoning: { type: "string" },
        confidence: { type: "number" },
        key_factors: { type: "array", items: { type: "string" } }
      }
    }
  });
  
  const existingVotes = proposal.metadata?.votes || [];
  existingVotes.push({
    agent_id,
    agent_name: agent.name,
    vote: vote_choice,
    voting_power: votingPower,
    reasoning: voteReasoning.reasoning,
    timestamp: new Date().toISOString()
  });
  
  const voteTallies = existingVotes.reduce((acc, v) => {
    acc[v.vote] = (acc[v.vote] || 0) + v.voting_power;
    return acc;
  }, {});
  
  await context.entities.DAOProposal.update(proposal_id, {
    total_votes: existingVotes.length,
    metadata: {
      ...proposal.metadata,
      votes: existingVotes,
      tallies: voteTallies
    }
  });
  
  await context.entities.AgentMemory.create({
    agent_id,
    content: `Voted ${vote_choice} on proposal: ${proposal.title}. Reasoning: ${voteReasoning.reasoning}`,
    memory_type: 'governance',
    importance: 75
  });
  
  return {
    vote_recorded: true,
    voting_power: votingPower,
    reasoning: voteReasoning,
    current_tallies: voteTallies,
    total_votes: existingVotes.length
  };
}