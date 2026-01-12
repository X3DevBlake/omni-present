/**
 * AI-Driven Haptic Pattern Suggestion
 */

import { base44 } from '@base44/sdk';

export default async function aiHapticSuggester(context) {
  const { agent_id, gesture_type, task_context } = context.params;

  try {
    const suggestion = await base44.integrations.Core.InvokeLLM({
      prompt: `Suggest optimal haptic feedback pattern for:
Gesture: ${gesture_type}
Task: ${task_context}

Generate pattern with varying intensity and duration for immersive experience.`,
      response_json_schema: {
        type: 'object',
        properties: {
          pattern_name: { type: 'string' },
          pattern: { type: 'array' },
          reasoning: { type: 'string' }
        }
      }
    });

    const pattern = await base44.asServiceRole.entities.CustomHapticPattern.create({
      agent_id,
      pattern_name: suggestion.pattern_name,
      pattern_data: suggestion.pattern,
      use_case: task_context,
      ai_suggested: true
    });

    return { success: true, pattern_id: pattern.id, suggestion };
  } catch (error) {
    return { success: false, error: error.message };
  }
}