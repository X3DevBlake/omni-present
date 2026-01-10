/**
 * Stripe Webhook Handler
 * Automatically manages subscription status changes
 * 
 * Events handled:
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 * - customer.subscription.trial_will_end
 */

import Stripe from 'stripe';
import { createClient } from '@base44/sdk';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const base44 = createClient({ serviceRole: true });

export async function POST(request) {
  const sig = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return new Response(JSON.stringify({ error: 'Webhook signature verification failed' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  console.log(`✅ Received Stripe event: ${event.type}`);

  try {
    switch (event.type) {
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      case 'customer.subscription.trial_will_end':
        await handleTrialEnding(event.data.object);
        break;

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleSubscriptionUpdated(subscription) {
  const subs = await base44.entities.Subscription.filter({ 
    stripe_subscription_id: subscription.id 
  });
  
  if (subs.length > 0) {
    await base44.entities.Subscription.update(subs[0].id, {
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end
    });
    
    console.log(`✅ Updated subscription ${subscription.id} status to ${subscription.status}`);
    
    // Send notification email if subscription became active
    if (subscription.status === 'active') {
      await sendEmail(subs[0].user_email, 'Subscription Active', 
        `Your ${subs[0].tier_name} subscription is now active!`);
    }
  }
}

async function handleSubscriptionDeleted(subscription) {
  const subs = await base44.entities.Subscription.filter({ 
    stripe_subscription_id: subscription.id 
  });
  
  if (subs.length > 0) {
    await base44.entities.Subscription.update(subs[0].id, {
      status: 'cancelled'
    });
    
    console.log(`✅ Cancelled subscription ${subscription.id}`);
    
    await sendEmail(subs[0].user_email, 'Subscription Cancelled', 
      'Your subscription has been cancelled. We hope to see you again soon!');
  }
}

async function handlePaymentSucceeded(invoice) {
  if (invoice.subscription) {
    const subs = await base44.entities.Subscription.filter({ 
      stripe_subscription_id: invoice.subscription 
    });
    
    if (subs.length > 0) {
      await base44.entities.Subscription.update(subs[0].id, {
        status: 'active',
        current_period_start: new Date(invoice.period_start * 1000).toISOString(),
        current_period_end: new Date(invoice.period_end * 1000).toISOString()
      });
      
      console.log(`✅ Payment succeeded for subscription ${invoice.subscription}`);
      
      await sendEmail(subs[0].user_email, 'Payment Received', 
        `Thank you! Your payment of $${(invoice.amount_paid / 100).toFixed(2)} has been received.`);
    }
  }
}

async function handlePaymentFailed(invoice) {
  if (invoice.subscription) {
    const subs = await base44.entities.Subscription.filter({ 
      stripe_subscription_id: invoice.subscription 
    });
    
    if (subs.length > 0) {
      await base44.entities.Subscription.update(subs[0].id, {
        status: 'past_due'
      });
      
      console.log(`⚠️ Payment failed for subscription ${invoice.subscription}`);
      
      await sendEmail(subs[0].user_email, 'Payment Failed', 
        'Your recent payment failed. Please update your payment method to continue your subscription.');
    }
  }
}

async function handleTrialEnding(subscription) {
  const subs = await base44.entities.Subscription.filter({ 
    stripe_subscription_id: subscription.id 
  });
  
  if (subs.length > 0) {
    const trialEnd = new Date(subscription.trial_end * 1000);
    await sendEmail(subs[0].user_email, 'Trial Ending Soon', 
      `Your trial ends on ${trialEnd.toLocaleDateString()}. Add a payment method to continue.`);
    
    console.log(`✅ Sent trial ending notification for ${subscription.id}`);
  }
}

async function handleCheckoutCompleted(session) {
  // Create subscription or purchase record
  if (session.mode === 'subscription') {
    await base44.entities.Subscription.create({
      user_email: session.customer_email,
      stripe_subscription_id: session.subscription,
      stripe_customer_id: session.customer,
      status: 'active',
      tier_id: session.metadata?.tier_id || 'pro',
      tier_name: session.metadata?.tier_name || 'Pro',
      billing_cycle: session.metadata?.billing_cycle || 'monthly',
      amount: session.amount_total / 100,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    console.log(`✅ Created subscription from checkout ${session.id}`);
  } else if (session.mode === 'payment') {
    await base44.entities.Purchase.create({
      user_email: session.customer_email,
      stripe_payment_intent_id: session.payment_intent,
      items: JSON.parse(session.metadata?.items || '[]'),
      total_amount: session.amount_total / 100,
      status: 'completed',
      purchase_date: new Date().toISOString()
    });
    
    console.log(`✅ Created purchase from checkout ${session.id}`);
  }
}

async function sendEmail(to, subject, body) {
  try {
    await base44.integrations.Core.SendEmail({
      to,
      subject,
      body
    });
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}