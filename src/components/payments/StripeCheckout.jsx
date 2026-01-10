import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: '"Inter", sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#94a3b8'
      }
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444'
    }
  }
};

export default function StripeCheckout({ 
  amount, 
  currency = 'usd', 
  description, 
  metadata = {},
  onSuccess,
  onCancel 
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment intent via backend function
      const user = await base44.auth.me();
      
      let paymentIntent;
      if (metadata.type === 'subscription') {
        // Call subscription creation function
        paymentIntent = await fetch('/api/functions/stripe-create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tierId: metadata.tier,
            tierName: description.split(' ')[0],
            billingCycle: metadata.billingCycle,
            amount: amount / 100,
            userEmail: user.email
          })
        }).then(r => r.json());
      } else {
        // Call payment intent creation function
        paymentIntent = await fetch('/api/functions/stripe-create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            description,
            metadata: {
              ...metadata,
              items: JSON.stringify(metadata.items)
            },
            userEmail: user.email
          })
        }).then(r => r.json());
      }

      if (paymentIntent.error) {
        throw new Error(paymentIntent.error);
      }

      // Confirm the payment with the card element
      const { error: stripeError, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              // Add billing details if collected
            }
          }
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        toast.error(stripeError.message);
      } else if (confirmedPayment.status === 'succeeded') {
        toast.success('Payment successful!');
        onSuccess?.(confirmedPayment);
      }
    } catch (err) {
      const message = err.message || 'Payment failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-black/40 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-green-400" />
          Secure Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Card Details
            </label>
            <div className="bg-white/5 border border-white/20 rounded-lg p-4">
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
            <div className="flex justify-between items-center text-white">
              <span className="font-medium">Total</span>
              <span className="text-2xl font-bold">
                ${(amount / 100).toFixed(2)} {currency.toUpperCase()}
              </span>
            </div>
            {description && (
              <p className="text-gray-400 text-sm mt-2">{description}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={!stripe || loading}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Pay ${(amount / 100).toFixed(2)}</>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="border-white/20 text-white"
              >
                Cancel
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center">
            🔒 Secured by Stripe. Your payment information is encrypted.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}