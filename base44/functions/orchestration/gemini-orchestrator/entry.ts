import { base44 } from '@/api/base44Client';

/**
 * Gemini Orchestrator - Intelligent workflow coordination
 */

// Analyze context and suggest workflows
export async function suggestWorkflowsFromContext(context) {
  try {
    const prompt = `You are an intelligent workflow orchestration system. 
    
Current Context:
${JSON.stringify(context, null, 2)}

Based on this context, suggest up to 5 highly relevant, actionable Zapier workflows.
For each workflow, provide:
1. Trigger (what initiates it)
2. Actions (what it executes)
3. Expected Impact (how it helps the user)
4. Relevance Score (0-100)

Return as JSON array with objects: { name, trigger, actions[], impact, score }`;

    const suggestions = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          workflows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                trigger: { type: 'string' },
                actions: { type: 'array', items: { type: 'string' } },
                impact: { type: 'string' },
                score: { type: 'number' }
              }
            }
          }
        }
      }
    });

    return suggestions.workflows || [];
  } catch (error) {
    console.error('Error suggesting workflows:', error);
    return [];
  }
}

// Detect anomalies and suggest protective workflows
export async function detectAnomaliesAndSuggest(data, dataType) {
  try {
    const prompt = `Analyze this ${dataType} data for anomalies and suggest protective/corrective workflows:

${JSON.stringify(data, null, 2)}

Identify:
1. Anomalies detected (with severity: low/medium/high/critical)
2. Recommended Zapier workflows to address them
3. Risk level assessment

Return JSON with: { anomalies: [...], workflows: [...], risk_level }`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          anomalies: { type: 'array', items: { type: 'object' } },
          workflows: { type: 'array', items: { type: 'object' } },
          risk_level: { type: 'string' }
        }
      }
    });

    return analysis;
  } catch (error) {
    console.error('Error detecting anomalies:', error);
    return { anomalies: [], workflows: [], risk_level: 'unknown' };
  }
}

// Generate personalized automation suggestions
export async function generatePersonalizedAutomations(userProfile, behavior, goals) {
  try {
    const prompt = `Create personalized automation workflows for this user:

Profile: ${JSON.stringify(userProfile)}
Behavior: ${JSON.stringify(behavior)}
Goals: ${JSON.stringify(goals)}

Generate 10 high-impact Zapier workflows tailored to:
1. Their financial goals
2. Their spending patterns
3. Their risk profile
4. Their time constraints

For each, provide: name, description, trigger, actions, expected_monthly_savings/impact

Return as JSON: { workflows: [...] }`;

    const automations = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          workflows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                trigger: { type: 'string' },
                actions: { type: 'array' },
                expected_impact: { type: 'string' }
              }
            }
          }
        }
      }
    });

    return automations.workflows || [];
  } catch (error) {
    console.error('Error generating personalizations:', error);
    return [];
  }
}

// Optimize workflow execution order and timing
export async function optimizeWorkflowExecution(workflows, constraints) {
  try {
    const prompt = `Optimize the execution order and timing of these workflows:

Workflows: ${JSON.stringify(workflows)}
Constraints: ${JSON.stringify(constraints)}

Consider:
1. Dependencies between workflows
2. Time-based efficiency
3. Resource optimization
4. Error recovery paths

Return optimized execution plan with timing.`;

    const optimized = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          execution_order: { type: 'array', items: { type: 'string' } },
          timing: { type: 'object' },
          optimizations: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    return optimized;
  } catch (error) {
    console.error('Error optimizing execution:', error);
    return { execution_order: [], timing: {}, optimizations: [] };
  }
}

// Real-time workflow health monitoring
export async function monitorWorkflowHealth(workflowId) {
  try {
    const executions = await base44.entities.WorkflowExecution.list('-created_date', 50);
    const workflow = await base44.entities.Workflow.list({ id: workflowId }, '', 1);

    const prompt = `Analyze workflow health:

Workflow: ${JSON.stringify(workflow[0])}
Recent Executions: ${JSON.stringify(executions.slice(0, 10))}

Provide health assessment with:
1. Success rate
2. Average execution time
3. Common errors
4. Optimization suggestions
5. Health score (0-100)`;

    const health = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          success_rate: { type: 'number' },
          avg_execution_time_ms: { type: 'number' },
          common_errors: { type: 'array', items: { type: 'string' } },
          optimizations: { type: 'array', items: { type: 'string' } },
          health_score: { type: 'number' }
        }
      }
    });

    return health;
  } catch (error) {
    console.error('Error monitoring health:', error);
    return null;
  }
}