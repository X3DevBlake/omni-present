import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import SubscriptionTiers from '../components/payments/SubscriptionTiers';
import StripeCheckout from '../components/payments/StripeCheckout';
import PlaidConnectButton from '../components/banking/PlaidConnectButton';
import { CreditCard, DollarSign, Settings } from 'lucide-react';

export default function Billing() {
  const [userEmail, setUserEmail] = React.useState(null);
  const [selectedTier, setSelectedTier] = React.useState(null);
  const [billingCycle, setBillingCycle] = React.useState('monthly');

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <CreditCard className="w-10 h-10 text-cyan-400" />
            Billing & Subscription
          </h1>
          <p className="text-white/60">Manage your subscription, payments, and billing preferences</p>
        </motion.div>

        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
            <TabsTrigger value="plans" className="data-[state=active]:bg-cyan-500/20">
              <DollarSign className="w-4 h-4 mr-2" />
              Plans
            </TabsTrigger>
            <TabsTrigger value="payment" className="data-[state=active]:bg-cyan-500/20">
              <CreditCard className="w-4 h-4 mr-2" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-cyan-500/20">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
            >
              <SubscriptionTiers
                onSelectTier={(tier, cycle) => {
                  setSelectedTier(tier);
                  setBillingCycle(cycle);
                }}
              />

              {selectedTier && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 pt-8 border-t border-white/10"
                >
                  <StripeCheckout
                    tier={selectedTier}
                    billingCycle={billingCycle}
                  />
                </motion.div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="payment" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6 space-y-6"
            >
              {userEmail && <PlaidConnectButton userEmail={userEmail} onSuccess={() => {}} />}
            </motion.div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
            >
              <div className="text-center py-12 text-white/40">
                <p>Billing settings and management features coming soon</p>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}