import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channel_id, start_time, end_time } = await req.json();
    
    // Get messages from the channel during meeting time
    const allMessages = await base44.entities.EnhancedAgentMessage.filter({ channel_id });
    
    const meetingMessages = allMessages.filter(msg => {
      const msgTime = new Date(msg.created_date).getTime();
      return msgTime >= new Date(start_time).getTime() && 
             msgTime <= new Date(end_time).getTime();
    });
    
    if (meetingMessages.length === 0) {
      return Response.json({ error: 'No messages found for this time period' }, { status: 404 });
    }
    
    // Compile conversation
    const conversation = meetingMessages
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
      .map(msg => `${msg.sender_id}: ${msg.message_content}`)
      .join('\n');
    
    // AI-powered meeting summary
    const summary = await base44.integrations.Core.InvokeLLM({
      prompt: `Summarize this meeting conversation. Include key discussion points, decisions made, action items, and next steps:
      
      ${conversation}
      
      Provide a structured summary.`,
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          key_topics: { type: "array", items: { type: "string" } },
          decisions_made: { type: "array", items: { type: "string" } },
          action_items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task: { type: "string" },
                assigned_to: { type: "string" },
                deadline: { type: "string" }
              }
            }
          },
          next_meeting: { type: "string" },
          sentiment: { type: "string" }
        }
      }
    });
    
    // Send summary to all participants
    const channel = await base44.entities.EnhancedCommunicationChannel.filter({ id: channel_id });
    const participants = channel[0]?.participants || [];
    
    for (const participantId of participants) {
      const participantUser = await base44.asServiceRole.entities.User.filter({ id: participantId });
      if (participantUser[0]?.email) {
        await base44.integrations.Core.SendEmail({
          to: participantUser[0].email,
          subject: 'Meeting Summary',
          body: `Executive Summary:\n${summary.executive_summary}\n\nKey Topics:\n${summary.key_topics.join('\n')}\n\nDecisions:\n${summary.decisions_made.join('\n')}\n\nAction Items:\n${summary.action_items.map(a => `- ${a.task} (${a.assigned_to})`).join('\n')}`
        });
      }
    }
    
    return Response.json({
      summary,
      message_count: meetingMessages.length,
      duration_minutes: (new Date(end_time) - new Date(start_time)) / 60000
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});