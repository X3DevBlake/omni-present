import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, agent_id, device_ids, spatial_position } = await req.json();

    if (action === 'start_projection') {
      // Get available devices
      const allDevices = await base44.entities.OmniDevice.filter({ user_id: user.id });
      const selectedDevices = device_ids 
        ? allDevices.filter(d => device_ids.includes(d.device_id))
        : allDevices.slice(0, 4);

      // Create projection session
      const session = await base44.entities.HolographicProjectionSession.create({
        agent_id: agent_id,
        device_network: selectedDevices.map(d => ({
          device_id: d.device_id,
          device_type: d.device_type,
          projection_quality: 0.85 + Math.random() * 0.15,
          active: true
        })),
        projection_settings: {
          brightness: 0.8,
          transparency: 0.3,
          resolution: '4K',
          color_calibration: { r: 1, g: 1, b: 1 },
          hologram_stability: 0.95
        },
        agent_appearance: {
          model_url: '/models/agent_hologram.glb',
          animation_state: 'idle',
          expression: 'neutral',
          scale: 1,
          rotation: { x: 0, y: 0, z: 0 }
        },
        spatial_position: spatial_position || {
          x: 0,
          y: 1.5,
          z: 0,
          room_id: 'living_room'
        },
        multi_device_coordination: {
          primary_device: selectedDevices[0]?.device_id,
          handoff_enabled: true,
          seamless_transition: true
        },
        performance_metrics: {
          latency_ms: 15,
          frame_rate: 60,
          quality_score: 0.92,
          stability_score: 0.95
        },
        session_duration_seconds: 0,
        session_status: 'initializing'
      });

      // Activate session
      setTimeout(async () => {
        await base44.asServiceRole.entities.HolographicProjectionSession.update(session.id, {
          session_status: 'active'
        });
      }, 1000);

      return Response.json({
        success: true,
        session: session,
        message: `Projection started on ${selectedDevices.length} devices`
      });
    }

    if (action === 'update_projection') {
      const { session_id, updates } = await req.json();
      
      const sessions = await base44.entities.HolographicProjectionSession.filter({ session_id });
      const session = sessions[0];

      if (!session) {
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }

      // Update projection settings
      await base44.entities.HolographicProjectionSession.update(session.id, {
        projection_settings: {
          ...session.projection_settings,
          ...updates.projection_settings
        },
        agent_appearance: {
          ...session.agent_appearance,
          ...updates.agent_appearance
        },
        spatial_position: updates.spatial_position || session.spatial_position
      });

      return Response.json({
        success: true,
        message: 'Projection updated'
      });
    }

    if (action === 'device_handoff') {
      const { session_id, target_device_id } = await req.json();
      
      const sessions = await base44.entities.HolographicProjectionSession.filter({ session_id });
      const session = sessions[0];

      if (!session) {
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }

      // Perform seamless device handoff
      await base44.entities.HolographicProjectionSession.update(session.id, {
        session_status: 'transitioning',
        multi_device_coordination: {
          ...session.multi_device_coordination,
          primary_device: target_device_id
        }
      });

      setTimeout(async () => {
        await base44.asServiceRole.entities.HolographicProjectionSession.update(session.id, {
          session_status: 'active'
        });
      }, 500);

      return Response.json({
        success: true,
        message: `Agent projection transferred to device ${target_device_id}`
      });
    }

    if (action === 'end_projection') {
      const { session_id } = await req.json();
      
      const sessions = await base44.entities.HolographicProjectionSession.filter({ session_id });
      const session = sessions[0];

      if (!session) {
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }

      await base44.entities.HolographicProjectionSession.update(session.id, {
        session_status: 'terminated'
      });

      return Response.json({
        success: true,
        message: 'Projection ended',
        session_duration: session.session_duration_seconds
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});