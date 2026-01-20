import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (data.drift_detection?.data_drift_score > 0.2) {
      await base44.integrations.Core.SendEmail({
        to: data.created_by || 'admin@base44.ai',
        subject: `🚨 Model Drift Alert: ${data.monitor_name}`,
        body: `Data drift detected: ${(data.drift_detection.data_drift_score * 100).toFixed(1)}%
        
Model: ${data.model_deployment_id}
Health Score: ${data.health_score}%
Retraining Recommended: ${data.retraining_recommended ? 'Yes' : 'No'}

Action required: Review model performance`
      });

      await base44.asServiceRole.entities.MLOpsMonitor.update(event.entity_id, {
        retraining_recommended: true
      });
    }

    return Response.json({ success: true, drift_score: data.drift_detection?.data_drift_score });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});