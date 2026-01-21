import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { companion_id, user_feedback, dilemma_id } = await req.json();

        const frameworks = await base44.asServiceRole.entities.EthicalFrameworkEvolution.filter({
            companion_id
        });

        if (frameworks.length === 0) {
            return Response.json({ error: 'No ethical framework found' }, { status: 404 });
        }

        const framework = frameworks[0];

        // Update principle weights based on feedback
        const updatedPrinciples = framework.core_principles.map(p => ({
            ...p,
            weight: user_feedback === 'positive' 
                ? Math.min(p.weight * 1.1, 1.0)
                : p.weight * 0.95
        }));

        // Adjust moral reasoning patterns
        const patterns = framework.moral_reasoning_patterns || {
            consequentialist_weight: 0.4,
            deontological_weight: 0.3,
            virtue_ethics_weight: 0.3
        };

        const evolutionInsights = {
            principles_strengthened: updatedPrinciples.filter((p, i) => p.weight > framework.core_principles[i].weight),
            principles_weakened: updatedPrinciples.filter((p, i) => p.weight < framework.core_principles[i].weight),
            reasoning_shift: 'More emphasis on consequentialist thinking based on user feedback'
        };

        await base44.asServiceRole.entities.EthicalFrameworkEvolution.update(framework.id, {
            core_principles: updatedPrinciples,
            moral_reasoning_patterns: patterns
        });

        return Response.json({
            success: true,
            evolution: evolutionInsights,
            updated_framework: {
                ...framework,
                core_principles: updatedPrinciples
            }
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});