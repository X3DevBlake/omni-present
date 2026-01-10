import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SubscriptionTiers from '../components/payments/SubscriptionTiers';
import VisualizerMarketplace from '../components/payments/VisualizerMarketplace';
import EnterprisePaymentPlans from '../components/payments/EnterprisePaymentPlans';
import BillingDashboard from '../components/payments/BillingDashboard';
import AuroraBackground from '../components/omni/AuroraBackground';
import StripeProvider from '../components/payments/StripeProvider';
import StripeCheckout from '../components/payments/StripeCheckout';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function Billing() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);

  const handleSubscribe = (tier, billingCycle) => {
    const amount = billingCycle === 'monthly' ? tier.price.monthly : tier.price.yearly;
    
    setCheckoutData({
      amount: amount * 100, // Convert to cents
      description: `${tier.name} Subscription (${billingCycle})`,
      metadata: {
        type: 'subscription',
        tier: tier.id,
        billingCycle
      }
    });
    setCheckoutOpen(true);
  };

  const handlePurchase = (items, total) => {
    setCheckoutData({
      amount: total * 100, // Convert to cents
      description: `Purchase: ${items.length} item(s)`,
      metadata: {
        type: 'one-time',
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price }))
      }
    });
    setCheckoutOpen(true);
  };

  const handleContactSales = async (data) => {
    try {
      await base44.integrations.Core.SendEmail({
        to: 'sales@yourcompany.com',
        subject: 'Enterprise Plan Request',
        body: `New enterprise inquiry:\n\n${JSON.stringify(data, null, 2)}`
      });
      toast.success('Your request has been sent to our sales team!');
    } catch (err) {
      toast.error('Failed to send request');
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    // Save subscription/purchase to database
    try {
      // Create appropriate entity record based on type
      if (checkoutData.metadata.type === 'subscription') {
        // Store subscription info
        toast.success('Subscription activated!');
      } else {
        // Store purchase info
        toast.success('Purchase complete!');
      }
      setCheckoutOpen(false);
      setCheckoutData(null);
    } catch (err) {
      toast.error('Payment succeeded but failed to activate. Please contact support.');
    }
  };

  return (
    <StripeProvider>
      <AuroraBackground>
        <div className="min-h-screen p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <CreditCard className="w-10 h-10 text-cyan-400" />
                Billing & Subscriptions
              </h1>
              <p className="text-gray-400">
                Manage your subscriptions, purchases, and billing information
              </p>
            </div>

            {/* Backend Functions Required Notice */}
            <div className="mb-6 bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-orange-400 font-semibold">Backend Functions Required</p>
                <p className="text-orange-400/80 text-sm mt-1">
                  Stripe payment processing requires backend functions to be enabled in your app settings 
                  for secure handling of payment secrets and webhooks.
                </p>
              </div>
            </div>

            <Tabs defaultValue="subscriptions" className="w-full">
              <TabsList className="bg-black/40 border border-white/10 mb-8">
                <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                <TabsTrigger value="marketplace">Visualizer Marketplace</TabsTrigger>
                <TabsTrigger value="enterprise">Enterprise Plans</TabsTrigger>
                <TabsTrigger value="dashboard">Revenue Dashboard</TabsTrigger>
              </TabsList>

              <TabsContent value="subscriptions">
                <SubscriptionTiers onSubscribe={handleSubscribe} />
              </TabsContent>

              <TabsContent value="marketplace">
                <VisualizerMarketplace onPurchase={handlePurchase} />
              </TabsContent>

              <TabsContent value="enterprise">
                <EnterprisePaymentPlans onContactSales={handleContactSales} />
              </TabsContent>

              <TabsContent value="dashboard">
                <BillingDashboard />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Stripe Checkout Dialog */}
        <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
          <DialogContent className="bg-black/90 border-white/10 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white">Complete Payment</DialogTitle>
            </DialogHeader>
            {checkoutData && (
              <StripeCheckout
                amount={checkoutData.amount}
                description={checkoutData.description}
                metadata={checkoutData.metadata}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setCheckoutOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </AuroraBackground>
    </StripeProvider>
  );
}