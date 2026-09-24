export default async function automatedRuleEnforcement(data, context) {
  const { proposal_id } = data;
  
  const proposal = await context.entities.DAOProposal.get(proposal_id);
  
  if (proposal.status !== 'approved') {
    return { error: 'Proposal not approved' };
  }
  
  const enforcementPlan = await context.integrations.Core.InvokeLLM({
    prompt: `Generate automated enforcement plan for approved governance proposal:

Proposal: ${proposal.title}
Type: ${proposal.proposal_type}
Description: ${proposal.description}

Create enforcement mechanism:
1. Rule specification
2. Automated monitoring
3. Violation detection
4. Penalty/reward system
5. Appeals process
6. Audit trail

Make it autonomous and fair.`,
    response_json_schema: {
      type: "object",
      properties: {
        rule_specification: {
          type: "object",
          properties: {
            rule_name: { type: "string" },
            conditions: { type: "array", items: { type: "string" } },
            scope: { type: "string" },
            exemptions: { type: "array", items: { type: "string" } }
          }
        },
        monitoring_config: {
          type: "object",
          properties: {
            check_frequency_minutes: { type: "number" },
            monitored_entities: { type: "array", items: { type: "string" } },
            alert_thresholds: { type: "object" }
          }
        },
        enforcement_actions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              violation_type: { type: "string" },
              action: { type: "string" },
              severity: { type: "string" },
              automated: { type: "boolean" }
            }
          }
        }
      }
    }
  });
  
  const rule = await context.entities.AgentGovernanceRule.create({
    rule_name: enforcementPlan.rule_specification.rule_name,
    rule_type: proposal.proposal_type,
    agent_ids: [],
    enforcement_level: 'strict',
    is_active: true,
    hierarchy_config: {
      proposal_id,
      enforcement_plan: enforcementPlan,
      created_from_governance: true
    }
  });
  
  const autonomousSetting = await context.entities.AutonomousSetting.create({
    setting_key: `governance_${proposal_id}`,
    setting_name: enforcementPlan.rule_specification.rule_name,
    description: proposal.description,
    category: 'governance',
    enabled: true,
    automation_level: 100
  });
  
  await context.entities.ProactiveAlert.create({
    alert_type: 'governance_action',
    severity: 'low',
    title: `New Rule Enforced: ${enforcementPlan.rule_specification.rule_name}`,
    description: `Governance proposal ${proposal_id} now being automatically enforced`,
    status: 'active'
  });
  
  return {
    rule,
    enforcement_plan: enforcementPlan,
    monitoring_active: true,
    setting: autonomousSetting
  };
}