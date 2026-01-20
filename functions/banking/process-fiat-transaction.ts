import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transaction_type, amount, currency, payment_method, destination_account } = await req.json();

    // Create transaction record
    const transaction = await base44.entities.FiatTransaction.create({
      user_id: user.id,
      transaction_type,
      amount,
      currency: currency || 'USD',
      payment_method,
      destination_account,
      status: 'processing',
      estimated_completion: new Date(Date.now() + 3600000).toISOString(),
      confirmation_code: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });

    // Process based on transaction type
    if (transaction_type === 'deposit') {
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase() || 'usd',
        metadata: {
          user_id: user.id,
          transaction_id: transaction.id
        }
      });

      return Response.json({
        success: true,
        transaction_id: transaction.id,
        client_secret: paymentIntent.client_secret,
        status: 'processing'
      });
    } else if (transaction_type === 'withdrawal') {
      // Get user's bank account
      const account = await base44.entities.OmniBankAccount.filter({
        created_by: user.email
      }).limit(1);

      if (!account.length || account[0].balance < amount) {
        return Response.json({ error: 'Insufficient funds' }, { status: 400 });
      }

      // Deduct from balance
      await base44.entities.OmniBankAccount.update(account[0].id, {
        balance: account[0].balance - amount
      });

      // Update transaction
      await base44.entities.FiatTransaction.update(transaction.id, {
        status: 'completed'
      });

      return Response.json({
        success: true,
        transaction_id: transaction.id,
        status: 'completed',
        new_balance: account[0].balance - amount
      });
    }

    return Response.json({
      success: true,
      transaction_id: transaction.id,
      status: 'processing'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});