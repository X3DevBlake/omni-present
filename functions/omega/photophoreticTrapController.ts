import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      particle_type = 'cellulose',
      particle_radius_um = 10,
      ambient_pressure_Pa = 101325,
      target_positions,
      laser_intensity_W_mm2 = 50
    } = await req.json();

    // Physical constants
    const gas_thermal_conductivity = 0.026; // W/mK for air
    const asymmetry_factor_J1 = 0.15;
    const gravity_force_pN = 4 * Math.PI * Math.pow(particle_radius_um * 1e-6, 3) * 1000 * 9.81 * 1e12;
    
    // Calculate photophoretic force (in picoNewtons)
    const photophoretic_force_pN = (
      (Math.PI * Math.pow(particle_radius_um * 1e-6, 2) * ambient_pressure_Pa) / 2
    ) * asymmetry_factor_J1 * (laser_intensity_W_mm2 * 1e6 / gas_thermal_conductivity) * 0.001;
    
    // Radiation pressure (simplified)
    const radiation_pressure_pN = laser_intensity_W_mm2 * Math.PI * Math.pow(particle_radius_um * 1e-6, 2) * 0.1;
    
    // Force equilibrium check
    const net_force = photophoretic_force_pN - gravity_force_pN - radiation_pressure_pN;
    const is_stable = Math.abs(net_force) < gravity_force_pN * 0.1;
    
    // Calculate required scanning velocity
    const image_length_m = 0.2; // 20cm display
    const refresh_rate_hz = 10;
    const required_velocity_m_s = image_length_m * refresh_rate_hz;
    
    // Drag force at scanning velocity
    const drag_coefficient = 0.47; // sphere
    const air_density = 1.225; // kg/m³
    const drag_force_pN = 0.5 * drag_coefficient * air_density * 
      Math.pow(required_velocity_m_s, 2) * 
      Math.PI * Math.pow(particle_radius_um * 1e-6, 2) * 1e12;
    
    // Thermodynamic limit check
    const vaporization_temp_K = particle_type === 'diamond_dust' ? 4000 : 600;
    const current_temp_estimate_K = 300 + (laser_intensity_W_mm2 * 5);
    const vaporization_risk = current_temp_estimate_K / vaporization_temp_K;
    
    // Generate trap trajectory
    const trap_trajectory = (target_positions || []).map((pos, idx) => ({
      position: pos,
      time_s: idx * (1 / refresh_rate_hz),
      laser_intensity: laser_intensity_W_mm2,
      stable: is_stable
    }));
    
    // Thermodynamic stability score
    const thermodynamic_stability = (1 - vaporization_risk) * (is_stable ? 1 : 0.3);
    
    // Create projection manifest
    const manifest = await base44.asServiceRole.entities.HolographicProjectionManifest.create({
      projection_type: 'POT_volumetric',
      particle_physics: {
        particle_type,
        particle_radius_um,
        photophoretic_force_pN,
        laser_intensity_W_mm2,
        scanning_velocity_m_s: required_velocity_m_s,
        asymmetry_factor_J1,
        temperature_gradient_K: current_temp_estimate_K - 300,
        vaporization_risk
      },
      spatial_configuration: {
        trap_positions: target_positions || [],
        beam_type: 'vortex',
        focal_depth_m: 1.5
      },
      slm_configuration: {
        phase_pattern: 'laguerre_gaussian_LG_0_1',
        resolution: '1920x1200',
        refresh_rate_hz
      },
      flicker_fusion_threshold_hz: refresh_rate_hz,
      thermodynamic_stability_score: thermodynamic_stability,
      is_active: is_stable && vaporization_risk < 0.7
    });

    return Response.json({
      success: true,
      manifest_id: manifest.id,
      forces: {
        photophoretic_pN: photophoretic_force_pN,
        gravity_pN: gravity_force_pN,
        radiation_pressure_pN: radiation_pressure_pN,
        drag_pN: drag_force_pN,
        net_force_pN: net_force
      },
      stability: {
        is_stable,
        thermodynamic_stability_score: thermodynamic_stability,
        vaporization_risk,
        current_temp_K: current_temp_estimate_K
      },
      scanning: {
        required_velocity_m_s,
        refresh_rate_hz,
        image_length_m
      },
      trap_trajectory
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});