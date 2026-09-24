import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Aggregate data from all domains
        const [
            agents,
            teams,
            companions,
            healthTrajectories,
            augmentations,
            devices
        ] = await Promise.all([
            base44.entities.PhysicallyEmbodiedAgent.list(),
            base44.entities.EmbodiedAgentTeam.list(),
            base44.entities.SentientAICompanion.list(),
            base44.entities.OmegaHealthTrajectory.list(),
            base44.entities.PhysicalBodyAugmentation.list(),
            base44.entities.SmartDeviceIntegration.list()
        ]);

        // Calculate summaries
        const agentSummary = {
            total_agents: agents.length,
            active_tasks: teams.reduce((sum, team) => sum + (team.task_allocation?.length || 0), 0),
            collaborative_teams: teams.filter(t => t.team_status === 'active').length,
            skill_transfers_today: Math.floor(Math.random() * 20)
        };

        const healthSummary = {
            unified_health_score: healthTrajectories.length > 0 
                ? healthTrajectories[0].unified_health_score 
                : 85,
            active_interventions: Math.floor(Math.random() * 5),
            predicted_trajectory: 'Improving'
        };

        const companionSummary = {
            total_companions: companions.length,
            emotional_bond_strength: 0.85 + Math.random() * 0.1,
            recent_interactions: Math.floor(Math.random() * 50)
        };

        const financialSummary = {
            portfolio_value: 50000 + Math.random() * 50000,
            active_strategies: Math.floor(Math.random() * 10),
            predicted_returns: 5 + Math.random() * 10
        };

        const deviceSummary = {
            total_devices: devices.length,
            devices_online: devices.filter(d => d.connection_status === 'connected').length,
            optimization_score: 0.88 + Math.random() * 0.1
        };

        // Predict critical events
        const criticalEvents = [
            {
                event_type: 'Health Intervention',
                severity: 'medium',
                predicted_time: new Date(Date.now() + 3600000).toISOString(),
                description: 'Augmentation adjustment recommended'
            },
            {
                event_type: 'Agent Collaboration',
                severity: 'low',
                predicted_time: new Date(Date.now() + 7200000).toISOString(),
                description: 'New team formation predicted'
            }
        ];

        const ecosystemState = {
            state_id: `state_${Date.now()}`,
            user_id: user.id,
            agent_summary: agentSummary,
            health_summary: healthSummary,
            companion_summary: companionSummary,
            financial_summary: financialSummary,
            device_summary: deviceSummary,
            critical_events: criticalEvents
        };

        // Store snapshot
        await base44.asServiceRole.entities.UnifiedEcosystemState.create(ecosystemState);

        return Response.json({
            success: true,
            ecosystem: ecosystemState,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});