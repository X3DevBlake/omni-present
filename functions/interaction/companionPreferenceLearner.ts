import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companionId, interactionData } = await req.json();

    // Get existing learned preferences
    const existingPrefs = await base44.entities.LearnedPreferences.filter({ 
        user_id: user.id, 
        companion_id: companionId 
    });

    // Analyze interaction to extract preferences
    const preferenceAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this user interaction with an AI companion and extract any user preferences revealed: ${JSON.stringify(interactionData)}. Consider communication style, activity preferences, timing preferences, etc.`,
        response_json_schema: {
            type: "object",
            properties: {
                detected_preferences: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            category: { type: "string" },
                            key: { type: "string" },
                            value: { type: "string" },
                            confidence: { type: "number" }
                        }
                    }
                }
            }
        }
    });

    // Update or create preferences
    const updatedPreferences = [];
    for (const pref of preferenceAnalysis.detected_preferences || []) {
        const existing = existingPrefs.find(p => p.preference_key === pref.key);
        
        if (existing) {
            // Reinforce existing preference
            const updated = await base44.entities.LearnedPreferences.update(existing.id, {
                confidence_level: Math.min(existing.confidence_level + 0.1, 1),
                reinforcement_count: (existing.reinforcement_count || 0) + 1,
                last_reinforced: new Date().toISOString()
            });
            updatedPreferences.push(updated);
        } else {
            // Create new preference
            const newPref = {
                preference_id: `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                user_id: user.id,
                companion_id: companionId,
                preference_category: pref.category || 'communication_style',
                preference_key: pref.key,
                preference_value: pref.value,
                confidence_level: pref.confidence || 0.5,
                learned_from_interactions: [interactionData.interaction_id],
                reinforcement_count: 1,
                last_reinforced: new Date().toISOString(),
                contextual_triggers: []
            };
            const created = await base44.entities.LearnedPreferences.create(newPref);
            updatedPreferences.push(created);
        }
    }

    return Response.json({
        success: true,
        preferencesLearned: updatedPreferences.length,
        preferences: updatedPreferences,
        totalPreferences: existingPrefs.length + (preferenceAnalysis.detected_preferences?.length || 0)
    });
});