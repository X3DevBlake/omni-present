import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, projection_data } = await req.json();

    switch (action) {
      case 'create_projection': {
        // AI determines optimal visualization
        const vizPrompt = `Determine optimal holographic visualization for this data:

Content Type: ${projection_data.content_type}
Data: ${JSON.stringify(projection_data.data)}
Context: ${JSON.stringify(projection_data.context)}

Suggest:
1. Visual properties (opacity, scale, color, glow)
2. Animation type and speed
3. Interaction handlers
4. Spatial positioning`;

        const vizConfig = await base44.integrations.Core.InvokeLLM({
          prompt: vizPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              visual_properties: { type: "object" },
              spatial_anchor: { type: "object" },
              animation_type: { type: "string" },
              interaction_handlers: { type: "array" }
            }
          }
        });

        const projection = await base44.asServiceRole.entities.HolographicProjection.create({
          projection_id: `proj_${Date.now()}_${Math.random()}`,
          content_type: projection_data.content_type,
          spatial_anchor: vizConfig.spatial_anchor || { x: 0, y: 1.5, z: 0, rotation_x: 0, rotation_y: 0, rotation_z: 0 },
          visual_properties: {
            opacity: vizConfig.visual_properties?.opacity || 0.8,
            scale: vizConfig.visual_properties?.scale || 1.0,
            color: vizConfig.visual_properties?.color || '#00FFFF',
            glow_intensity: vizConfig.visual_properties?.glow_intensity || 0.5,
            animation_type: vizConfig.animation_type || 'pulse',
            animation_speed: 1.0
          },
          data_source: {
            entity_type: projection_data.entity_type,
            entity_id: projection_data.entity_id,
            realtime_stream: projection_data.realtime || false,
            update_frequency_hz: 10
          },
          interactive: true,
          interaction_handlers: vizConfig.interaction_handlers || [],
          persistence_mode: projection_data.persistence || 'session',
          visible_to: projection_data.visible_to || [user.id],
          created_by: user.id
        });

        // Create accompanying animation
        const animation = await base44.asServiceRole.entities.HolographicAnimation.create({
          animation_id: `anim_${Date.now()}_${Math.random()}`,
          animation_name: `${projection_data.content_type}_animation`,
          animation_type: 'emergence',
          target_projection_id: projection.projection_id,
          keyframes: [
            { time: 0, properties: { opacity: 0, scale: 0.1 }, easing: 'easeOut' },
            { time: 0.5, properties: { opacity: 0.8, scale: 1.2 }, easing: 'easeInOut' },
            { time: 1, properties: { opacity: 0.8, scale: 1.0 }, easing: 'easeIn' }
          ],
          duration_ms: 1000,
          loop: false,
          particle_effects: {
            enabled: true,
            particle_count: 50,
            particle_color: projection.visual_properties.color,
            emission_rate: 100
          },
          audio_sync: {
            has_audio: false,
            spatial_audio: false
          },
          triggers: [{ trigger_type: 'on_create', condition: 'immediate' }]
        });

        return Response.json({
          success: true,
          projection,
          animation
        });
      }

      case 'update_projection': {
        const { projection_id, updates } = projection_data;
        
        const updated = await base44.asServiceRole.entities.HolographicProjection.update(
          projection_id,
          updates
        );

        return Response.json({ success: true, projection: updated });
      }

      case 'query_projections': {
        const { spatial_bounds, content_types } = projection_data;
        
        const allProjections = await base44.entities.HolographicProjection.list();
        
        // Filter by spatial proximity and type
        const filtered = allProjections.filter(proj => {
          const anchor = proj.spatial_anchor;
          const inBounds = !spatial_bounds || (
            anchor.x >= spatial_bounds.min_x && anchor.x <= spatial_bounds.max_x &&
            anchor.z >= spatial_bounds.min_z && anchor.z <= spatial_bounds.max_z
          );
          const matchesType = !content_types || content_types.includes(proj.content_type);
          
          return inBounds && matchesType;
        });

        return Response.json({
          success: true,
          projections: filtered,
          count: filtered.length
        });
      }

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});