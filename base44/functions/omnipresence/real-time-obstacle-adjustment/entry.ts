import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, check_all_agents = false } = await req.json();

    const agentsToCheck = check_all_agents
      ? await base44.asServiceRole.entities.AgentPhysicalPresence.filter({ projection_status: 'active' })
      : await base44.asServiceRole.entities.AgentPhysicalPresence.filter({ agent_id });

    const adjustmentResults = [];

    for (const agent of agentsToCheck) {
      if (!agent.movement_path || agent.movement_path.length === 0) continue;

      const currentPos = agent.current_location || { x: 0, y: 0, z: 0 };
      const plannedPath = agent.movement_path;

      // Get latest obstacle predictions
      const obstacles = await base44.asServiceRole.entities.PredictiveObstacle.list('-last_updated', 30);

      // Check for collisions along planned path
      const collisionsDetected = [];

      for (const waypoint of plannedPath.slice(0, 5)) {
        const wpPos = waypoint.waypoint || { x: 0, y: 0, z: 0 };
        
        for (const obstacle of obstacles) {
          // Check current position
          const currentDistance = Math.sqrt(
            Math.pow((wpPos.x || 0) - (obstacle.current_position?.x || 0), 2) +
            Math.pow((wpPos.z || 0) - (obstacle.current_position?.z || 0), 2)
          );

          if (currentDistance < (obstacle.avoidance_buffer_meters || 0.5) * 1.5) {
            collisionsDetected.push({
              waypoint: wpPos,
              obstacle_id: obstacle.obstacle_id,
              obstacle_type: obstacle.obstacle_type,
              distance: currentDistance,
              eta_seconds: waypoint.eta_seconds || 0,
              velocity: obstacle.velocity
            });
          }

          // Check predicted positions
          if (obstacle.predicted_trajectory) {
            for (const prediction of obstacle.predicted_trajectory.slice(0, 3)) {
              const predDistance = Math.sqrt(
                Math.pow((wpPos.x || 0) - (prediction.position?.x || 0), 2) +
                Math.pow((wpPos.z || 0) - (prediction.position?.z || 0), 2)
              );

              if (predDistance < (obstacle.avoidance_buffer_meters || 0.5) * 1.2) {
                collisionsDetected.push({
                  waypoint: wpPos,
                  obstacle_id: obstacle.obstacle_id,
                  obstacle_type: obstacle.obstacle_type,
                  distance: predDistance,
                  eta_seconds: waypoint.eta_seconds || 0,
                  predicted_collision: true,
                  prediction_time_offset_ms: prediction.timestamp_offset_ms
                });
              }
            }
          }
        }
      }

      // If collisions detected, recalculate path
      if (collisionsDetected.length > 0) {
        const adjustmentResponse = await fetch(`${Deno.env.get('BASE44_API_URL') || 'https://api.base44.com'}/functions/dynamic-pathfinding-engine`, {
          method: 'POST',
          headers: {
            'Authorization': req.headers.get('Authorization'),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            agent_id: agent.agent_id,
            destination: plannedPath[plannedPath.length - 1]?.waypoint,
            priority: 'safe',
            avoid_obstacles: true,
            real_time_adjustment: true
          })
        });

        const adjustmentData = await adjustmentResponse.json();

        adjustmentResults.push({
          agent_id: agent.agent_id,
          collisions_detected: collisionsDetected.length,
          path_recalculated: adjustmentData.success || false,
          new_path_waypoints: adjustmentData.primary_path?.length || 0,
          obstacles_avoided: collisionsDetected.map(c => c.obstacle_id),
          adjustment_type: 'dynamic_reroute'
        });
      } else {
        adjustmentResults.push({
          agent_id: agent.agent_id,
          collisions_detected: 0,
          path_status: 'clear',
          no_adjustment_needed: true
        });
      }
    }

    const totalCollisionsAvoided = adjustmentResults.reduce((sum, r) => sum + (r.collisions_detected || 0), 0);
    const pathsRecalculated = adjustmentResults.filter(r => r.path_recalculated).length;

    return Response.json({
      success: true,
      agents_checked: agentsToCheck.length,
      adjustment_results: adjustmentResults,
      summary: {
        collisions_avoided: totalCollisionsAvoided,
        paths_recalculated: pathsRecalculated,
        agents_safe: agentsToCheck.length - pathsRecalculated
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});