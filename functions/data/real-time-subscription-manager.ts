import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entityType, action } = await req.json();

    // Subscribe to entity changes
    const unsubscribe = base44.entities[entityType].subscribe((event) => {
      if (action === 'all' || event.type === action) {
        // Process real-time update
        console.log(`Entity ${entityType} ${event.type}:`, event.data);
        
        // Emit to client via WebSocket or webhook
        fetch(`${Deno.env.get('APP_URL')}/api/real-time-update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entityType,
            event: event.type,
            data: event.data,
            timestamp: new Date().toISOString()
          })
        }).catch(err => console.error('Webhook error:', err));
      }
    });

    return Response.json({
      status: 'subscribed',
      entityType,
      message: `Real-time subscription active for ${entityType}`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});