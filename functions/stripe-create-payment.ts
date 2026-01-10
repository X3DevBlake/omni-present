import Stripe from 'stripe';

export default async function handler(req, context) {
  const stripe = new Stripe(context.secrets.STRIPE_SECRET_KEY);
  
  try {
    const { amount, description, metadata, userEmail } = req.body;
    
    // Create payment intent for one-time purchases
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Already in cents
      currency: 'usd',
      description: description,
      metadata: {
        ...metadata,
        userEmail
      },
      automatic_payment_methods: {
        enabled: true
      }
    });
    
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return { error: error.message };
  }
}