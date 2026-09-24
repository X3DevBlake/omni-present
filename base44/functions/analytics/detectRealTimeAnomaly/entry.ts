import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stream_name, threshold_multiplier = 2 } = await req.json();
    
    // Get data stream
    const streams = await base44.entities.RealTimeDataStream.filter({ stream_name });
    const stream = streams[0];
    
    if (!stream) {
      return Response.json({ error: 'Stream not found' }, { status: 404 });
    }
    
    // Analyze historical buffer for anomalies
    const buffer = stream.historical_buffer || [];
    
    if (buffer.length < 10) {
      return Response.json({
        anomaly_detected: false,
        reason: 'Insufficient historical data'
      });
    }
    
    // Calculate statistics
    const values = buffer.map(b => b.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    const currentValue = stream.current_value?.value || 0;
    const zScore = Math.abs((currentValue - mean) / stdDev);
    
    const isAnomaly = zScore > threshold_multiplier;
    
    if (isAnomaly) {
      // AI analysis of anomaly
      const aiAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `An anomaly was detected in ${stream_name} data stream:
        
        Current value: ${currentValue}
        Expected range: ${mean - stdDev * 2} to ${mean + stdDev * 2}
        Z-score: ${zScore}
        
        Analyze the potential cause and recommend actions.`,
        response_json_schema: {
          type: "object",
          properties: {
            likely_cause: { type: "string" },
            severity: { type: "string" },
            recommended_actions: { type: "array", items: { type: "string" } },
            requires_immediate_attention: { type: "boolean" }
          }
        }
      });
      
      // Update stream
      await base44.entities.RealTimeDataStream.update(stream.id, {
        anomaly_detected: true
      });
      
      // Create alert
      await base44.entities.RealTimeAlert.create({
        alert_type: 'anomaly_detected',
        source: stream_name,
        severity: aiAnalysis.severity,
        message: `Anomaly in ${stream_name}: ${aiAnalysis.likely_cause}`,
        data: {
          current_value: currentValue,
          expected_value: mean,
          z_score: zScore
        },
        status: 'active'
      });
      
      return Response.json({
        anomaly_detected: true,
        z_score: zScore,
        current_value: currentValue,
        expected_range: [mean - stdDev * 2, mean + stdDev * 2],
        ai_analysis: aiAnalysis
      });
    }
    
    return Response.json({
      anomaly_detected: false,
      z_score: zScore,
      current_value: currentValue
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});