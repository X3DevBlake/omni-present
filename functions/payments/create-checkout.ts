/**
 * Create Stripe Checkout Session
 * Handles both subscriptions and one-time purchases
 */

import Stripe from 'stripe';
import { createClient } from '@base44/sdk';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const base44 = createClient({ serviceRole: true });

export async function POST(request) {
  try {
    const { type, items, successUrl, cancelUrl, customerEmail, metadata } = await request.json();

    let session;

    if (type === 'subscription') {
      // Create subscription checkout
      const { tierId, tierName, billingCycle, amount } = metadata;
      
      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: customerEmail,
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tierName} Subscription`,
              description: `${tierName} tier - ${billingCycle} billing`
            },
            unit_amount: Math.round(amount * 100),
            recurring: {
              interval: billingCycle === 'yearly' ? 'year' : 'month'
            }
          },
          quantity: 1
        }],
        success_url: successUrl || `${process.env.APP_URL}/billing?success=true`,
        cancel_url: cancelUrl || `${process.env.APP_URL}/billing?cancelled=true`,
        metadata: {
          tier_id: tierId,
          tier_name: tierName,
          billing_cycle: billingCycle
        }
      });
    } else if (type === 'purchase') {
      // Create one-time purchase checkout
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: customerEmail,
        line_items: items.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              description: item.description,
              images: item.thumbnail ? [item.thumbnail] : []
            },
            unit_amount: Math.round(item.price * 100)
          },
          quantity: 1
        })),
        success_url: successUrl || `${process.env.APP_URL}/billing?success=true`,
        cancel_url: cancelUrl || `${process.env.APP_URL}/billing?cancelled=true`,
        metadata: {
          items: JSON.stringify(items.map(i => ({ id: i.id, name: i.name, price: i.price })))
        }
      });
    }

    return new Response(JSON.stringify({ 
      sessionId: session.id,
      url: session.url
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}