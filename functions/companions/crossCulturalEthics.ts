import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companionId, cultureContext, scenario } = await req.json();

    // Get cultural adaptation research
    const culturalResearch = await base44.integrations.Core.InvokeLLM({
        prompt: `Research ethical norms, communication styles, and taboos for this cultural context: "${cultureContext}". 
        Provide specific adaptations an AI companion should make when interacting in this cultural context.`,
        add_context_from_internet: true,
        response_json_schema: {
            type: "object",
            properties: {
                communication_adaptations: { type: "array", items: { type: "string" } },
                ethical_principle_variations: { type: "array", items: { type: "string" } },
                formality_level: { type: "string" },
                taboos_to_avoid: { type: "array", items: { type: "string" } },
                respectful_gestures: { type: "array", items: { type: "string" } }
            }
        }
    });

    // Apply adaptations
    const adaptations = [];
    
    for (const adaptation of culturalResearch.communication_adaptations || []) {
        const log = {
            adaptation_id: `adapt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            companion_id: companionId,
            culture_context: cultureContext,
            adaptation_type: 'communication_style',
            original_behavior: 'default_communication',
            adapted_behavior: adaptation,
            cultural_research_sources: ['web_research'],
            confidence_score: 0.8,
            applied_at: new Date().toISOString()
        };
        
        const created = await base44.entities.CulturalAdaptationLog.create(log);
        adaptations.push(created);
    }

    // Test adaptation in scenario if provided
    let scenarioTest = null;
    if (scenario) {
        scenarioTest = await base44.integrations.Core.InvokeLLM({
            prompt: `Using these cultural adaptations: ${JSON.stringify(culturalResearch)}, 
            respond to this scenario in a culturally appropriate way: "${scenario}"`,
            response_json_schema: {
                type: "object",
                properties: {
                    response: { type: "string" },
                    cultural_considerations_applied: { type: "array", items: { type: "string" } }
                }
            }
        });
    }

    return Response.json({
        success: true,
        culturalContext: cultureContext,
        adaptationsApplied: adaptations.length,
        adaptations: adaptations,
        culturalResearch: culturalResearch,
        scenarioTest: scenarioTest
    });
});