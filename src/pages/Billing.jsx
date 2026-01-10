import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SubscriptionTiers from '../components/payments/SubscriptionTiers';
import VisualizerMarketplace from '../components/payments/VisualizerMarketplace';
import EnterprisePaymentPlans from '../components/payments/EnterprisePaymentPlans';
import BillingDashboard from '../components/payments/BillingDashboard';
import AuroraBackground from '../components/omni/AuroraBackground';
import { CreditCard } from 'lucide-react';

export default function Billing() {
  const handleSubscribe = (tier, billingCycle) => {
    console.log('Subscribe:', tier, billingCycle);
    // Integrate with payment processor
  };

  const handlePurchase = (items, total) => {
    console.log('Purchase:', items, total);
    // Integrate with payment processor
  };

  const handleContactSales = (data) => {
    console.log('Contact Sales:', data);
    // Send to sales team
  };

  return (
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
    </AuroraBackground>
  );
}