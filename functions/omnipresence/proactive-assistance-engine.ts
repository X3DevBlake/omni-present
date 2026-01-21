import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, scan_all_contexts = true } = await req.json();

    // Get agent data
    const agents = await base44.asServiceRole.entities.AgentPhysicalPresence.filter(
      agent_id ? { agent_id } : { projection_status: 'active' }
    );

    const assistanceOffers = [];

    for (const agent of agents) {
      // Get agent's contextual state
      const [contextStates, sensorData, obstacles, activeTasks] = await Promise.all([
        base44.asServiceRole.entities.AgentContextualState.filter({ agent_id: agent.agent_id }),
        base44.asServiceRole.entities.SensorData.list('-reading_timestamp', 20),
        base44.asServiceRole.entities.PredictiveObstacle.list('-last_updated', 15),
        base44.asServiceRole.entities.AgentCollaborativeTask.filter({ task_status: 'in_progress' })
      ]);

      const context = contextStates[0]?.current_context || {};
      const agentPos = agent.current_location || { x: 0, y: 0, z: 0 };

      // Check for collision warnings
      for (const obstacle of obstacles) {
        const obsPos = obstacle.current_position || { x: 0, y: 0, z: 0 };
        const distance = Math.sqrt(
          Math.pow(agentPos.x - obsPos.x, 2) + Math.pow(agentPos.z - obsPos.z, 2)
        );

        if (distance < (obstacle.avoidance_buffer_meters || 0.5) * 3) {
          const collisionPredictions = obstacle.collision_predictions || [];
          const relevantPrediction = collisionPredictions.find(cp => cp.agent_id === agent.agent_id);

          if (relevantPrediction?.collision_probability > 0.4) {
            assistanceOffers.push({
              agent_id: agent.agent_id,
              assistance_type: 'warning',
              trigger_source: {
                entity_type: 'PredictiveObstacle',
                entity_id: obstacle.obstacle_id,
                trigger_condition: 'collision_risk_detected'
              },
              context_snapshot: {
                agent_state: { position: agentPos, activity: agent.current_activity },
                nearby_obstacles: [{ id: obstacle.obstacle_id, type: obstacle.obstacle_type, distance }]
              },
              assistance_content: {
                title: 'Collision Warning',
                message: `${obstacle.obstacle_type} detected ${distance.toFixed(1)}m away, ${(relevantPrediction.collision_probability * 100).toFixed(0)}% collision risk in ${relevantPrediction.estimated_time_ms / 1000}s`,
                severity: relevantPrediction.collision_probability > 0.7 ? 'critical' : 'warning',
                recommended_actions: [
                  {
                    action_id: 'avoid_' + obstacle.obstacle_id,
                    action_name: relevantPrediction.recommended_action || 'detour',
                    description: `Execute ${relevantPrediction.recommended_action} maneuver`,
                    auto_executable: true,
                    estimated_benefit: 'Avoid collision'
                  }
                ]
              },
              prediction_data: {
                prediction_type: 'collision',
                confidence: relevantPrediction.collision_probability,
                time_horizon_seconds: relevantPrediction.estimated_time_ms / 1000,
                predicted_outcome: 'Potential collision with ' + obstacle.obstacle_type
              }
            });
          }
        }
      }

      // Check environmental conditions
      const nearbySensors = sensorData.filter(s => {
        if (!s.position) return false;
        const dist = Math.sqrt(
          Math.pow((s.position.x || 0) - agentPos.x, 2) +
          Math.pow((s.position.z || 0) - agentPos.z, 2)
        );
        return dist < 5;
      });

      for (const sensor of nearbySensors) {
        const value = sensor.reading_value;
        const thresholds = sensor.thresholds || {};

        let alertCondition = null;
        if (value > (thresholds.max_normal || Infinity)) {
          alertCondition = 'high';
        } else if (value < (thresholds.min_normal || -Infinity)) {
          alertCondition = 'low';
        }

        if (alertCondition && sensor.influences_agent_behavior) {
          assistanceOffers.push({
            agent_id: agent.agent_id,
            assistance_type: 'environmental',
            trigger_source: {
              entity_type: 'SensorData',
              entity_id: sensor.id,
              trigger_condition: `${sensor.sensor_type}_${alertCondition}`
            },
            context_snapshot: {
              sensor_data: { type: sensor.sensor_type, value, unit: sensor.unit },
              environmental_conditions: context.environmental_conditions
            },
            assistance_content: {
              title: `${sensor.sensor_type.charAt(0).toUpperCase() + sensor.sensor_type.slice(1)} Alert`,
              message: `${sensor.sensor_type} is ${alertCondition}: ${value}${sensor.unit || ''}`,
              severity: value > (thresholds.critical_max || Infinity) || value < (thresholds.critical_min || -Infinity) ? 'critical' : 'suggestion',
              recommended_actions: [
                {
                  action_id: `adjust_${sensor.sensor_type}`,
                  action_name: `Adjust ${sensor.sensor_type}`,
                  description: `Recommend adjusting ${sensor.sensor_type} to optimal range`,
                  auto_executable: true,
                  estimated_benefit: 'Improve comfort and efficiency'
                }
              ]
            }
          });
        }
      }

      // Check for task delegation opportunities
      const agentTasks = activeTasks.filter(t => 
        t.participating_agents?.some(pa => pa.agent_id === agent.agent_id)
      );

      for (const task of agentTasks) {
        if (task.progress < 30 && task.task_decomposition?.length > 2) {
          const availableAgents = agents.filter(a => 
            a.agent_id !== agent.agent_id && 
            (!a.current_activity || a.current_activity === 'Idle')
          );

          if (availableAgents.length > 0) {
            assistanceOffers.push({
              agent_id: agent.agent_id,
              assistance_type: 'delegation',
              trigger_source: {
                entity_type: 'AgentCollaborativeTask',
                entity_id: task.id,
                trigger_condition: 'complex_task_detected'
              },
              context_snapshot: {
                active_tasks: [{ id: task.id, name: task.task_name, progress: task.progress }]
              },
              assistance_content: {
                title: 'Task Delegation Opportunity',
                message: `Task "${task.task_name}" has ${task.task_decomposition.length} subtasks. ${availableAgents.length} agents available to help.`,
                severity: 'suggestion',
                recommended_actions: availableAgents.slice(0, 2).map(a => ({
                  action_id: `delegate_to_${a.agent_id}`,
                  action_name: `Delegate to Agent ${a.agent_id.slice(0, 8)}`,
                  description: `Assign subtasks to available agent`,
                  auto_executable: true,
                  estimated_benefit: 'Faster task completion'
                }))
              }
            });
          }
        }
      }
    }

    // Store assistance offers
    const storedOffers = [];
    for (const offer of assistanceOffers) {
      const stored = await base44.asServiceRole.entities.ProactiveAssistance.create({
        ...offer,
        assistance_id: `assist_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        status: 'pending',
        expires_at: new Date(Date.now() + 60000).toISOString()
      });
      storedOffers.push(stored);

      // Create thought process for the assistance
      await base44.asServiceRole.entities.AgentThoughtProcess.create({
        thought_id: `thought_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        agent_id: offer.agent_id,
        thought_type: offer.assistance_type === 'warning' ? 'observation' : 'reasoning',
        thought_content: {
          main_thought: offer.assistance_content.title,
          sub_thoughts: [offer.assistance_content.message],
          conclusion: offer.assistance_content.recommended_actions?.[0]?.description || 'Awaiting response'
        },
        visualization_data: {
          display_duration_seconds: offer.assistance_content.severity === 'critical' ? 8 : 4,
          position_offset: { x: 0.2, y: 0.6, z: 0.1 },
          bubble_style: offer.assistance_type === 'warning' ? 'alert' : 'thought',
          color_scheme: offer.assistance_content.severity === 'critical' ? 'red' : offer.assistance_type === 'suggestion' ? 'green' : 'orange',
          animation_type: offer.assistance_content.severity === 'critical' ? 'pulse' : 'fade'
        },
        confidence_level: offer.prediction_data?.confidence || 0.8,
        timestamp: new Date().toISOString()
      });
    }

    return Response.json({
      success: true,
      agents_scanned: agents.length,
      assistance_offers: storedOffers.length,
      offers_by_type: {
        warnings: assistanceOffers.filter(a => a.assistance_type === 'warning').length,
        environmental: assistanceOffers.filter(a => a.assistance_type === 'environmental').length,
        delegation: assistanceOffers.filter(a => a.assistance_type === 'delegation').length,
        suggestions: assistanceOffers.filter(a => a.assistance_type === 'suggestion').length
      },
      stored_offers: storedOffers
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});