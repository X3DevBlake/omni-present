import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sender_agent_id, content, target_scope, target_group_id, target_role, priority = 'normal' } = await req.json();

    // Determine recipients based on scope
    let recipients = [];

    if (target_scope === 'all') {
      const allAgents = await base44.asServiceRole.entities.Agent.list();
      recipients = allAgents.map(a => a.id);
    } else if (target_scope === 'group' && target_group_id) {
      const groups = await base44.asServiceRole.entities.WorkingGroup.filter({ id: target_group_id });
      const group = groups[0];
      recipients = group?.agent_members?.map(m => m.agent_id) || [];
    } else if (target_scope === 'role' && target_role) {
      const agents = await base44.asServiceRole.entities.Agent.filter({ agent_type: target_role });
      recipients = agents.map(a => a.id);
    }

    // Create broadcast
    const broadcast = await base44.asServiceRole.entities.MessageBroadcast.create({
      sender_agent_id,
      broadcast_type: priority === 'urgent' ? 'alert' : 'announcement',
      content,
      target_scope,
      target_group_id,
      target_role,
      priority,
      recipients,
      read_count: 0,
    });

    // Create individual messages in relevant channels
    if (target_scope === 'group' && target_group_id) {
      const channels = await base44.asServiceRole.entities.AgentCommunicationChannel.filter({ 
        workflow_id: target_group_id 
      });
      
      for (const channel of channels) {
        await base44.asServiceRole.entities.AgentMessage.create({
          channel_id: channel.id,
          sender_agent_id,
          content: `[BROADCAST] ${content}`,
          message_type: 'announcement',
        });
      }
    }

    return Response.json({
      success: true,
      broadcast_id: broadcast.id,
      recipients_count: recipients.length,
      message: 'Broadcast sent successfully',
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});