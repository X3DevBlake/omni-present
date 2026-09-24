import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Note: Requires Plaid integration via app connector
    // This function would create a Plaid Link token
    const linkToken = 'link-token-' + Date.now();

    return Response.json({
      success: true,
      linkToken,
      message: 'Plaid link token generated. Connect via app connector for production use.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});