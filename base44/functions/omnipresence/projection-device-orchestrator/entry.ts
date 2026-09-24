import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      action,
      device_ids,
      projection_content,
      agent_id,
      animation_preset,
      spatial_coordinates,
      sync_mode
    } = await req.json();

    // Available animation presets
    const animationPresets = {
      logo_pulse: {
        name: 'Logo Pulse',
        duration_ms: 2000,
        keyframes: [
          { scale: 1, opacity: 0.8, time: 0 },
          { scale: 1.2, opacity: 1, time: 0.5 },
          { scale: 1, opacity: 0.8, time: 1 }
        ],
        easing: 'ease-in-out',
        loop: true
      },
      agent_materialize: {
        name: 'Agent Materialize',
        duration_ms: 1500,
        keyframes: [
          { scale: 0, opacity: 0, particles: 100, time: 0 },
          { scale: 0.5, opacity: 0.5, particles: 50, time: 0.3 },
          { scale: 1, opacity: 1, particles: 0, time: 1 }
        ],
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        loop: false
      },
      agent_dematerialize: {
        name: 'Agent Dematerialize',
        duration_ms: 1200,
        keyframes: [
          { scale: 1, opacity: 1, particles: 0, time: 0 },
          { scale: 1.1, opacity: 0.5, particles: 50, time: 0.5 },
          { scale: 0, opacity: 0, particles: 100, time: 1 }
        ],
        easing: 'ease-in',
        loop: false
      },
      knowledge_transfer: {
        name: 'Knowledge Transfer',
        duration_ms: 3000,
        keyframes: [
          { beam_opacity: 0, particle_flow: 0, time: 0 },
          { beam_opacity: 0.8, particle_flow: 1, time: 0.2 },
          { beam_opacity: 0.8, particle_flow: 1, time: 0.8 },
          { beam_opacity: 0, particle_flow: 0, time: 1 }
        ],
        easing: 'linear',
        loop: false
      },
      emotional_aura: {
        name: 'Emotional Aura',
        duration_ms: 4000,
        keyframes: [
          { aura_radius: 0.4, intensity: 0.3, time: 0 },
          { aura_radius: 0.6, intensity: 0.5, time: 0.5 },
          { aura_radius: 0.4, intensity: 0.3, time: 1 }
        ],
        easing: 'sine',
        loop: true
      },
      device_handoff: {
        name: 'Device Handoff',
        duration_ms: 2000,
        keyframes: [
          { source_opacity: 1, target_opacity: 0, trail: 0, time: 0 },
          { source_opacity: 0.5, target_opacity: 0.5, trail: 1, time: 0.5 },
          { source_opacity: 0, target_opacity: 1, trail: 0, time: 1 }
        ],
        easing: 'ease-in-out',
        loop: false
      },
      spatial_ripple: {
        name: 'Spatial Ripple',
        duration_ms: 1500,
        keyframes: [
          { ripple_radius: 0, opacity: 1, time: 0 },
          { ripple_radius: 2, opacity: 0.3, time: 0.7 },
          { ripple_radius: 3, opacity: 0, time: 1 }
        ],
        easing: 'ease-out',
        loop: false
      },
      data_stream: {
        name: 'Data Stream',
        duration_ms: 5000,
        keyframes: [
          { particle_count: 0, flow_speed: 0, time: 0 },
          { particle_count: 100, flow_speed: 1, time: 0.1 },
          { particle_count: 100, flow_speed: 1, time: 0.9 },
          { particle_count: 0, flow_speed: 0, time: 1 }
        ],
        easing: 'linear',
        loop: true
      }
    };

    // Get available projection devices
    const availableDevices = await base44.asServiceRole.entities.OmniDevice.filter({
      online_status: true,
      device_type: 'holographic_projector'
    });

    if (action === 'list_animations') {
      return Response.json({
        success: true,
        animation_presets: Object.entries(animationPresets).map(([key, preset]) => ({
          id: key,
          ...preset
        }))
      });
    }

    if (action === 'project_logo') {
      const preset = animationPresets[animation_preset] || animationPresets.logo_pulse;
      
      // Create projection command for each device
      const projectionCommands = (device_ids || availableDevices.map(d => d.id)).map(deviceId => ({
        device_id: deviceId,
        content_type: 'logo',
        animation: preset,
        coordinates: spatial_coordinates || { x: 0, y: 1.5, z: 0 },
        sync_timestamp: Date.now()
      }));

      return Response.json({
        success: true,
        projection_commands: projectionCommands,
        animation_used: preset,
        devices_targeted: projectionCommands.length
      });
    }

    if (action === 'project_agent') {
      // Get agent data
      const agents = await base44.asServiceRole.entities.AgentPhysicalPresence.filter({
        agent_id
      });
      const agent = agents[0];

      if (!agent) {
        return Response.json({ error: 'Agent not found' }, { status: 404 });
      }

      // Get agent's emotional state
      const emotions = await base44.asServiceRole.entities.AgentEmotion.filter({
        agent_id
      });
      const currentEmotion = emotions[0];

      // Determine animation based on context
      let selectedAnimation = animation_preset;
      if (!selectedAnimation) {
        if (agent.projection_status === 'transitioning') {
          selectedAnimation = 'agent_materialize';
        } else if (currentEmotion?.emotion_intensity > 0.7) {
          selectedAnimation = 'emotional_aura';
        } else {
          selectedAnimation = 'logo_pulse';
        }
      }

      const preset = animationPresets[selectedAnimation] || animationPresets.agent_materialize;

      // Generate projection data with emotional coloring
      const emotionColors = {
        happy: '#10b981',
        excited: '#f59e0b',
        calm: '#3b82f6',
        focused: '#8b5cf6',
        stressed: '#ef4444',
        neutral: '#00f5ff'
      };

      const projectionData = {
        agent_id,
        agent_data: agent,
        emotion_state: currentEmotion,
        primary_color: emotionColors[currentEmotion?.primary_emotion] || '#00f5ff',
        animation: preset,
        coordinates: spatial_coordinates || agent.current_location || { x: 0, y: 0, z: 0 },
        interaction_zone_radius: agent.interaction_zone_radius || 2
      };

      // Distribute across devices based on sync_mode
      const projectionCommands = [];
      const targetDevices = device_ids ? availableDevices.filter(d => device_ids.includes(d.id)) : availableDevices;

      if (sync_mode === 'distributed') {
        // Each device projects a portion
        targetDevices.forEach((device, idx) => {
          projectionCommands.push({
            device_id: device.id,
            content_type: 'agent',
            projection_portion: idx === 0 ? 'primary' : 'support',
            data: projectionData,
            sync_timestamp: Date.now()
          });
        });
      } else {
        // All devices project the same content
        targetDevices.forEach(device => {
          projectionCommands.push({
            device_id: device.id,
            content_type: 'agent',
            projection_portion: 'full',
            data: projectionData,
            sync_timestamp: Date.now()
          });
        });
      }

      return Response.json({
        success: true,
        projection_commands: projectionCommands,
        agent_state: agent,
        emotion_applied: currentEmotion?.primary_emotion,
        animation_used: selectedAnimation
      });
    }

    if (action === 'project_spatial_map') {
      // Get semantic graph
      const graphs = await base44.asServiceRole.entities.EnvironmentSemanticGraph.list('-created_date', 1);
      const currentGraph = graphs[0];

      // Get predictive obstacles
      const obstacles = await base44.asServiceRole.entities.PredictiveObstacle.list('-last_updated', 20);

      // Get devices
      const smartDevices = await base44.asServiceRole.entities.CrossPlatformDevice.list('-created_date', 50);

      const spatialProjectionData = {
        semantic_graph: currentGraph,
        obstacles: obstacles,
        devices: smartDevices,
        animations: {
          object_highlight: animationPresets.spatial_ripple,
          obstacle_warning: animationPresets.emotional_aura,
          device_status: animationPresets.logo_pulse
        },
        render_settings: {
          show_labels: true,
          show_trajectories: true,
          show_navigation_mesh: true,
          heatmap_enabled: false
        }
      };

      const projectionCommands = availableDevices.map(device => ({
        device_id: device.id,
        content_type: 'spatial_map',
        data: spatialProjectionData,
        layer_assignment: device.physical_location?.room || 'default',
        sync_timestamp: Date.now()
      }));

      return Response.json({
        success: true,
        projection_commands: projectionCommands,
        objects_to_render: currentGraph?.nodes?.length || 0,
        obstacles_tracked: obstacles.length,
        devices_shown: smartDevices.length
      });
    }

    if (action === 'trigger_animation') {
      const preset = animationPresets[animation_preset];
      if (!preset) {
        return Response.json({ error: 'Animation preset not found' }, { status: 400 });
      }

      const targetDevices = device_ids ? availableDevices.filter(d => device_ids.includes(d.id)) : availableDevices;

      const animationCommands = targetDevices.map(device => ({
        device_id: device.id,
        animation: preset,
        target_element: projection_content || 'global',
        coordinates: spatial_coordinates,
        start_time: Date.now(),
        sync_mode: sync_mode || 'synchronized'
      }));

      return Response.json({
        success: true,
        animation_commands: animationCommands,
        animation_name: preset.name,
        duration_ms: preset.duration_ms,
        devices_count: animationCommands.length
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});