import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deployment_name, model_id, platform, instance_type } = await req.json();

    const deploymentPlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Design model deployment to ${platform}:

Deployment: ${deployment_name}
Model: ${model_id}
Instance: ${instance_type}

Generate:
1. Deployment configuration (auto-scaling, instances)
2. API endpoint structure
3. Performance metrics baseline
4. Resource usage estimates
5. Cost per hour calculation

Enable: production-ready inference, auto-scaling`,
      response_json_schema: {
        type: "object",
        properties: {
          deployment_config: {
            type: "object",
            properties: {
              instance_type: {type: "string"},
              auto_scaling: {type: "boolean"},
              min_instances: {type: "number"},
              max_instances: {type: "number"}
            }
          },
          endpoint_url: {type: "string"},
          performance_metrics: {
            type: "object",
            properties: {
              requests_per_second: {type: "number"},
              avg_latency_ms: {type: "number"},
              error_rate: {type: "number"},
              uptime_percentage: {type: "number"}
            }
          },
          resource_usage: {
            type: "object",
            properties: {
              cpu_utilization: {type: "number"},
              memory_usage_gb: {type: "number"},
              gpu_utilization: {type: "number"}
            }
          },
          cost_per_hour: {type: "number"}
        }
      }
    });

    const deploymentData = {
      deployment_name,
      model_id,
      target_platform: platform,
      deployment_config: deploymentPlan.deployment_config || {
        instance_type: instance_type || 'ml.m5.large',
        auto_scaling: true,
        min_instances: 1,
        max_instances: 5
      },
      endpoint_url: deploymentPlan.endpoint_url || `https://api.model-${model_id}.inference.io`,
      deployment_status: 'deploying',
      performance_metrics: deploymentPlan.performance_metrics || {
        requests_per_second: 100,
        avg_latency_ms: 45,
        error_rate: 0.01,
        uptime_percentage: 99.9
      },
      resource_usage: deploymentPlan.resource_usage || {
        cpu_utilization: 0.65,
        memory_usage_gb: 4.2,
        gpu_utilization: 0.80
      },
      cost_per_hour: deploymentPlan.cost_per_hour || 2.45
    };

    const deployment = await base44.entities.ModelDeployment.create(deploymentData);

    setTimeout(async () => {
      await base44.asServiceRole.entities.ModelDeployment.update(deployment.id, {
        deployment_status: 'active'
      });
    }, 3000);

    return Response.json({
      success: true,
      deployment,
      endpoint: deploymentData.endpoint_url,
      estimated_cost: `$${deploymentData.cost_per_hour}/hour`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});