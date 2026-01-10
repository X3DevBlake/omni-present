import Stripe from 'stripe';

export default async function handler(req, context) {
  const stripe = new Stripe(context.secrets.STRIPE_SECRET_KEY);
  
  try {
    const { tierId, tierName, billingCycle, amount, userEmail } = req.body;
    
    // Create or retrieve customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });
    
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: { tierId }
      });
    }
    
    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tierName} - ${billingCycle}`,
            description: `AI Lab ${tierName} subscription`
          },
          unit_amount: amount * 100, // Convert to cents
          recurring: {
            interval: billingCycle === 'yearly' ? 'year' : 'month'
          }
        }
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    });
    
    // Save subscription to database
    await context.base44.entities.Subscription.create({
      user_email: userEmail,
      tier_id: tierId,
      tier_name: tierName,
      billing_cycle: billingCycle,
      amount: amount,
      status: 'active',
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customer.id,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
    });
    
    return {
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    };
  } catch (error) {
    console.error('Subscription creation error:', error);
    return { error: error.message };
  }
}