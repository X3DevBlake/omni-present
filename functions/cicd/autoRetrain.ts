import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { monitor_id, deployment_id } = await req.json();

    const monitor = await base44.entities.MLOpsMonitor.get(monitor_id);
    
    const shouldRetrain = 
      monitor.drift_detection?.data_drift_score > 0.2 ||
      monitor.performance_degradation?.degradation_percentage > 5 ||
      monitor.retraining_recommended;

    if (!shouldRetrain) {
      return Response.json({
        success: true,
        action: 'no_retraining_needed',
        monitor_health: monitor.health_score
      });
    }

    const retrainingPlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Design automated retraining plan:

Drift Score: ${monitor.drift_detection?.data_drift_score}
Performance Drop: ${monitor.performance_degradation?.degradation_percentage}%
Health: ${monitor.health_score}%

Generate:
1. New training hyperparameters
2. Data augmentation strategy
3. Validation approach
4. Deployment strategy

Optimize: address drift, improve performance`,
      response_json_schema: {
        type: "object",
        properties: {
          hyperparameters: {
            type: "object",
            properties: {
              learning_rate: {type: "number"},
              batch_size: {type: "number"},
              epochs: {type: "number"}
            }
          },
          data_strategy: {type: "string"},
          estimated_improvement: {type: "number"}
        }
      }
    });

    const pipelineResponse = await base44.functions.invoke('executePipeline', {
      pipeline_name: 'Auto_Retrain_Pipeline',
      model_id: deployment_id,
      environment: 'staging',
      trigger_type: 'drift_detected'
    });

    await base44.entities.MLOpsMonitor.update(monitor_id, {
      retraining_recommended: false
    });

    return Response.json({
      success: true,
      action: 'retraining_initiated',
      pipeline: pipelineResponse.data.pipeline,
      improvement_estimate: retrainingPlan.estimated_improvement || 15
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});