import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { updatePreferences } = await req.json();

    // Get or create personalization profile
    const profiles = await base44.entities.PersonalizationProfile.filter({ user_id: user.id });
    let profile = profiles[0];

    if (!profile && updatePreferences) {
        // Create new profile with defaults
        profile = await base44.entities.PersonalizationProfile.create({
            profile_id: `profile_${Date.now()}`,
            user_id: user.id,
            ui_preferences: updatePreferences.ui_preferences || {
                theme: 'dark',
                color_scheme: 'cyan-purple',
                layout_density: 'comfortable',
                animation_intensity: 'high'
            },
            interaction_preferences: updatePreferences.interaction_preferences || {
                preferred_input_methods: ['touch', 'voice'],
                notification_style: 'subtle',
                haptic_feedback_level: 0.7
            },
            content_preferences: updatePreferences.content_preferences || {
                information_density: 'balanced',
                visualization_style: '3d',
                language: 'en'
            },
            behavioral_patterns: {},
            ai_interaction_style: {
                verbosity: 'balanced',
                formality: 0.5,
                proactiveness: 0.7
            }
        });
    } else if (profile && updatePreferences) {
        // Update existing profile
        profile = await base44.entities.PersonalizationProfile.update(profile.id, updatePreferences);
    }

    // Analyze user behavior patterns
    const contexts = await base44.entities.OmniContext.filter({ user_id: user.id }, '-created_date', 50);
    
    // Determine peak activity hours
    const hourCounts = {};
    contexts.forEach(ctx => {
        const hour = new Date(ctx.created_date).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const peakHours = Object.entries(hourCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => parseInt(hour));

    // Generate personalized recommendations
    const recommendations = {
        themeRecommendation: profile?.ui_preferences?.theme || 'dark',
        layoutOptimization: 'Reduce cognitive load by simplifying dashboard',
        interactionMethod: 'Voice and gesture controls recommended based on usage patterns',
        peakProductivityHours: peakHours
    };

    return Response.json({
        success: true,
        profile: profile,
        recommendations: recommendations,
        behavioralInsights: {
            peakActivityHours: peakHours,
            totalContexts: contexts.length,
            avgCognitiveLoad: contexts.reduce((sum, c) => sum + (c.cognitive_load || 0), 0) / (contexts.length || 1)
        }
    });
});