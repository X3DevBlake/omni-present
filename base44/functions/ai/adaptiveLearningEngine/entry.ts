import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId, learningData } = await req.json();

    // Fetch agent's learning history
    const learningLogs = await base44.entities.AgentLearningLog.filter({ agent_id: agentId });

    // Calculate learning velocity
    const recentLogs = learningLogs.slice(0, 10);
    const avgAccuracyImprovement = recentLogs.reduce((sum, log) => {
        const improvement = (log.performance_metrics?.accuracy_after || 0) - 
                           (log.performance_metrics?.accuracy_before || 0);
        return sum + improvement;
    }, 0) / (recentLogs.length || 1);

    // Determine optimal learning method
    const methodPerformance = {};
    learningLogs.forEach(log => {
        const method = log.learning_method;
        if (!methodPerformance[method]) {
            methodPerformance[method] = { total: 0, count: 0 };
        }
        const improvement = (log.performance_metrics?.accuracy_after || 0) - 
                           (log.performance_metrics?.accuracy_before || 0);
        methodPerformance[method].total += improvement;
        methodPerformance[method].count++;
    });

    const optimalMethod = Object.entries(methodPerformance)
        .map(([method, stats]) => ({ method, avgImprovement: stats.total / stats.count }))
        .sort((a, b) => b.avgImprovement - a.avgImprovement)[0]?.method || 'supervised';

    // Create new learning log
    const newLog = {
        log_id: `learn_${Date.now()}`,
        agent_id: agentId,
        learning_event_type: learningData?.type || 'skill_acquisition',
        content_learned: learningData?.content || {},
        learning_method: optimalMethod,
        performance_metrics: {
            accuracy_before: learningData?.accuracyBefore || 0.5,
            accuracy_after: learningData?.accuracyAfter || 0.7,
            learning_speed: avgAccuracyImprovement,
            retention_rate: 0.9
        },
        knowledge_sources: learningData?.sources || [],
        timestamp: new Date().toISOString(),
        applied_successfully: true
    };

    await base44.entities.AgentLearningLog.create(newLog);

    // Update model performance metrics
    await base44.entities.ModelPerformanceMetrics.create({
        metric_id: `metric_${Date.now()}`,
        model_name: `agent_${agentId}_cognitive_model`,
        model_version: '1.0',
        accuracy_score: learningData?.accuracyAfter || 0.7,
        latency_ms: 50,
        timestamp: new Date().toISOString()
    });

    return Response.json({
        success: true,
        learningVelocity: avgAccuracyImprovement,
        optimalMethod: optimalMethod,
        newLog: newLog,
        recommendations: {
            continue_method: optimalMethod,
            focus_areas: learningData?.focusAreas || []
        }
    });
});