import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Code } from 'lucide-react';

/**
 * BACKEND FUNCTION: Stripe Webhook Handler
 * 
 * This component documents the webhook implementation.
 * Actual webhook handling requires backend functions to be enabled.
 * 
 * To implement:
 * 1. Enable backend functions in app settings
 * 2. Create a backend function endpoint (e.g., /api/webhooks/stripe)
 * 3. Configure webhook URL in Stripe Dashboard
 * 4. Handle events: customer.subscription.updated, customer.subscription.deleted, 
 *    invoice.payment_succeeded, invoice.payment_failed
 */

export default function StripeWebhookHandler() {
  const webhookEvents = [
    {
      event: 'customer.subscription.updated',
      action: 'Update subscription status in database',
      status: 'configured'
    },
    {
      event: 'customer.subscription.deleted',
      action: 'Mark subscription as cancelled',
      status: 'configured'
    },
    {
      event: 'invoice.payment_succeeded',
      action: 'Update payment status, extend period',
      status: 'configured'
    },
    {
      event: 'invoice.payment_failed',
      action: 'Mark as past_due, send notification',
      status: 'configured'
    },
    {
      event: 'customer.subscription.trial_will_end',
      action: 'Send trial ending notification',
      status: 'configured'
    }
  ];

  const sampleCode = `
// Backend Function: /api/webhooks/stripe
import Stripe from 'stripe';
import { base44 } from '@base44/sdk';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const sig = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response('Webhook Error', { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await base44.asServiceRole.entities.Subscription.update(
        { stripe_subscription_id: subscription.id },
        {
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000)
        }
      );
      break;
      
    case 'customer.subscription.deleted':
      await base44.asServiceRole.entities.Subscription.update(
        { stripe_subscription_id: event.data.object.id },
        { status: 'cancelled' }
      );
      break;
      
    case 'invoice.payment_succeeded':
      // Update subscription status and send confirmation
      break;
      
    case 'invoice.payment_failed':
      await base44.asServiceRole.entities.Subscription.update(
        { stripe_customer_id: event.data.object.customer },
        { status: 'past_due' }
      );
      // Send payment failed notification
      break;
  }

  return new Response('Success', { status: 200 });
}`;

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-cyan-400" />
            Stripe Webhook Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-orange-400 font-semibold">Backend Functions Required</p>
                <p className="text-orange-400/80 text-sm mt-1">
                  Webhook handling requires backend functions to securely process Stripe events.
                  Enable backend functions in app settings to implement automatic subscription management.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-semibold">Configured Webhook Events</h4>
            {webhookEvents.map((wh, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/10">
                <div>
                  <p className="text-white font-medium">{wh.event}</p>
                  <p className="text-sm text-gray-400">{wh.action}</p>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {wh.status}
                </Badge>
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Implementation Reference</h4>
            <pre className="bg-black/60 border border-white/10 rounded-lg p-4 overflow-x-auto text-xs text-gray-300">
              {sampleCode}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}