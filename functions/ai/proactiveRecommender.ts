import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user context
    const contexts = await base44.entities.OmniContext.filter({ user_id: user.id }, '-created_date', 1);
    const currentContext = contexts[0] || {};

    // Get user preferences and recommendation history
    const [preferences, history] = await Promise.all([
        base44.entities.UserPreferences.filter({ created_by: user.email }).catch(() => []),
        base44.entities.RecommendationHistory.filter({ user_id: user.id }, '-created_date', 50)
    ]);

    // Analyze successful past recommendations
    const successfulRecs = history.filter(h => h.user_response === 'accepted');
    const dismissedRecs = history.filter(h => h.user_response === 'dismissed');

    // Generate recommendations based on context
    const recommendations = [];

    // Task-based recommendations
    if (currentContext.cognitive_load > 0.7) {
        recommendations.push({
            recommendation_id: `rec_${Date.now()}_1`,
            user_id: user.id,
            recommendation_type: 'task',
            recommendation_content: {
                title: 'Cognitive Load Alert',
                description: 'Your cognitive load is high. Consider taking a 10-minute break or delegating tasks.',
                action_url: '/AutonomousTaskPlannerVisualizer3D',
                priority_score: 0.9
            },
            context_snapshot: currentContext,
            user_response: 'not_responded',
            presented_at: new Date().toISOString()
        });
    }

    // Health-based recommendations
    if (currentContext.emotional_state?.primary_emotion === 'stressed') {
        recommendations.push({
            recommendation_id: `rec_${Date.now()}_2`,
            user_id: user.id,
            recommendation_type: 'health',
            recommendation_content: {
                title: 'Stress Detected',
                description: 'Would you like to connect with your AI companion for emotional support?',
                action_url: '/SentientCompanionInterface3D',
                priority_score: 0.85
            },
            context_snapshot: currentContext,
            user_response: 'not_responded',
            presented_at: new Date().toISOString()
        });
    }

    // Learning recommendations
    const recentLearning = await base44.entities.AgentLearningLog.filter({}, '-created_date', 5);
    if (recentLearning.length > 0) {
        recommendations.push({
            recommendation_id: `rec_${Date.now()}_3`,
            user_id: user.id,
            recommendation_type: 'learning',
            recommendation_content: {
                title: 'Skill Development Opportunity',
                description: 'Your agents are learning rapidly. Explore the Skill Marketplace to acquire complementary skills.',
                action_url: '/AgentSkillMarketplace',
                priority_score: 0.7
            },
            context_snapshot: currentContext,
            user_response: 'not_responded',
            presented_at: new Date().toISOString()
        });
    }

    // Store recommendations
    for (const rec of recommendations) {
        await base44.entities.RecommendationHistory.create(rec);
    }

    return Response.json({
        success: true,
        recommendations: recommendations,
        contextAnalysis: {
            cognitiveLoad: currentContext.cognitive_load,
            emotionalState: currentContext.emotional_state,
            activeSystemsCount: (currentContext.active_agents?.length || 0) + (currentContext.active_devices?.length || 0)
        }
    });
});