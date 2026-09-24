import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // 1. Verify Authentication
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch Data from Multiple Domains
        // Using service role to access data across the system if needed, though user-scoped is often safer.
        // Assuming we want a system-wide view, we might need elevated permissions or just aggregate user's data.
        
        const [agents, wallets, hubs, risks] = await Promise.all([
            base44.entities.Agent.list({ limit: 100 }),
            base44.entities.UserWallet.list({ limit: 10 }),
            base44.entities.Hub.list({ limit: 50 }),
            base44.entities.EmergentRiskForecast.list({ limit: 5, sort: { created_date: -1 } })
        ]);

        // 3. Synthesis Logic
        const systemHealth = agents.filter(a => a.status === 'active').length / (agents.length || 1);
        const financialVolume = wallets.reduce((acc, w) => acc + (w.balance || 0), 0);
        const threatLevel = risks.length > 0 ? Math.max(...risks.map(r => r.risk_score)) : 0;

        let insights = [];

        // Insight: Sentience & Stability
        if (systemHealth > 0.8 && threatLevel < 20) {
            insights.push({
                primary_domain: "Sentience",
                secondary_domain: "Maintenance",
                insight_type: "Correlation",
                description: "High agent uptime correlates with low threat variance. The ecosystem is stabilizing.",
                confidence_score: 0.92,
                risk_level: "Low",
                triggered_actions: ["increase_learning_rate", "expand_network"]
            });
        }

        // Insight: Financial & Risk
        if (financialVolume > 10000 && threatLevel > 50) {
            insights.push({
                primary_domain: "Marketplace",
                secondary_domain: "Simulation",
                insight_type: "Anomaly",
                description: "High financial throughput detected during elevated threat period. Potential arbitrage or attack vector.",
                confidence_score: 0.85,
                risk_level: "High",
                triggered_actions: ["freeze_large_tx", "audit_wallets"]
            });
        }

        // 4. Store Insights
        const createdInsights = await Promise.all(insights.map(insight => 
            base44.entities.UnifiedSystemInsight.create({
                ...insight,
                correlation_id: `corr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                timestamp: new Date().toISOString()
            })
        ));

        return Response.json({ 
            success: true, 
            metrics: { systemHealth, financialVolume, threatLevel },
            new_insights: createdInsights.length 
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});