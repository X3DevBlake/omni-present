import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      sync_type,
      spatial_map_id,
      agent_updates,
      device_updates,
      sensor_readings,
      user_proximity
    } = await req.json();

    const syncTimestamp = new Date().toISOString();

    if (sync_type === 'full_sync') {
      // Gather all spatial data for comprehensive sync
      const [
        semanticGraphs,
        agents,
        obstacles,
        devices,
        zones,
        activeTasks
      ] = await Promise.all([
        base44.asServiceRole.entities.EnvironmentSemanticGraph.list('-created_date', 1),
        base44.asServiceRole.entities.AgentPhysicalPresence.list('-created_date', 50),
        base44.asServiceRole.entities.PredictiveObstacle.list('-last_updated', 30),
        base44.asServiceRole.entities.CrossPlatformDevice.list('-created_date', 100),
        base44.asServiceRole.entities.SpatialZone.list('-created_date', 50),
        base44.asServiceRole.entities.AgentCollaborativeTask.filter({ task_status: 'in_progress' })
      ]);

      // Calculate real-time metrics
      const activeAgents = agents.filter(a => a.projection_status === 'active');
      const movingObstacles = obstacles.filter(o => o.velocity?.speed_ms > 0.1);
      const onlineDevices = devices.filter(d => d.connection_status === 'online');

      // Generate spatial heatmap data
      const heatmapData = zones.map(zone => ({
        zone_id: zone.id,
        zone_name: zone.zone_name,
        activity_level: zone.activity_heat_score || 0,
        occupancy: zone.real_time_occupancy || 0,
        center: {
          x: (zone.boundaries?.min_x + zone.boundaries?.max_x) / 2 || 0,
          z: (zone.boundaries?.min_z + zone.boundaries?.max_z) / 2 || 0
        }
      }));

      // Calculate navigation paths
      const navigationData = {
        waypoints: semanticGraphs[0]?.navigation_mesh?.waypoints || [],
        agent_paths: activeAgents.map(agent => ({
          agent_id: agent.agent_id,
          current_position: agent.current_location,
          movement_path: agent.movement_path,
          destination: agent.movement_path?.[agent.movement_path?.length - 1]?.waypoint
        })),
        obstacle_avoidance_zones: movingObstacles.map(obs => ({
          obstacle_id: obs.obstacle_id,
          center: obs.current_position,
          radius: obs.avoidance_buffer_meters || 0.5,
          predicted_path: obs.predicted_trajectory
        }))
      };

      // Calculate device interaction zones
      const deviceInteractions = onlineDevices.map(device => ({
        device_id: device.id,
        device_name: device.device_name,
        position: device.spatial_location || { x: 0, y: 0, z: 0 },
        reachable_by_agents: device.reachable_by_agents || [],
        current_state: device.current_state,
        interaction_radius: 1.5
      }));

      return Response.json({
        success: true,
        sync_timestamp: syncTimestamp,
        sync_type: 'full',
        spatial_data: {
          semantic_graph: semanticGraphs[0],
          agents: activeAgents,
          obstacles: movingObstacles,
          devices: deviceInteractions,
          zones: heatmapData,
          navigation: navigationData,
          active_tasks: activeTasks
        },
        metrics: {
          active_agents: activeAgents.length,
          moving_obstacles: movingObstacles.length,
          online_devices: onlineDevices.length,
          active_zones: zones.filter(z => z.activity_heat_score > 30).length
        }
      });
    }

    if (sync_type === 'agent_update') {
      // Process real-time agent position and state updates
      const updates = [];
      
      for (const update of (agent_updates || [])) {
        const agents = await base44.asServiceRole.entities.AgentPhysicalPresence.filter({
          agent_id: update.agent_id
        });
        
        if (agents[0]) {
          await base44.asServiceRole.entities.AgentPhysicalPresence.update(agents[0].id, {
            current_location: update.position,
            projection_status: update.status || agents[0].projection_status,
            current_activity: update.activity,
            last_interaction_timestamp: syncTimestamp
          });
          updates.push({ agent_id: update.agent_id, updated: true });
        }
      }

      // Check for collision predictions after position updates
      const obstacles = await base44.asServiceRole.entities.PredictiveObstacle.list('-last_updated', 20);
      const collisionWarnings = [];

      for (const update of (agent_updates || [])) {
        for (const obstacle of obstacles) {
          const distance = Math.sqrt(
            Math.pow((update.position?.x || 0) - (obstacle.current_position?.x || 0), 2) +
            Math.pow((update.position?.z || 0) - (obstacle.current_position?.z || 0), 2)
          );
          
          if (distance < (obstacle.avoidance_buffer_meters || 0.5) * 2) {
            collisionWarnings.push({
              agent_id: update.agent_id,
              obstacle_id: obstacle.obstacle_id,
              distance,
              warning_level: distance < obstacle.avoidance_buffer_meters ? 'critical' : 'warning'
            });
          }
        }
      }

      return Response.json({
        success: true,
        sync_timestamp: syncTimestamp,
        updates_processed: updates.length,
        collision_warnings: collisionWarnings
      });
    }

    if (sync_type === 'sensor_update') {
      // Process sensor readings and update environmental data
      const processedReadings = [];
      
      for (const reading of (sensor_readings || [])) {
        // Update zone environmental data
        if (reading.zone_id) {
          const zones = await base44.asServiceRole.entities.SpatialZone.filter({
            id: reading.zone_id
          });
          
          if (zones[0]) {
            await base44.asServiceRole.entities.SpatialZone.update(zones[0].id, {
              environmental_settings: {
                ...zones[0].environmental_settings,
                [reading.sensor_type]: reading.value,
                last_sensor_update: syncTimestamp
              }
            });
            processedReadings.push({ zone_id: reading.zone_id, sensor_type: reading.sensor_type });
          }
        }
      }

      // Generate heatmap updates
      const heatmapUpdates = processedReadings.map(r => ({
        zone_id: r.zone_id,
        update_type: r.sensor_type,
        timestamp: syncTimestamp
      }));

      return Response.json({
        success: true,
        sync_timestamp: syncTimestamp,
        readings_processed: processedReadings.length,
        heatmap_updates: heatmapUpdates
      });
    }

    if (sync_type === 'user_proximity') {
      // Handle user proximity for logo/text interaction effects
      const nearbyDevices = await base44.asServiceRole.entities.OmniDevice.filter({
        online_status: true
      });

      // Calculate which devices are near the user
      const deviceProximity = nearbyDevices.map(device => {
        const devicePos = device.physical_location || { x: 0, y: 0, z: 0 };
        const userPos = user_proximity?.position || { x: 0, y: 0, z: 0 };
        
        const distance = Math.sqrt(
          Math.pow(devicePos.x - userPos.x, 2) +
          Math.pow(devicePos.z - userPos.z, 2)
        );

        return {
          device_id: device.id,
          device_name: device.device_name,
          distance,
          in_range: distance < (device.coverage_area?.radius_meters || 5),
          interaction_intensity: Math.max(0, 1 - (distance / 5))
        };
      });

      // Generate interaction commands for nearby devices
      const interactionCommands = deviceProximity
        .filter(d => d.in_range)
        .map(d => ({
          device_id: d.device_id,
          command: 'adjust_projection_intensity',
          parameters: {
            intensity: d.interaction_intensity,
            pulse_on_proximity: true,
            user_direction: user_proximity?.direction
          }
        }));

      return Response.json({
        success: true,
        sync_timestamp: syncTimestamp,
        user_position: user_proximity?.position,
        nearby_devices: deviceProximity.filter(d => d.in_range),
        interaction_commands: interactionCommands
      });
    }

    return Response.json({ error: 'Invalid sync_type' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});