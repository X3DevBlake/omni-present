import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { protocol_name, protocol_type, agent_ids, channels } = await req.json();

    const protocol = await base44.entities.AgentCommunicationProtocol.create({
      protocol_name,
      protocol_type,
      message_format: {
        schema: {
          type: 'object',
          properties: {
            sender: { type: 'string' },
            content: { type: 'string' },
            timestamp: { type: 'string' }
          }
        },
        encoding: 'json'
      },
      participants: agent_ids?.map(id => ({
        agent_id: id,
        role: protocol_type === 'broadcast' ? 'broadcaster' : 'sender',
        message_count: 0
      })) || [],
      channels: channels?.map((ch, i) => ({
        channel_id: `ch_${i}`,
        channel_name: ch,
        topic: ch,
        subscriber_count: 0
      })) || [],
      quality_of_service: {
        delivery_guarantee: 'at_least_once',
        max_latency_ms: 100,
        priority_levels: 3
      },
      security: {
        encryption_enabled: true,
        authentication_required: true,
        access_control: 'role_based'
      },
      message_stats: {
        total_messages: 0,
        messages_per_second: 0,
        average_message_size_bytes: 512,
        delivery_success_rate: 0.995
      },
      is_active: true
    });

    return Response.json({
      success: true,
      protocol_id: protocol.id,
      protocol,
      message: `Communication protocol ${protocol_name} setup for ${agent_ids?.length} agents`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});