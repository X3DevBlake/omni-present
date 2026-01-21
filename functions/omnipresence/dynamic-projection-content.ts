import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      content_type,
      agent_id,
      spatial_zone_id,
      device_ids,
      include_thought_bubbles = true,
      include_sensor_overlays = true,
      include_task_progress = true
    } = await req.json();

    const projectionContent = {
      timestamp: new Date().toISOString(),
      layers: []
    };

    // Get projection devices
    const devices = device_ids 
      ? await base44.asServiceRole.entities.OmniDevice.filter({ id: { $in: device_ids } })
      : await base44.asServiceRole.entities.OmniDevice.filter({ online_status: true, device_type: 'holographic_projector' });

    // Layer 1: Agent thought bubbles
    if (include_thought_bubbles) {
      const thoughtProcesses = await base44.asServiceRole.entities.AgentThoughtProcess.list('-timestamp', 20);
      const recentThoughts = thoughtProcesses.filter(t => {
        const age = Date.now() - new Date(t.timestamp).getTime();
        return age < (t.visualization_data?.display_duration_seconds || 5) * 1000;
      });

      const thoughtBubbles = recentThoughts.map(thought => {
        const bubbleStyles = {
          speech: { shape: 'rounded_rect', tail: true, border_style: 'solid' },
          thought: { shape: 'cloud', tail: true, border_style: 'dotted' },
          alert: { shape: 'hexagon', tail: false, border_style: 'glow' },
          plan: { shape: 'rectangle', tail: true, border_style: 'dashed' },
          question: { shape: 'rounded_rect', tail: true, border_style: 'solid', icon: '?' }
        };

        const colorSchemes = {
          blue: { primary: '#00f5ff', secondary: '#3b82f6', text: '#ffffff' },
          green: { primary: '#10b981', secondary: '#22c55e', text: '#ffffff' },
          orange: { primary: '#f59e0b', secondary: '#fbbf24', text: '#000000' },
          red: { primary: '#ef4444', secondary: '#f87171', text: '#ffffff' },
          purple: { primary: '#a855f7', secondary: '#c084fc', text: '#ffffff' }
        };

        return {
          thought_id: thought.thought_id,
          agent_id: thought.agent_id,
          content: {
            main_text: thought.thought_content?.main_thought,
            sub_text: thought.thought_content?.sub_thoughts?.slice(0, 2),
            conclusion: thought.thought_content?.conclusion
          },
          style: {
            ...bubbleStyles[thought.visualization_data?.bubble_style || 'thought'],
            colors: colorSchemes[thought.visualization_data?.color_scheme || 'blue'],
            animation: thought.visualization_data?.animation_type || 'fade',
            opacity: 0.9,
            scale: 1
          },
          position_offset: thought.visualization_data?.position_offset || { x: 0.3, y: 0.5, z: 0 },
          duration_remaining_ms: Math.max(0, 
            (thought.visualization_data?.display_duration_seconds || 5) * 1000 - 
            (Date.now() - new Date(thought.timestamp).getTime())
          ),
          confidence_indicator: thought.confidence_level
        };
      });

      projectionContent.layers.push({
        layer_id: 'thought_bubbles',
        layer_type: 'holographic_text',
        z_index: 10,
        items: thoughtBubbles,
        render_settings: {
          billboard: true,
          face_camera: true,
          depth_test: false
        }
      });
    }

    // Layer 2: Sensor data overlays
    if (include_sensor_overlays) {
      const sensorData = await base44.asServiceRole.entities.SensorData.list('-reading_timestamp', 30);

      const sensorOverlays = sensorData.map(sensor => {
        const sensorVisuals = {
          temperature: { icon: '🌡️', color: sensor.reading_value > 75 ? '#ef4444' : '#3b82f6', unit: '°F' },
          humidity: { icon: '💧', color: '#06b6d4', unit: '%' },
          light: { icon: '☀️', color: '#fbbf24', unit: 'lux' },
          motion: { icon: '👁️', color: '#ec4899', unit: '' },
          air_quality: { icon: '🌬️', color: sensor.reading_value > 80 ? '#ef4444' : '#10b981', unit: 'AQI' },
          sound: { icon: '🔊', color: '#8b5cf6', unit: 'dB' }
        };

        const visual = sensorVisuals[sensor.sensor_type] || { icon: '📊', color: '#64748b', unit: '' };
        const isAlerting = sensor.alert_triggered || 
          (sensor.thresholds && (
            sensor.reading_value > (sensor.thresholds.max_normal || Infinity) ||
            sensor.reading_value < (sensor.thresholds.min_normal || -Infinity)
          ));

        return {
          sensor_id: sensor.id,
          sensor_type: sensor.sensor_type,
          position: sensor.position || { x: 0, y: 0.5, z: 0 },
          value: sensor.reading_value,
          unit: sensor.unit || visual.unit,
          display: {
            icon: visual.icon,
            color: visual.color,
            value_text: `${sensor.reading_value?.toFixed(1)}${sensor.unit || visual.unit}`,
            trend_indicator: sensor.trend === 'increasing' ? '↑' : sensor.trend === 'decreasing' ? '↓' : '→'
          },
          is_alerting: isAlerting,
          heatmap_radius: 2,
          heatmap_intensity: Math.min(1, sensor.reading_value / 100)
        };
      });

      projectionContent.layers.push({
        layer_id: 'sensor_overlays',
        layer_type: 'data_visualization',
        z_index: 5,
        items: sensorOverlays,
        render_settings: {
          show_heatmap: true,
          show_icons: true,
          show_values: true,
          update_frequency_ms: 2000
        }
      });
    }

    // Layer 3: Task progress visualization
    if (include_task_progress) {
      const [activeTasks, taskPlans] = await Promise.all([
        base44.asServiceRole.entities.AgentCollaborativeTask.filter({ task_status: 'in_progress' }),
        base44.asServiceRole.entities.AutonomousTaskPlan.filter({ plan_status: 'executing' })
      ]);

      const taskVisuals = [...activeTasks, ...taskPlans].map(task => {
        const subTasks = task.task_decomposition || task.sub_tasks || [];
        const completedCount = subTasks.filter(st => st.status === 'completed').length;
        const inProgressCount = subTasks.filter(st => st.status === 'in_progress').length;

        return {
          task_id: task.id,
          task_name: task.task_name || task.high_level_goal,
          progress: task.progress || task.overall_progress || 0,
          sub_tasks_display: {
            total: subTasks.length,
            completed: completedCount,
            in_progress: inProgressCount,
            items: subTasks.slice(0, 5).map(st => ({
              name: st.task_name || st.subtask_name,
              status: st.status,
              assigned_to: st.assigned_to?.name || st.assigned_agent
            }))
          },
          participating_agents: task.participating_agents?.map(pa => pa.agent_id) || [task.agent_id],
          visualization: {
            progress_bar: {
              width: 1.5,
              height: 0.1,
              fill_color: '#10b981',
              background_color: '#1e293b',
              glow: true
            },
            position_mode: 'follow_agent',
            offset: { x: 0, y: 0.8, z: 0 }
          }
        };
      });

      projectionContent.layers.push({
        layer_id: 'task_progress',
        layer_type: 'progress_visualization',
        z_index: 8,
        items: taskVisuals,
        render_settings: {
          show_progress_bar: true,
          show_subtask_list: true,
          follow_primary_agent: true,
          update_frequency_ms: 1000
        }
      });
    }

    // Generate projection commands for each device
    const projectionCommands = devices.map(device => ({
      device_id: device.id,
      device_name: device.device_name,
      content: projectionContent,
      render_mode: 'layered',
      sync_timestamp: Date.now()
    }));

    return Response.json({
      success: true,
      projection_content: projectionContent,
      projection_commands: projectionCommands,
      summary: {
        thought_bubbles: projectionContent.layers.find(l => l.layer_id === 'thought_bubbles')?.items.length || 0,
        sensor_overlays: projectionContent.layers.find(l => l.layer_id === 'sensor_overlays')?.items.length || 0,
        task_visuals: projectionContent.layers.find(l => l.layer_id === 'task_progress')?.items.length || 0,
        devices_targeted: projectionCommands.length
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});