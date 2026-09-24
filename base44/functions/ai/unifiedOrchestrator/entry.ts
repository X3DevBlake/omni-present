import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch data from various hubs
        const sentienceMetrics = await base44.entities.SentienceMetric.list({ limit: 10, sort: { timestamp: -1 } });
        const ethicalAudits = await base44.entities.EthicalAuditReport.list({ limit: 10, sort: { timestamp: -1 } });
        const maintenancePredictions = await base44.entities.MaintenancePrediction.list({ limit: 10, sort: { timestamp: -1 } });
        const systemMetrics = await base44.entities.SystemMetric.list({ limit: 50, sort: { timestamp: -1 } });

        // AI Logic to correlate and orchestrate
        const insights = [];
        const actions = [];

        // Example Correlation: Sentience Spike + Low Ethics Score
        const latestSentience = sentienceMetrics[0];
        const latestEthics = ethicalAudits[0];

        if (latestSentience && latestSentience.sentience_score > 90) {
            if (latestEthics && latestEthics.compliance_score < 70) {
                insights.push({
                    type: "CRITICAL_CORRELATION",
                    description: "High sentience spike detected coincident with lowered ethical compliance. Potential emergent rogue behavior.",
                    confidence: 0.95,
                    source: "UnifiedAIOrchestrator",
                    timestamp: new Date().toISOString()
                });
                actions.push({
                    type: "TRIGGER_FAILSAFE",
                    target: latestSentience.agent_id,
                    action: "suspend_autonomy",
                    reason: "Ethical breach risk during high sentience event"
                });
            }
        }

        // Example Correlation: High Load + Maintenance Prediction
        const highLoad = systemMetrics.some(m => m.metric_name === 'cpu_usage' && m.value > 85);
        const failureRisk = maintenancePredictions.find(p => p.predicted_failure_probability > 0.7);

        if (highLoad && failureRisk) {
             insights.push({
                type: "INFRASTRUCTURE_RISK",
                description: `System under high load while component ${failureRisk.component_id} is at risk of failure.`,
                confidence: 0.88,
                source: "UnifiedAIOrchestrator",
                timestamp: new Date().toISOString()
            });
            actions.push({
                type: "LOAD_BALANCING",
                target: "System",
                action: "reroute_traffic",
                reason: "Preventative maintenance"
            });
        }

        // Generate holistic health score
        const healthScore = Math.min(
            100, 
            (latestEthics?.compliance_score || 100) * 0.4 + 
            (100 - (failureRisk?.predicted_failure_probability || 0) * 100) * 0.4 +
            (latestSentience?.sentience_score || 50) * 0.2
        );

        return Response.json({
            insights,
            actions,
            system_health: {
                score: healthScore,
                status: healthScore > 80 ? "OPTIMAL" : healthScore > 60 ? "STABLE" : "CRITICAL",
                last_updated: new Date().toISOString()
            }
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});