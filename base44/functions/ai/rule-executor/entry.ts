import { base44 } from '@base44/sdk';

/**
 * Dynamic Rule Executor
 * Executes dynamic rules based on trigger conditions
 */
export default async function ruleExecutor(event) {
  try {
    // Get all active rules
    const rules = await base44.asServiceRole.entities.DynamicRuleSet.filter({
      active: true
    });

    // Sort by priority
    rules.sort((a, b) => (b.priority || 50) - (a.priority || 50));

    const executedRules = [];

    for (const rule of rules) {
      // Check if trigger conditions are met
      const shouldExecute = await evaluateTriggerConditions(rule.trigger_conditions);

      if (shouldExecute) {
        try {
          // Execute rule actions
          const results = await executeActions(rule.actions);

          // Update rule execution stats
          await base44.asServiceRole.entities.DynamicRuleSet.update(rule.id, {
            execution_count: (rule.execution_count || 0) + 1,
            last_executed: new Date().toISOString(),
            success_rate: calculateSuccessRate(rule, results.success)
          });

          executedRules.push({
            rule_id: rule.id,
            rule_name: rule.rule_name,
            success: results.success,
            results
          });

        } catch (error) {
          await base44.asServiceRole.entities.DynamicRuleSet.update(rule.id, {
            success_rate: calculateSuccessRate(rule, false)
          });
        }
      }
    }

    return {
      success: true,
      rules_evaluated: rules.length,
      rules_executed: executedRules.length,
      results: executedRules
    };

  } catch (error) {
    console.error('Rule executor error:', error);
    return { success: false, error: error.message };
  }
}

async function evaluateTriggerConditions(conditions) {
  // Simple condition evaluation - can be expanded
  if (conditions.metric_threshold) {
    const metrics = await base44.asServiceRole.entities.SystemMetric.list('-created_date', 5);
    return metrics.some(m => m.threshold_status !== 'normal');
  }

  return false;
}

async function executeActions(actions) {
  const results = [];

  for (const action of actions) {
    try {
      if (action.action_type === 'execute_command') {
        // Simulate command execution
        results.push({ action: action.action_type, success: true });
      } else if (action.action_type === 'send_notification') {
        await base44.integrations.Core.SendEmail({
          to: action.parameters.recipient,
          subject: 'Automated Action Executed',
          body: action.parameters.message
        });
        results.push({ action: action.action_type, success: true });
      }
    } catch (error) {
      results.push({ action: action.action_type, success: false, error: error.message });
    }
  }

  return {
    success: results.every(r => r.success),
    results
  };
}

function calculateSuccessRate(rule, currentSuccess) {
  const totalExecutions = (rule.execution_count || 0) + 1;
  const currentRate = rule.success_rate || 100;
  const successCount = Math.round((currentRate / 100) * (totalExecutions - 1)) + (currentSuccess ? 1 : 0);
  return (successCount / totalExecutions) * 100;
}