import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspace_name, workspace_type, layout_preset } = await req.json();

    // Generate default layout based on workspace type
    const defaultLayouts = {
      model_training: {
        panels: [
          { panel_id: 'training_curve', panel_type: 'chart', position: { x: -2, y: 1, z: 0 }, size: { w: 2, h: 2 } },
          { panel_id: 'hyperparams', panel_type: 'controls', position: { x: 0, y: 1, z: 0 }, size: { w: 1.5, h: 2 } },
          { panel_id: 'gradient_flow', panel_type: 'visualization', position: { x: 2, y: 1, z: 0 }, size: { w: 2, h: 2 } }
        ],
        camera_position: { x: 0, y: 2, z: 5 },
        lighting: { ambient: 0.4, directional: 0.8 }
      },
      agent_design: {
        panels: [
          { panel_id: 'behavior_tree', panel_type: '3d_graph', position: { x: -1.5, y: 1, z: 0 }, size: { w: 2, h: 2 } },
          { panel_id: 'agent_config', panel_type: 'form', position: { x: 1.5, y: 1, z: 0 }, size: { w: 1.5, h: 2 } }
        ],
        camera_position: { x: 0, y: 1.5, z: 4 },
        lighting: { ambient: 0.5, directional: 0.7 }
      },
      data_exploration: {
        panels: [
          { panel_id: 'data_viz', panel_type: '3d_scatter', position: { x: 0, y: 1, z: 0 }, size: { w: 3, h: 3 } },
          { panel_id: 'filters', panel_type: 'controls', position: { x: 3, y: 1, z: 0 }, size: { w: 1, h: 2 } }
        ],
        camera_position: { x: 0, y: 3, z: 6 },
        lighting: { ambient: 0.6, directional: 0.6 }
      }
    };

    const workspace = await base44.entities.HolographicWorkspace.create({
      workspace_name,
      owner_id: user.id,
      workspace_type,
      layout_config: layout_preset || defaultLayouts[workspace_type] || defaultLayouts.model_training,
      active_visualizations: [],
      gesture_controls: {
        enabled: true,
        sensitivity: 1.0,
        custom_gestures: []
      },
      voice_commands: {
        enabled: true,
        language: 'en',
        custom_commands: []
      },
      shared_with: [],
      personalization: {
        theme: 'aurora',
        avatar_config: {},
        preferred_tools: []
      }
    });

    return Response.json({
      success: true,
      workspace_id: workspace.id,
      workspace,
      message: `Holographic workspace ${workspace_name} created`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});