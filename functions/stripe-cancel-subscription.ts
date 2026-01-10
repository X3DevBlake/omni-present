import Stripe from 'stripe';

export default async function handler(req, context) {
  const stripe = new Stripe(context.secrets.STRIPE_SECRET_KEY);
  
  try {
    const { subscriptionId, cancelAtPeriodEnd = true } = req.body;
    
    // Cancel or schedule cancellation
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd
    });
    
    // Update database
    const subs = await context.base44.entities.Subscription.filter({
      stripe_subscription_id: subscriptionId
    });
    
    if (subs.length > 0) {
      await context.base44.entities.Subscription.update(subs[0].id, {
        cancel_at_period_end: cancelAtPeriodEnd,
        status: cancelAtPeriodEnd ? 'active' : 'cancelled'
      });
    }
    
    return { success: true, subscription };
  } catch (error) {
    console.error('Cancellation error:', error);
    return { error: error.message };
  }
}