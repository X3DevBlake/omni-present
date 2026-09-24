export default async function dynamicTaskForce(data, context) {
  const { urgent_task, agent_pool, auto_resolve_conflicts = true } = data;
  
  const agents = await context.entities.Agent.filter({
    id: { $in: agent_pool }
  });
  
  const taskForceFormation = await context.integrations.Core.InvokeLLM({
    prompt: `Form dynamic ad-hoc task force for urgent mission:

Urgent Task: ${urgent_task}
Available Agent Pool: ${agents.length} agents
Auto-Resolve Conflicts: ${auto_resolve_conflicts}

Agent Pool:
${agents.map(a => `- ${a.name} (Type: ${a.agent_type})`).join('\n')}

Design task force with:
1. Optimal team size (3-7 agents)
2. Clear role assignments
3. Command hierarchy
4. Communication protocols
5. Conflict resolution rules
6. Success criteria
7. Failure fallbacks
8. Resource allocation

Include automated conflict resolution mechanism.`,
    response_json_schema: {
      type: "object",
      properties: {
        task_force_name: { type: "string" },
        selected_agents: {
          type: "array",
          items: {
            type: "object",
            properties: {
              agent_id: { type: "string" },
              role: { type: "string" },
              authority_level: { type: "number" },
              responsibilities: { type: "array", items: { type: "string" } }
            }
          }
        },
        command_structure: {
          type: "object",
          properties: {
            leader: { type: "string" },
            lieutenants: { type: "array", items: { type: "string" } },
            specialists: { type: "array", items: { type: "string" } }
          }
        },
        conflict_resolution: {
          type: "object",
          properties: {
            voting_mechanism: { type: "string" },
            tie_breaker: { type: "string" },
            escalation_path: { type: "array", items: { type: "string" } },
            automated_rules: { type: "array", items: { type: "string" } }
          }
        },
        communication_protocol: {
          type: "object",
          properties: {
            update_frequency: { type: "string" },
            emergency_channels: { type: "array", items: { type: "string" } },
            decision_latency: { type: "string" }
          }
        },
        success_metrics: { type: "array", items: { type: "string" } }
      }
    }
  });
  
  const taskForce = await context.entities.TeamOrchestration.create({
    name: taskForceFormation.task_force_name,
    description: urgent_task,
    team_agents: taskForceFormation.selected_agents.map(a => a.agent_id),
    status: 'active',
    workflow_nodes: taskForceFormation.selected_agents.map((a, i) => ({
      id: `node_${i}`,
      agent_id: a.agent_id,
      task_description: a.responsibilities.join('; '),
      role: a.role
    })),
    delegation_rules: [
      {
        rule: 'Automatic conflict resolution enabled',
        mechanism: taskForceFormation.conflict_resolution.voting_mechanism
      }
    ]
  });
  
  await context.entities.AgentGovernanceRule.create({
    rule_name: `TaskForce_${taskForce.id}_ConflictResolution`,
    rule_type: 'hierarchy',
    agent_ids: taskForceFormation.selected_agents.map(a => a.agent_id),
    hierarchy_config: taskForceFormation.command_structure,
    enforcement_level: 'strict',
    is_active: true
  });
  
  return {
    task_force: taskForce,
    formation: taskForceFormation,
    agents_deployed: taskForceFormation.selected_agents.length
  };
}