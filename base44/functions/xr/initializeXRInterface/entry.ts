import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { interface_type, content_config } = await req.json();

    // Generate XR interface configuration
    const xrConfig = await base44.integrations.Core.InvokeLLM({
      prompt: `Design an immersive ${interface_type} interface for AI agent marketplace and collaboration:

Generate:
1. Optimal spatial anchor placements for 3D content
2. Intuitive gesture mappings for common actions
3. Holographic layer configuration for data visualization
4. Interaction zones and affordances
5. Performance optimization recommendations

Consider: ergonomics, accessibility, cognitive load, visual hierarchy.`,
      response_json_schema: {
        type: "object",
        properties: {
          spatial_anchors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                anchor_id: { type: "string" },
                position: { type: "array", items: { type: "number" } },
                content_type: { type: "string" },
                interaction_type: { type: "string" }
              }
            }
          },
          gesture_mappings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                gesture_name: { type: "string" },
                action: { type: "string" },
                confidence_threshold: { type: "number" }
              }
            }
          },
          holographic_layers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                layer_name: { type: "string" },
                depth: { type: "number" },
                opacity: { type: "number" },
                interactive: { type: "boolean" }
              }
            }
          },
          performance_recommendations: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    const interfaceData = {
      interface_name: `XR_${interface_type}_${user.id}`,
      interface_type: interface_type,
      spatial_anchors: xrConfig.spatial_anchors || [],
      gesture_mappings: xrConfig.gesture_mappings || [],
      holographic_layers: xrConfig.holographic_layers || [],
      user_presence: {
        eye_tracking_enabled: true,
        hand_tracking_enabled: true,
        spatial_audio_enabled: true
      },
      performance_mode: 'balanced'
    };

    const xrInterface = await base44.entities.XRInterface.create(interfaceData);

    return Response.json({
      success: true,
      xr_interface: xrInterface,
      configuration: xrConfig,
      setup_instructions: [
        'Enable WebXR in your browser',
        'Grant camera and motion permissions',
        'Calibrate your play space',
        'Position yourself at least 1.5m from objects'
      ]
    });

  } catch (error) {
    console.error('XR initialization error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});