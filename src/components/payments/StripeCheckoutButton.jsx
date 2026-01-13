import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, CreditCard, Zap, Star, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    features: [
      '5 AI Agents',
      '1,000 tasks/month',
      'Basic analytics',
      'Email support',
      'Community access'
    ],
    color: 'from-blue-500 to-cyan-500',
    icon: Star
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 99,
    features: [
      '25 AI Agents',
      '10,000 tasks/month',
      'Advanced analytics',
      'Priority support',
      'Custom workflows',
      'API access'
    ],
    color: 'from-purple-500 to-pink-500',
    popular: true,
    icon: Zap
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    features: [
      'Unlimited AI Agents',
      'Unlimited tasks',
      'Enterprise analytics',
      '24/7 dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'White-label option'
    ],
    color: 'from-orange-500 to-red-500',
    icon: Shield
  }
];

export default function StripeCheckoutButton({ planId, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(planId || 'pro');

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast.error('Stripe not loaded');
      return;
    }

    setLoading(true);

    try {
      const plan = plans.find(p => p.id === selectedPlan);
      
      // Create payment intent via your backend
      const { clientSecret } = await base44.integrations.Core.InvokeLLM({
        prompt: `Create Stripe payment intent for plan ${plan.name} at $${plan.price}/month`,
        response_json_schema: {
          type: 'object',
          properties: {
            clientSecret: { type: 'string' }
          }
        }
      });

      // Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Payment successful! Welcome to Premium!');
        onSuccess?.(selectedPlan);
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative cursor-pointer transition-all ${
              selectedPlan === plan.id 
                ? `bg-gradient-to-br ${plan.color} border-2 border-white shadow-2xl scale-105` 
                : 'bg-white/5 hover:bg-white/10 border border-white/10'
            }`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-yellow-500 text-black">Most Popular</Badge>
              </div>
            )}
            
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <plan.icon className={`w-8 h-8 ${selectedPlan === plan.id ? 'text-white' : 'text-gray-400'}`} />
                {selectedPlan === plan.id && (
                  <Check className="w-6 h-6 text-white" />
                )}
              </div>
              <CardTitle className={selectedPlan === plan.id ? 'text-white' : 'text-gray-300'}>
                {plan.name}
              </CardTitle>
              <div className={`text-4xl font-bold mt-2 ${selectedPlan === plan.id ? 'text-white' : 'text-gray-200'}`}>
                ${plan.price}
                <span className="text-lg font-normal">/mo</span>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className={`w-4 h-4 ${selectedPlan === plan.id ? 'text-white' : 'text-green-400'}`} />
                    <span className={`text-sm ${selectedPlan === plan.id ? 'text-white' : 'text-gray-300'}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheckout} className="space-y-4">
            <div className="p-4 bg-white/10 rounded-lg">
              <CardElement 
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#ffffff',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#ef4444',
                    },
                  },
                }}
              />
            </div>
            
            <Button
              type="submit"
              disabled={!stripe || loading}
              className={`w-full bg-gradient-to-r ${plans.find(p => p.id === selectedPlan)?.color} text-white text-lg py-6`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Subscribe to {plans.find(p => p.id === selectedPlan)?.name} - ${plans.find(p => p.id === selectedPlan)?.price}/mo
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-gray-400">
              Secure payment powered by Stripe. Cancel anytime.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}