import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { simulation_id, physics_config } = await req.json();

    let existingConfig = await base44.entities.SimulationPhysicsConfig.filter({ simulation_id });

    if (existingConfig.length === 0) {
      existingConfig = await base44.entities.SimulationPhysicsConfig.create({
        simulation_id,
        physics_engine: physics_config.physics_engine || 'realistic',
        gravity: physics_config.gravity || { x: 0, y: -9.8, z: 0 },
        environmental_factors: physics_config.environmental_factors || {
          wind_speed: 0,
          temperature: 20,
          humidity: 50,
          pressure: 101.3
        },
        collision_detection: physics_config.collision_detection || {
          enabled: true,
          precision: 'high'
        },
        time_scale: physics_config.time_scale || 1.0,
        material_properties: physics_config.material_properties || []
      });
    } else {
      existingConfig = await base44.entities.SimulationPhysicsConfig.update(
        existingConfig[0].id,
        physics_config
      );
    }

    return Response.json({
      success: true,
      config: existingConfig,
      message: 'Physics engine configuration updated'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});