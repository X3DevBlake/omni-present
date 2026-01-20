import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    await base44.integrations.Core.SendEmail({
      to: data.email,
      subject: '🎉 Welcome to Base44 AI Platform!',
      body: `Hi ${data.full_name},

Welcome to the future of AI development!

Get started:
• Explore the MLOps Hub for model deployment
• Check out the Agent Marketplace
• Build your first automation

Need help? Visit our docs or reach out to support.

Happy building!
The Base44 Team`
    });

    await base44.asServiceRole.entities.UserPreferences.create({
      user_id: data.email,
      onboarding_completed: false,
      preferred_hubs: ['mlops', 'agents']
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});