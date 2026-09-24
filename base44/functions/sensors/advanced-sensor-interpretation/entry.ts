/**
 * Advanced Sensor Data Interpretation
 */

import { base44 } from '@base44/sdk';

export default async function advancedSensorInterpretation(context) {
  const { device_id, sensor_readings } = context.params;

  try {
    const interpretation = await base44.integrations.Core.InvokeLLM({
      prompt: `Interpret sensor data for nuanced environmental awareness:
${JSON.stringify(sensor_readings)}

Analyze:
1. Environmental state
2. Patterns and anomalies
3. Recommended agent actions
4. Context for decision-making`,
      response_json_schema: {
        type: 'object',
        properties: {
          environmental_state: { type: 'string' },
          patterns: { type: 'array' },
          recommendations: { type: 'array' },
          context: { type: 'object' }
        }
      }
    });

    for (const reading of sensor_readings) {
      await base44.asServiceRole.entities.SensorData.create({
        device_id,
        sensor_type: reading.type,
        raw_value: reading.value,
        interpreted_state: interpretation.environmental_state,
        environmental_context: interpretation.context
      });
    }

    return { success: true, interpretation };
  } catch (error) {
    return { success: false, error: error.message };
  }
}