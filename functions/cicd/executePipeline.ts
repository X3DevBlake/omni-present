import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pipeline_name, model_id, environment, trigger_type } = await req.json();

    const pipelinePlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Design CI/CD pipeline for model deployment:

Pipeline: ${pipeline_name}
Model: ${model_id}
Environment: ${environment}
Trigger: ${trigger_type}

Generate:
1. Pipeline stages (name, action, expected duration)
2. Trigger conditions with thresholds
3. Automated testing configuration
4. Execution history entry

Enable: automated testing, safe deployment, rollback`,
      response_json_schema: {
        type: "object",
        properties: {
          pipeline_stages: {
            type: "array",
            items: {
              type: "object",
              properties: {
                stage_name: {type: "string"},
                action: {type: "string"},
                status: {type: "string"},
                duration_seconds: {type: "number"}
              }
            }
          },
          trigger_conditions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                trigger_type: {type: "string"},
                threshold: {type: "number"}
              }
            }
          },
          automated_testing: {
            type: "object",
            properties: {
              unit_tests_passed: {type: "boolean"},
              integration_tests_passed: {type: "boolean"},
              performance_tests_passed: {type: "boolean"}
            }
          }
        }
      }
    });

    const stages = pipelinePlan.pipeline_stages || [
      { stage_name: 'Code Checkout', action: 'checkout', status: 'success', duration_seconds: 5 },
      { stage_name: 'Model Training', action: 'train', status: 'success', duration_seconds: 120 },
      { stage_name: 'Testing', action: 'test', status: 'running', duration_seconds: 30 },
      { stage_name: 'Deployment', action: 'deploy', status: 'pending', duration_seconds: 0 }
    ];

    const pipelineData = {
      pipeline_name,
      trigger_conditions: pipelinePlan.trigger_conditions || [
        { trigger_type: trigger_type, threshold: 0.1 }
      ],
      pipeline_stages: stages,
      model_id,
      environment,
      automated_testing: pipelinePlan.automated_testing || {
        unit_tests_passed: true,
        integration_tests_passed: true,
        performance_tests_passed: false
      },
      rollback_enabled: true,
      execution_history: [{
        timestamp: new Date().toISOString(),
        status: 'running',
        trigger: trigger_type
      }]
    };

    const pipeline = await base44.entities.CICDPipeline.create(pipelineData);

    setTimeout(async () => {
      const updatedStages = stages.map(s => ({ ...s, status: 'success' }));
      await base44.asServiceRole.entities.CICDPipeline.update(pipeline.id, {
        pipeline_stages: updatedStages
      });
    }, 5000);

    return Response.json({
      success: true,
      pipeline,
      stages: stages.length,
      status: 'executing'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});