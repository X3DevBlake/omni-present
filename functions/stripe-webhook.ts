import Stripe from 'stripe';

export default async function handler(req, context) {
  const stripe = new Stripe(context.secrets.STRIPE_SECRET_KEY);
  const webhookSecret = context.secrets.STRIPE_WEBHOOK_SECRET;
  
  try {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        
        // Save purchase record
        if (paymentIntent.metadata.type === 'one-time') {
          await context.base44.entities.Purchase.create({
            user_email: paymentIntent.metadata.userEmail,
            items: JSON.parse(paymentIntent.metadata.items || '[]'),
            total_amount: paymentIntent.amount / 100,
            stripe_payment_intent_id: paymentIntent.id,
            status: 'completed',
            purchase_date: new Date().toISOString()
          });
        }
        break;
      }
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Update subscription status
        const subs = await context.base44.entities.Subscription.filter({
          stripe_subscription_id: subscription.id
        });
        
        if (subs.length > 0) {
          await context.base44.entities.Subscription.update(subs[0].id, {
            status: subscription.status === 'active' ? 'active' : 
                    subscription.status === 'canceled' ? 'cancelled' : 
                    subscription.status === 'past_due' ? 'past_due' : 'expired',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          });
        }
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        
        // Mark subscription as past_due
        const subs = await context.base44.entities.Subscription.filter({
          stripe_subscription_id: invoice.subscription
        });
        
        if (subs.length > 0) {
          await context.base44.entities.Subscription.update(subs[0].id, {
            status: 'past_due'
          });
        }
        break;
      }
    }
    
    return { received: true };
  } catch (error) {
    console.error('Webhook error:', error);
    return { error: error.message };
  }
}