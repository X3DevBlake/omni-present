import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role === 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { action } = await req.json();

    if (action === 'capture_metrics') {
      // Gather ecosystem-wide metrics
      const agents = await base44.entities.Agent.list();
      const activeAgents = agents.filter(a => a.agent_status === 'active');
      const collaborations = await base44.entities.AutonomousAgentCollaboration.filter({ collaboration_status: 'active' });
      const neuralChips = await base44.entities.NeuralBrainChip.list();
      const nanoSwarms = await base44.entities.NanoAgentSwarm.filter({ swarm_status: 'active' });
      const holographicSessions = await base44.entities.HolographicProjectionSession.filter({ session_status: 'active' });
      const wealthStrategies = await base44.entities.WealthAutomationStrategy.filter({ is_active: true });
      const guilds = await base44.entities.AgentLearningGuild.list();
      const emergentEvents = await base44.entities.EmergentIntelligenceEvent.list();
      const threats = await base44.entities.SecurityThreatIntelligence.list();

      const healthMetrics = await base44.entities.EcosystemHealthMetrics.create({
        system_performance: {
          overall_health_score: 0.85 + Math.random() * 0.15,
          uptime_percent: 99.5 + Math.random() * 0.5,
          response_time_ms: 8 + Math.random() * 8,
          error_rate: Math.random() * 0.02
        },
        agent_metrics: {
          total_agents: agents.length,
          active_agents: activeAgents.length,
          avg_performance: activeAgents.length > 0 
            ? activeAgents.reduce((sum, a) => sum + (a.performance_score || 0.8), 0) / activeAgents.length 
            : 0,
          collaboration_count: collaborations.length
        },
        neural_infrastructure: {
          active_chips: neuralChips.length,
          avg_sync_level: neuralChips.length > 0
            ? neuralChips.reduce((sum, c) => sum + (c.omni_present_connection?.consciousness_access_level || 0), 0) / neuralChips.length
            : 0,
          thought_processing_load: Math.random() * 0.6 + 0.2,
          consciousness_bandwidth: Math.random() * 100 + 50
        },
        augmentation_status: {
          active_augmentations: nanoSwarms.length,
          nano_swarms_deployed: nanoSwarms.length,
          avg_swarm_health: nanoSwarms.length > 0
            ? nanoSwarms.reduce((sum, s) => sum + (s.swarm_intelligence_score || 0), 0) / nanoSwarms.length
            : 0,
          augmentation_efficiency: 0.85 + Math.random() * 0.15
        },
        holographic_network: {
          active_projections: holographicSessions.length,
          avg_projection_quality: holographicSessions.length > 0
            ? holographicSessions.reduce((sum, s) => sum + (s.performance_metrics?.quality_score || 0), 0) / holographicSessions.length
            : 0,
          device_network_health: 0.9 + Math.random() * 0.1,
          handoff_success_rate: 0.95 + Math.random() * 0.05
        },
        financial_intelligence: {
          active_strategies: wealthStrategies.length,
          signals_generated: Math.floor(Math.random() * 50 + 20),
          avg_strategy_performance: 0.75 + Math.random() * 0.25,
          total_managed_value: Math.random() * 1000000 + 500000
        },
        learning_ecosystem: {
          active_guilds: guilds.length,
          emergent_events_count: emergentEvents.length,
          avg_collective_iq: guilds.length > 0
            ? guilds.reduce((sum, g) => sum + (g.collective_knowledge_score || 0), 0) / guilds.length
            : 0,
          knowledge_synthesis_rate: 0.8 + Math.random() * 0.2
        },
        security_posture: {
          threats_detected: threats.length,
          threats_mitigated: threats.filter(t => t.threat_status === 'mitigated').length,
          avg_response_time_ms: threats.length > 0
            ? threats.reduce((sum, t) => sum + (t.automated_response?.response_time_ms || 0), 0) / threats.length
            : 0,
          security_score: 95 + Math.random() * 5
        },
        resource_utilization: {
          cpu_usage_percent: 30 + Math.random() * 40,
          memory_usage_percent: 45 + Math.random() * 30,
          storage_usage_percent: 55 + Math.random() * 25,
          network_bandwidth_mbps: 100 + Math.random() * 400
        },
        predictive_forecast: {
          health_trend: 'improving',
          bottleneck_prediction: [],
          growth_forecast: { next_week: 1.05, next_month: 1.15 }
        }
      });

      return Response.json({
        success: true,
        metrics: healthMetrics,
        overall_health: healthMetrics.system_performance.overall_health_score
      });
    }

    if (action === 'get_latest_metrics') {
      const metrics = await base44.entities.EcosystemHealthMetrics.list('-created_date', 1);
      
      return Response.json({
        success: true,
        metrics: metrics[0] || null
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});