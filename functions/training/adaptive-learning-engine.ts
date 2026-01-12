/**
 * Adaptive Learning Path Adjustment
 */

import { base44 } from '@base44/sdk';

export default async function adaptiveLearningEngine(context) {
  const { curriculum_id, performance_data } = context.params;

  try {
    const curriculum = await base44.asServiceRole.entities.TrainingCurriculum.get(curriculum_id);

    const adjustment = await base44.integrations.Core.InvokeLLM({
      prompt: `Adjust learning difficulty based on performance:
Current: ${curriculum.current_difficulty}
Performance: ${JSON.stringify(performance_data)}

Recommend difficulty adjustment and next modules.`,
      response_json_schema: {
        type: 'object',
        properties: {
          new_difficulty: { type: 'string' },
          next_modules: { type: 'array' }
        }
      }
    });

    await base44.asServiceRole.entities.TrainingCurriculum.update(curriculum_id, {
      current_difficulty: adjustment.new_difficulty,
      adaptive_path: {
        ...curriculum.adaptive_path,
        last_adjustment: new Date().toISOString(),
        reason: adjustment
      }
    });

    return { success: true, adjustment };
  } catch (error) {
    return { success: false, error: error.message };
  }
}