import { createClientFromRequest } from 'npm:@base44/sdk@0.8.3';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, teamId, agentId, message, missionId } = await req.json();

    if (action === 'send') {
        const chat = await base44.entities.CollaborationChat.create({
            group_id: teamId,
            content: message,
            message_type: 'agent',
            mentions: [agentId], // Using mentions field to store sender for now
            timestamp: new Date().toISOString()
        });
        return Response.json({ success: true, chat });
    }

    if (action === 'history') {
        const history = await base44.entities.CollaborationChat.list({ 
            filter: { group_id: teamId },
            sort: { created_date: 1 },
            limit: 50
        });
        return Response.json({ success: true, history });
    }

    if (action === 'summarize') {
        // Mock AI Summarization
        const summary = `Team communication indicates consensus on Protocol Delta. 
        Agent X detected a firewall anomaly at 14:00. 
        Agent Y has successfully reallocated 30% bandwidth.
        Pending: Final authorization for core access.`;
        
        return Response.json({ success: true, summary });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});