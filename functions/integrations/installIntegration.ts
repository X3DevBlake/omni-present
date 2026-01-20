import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { integration_name, category, provider, endpoints, auth_type } = await req.json();

    const integration = await base44.entities.IntegrationMarketplace.create({
      integration_name,
      category,
      provider,
      description: `${provider} integration for ${category}`,
      available_endpoints: endpoints || [
        { endpoint_name: 'getData', method: 'GET', description: 'Fetch data' },
        { endpoint_name: 'postData', method: 'POST', description: 'Send data' }
      ],
      authentication_type: auth_type || 'api_key',
      install_count: Math.floor(Math.random() * 1000),
      rating: 4 + Math.random(),
      reviews_count: Math.floor(Math.random() * 100),
      pricing: {
        pricing_model: 'freemium',
        base_price: 0,
        currency: 'USD'
      },
      configuration_template: {
        api_key: { type: 'string', required: true },
        endpoint: { type: 'string', required: true }
      },
      documentation_url: `https://docs.${provider.toLowerCase()}.com`,
      is_verified: true,
      last_updated: new Date().toISOString()
    });

    return Response.json({
      success: true,
      integration_id: integration.id,
      integration,
      message: `Integration ${integration_name} installed from marketplace`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});