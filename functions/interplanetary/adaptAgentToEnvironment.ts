import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, planet } = await req.json();

    // Fetch planetary environmental profile
    const profiles = await base44.entities.PlanetaryEnvironmentalProfile.filter({
      celestial_body_name: planet
    });

    if (!profiles || profiles.length === 0) {
      return Response.json({ error: 'Planet profile not found' }, { status: 404 });
    }

    const profile = profiles[0];

    // AI generates adaptive behavioral parameters
    const adaptationPrompt = `Agent deployment to ${planet}:

Environmental Conditions:
- Gravity: ${profile.physics_constants?.surface_gravity_ms2} m/s²
- Radiation: ${profile.physics_constants?.radiation_exposure_msv_year} mSv/year
- Temperature Range: ${profile.physics_constants?.surface_temperature_range_k?.min}K - ${profile.physics_constants?.surface_temperature_range_k?.max}K
- Atmosphere: ${JSON.stringify(profile.atmospheric_composition || {})}

Generate adaptive parameters for agent survival and optimal performance:
1. Locomotion adjustments for gravity
2. Radiation shielding protocols
3. Thermal management strategies
4. Communication window optimization
5. Resource consumption rates`;

    const adaptations = await base44.integrations.Core.InvokeLLM({
      prompt: adaptationPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          locomotion_gain_multiplier: { type: 'number' },
          radiation_shielding_level: { type: 'number' },
          thermal_management_mode: { type: 'string' },
          comm_window_optimization: { type: 'boolean' },
          power_consumption_adjustment: { type: 'number' },
          adaptive_behaviors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                behavior_name: { type: 'string' },
                trigger_reason: { type: 'string' },
                parameter_adjustments: { type: 'object' }
              }
            }
          }
        }
      }
    });

    // Log system metric for monitoring
    await base44.entities.SystemMetric.create({
      metric_id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      component_type: 'agent',
      component_id: agent_id,
      metric_name: 'environmental_adaptation_score',
      metric_value: adaptations.radiation_shielding_level || 0.8,
      metric_unit: 'score',
      threshold_min: 0.6,
      threshold_max: 1.0,
      anomaly_detected: false,
      contextual_metadata: {
        planet,
        adaptation_timestamp: new Date().toISOString()
      }
    });

    return Response.json({
      success: true,
      agent_id,
      planet,
      adaptations
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: 'Failed to adapt agent to environment'
    }, { status: 500 });
  }
});