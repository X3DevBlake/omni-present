import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, look_ahead_seconds = 10 } = await req.json();

    // Get agent
    const agents = await base44.asServiceRole.entities.AgentPhysicalPresence.filter({ agent_id });
    const agent = agents[0];

    if (!agent) {
      return Response.json({ error: 'Agent not found' }, { status: 404 });
    }

    const agentPos = agent.current_location || { x: 0, y: 0, z: 0 };
    const currentPath = agent.movement_path || [];

    // Get predictive obstacles
    const obstacles = await base44.asServiceRole.entities.PredictiveObstacle.list('-last_updated', 30);

    // Analyze potential collisions along the path
    const collisionAnalysis = [];
    const avoidanceManeuvers = [];

    for (let i = 0; i < currentPath.length; i++) {
      const waypoint = currentPath[i];
      const wpPos = waypoint.waypoint || { x: 0, y: 0, z: 0 };
      const wpTime = waypoint.eta_seconds || (i * 2);

      for (const obstacle of obstacles) {
        const obsPos = obstacle.current_position || { x: 0, y: 0, z: 0 };
        const obsVelocity = obstacle.velocity || { vx: 0, vz: 0 };
        
        // Predict obstacle position at waypoint time
        const predictedObsX = obsPos.x + (obsVelocity.vx || 0) * wpTime;
        const predictedObsZ = obsPos.z + (obsVelocity.vz || 0) * wpTime;

        const predictedDistance = Math.sqrt(
          Math.pow(wpPos.x - predictedObsX, 2) +
          Math.pow(wpPos.z - predictedObsZ, 2)
        );

        const buffer = obstacle.avoidance_buffer_meters || 0.5;
        const collisionRisk = predictedDistance < buffer * 2;

        if (collisionRisk) {
          const collisionProbability = Math.max(0, 1 - (predictedDistance / (buffer * 2)));
          
          collisionAnalysis.push({
            waypoint_index: i,
            waypoint_position: wpPos,
            obstacle_id: obstacle.obstacle_id,
            obstacle_type: obstacle.obstacle_type,
            current_obstacle_position: obsPos,
            predicted_obstacle_position: { x: predictedObsX, z: predictedObsZ },
            time_to_collision_seconds: wpTime,
            collision_probability: collisionProbability,
            buffer_zone: buffer
          });

          // Generate avoidance maneuver
          if (collisionProbability > 0.3) {
            // Calculate avoidance direction (perpendicular to obstacle movement)
            const obsDirection = Math.atan2(obsVelocity.vz || 0.01, obsVelocity.vx || 0.01);
            const avoidanceDirection = obsDirection + Math.PI / 2; // Perpendicular

            const avoidanceDistance = buffer * 2;
            const avoidancePoint = {
              x: wpPos.x + Math.cos(avoidanceDirection) * avoidanceDistance,
              y: 0,
              z: wpPos.z + Math.sin(avoidanceDirection) * avoidanceDistance
            };

            // Alternative: go around the other way
            const alternativeDirection = obsDirection - Math.PI / 2;
            const alternativePoint = {
              x: wpPos.x + Math.cos(alternativeDirection) * avoidanceDistance,
              y: 0,
              z: wpPos.z + Math.sin(alternativeDirection) * avoidanceDistance
            };

            avoidanceManeuvers.push({
              for_collision: {
                waypoint_index: i,
                obstacle_id: obstacle.obstacle_id
              },
              primary_avoidance: {
                type: 'detour',
                new_waypoint: avoidancePoint,
                insert_before_index: i,
                time_penalty_seconds: 1.5,
                safety_improvement: 0.8
              },
              alternative_avoidance: {
                type: 'detour_opposite',
                new_waypoint: alternativePoint,
                insert_before_index: i,
                time_penalty_seconds: 1.8,
                safety_improvement: 0.75
              },
              wait_option: {
                type: 'wait',
                wait_position: i > 0 ? currentPath[i - 1].waypoint : agentPos,
                wait_duration_seconds: Math.min(5, wpTime + 2),
                safety_improvement: 0.9
              },
              recommended_action: collisionProbability > 0.7 ? 'stop' : 
                                  collisionProbability > 0.5 ? 'detour' : 'slow_down'
            });
          }
        }
      }
    }

    // Generate optimized path with avoidances
    let optimizedPath = [...currentPath];
    const appliedManeuvers = [];

    for (const maneuver of avoidanceManeuvers) {
      if (maneuver.recommended_action === 'detour' || maneuver.recommended_action === 'stop') {
        const insertIndex = maneuver.for_collision.waypoint_index;
        const newWaypoint = {
          waypoint: maneuver.primary_avoidance.new_waypoint,
          eta_seconds: (optimizedPath[insertIndex]?.eta_seconds || 0) - 0.5,
          is_avoidance_waypoint: true,
          avoiding_obstacle: maneuver.for_collision.obstacle_id
        };

        // Insert avoidance waypoint
        optimizedPath.splice(insertIndex, 0, newWaypoint);
        appliedManeuvers.push({
          type: maneuver.primary_avoidance.type,
          obstacle_avoided: maneuver.for_collision.obstacle_id,
          new_waypoint: newWaypoint
        });
      }
    }

    // Calculate path statistics
    const totalCollisionRisks = collisionAnalysis.filter(c => c.collision_probability > 0.5).length;
    const highRiskCollisions = collisionAnalysis.filter(c => c.collision_probability > 0.7).length;

    // Update agent with optimized path if there are changes
    if (appliedManeuvers.length > 0) {
      await base44.asServiceRole.entities.AgentPhysicalPresence.update(agent.id, {
        movement_path: optimizedPath,
        current_activity: `Navigating with ${appliedManeuvers.length} avoidance maneuvers`
      });
    }

    return Response.json({
      success: true,
      agent_id,
      analysis: {
        potential_collisions: collisionAnalysis.length,
        high_risk_collisions: highRiskCollisions,
        medium_risk_collisions: totalCollisionRisks - highRiskCollisions
      },
      collision_details: collisionAnalysis,
      avoidance_maneuvers: avoidanceManeuvers,
      path_optimization: {
        original_waypoints: currentPath.length,
        optimized_waypoints: optimizedPath.length,
        maneuvers_applied: appliedManeuvers.length,
        applied_maneuvers: appliedManeuvers
      },
      optimized_path: optimizedPath
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});