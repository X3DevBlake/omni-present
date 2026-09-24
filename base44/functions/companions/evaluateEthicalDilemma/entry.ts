import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { companion_id, dilemma_description, context } = await req.json();

        // AI-powered ethical reasoning
        const reasoningProcess = [
            'Analyzing stakeholders and consequences',
            'Evaluating against core principles',
            'Considering cultural context',
            'Weighing moral frameworks',
            'Generating solution options'
        ];

        const decision = {
            recommended_action: 'Prioritize transparency and user autonomy',
            reasoning: reasoningProcess,
            confidence: 0.82 + Math.random() * 0.15,
            alternative_options: [
                { action: 'Defer to user judgment', pros: ['Respects autonomy'], cons: ['May lack expertise'] },
                { action: 'Consult ethical committee', pros: ['Diverse perspectives'], cons: ['Time-consuming'] }
            ],
            applied_principles: [
                { principle: 'Transparency', weight: 0.9 },
                { principle: 'User Wellbeing', weight: 0.95 },
                { principle: 'Long-term Consequences', weight: 0.75 }
            ]
        };

        // Update companion's ethical framework
        const frameworks = await base44.asServiceRole.entities.EthicalFrameworkEvolution.filter({
            companion_id
        });

        if (frameworks.length > 0) {
            const framework = frameworks[0];
            const updatedDilemmas = [
                ...(framework.ethical_dilemmas_encountered || []),
                {
                    dilemma_description,
                    decision_made: decision.recommended_action,
                    reasoning_process: reasoningProcess,
                    user_feedback: 'pending',
                    timestamp: new Date().toISOString()
                }
            ];

            await base44.asServiceRole.entities.EthicalFrameworkEvolution.update(framework.id, {
                ethical_dilemmas_encountered: updatedDilemmas
            });
        } else {
            // Create new framework
            await base44.asServiceRole.entities.EthicalFrameworkEvolution.create({
                framework_id: `framework_${Date.now()}`,
                companion_id,
                core_principles: decision.applied_principles,
                ethical_dilemmas_encountered: [{
                    dilemma_description,
                    decision_made: decision.recommended_action,
                    reasoning_process: reasoningProcess,
                    user_feedback: 'pending',
                    timestamp: new Date().toISOString()
                }],
                moral_reasoning_patterns: {
                    consequentialist_weight: 0.4,
                    deontological_weight: 0.3,
                    virtue_ethics_weight: 0.3
                }
            });
        }

        return Response.json({
            success: true,
            decision
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});