import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await req.json();
    const targetUserId = userId || user.id;

    // Gather context from multiple sources
    const [agents, devices, tasks, companions, healthData] = await Promise.all([
        base44.entities.Agent.filter({ created_by: user.email }).catch(() => []),
        base44.entities.OmegaDevice.filter({ created_by: user.email }).catch(() => []),
        base44.entities.AutonomousTaskPlan.filter({ created_by: user.email }).catch(() => []),
        base44.entities.SentientAICompanion.filter({ created_by: user.email }).catch(() => []),
        base44.entities.OmegaHealthTrajectory.filter({ user_id: targetUserId }).catch(() => [])
    ]);

    // Calculate cognitive load based on active tasks
    const activeTasks = tasks.filter(t => t.plan_status === 'executing' || t.plan_status === 'ready');
    const cognitiveLoad = Math.min(activeTasks.length / 10, 1);

    // Determine emotional state from recent companion interactions
    const recentCompanionData = companions[0];
    const emotionalState = {
        primary_emotion: 'calm',
        intensity: 0.5,
        valence: 0.7
    };

    // Predict next action based on patterns
    const predictedNextAction = activeTasks.length > 0 ? 
        `Continue working on: ${activeTasks[0].high_level_goal}` : 
        'Explore new opportunities';

    // Create context snapshot
    const contextSnapshot = {
        context_id: `ctx_${Date.now()}`,
        user_id: targetUserId,
        active_tasks: activeTasks.map(t => t.plan_id),
        current_location: {
            physical: {},
            digital_hub: 'Home'
        },
        emotional_state: emotionalState,
        cognitive_load: cognitiveLoad,
        active_devices: devices.map(d => d.device_id),
        active_agents: agents.map(a => a.agent_id || a.id),
        environmental_conditions: {},
        recent_interactions: [],
        predicted_next_action: predictedNextAction,
        context_confidence: 0.85
    };

    // Store context
    await base44.entities.OmniContext.create(contextSnapshot);

    return Response.json({
        success: true,
        context: contextSnapshot,
        insights: {
            cognitive_load_status: cognitiveLoad > 0.7 ? 'high' : cognitiveLoad > 0.4 ? 'moderate' : 'low',
            active_systems: {
                agents: agents.length,
                devices: devices.length,
                tasks: activeTasks.length,
                companions: companions.length
            },
            recommendation: cognitiveLoad > 0.7 ? 
                'Consider delegating tasks or taking a break' : 
                'System operating optimally'
        }
    });
});