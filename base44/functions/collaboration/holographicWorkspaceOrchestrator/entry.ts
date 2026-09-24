import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, workspace_id, data } = await req.json();

    switch (action) {
      case 'create_workspace': {
        const workspace = await base44.asServiceRole.entities.HolographicCollaborativeWorkspace.create({
          workspace_id: `workspace_${Date.now()}_${Math.random()}`,
          workspace_name: data.name || 'Collaborative Workspace',
          creator_id: user.id,
          active_participants: [{
            user_id: user.id,
            device_type: data.device_type || 'desktop',
            spatial_position: { x: 0, y: 1.6, z: 0 },
            interaction_mode: 'multi_modal',
            joined_at: new Date().toISOString()
          }],
          holographic_entities: [],
          real_time_data_streams: [],
          interaction_log: [],
          sync_state: {
            last_sync_timestamp: new Date().toISOString(),
            sync_latency_ms: 0,
            conflicts_detected: 0,
            resolution_strategy: 'last_write_wins'
          },
          permissions: {
            public_access: false,
            allowed_users: [user.id],
            edit_permissions: [user.id]
          },
          workspace_status: 'active'
        });

        return Response.json({ success: true, workspace });
      }

      case 'join_workspace': {
        const workspaces = await base44.entities.HolographicCollaborativeWorkspace.filter({ workspace_id });
        if (workspaces.length === 0) {
          return Response.json({ error: 'Workspace not found' }, { status: 404 });
        }

        const workspace = workspaces[0];
        const updatedParticipants = [
          ...(workspace.active_participants || []),
          {
            user_id: user.id,
            device_type: data.device_type || 'desktop',
            spatial_position: data.spawn_position || { x: Math.random() * 10 - 5, y: 1.6, z: Math.random() * 10 - 5 },
            interaction_mode: data.mode || 'multi_modal',
            joined_at: new Date().toISOString()
          }
        ];

        const updated = await base44.asServiceRole.entities.HolographicCollaborativeWorkspace.update(
          workspace.id,
          { active_participants: updatedParticipants }
        );

        // Notify other participants via event bus
        await base44.functions.invoke('globalEventBus', {
          event_type: 'user_joined_workspace',
          payload: { workspace_id, user_id: user.id },
          target_services: ['notification_service'],
          priority: 'normal'
        });

        return Response.json({ success: true, workspace: updated });
      }

      case 'manipulate_entity': {
        const workspaces = await base44.entities.HolographicCollaborativeWorkspace.filter({ workspace_id });
        if (workspaces.length === 0) {
          return Response.json({ error: 'Workspace not found' }, { status: 404 });
        }

        const workspace = workspaces[0];
        const manipulation = {
          manipulation_id: `manip_${Date.now()}_${Math.random()}`,
          performed_by: user.id,
          timestamp: new Date().toISOString(),
          entity_id: data.entity_id,
          transformation: data.transformation,
          confirmed_by: [user.id]
        };

        const updatedManipulations = [
          ...(workspace.shared_manipulations || []),
          manipulation
        ];

        const updated = await base44.asServiceRole.entities.HolographicCollaborativeWorkspace.update(
          workspace.id,
          { shared_manipulations: updatedManipulations }
        );

        return Response.json({ success: true, manipulation, workspace: updated });
      }

      case 'sync_state': {
        const workspaces = await base44.entities.HolographicCollaborativeWorkspace.filter({ workspace_id });
        if (workspaces.length === 0) {
          return Response.json({ error: 'Workspace not found' }, { status: 404 });
        }

        const workspace = workspaces[0];
        
        // Update sync state with current latency
        const updated = await base44.asServiceRole.entities.HolographicCollaborativeWorkspace.update(
          workspace.id,
          {
            sync_state: {
              last_sync_timestamp: new Date().toISOString(),
              sync_latency_ms: data.measured_latency || 50,
              conflicts_detected: workspace.sync_state?.conflicts_detected || 0,
              resolution_strategy: 'operational_transform'
            }
          }
        );

        return Response.json({ 
          success: true, 
          workspace: updated,
          participants: workspace.active_participants
        });
      }

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});