import { base44 } from '@base44/sdk';

/**
 * AI Workflow Analyzer
 * Analyzes user activity patterns and system metrics to suggest optimizations
 */
export default async function workflowAnalyzer(event) {
  try {
    // Gather comprehensive system data
    const [metrics, activities, webhooks, upgrades] = await Promise.all([
      base44.asServiceRole.entities.SystemMetric.list('-created_date', 200),
      base44.asServiceRole.entities.ActivityLog.list('-created_date', 500),
      base44.asServiceRole.entities.WebhookConfiguration.list(),
      base44.asServiceRole.entities.UpgradeTracker.list()
    ]);

    // Analyze patterns with AI
    const analysisPrompt = `
Analyze the following system data to identify:
1. Performance bottlenecks
2. Resource allocation inefficiencies
3. Workflow automation opportunities
4. Potential cost optimizations

System Metrics (Last 200):
${JSON.stringify(metrics.slice(0, 50).map(m => ({
  name: m.metric_name,
  type: m.metric_type,
  value: m.metric_value,
  status: m.threshold_status
})), null, 2)}

Activity Patterns (Last 500):
${JSON.stringify(activities.slice(0, 100).map(a => ({
  user: a.user_email,
  action: a.action_type,
  entity: a.entity_type,
  success: a.success,
  time: a.created_date
})), null, 2)}

Webhook Performance:
${JSON.stringify(webhooks.map(w => ({
  name: w.webhook_name,
  success: w.success_count,
  failures: w.failure_count,
  status: w.status
})), null, 2)}

For each issue identified, provide:
1. issue_type: bottleneck | resource_allocation | workflow_automation | cost_optimization
2. severity: critical | high | medium | low
3. description: Clear explanation of the issue
4. suggested_actions: Array of specific actions to resolve
5. estimated_impact: Expected improvement percentage
6. confidence: Your confidence in this analysis (0-100)
`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          issues: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                issue_type: { type: 'string' },
                severity: { type: 'string' },
                description: { type: 'string' },
                suggested_actions: {
                  type: 'array',
                  items: { type: 'string' }
                },
                estimated_impact: { type: 'number' },
                confidence: { type: 'number' }
              }
            }
          },
          bottlenecks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                location: { type: 'string' },
                description: { type: 'string' },
                suggested_fix: { type: 'string' }
              }
            }
          },
          optimization_opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                area: { type: 'string' },
                current_state: { type: 'string' },
                optimized_state: { type: 'string' },
                steps: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            }
          }
        }
      }
    });

    // Generate dynamic rules based on analysis
    const generatedRules = await generateDynamicRules(analysis);

    // Store analysis results
    await base44.asServiceRole.entities.ActivityLog.create({
      action_type: 'system_event',
      entity_type: 'WorkflowAnalysis',
      success: true,
      action_details: {
        analysis,
        rules_generated: generatedRules.length,
        timestamp: new Date().toISOString()
      }
    });

    return {
      success: true,
      analysis,
      rules_generated: generatedRules,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Workflow analyzer error:', error);
    return { success: false, error: error.message };
  }
}

async function generateDynamicRules(analysis) {
  const rules = [];

  // Generate rules for each identified issue
  for (const issue of analysis.issues || []) {
    const rule = {
      rule_name: `Auto-fix: ${issue.description.substring(0, 50)}`,
      rule_type: mapIssueTypeToRuleType(issue.issue_type),
      trigger_conditions: {
        metric_threshold: true,
        severity: issue.severity,
        pattern_detected: issue.issue_type
      },
      actions: issue.suggested_actions.map(action => ({
        action_type: 'execute_command',
        parameters: { command: action }
      })),
      ai_generated: true,
      confidence_score: issue.confidence || 70,
      active: issue.confidence > 80, // Only auto-activate high confidence rules
      priority: issue.severity === 'critical' ? 100 : issue.severity === 'high' ? 75 : 50
    };

    const created = await base44.asServiceRole.entities.DynamicRuleSet.create(rule);
    rules.push(created);
  }

  return rules;
}

function mapIssueTypeToRuleType(issueType) {
  const mapping = {
    'bottleneck': 'bottleneck_resolution',
    'resource_allocation': 'resource_allocation',
    'workflow_automation': 'workflow_automation',
    'cost_optimization': 'cost_optimization'
  };
  return mapping[issueType] || 'performance_optimization';
}