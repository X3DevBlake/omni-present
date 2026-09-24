import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_id, user_action, cursor_position } = await req.json();

    const session = await base44.entities.CollaborationSession.get(session_id);
    
    const updatedUsers = session.active_users || [];
    const userIndex = updatedUsers.findIndex(u => u.user_id === user.id);
    
    const userColors = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899'];
    
    if (userIndex >= 0) {
      updatedUsers[userIndex] = {
        user_id: user.id,
        cursor_position: cursor_position || updatedUsers[userIndex].cursor_position,
        current_action: user_action || updatedUsers[userIndex].current_action,
        color: updatedUsers[userIndex].color
      };
    } else {
      updatedUsers.push({
        user_id: user.id,
        cursor_position,
        current_action: user_action,
        color: userColors[updatedUsers.length % userColors.length]
      });
    }

    const changeEntry = {
      timestamp: new Date().toISOString(),
      user_id: user.id,
      change_type: user_action,
      data: { cursor_position }
    };

    const updatedHistory = [...(session.change_history || []), changeEntry].slice(-100);

    await base44.entities.CollaborationSession.update(session_id, {
      active_users: updatedUsers,
      change_history: updatedHistory
    });

    return Response.json({
      success: true,
      active_users: updatedUsers,
      total_collaborators: updatedUsers.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});