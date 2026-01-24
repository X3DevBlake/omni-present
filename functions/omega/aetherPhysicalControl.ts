import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { control_type, target_device, parameters } = await req.json();

    if (control_type === 'particle_manipulation') {
      // Direct control of physical particles in Aether display
      const control_command = {
        command_id: `ctrl_${Date.now()}`,
        device_id: target_device,
        action: 'adjust_trap_parameters',
        parameters: {
          laser_intensity: parameters.laser_intensity,
          focal_depth: parameters.focal_depth,
          particle_count: parameters.particle_count
        },
        expected_latency_ms: 15,
        safety_verified: parameters.laser_intensity < 140
      };

      // Simulate API call to physical Aether hardware
      const hardware_response = {
        status: 'executed',
        actual_latency_ms: 12,
        particle_positions: Array(parameters.particle_count).fill(0).map(() => ({
          x: Math.random() * 2 - 1,
          y: Math.random() * 2 - 1,
          z: parameters.focal_depth + (Math.random() - 0.5) * 0.2
        })),
        stability_score: parameters.laser_intensity < 120 ? 0.95 : 0.72
      };

      return Response.json({
        success: true,
        control_command,
        hardware_response,
        safety_status: hardware_response.stability_score > 0.8 ? 'safe' : 'warning'
      });
    }

    if (control_type === 'stabilization_loop') {
      // Activate active stabilization for dynamic object tracking
      const stabilization_config = {
        pid_gains: { kp: 0.8, ki: 0.1, kd: 0.05 },
        tracking_mode: 'predictive',
        update_frequency_hz: 1000,
        max_correction_force_pN: 50
      };

      // Simulate PID control loop
      const tracking_result = {
        target_locked: true,
        position_error_um: 2.3,
        steady_state_achieved: true,
        settling_time_ms: 45
      };

      return Response.json({
        success: true,
        stabilization_active: true,
        configuration: stabilization_config,
        tracking_result
      });
    }

    return Response.json({ error: 'Invalid control_type' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});