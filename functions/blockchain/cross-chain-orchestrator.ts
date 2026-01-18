export default async function crossChainOrchestrator(data, context) {
  const { agent_id, task_description, target_chains, priority = 'normal' } = data;
  
  const agent = await context.entities.Agent.get(agent_id);
  const agentIdentities = await context.entities.CrossPlatformAgent.filter({ 
    source_agent_id: agent_id 
  });
  
  const orchestrationPlan = await context.integrations.Core.InvokeLLM({
    prompt: `Orchestrate multi-chain task execution for AI agent:

Agent: ${agent.name}
Task: ${task_description}
Target Chains: ${target_chains.join(', ')}
Priority: ${priority}

Agent Identities:
${agentIdentities.map(i => `- ${i.platform_name}: ${i.platform_agent_id}`).join('\n')}

Design cross-chain orchestration:
1. Task decomposition per chain
2. Optimal execution sequence
3. Inter-chain dependencies
4. Bridge routing strategy
5. Gas optimization across chains
6. Failure recovery per chain
7. State synchronization

For each chain operation:
- Required identity/permissions
- Execution order
- Dependencies on other chains
- Estimated gas costs
- Fallback strategies`,
    response_json_schema: {
      type: "object",
      properties: {
        execution_plan: {
          type: "array",
          items: {
            type: "object",
            properties: {
              chain: { type: "string" },
              agent_identity: { type: "string" },
              operations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    operation: { type: "string" },
                    sequence: { type: "number" },
                    dependencies: { type: "array", items: { type: "string" } },
                    estimated_gas: { type: "number" },
                    estimated_time_seconds: { type: "number" }
                  }
                }
              },
              bridge_requirements: {
                type: "object",
                properties: {
                  from_chain: { type: "string" },
                  to_chain: { type: "string" },
                  bridge_protocol: { type: "string" },
                  estimated_cost: { type: "number" }
                }
              }
            }
          }
        },
        total_estimated_cost: { type: "number" },
        total_estimated_time_minutes: { type: "number" },
        critical_path: { type: "array", items: { type: "string" } },
        risk_assessment: {
          type: "object",
          properties: {
            bridge_risks: { type: "array", items: { type: "string" } },
            timing_risks: { type: "array", items: { type: "string" } },
            cost_volatility_risk: { type: "number" }
          }
        }
      }
    }
  });
  
  const orchestration = await context.entities.TeamOrchestration.create({
    name: `CrossChain: ${task_description.substring(0, 50)}`,
    description: task_description,
    team_agents: [agent_id],
    status: 'active',
    workflow_nodes: orchestrationPlan.execution_plan.map((plan, i) => ({
      id: `${plan.chain}_${i}`,
      agent_id,
      task_description: plan.operations.map(o => o.operation).join(', '),
      chain: plan.chain,
      dependencies: plan.operations.flatMap(o => o.dependencies)
    })),
    metadata: {
      multi_chain: true,
      chains: target_chains,
      total_cost: orchestrationPlan.total_estimated_cost,
      critical_path: orchestrationPlan.critical_path
    }
  });
  
  for (const chainPlan of orchestrationPlan.execution_plan) {
    if (chainPlan.bridge_requirements) {
      await context.entities.BlockchainTransaction.create({
        from_node: chainPlan.bridge_requirements.from_chain,
        to_node: chainPlan.bridge_requirements.to_chain,
        transaction_type: 'agent_transfer',
        payload: {
          agent_id,
          operations: chainPlan.operations,
          orchestration_id: orchestration.id
        },
        status: 'pending'
      });
    }
  }
  
  return {
    orchestration,
    execution_plan: orchestrationPlan,
    chains_involved: target_chains.length,
    estimated_completion: new Date(Date.now() + orchestrationPlan.total_estimated_time_minutes * 60 * 1000).toISOString()
  };
}