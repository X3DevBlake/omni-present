import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id } = await req.json();

    // Get agent performance metrics
    const metrics = await base44.asServiceRole.entities.AgentPerformanceMetrics.filter({
      agent_id
    });

    // Get communication patterns
    const messages = await base44.asServiceRole.entities.AgentMessage.filter({
      sender_agent_id: agent_id
    });

    const metricsData = metrics[0] || {};
    
    // AI-powered burnout prediction
    const burnoutAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this agent's performance data to predict burnout risk and suggest interventions.
      
      Performance Metrics:
      - Task Completion Rate: ${metricsData.task_completion_rate || 0}%
      - Efficiency Score: ${metricsData.efficiency_score || 0}%
      - Error Rate: ${metricsData.error_rate || 0}%
      - Resource Utilization: ${JSON.stringify(metricsData.resource_utilization || {})}
      
      Communication Data:
      - Total Messages: ${messages.length}
      - Recent Message Frequency: ${messages.slice(0, 10).length} in last period
      
      Analyze for signs of:
      - Workload overload
      - Performance degradation
      - Communication fatigue
      - Resource exhaustion
      
      Return:
      1. Burnout risk score (0-100)
      2. Risk factors identified
      3. Recommended interventions
      4. Priority level (low/medium/high/critical)
      
      Return as JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          burnout_risk_score: { type: "number" },
          risk_factors: {
            type: "array",
            items: { type: "string" }
          },
          interventions: {
            type: "array",
            items: { type: "string" }
          },
          priority: { type: "string" },
          detailed_analysis: { type: "string" }
        }
      }
    });

    // Create analytics record
    const analytics = await base44.asServiceRole.entities.AgentPerformanceAnalytics.create({
      agent_id,
      time_period: new Date().toISOString().split('T')[0],
      task_completion_rate: metricsData.task_completion_rate || 0,
      communication_efficiency: 100 - (metricsData.error_rate || 0),
      collaboration_effectiveness: metricsData.collaboration_effectiveness || 70,
      burnout_risk_score: burnoutAnalysis.burnout_risk_score,
      suggested_interventions: burnoutAnalysis.interventions,
      response_time_avg: 120,
      quality_score: metricsData.efficiency_score || 75
    });

    return Response.json({ 
      success: true,
      analytics,
      burnout_analysis: burnoutAnalysis
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});