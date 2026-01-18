export default async function enforceAgentRules(data, context) {
  const { agent_id, proposed_action } = data;
  
  // Get applicable governance rules
  const rules = await context.entities.AgentGovernanceRule.filter({
    agent_ids: { $contains: agent_id },
    is_active: true
  });
  
  if (rules.length === 0) {
    return { allowed: true, message: 'No applicable rules' };
  }
  
  const violations = [];
  
  // Check no_interaction rules
  const noInteractionRules = rules.filter(r => r.rule_type === 'no_interaction');
  for (const rule of noInteractionRules) {
    if (proposed_action.target_agent && rule.restricted_agents?.includes(proposed_action.target_agent)) {
      violations.push({
        rule_name: rule.rule_name,
        severity: rule.enforcement_level,
        message: `Agent ${agent_id} is not allowed to interact with ${proposed_action.target_agent}`
      });
    }
  }
  
  // Check hierarchy rules
  const hierarchyRules = rules.filter(r => r.rule_type === 'hierarchy');
  for (const rule of hierarchyRules) {
    if (rule.hierarchy_config && proposed_action.requires_approval) {
      const agentLevel = rule.hierarchy_config[agent_id] || 0;
      const requiredLevel = proposed_action.approval_level || 5;
      
      if (agentLevel < requiredLevel) {
        violations.push({
          rule_name: rule.rule_name,
          severity: rule.enforcement_level,
          message: `Agent lacks authority for this action (level ${agentLevel} < ${requiredLevel})`
        });
      }
    }
  }
  
  // Check ethical constraints
  const ethicalRules = rules.filter(r => r.rule_type === 'ethical_constraint');
  for (const rule of ethicalRules) {
    if (rule.ethical_guidelines?.length > 0) {
      // Use AI to check ethics
      const ethicsCheck = await context.integrations.Core.InvokeLLM({
        prompt: `Evaluate if this action violates ethical guidelines:

Action: ${JSON.stringify(proposed_action)}
Guidelines: ${rule.ethical_guidelines.join('; ')}

Does this action violate any guidelines?`,
        response_json_schema: {
          type: "object",
          properties: {
            violates: { type: "boolean" },
            violated_guidelines: { type: "array", items: { type: "string" } },
            explanation: { type: "string" }
          }
        }
      });
      
      if (ethicsCheck.violates) {
        violations.push({
          rule_name: rule.rule_name,
          severity: rule.enforcement_level,
          message: `Ethical violation: ${ethicsCheck.explanation}`,
          guidelines: ethicsCheck.violated_guidelines
        });
      }
    }
  }
  
  // Record violations if any
  if (violations.length > 0) {
    const strictViolations = violations.filter(v => v.severity === 'strict');
    
    // Update violation counts
    for (const rule of rules) {
      if (violations.some(v => v.rule_name === rule.rule_name)) {
        await context.entities.AgentGovernanceRule.update(rule.id, {
          violation_count: (rule.violation_count || 0) + 1
        });
      }
    }
    
    return {
      allowed: strictViolations.length === 0,
      violations,
      message: strictViolations.length > 0 
        ? 'Action blocked by strict governance rules'
        : 'Action allowed with warnings'
    };
  }
  
  return { allowed: true, message: 'All governance checks passed' };
}