import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (!data.is_active && data.change_history?.length > 0) {
      const summary = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate collaboration session summary:
        
Session: ${data.session_name}
Type: ${data.workspace_type}
Participants: ${data.active_users?.length || 0}
Changes: ${data.change_history.length}

Create concise summary of key actions and outcomes`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            key_decisions: { type: "array", items: { type: "string" } },
            next_steps: { type: "array", items: { type: "string" } }
          }
        }
      });

      for (const user of data.active_users || []) {
        await base44.integrations.Core.SendEmail({
          to: user.user_id,
          subject: `📋 Session Summary: ${data.session_name}`,
          body: `${summary.summary}\n\nKey Decisions:\n${summary.key_decisions?.join('\n')}\n\nNext Steps:\n${summary.next_steps?.join('\n')}`
        });
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});