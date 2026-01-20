import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gather automation performance data
    const [automations, jobs, workflows] = await Promise.all([
      base44.entities.AutomationRule.filter({}).limit(100),
      base44.entities.OrchestrationJob.filter({}).limit(100).sort('-created_date'),
      base44.entities.WorkflowTemplate.filter({}).limit(50)
    ]);

    // Analyze performance metrics
    const performanceData = jobs.map(job => ({
      job_name: job.job_name,
      duration: job.performance_metrics?.duration_seconds || 0,
      efficiency: job.performance_metrics?.efficiency_score || 0,
      status: job.status,
      bottlenecks: job.performance_metrics?.bottleneck_steps || []
    }));

    // Use AI to generate optimization recommendations
    const optimizationData = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze automation performance data and generate optimization recommendations:
      
Total Automations: ${automations.length}
Completed Jobs: ${jobs.filter(j => j.status === 'completed').length}
Failed Jobs: ${jobs.filter(j => j.status === 'failed').length}
Workflows: ${workflows.length}

Performance Data: ${JSON.stringify(performanceData.slice(0, 10))}

Provide 5 optimization recommendations with: recommendation title, affected automation names (array), improvement type (speed/reliability/cost), estimated impact percentage, and specific actions to take.`,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                affected_automations: { type: "array", items: { type: "string" } },
                improvement_type: { type: "string" },
                impact_percentage: { type: "number" },
                actions: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    // Apply optimizations to automations
    const optimizedCount = 0;
    for (const rec of optimizationData.recommendations) {
      for (const autoName of rec.affected_automations) {
        const automation = automations.find(a => a.rule_name === autoName);
        if (automation) {
          await base44.entities.AutomationRule.update(automation.id, {
            optimization_suggestions: [
              ...(automation.optimization_suggestions || []),
              `${rec.title}: ${rec.actions[0]}`
            ]
          });
        }
      }
    }

    return Response.json({
      success: true,
      recommendations: optimizationData.recommendations,
      automations_analyzed: automations.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});