import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, task_id, feedback_type, outcome_data, corrections, source } = await req.json();

    // Analyze feedback and generate learning insights
    const learningPrompt = `Analyze this agent task feedback and generate learning insights.

Agent ID: ${agent_id}
Task ID: ${task_id}
Feedback Type: ${feedback_type}
Source: ${source}

Outcome Data:
${JSON.stringify(outcome_data || {})}

Corrections Applied:
${JSON.stringify(corrections || [])}

Based on this feedback:
1. Identify patterns the agent should learn
2. Suggest behavioral adjustments
3. Determine applicable contexts for these learnings
4. Rate the importance of each insight
5. Suggest how to avoid similar issues in the future`;

    const learningAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: learningPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          learned_patterns: {
            type: "array",
            items: {
              type: "object",
              properties: {
                pattern_type: { type: "string" },
                pattern_description: { type: "string" },
                confidence: { type: "number" },
                applicable_contexts: { type: "array", items: { type: "string" } },
                importance_score: { type: "number" }
              }
            }
          },
          behavioral_adjustments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                behavior_name: { type: "string" },
                current_behavior: { type: "string" },
                recommended_behavior: { type: "string" },
                adjustment_weight: { type: "number" },
                reasoning: { type: "string" }
              }
            }
          },
          prevention_strategies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                strategy_name: { type: "string" },
                trigger_conditions: { type: "array", items: { type: "string" } },
                recommended_actions: { type: "array", items: { type: "string" } }
              }
            }
          },
          knowledge_to_share: {
            type: "array",
            items: {
              type: "object",
              properties: {
                knowledge_type: { type: "string" },
                content: { type: "string" },
                relevance_to_other_agents: { type: "number" }
              }
            }
          },
          overall_learning_score: { type: "number" }
        }
      }
    });

    // Store the feedback with learning insights
    const feedbackRecord = await base44.asServiceRole.entities.AgentLearningFeedback.create({
      agent_id,
      task_id,
      feedback_type,
      source: source || 'system',
      outcome_data: outcome_data || {},
      corrections: corrections || [],
      learned_patterns: learningAnalysis.learned_patterns || [],
      behavioral_adjustments: (learningAnalysis.behavioral_adjustments || []).map(ba => ({
        behavior_name: ba.behavior_name,
        old_value: ba.current_behavior,
        new_value: ba.recommended_behavior,
        adjustment_weight: ba.adjustment_weight
      })),
      integration_status: 'processing'
    });

    // Share high-relevance knowledge with other agents
    const knowledgeToShare = (learningAnalysis.knowledge_to_share || [])
      .filter(k => k.relevance_to_other_agents > 0.7);

    if (knowledgeToShare.length > 0) {
      // Get other agents
      const allAgents = await base44.asServiceRole.entities.AgentPhysicalPresence.filter({});
      const otherAgentIds = allAgents
        .filter(a => a.agent_id !== agent_id)
        .map(a => a.agent_id)
        .slice(0, 5);

      if (otherAgentIds.length > 0) {
        await base44.asServiceRole.entities.KnowledgeTransfer.create({
          source_agent_id: agent_id,
          target_agents: otherAgentIds,
          knowledge_type: 'insight',
          knowledge_payload: {
            content: JSON.stringify(knowledgeToShare),
            confidence: learningAnalysis.overall_learning_score || 0.8
          },
          transfer_method: 'broadcast',
          transfer_status: 'pending'
        });
      }
    }

    // Update feedback status
    await base44.asServiceRole.entities.AgentLearningFeedback.update(feedbackRecord.id, {
      integration_status: 'integrated'
    });

    return Response.json({
      success: true,
      feedback_id: feedbackRecord.id,
      learning_analysis: learningAnalysis,
      patterns_learned: learningAnalysis.learned_patterns?.length || 0,
      adjustments_recommended: learningAnalysis.behavioral_adjustments?.length || 0,
      knowledge_shared_with: knowledgeToShare.length > 0 ? 'other_agents' : 'none'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});