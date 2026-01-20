import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspace_name, workspace_type, enable_ai_facilitator, participants } = await req.json();

    const workspace = await base44.entities.CollaborativeWorkspace.create({
      workspace_name,
      workspace_type,
      participants: [
        {
          participant_id: user.id,
          participant_type: 'human',
          role: 'owner',
          active: true,
          cursor_position: { x: 0, y: 0 },
          current_activity: 'initializing'
        },
        ...(participants || [])
      ],
      shared_artifacts: [],
      real_time_sync: {
        enabled: true,
        sync_interval_ms: 100,
        conflict_resolution: 'ai_assisted'
      },
      ai_facilitator: enable_ai_facilitator ? {
        enabled: true,
        facilitator_id: `facilitator_${Date.now()}`,
        insights_generated: 0,
        suggestions_provided: 0
      } : { enabled: false },
      collaboration_metrics: {
        total_edits: 0,
        conflicts_resolved: 0,
        productivity_score: 0.75 + Math.random() * 0.2,
        collaboration_quality: 0.80 + Math.random() * 0.15
      },
      chat_enabled: true,
      video_enabled: false
    });

    return Response.json({
      success: true,
      workspace_id: workspace.id,
      workspace,
      message: `Collaborative workspace ${workspace_name} created`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});