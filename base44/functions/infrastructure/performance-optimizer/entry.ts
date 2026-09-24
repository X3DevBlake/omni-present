export default async function performanceOptimizer(data, context) {
  const { optimization_target, current_metrics } = data;
  
  const optimizationStrategies = {
    '3d_rendering': {
      techniques: ['LOD', 'Occlusion Culling', 'Instancing', 'Frustum Culling'],
      target_fps: 60,
      quality_presets: ['low', 'medium', 'high', 'ultra']
    },
    'database_queries': {
      techniques: ['Indexing', 'Query Caching', 'Connection Pooling', 'Read Replicas'],
      target_latency_ms: 100,
      optimization_threshold: 0.7
    },
    'api_response': {
      techniques: ['Response Compression', 'CDN Caching', 'Lazy Loading', 'API Gateway Caching'],
      target_response_time_ms: 200,
      cache_ttl_seconds: 300
    },
    'real_time_events': {
      techniques: ['Event Batching', 'WebSocket Optimization', 'Message Queue', 'Event Filtering'],
      target_throughput: 10000,
      latency_p99_ms: 50
    }
  };
  
  const strategy = optimizationStrategies[optimization_target];
  if (!strategy) {
    return { error: 'Unknown optimization target', available: Object.keys(optimizationStrategies) };
  }
  
  const analysis = await context.integrations.Core.InvokeLLM({
    prompt: `Analyze performance metrics and recommend optimizations:

Target: ${optimization_target}
Current Metrics: ${JSON.stringify(current_metrics)}
Available Techniques: ${strategy.techniques.join(', ')}

Provide:
1. Performance bottlenecks identified
2. Recommended optimizations (priority ordered)
3. Expected performance improvements
4. Implementation complexity
5. Resource requirements`,
    response_json_schema: {
      type: "object",
      properties: {
        bottlenecks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              component: { type: "string" },
              severity: { type: "string" },
              impact: { type: "string" }
            }
          }
        },
        optimizations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              technique: { type: "string" },
              priority: { type: "number" },
              expected_improvement: { type: "string" },
              complexity: { type: "string" },
              estimated_time_hours: { type: "number" }
            }
          }
        },
        overall_health_score: { type: "number" }
      }
    }
  });
  
  const optimizationPlan = {
    target: optimization_target,
    current_health: analysis?.overall_health_score || 0,
    bottlenecks: analysis?.bottlenecks || [],
    recommended_actions: analysis?.optimizations || [],
    strategy,
    auto_apply: (analysis?.optimizations || []).filter(o => o?.complexity === 'low').map(o => o?.technique)
  };
  
  for (const opt of (analysis?.optimizations || []).filter(o => o?.priority >= 8)) {
    if (opt?.expected_improvement && opt?.technique) {
      await context.entities.SystemMetric.create({
        metric_name: `optimization_${optimization_target}`,
        metric_value: opt.expected_improvement,
        category: 'performance',
        metadata: {
          technique: opt.technique,
          priority: opt.priority
        }
      });
    }
  }
  
  return optimizationPlan;
}