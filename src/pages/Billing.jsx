import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import StripeCheckoutButton from '@/components/payments/StripeCheckoutButton';
import CardCustomizer from '@/components/banking/CardCustomizer';
import OmniCardManager from '@/components/banking/OmniCardManager';
import { CreditCard, DollarSign, Wallet, Bitcoin, ShieldCheck, ArrowRightLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe (placeholder key, usually env var)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

export default function Billing() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-12 h-12 text-cyan-400" />
            <h1 className="text-5xl font-bold text-white">Financial Hub</h1>
          </div>
          <p className="text-white/60 text-lg">
            Manage subscriptions, cards, crypto assets, and banking operations
          </p>
        </motion.div>

        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10 mb-8 p-1 h-14">
            <TabsTrigger value="cards" className="text-lg data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <CreditCard className="w-5 h-5 mr-2" /> Omni Cards
            </TabsTrigger>
            <TabsTrigger value="crypto" className="text-lg data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <Bitcoin className="w-5 h-5 mr-2" /> Crypto Assets
            </TabsTrigger>
            <TabsTrigger value="banking" className="text-lg data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <ArrowRightLeft className="w-5 h-5 mr-2" /> Banking
            </TabsTrigger>
            <TabsTrigger value="subscription" className="text-lg data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400">
              <ShieldCheck className="w-5 h-5 mr-2" /> Subscription
            </TabsTrigger>
          </TabsList>

          {/* OMNI CARDS TAB */}
          <TabsContent value="cards" className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Your Digital Wallet</h2>
                <OmniCardManager userEmail={userEmail} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Card Customizer Studio</h2>
                <CardCustomizer userEmail={userEmail} />
              </div>
            </div>
          </TabsContent>

          {/* CRYPTO ASSETS TAB */}
          <TabsContent value="crypto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-black/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bitcoin className="w-6 h-6 text-purple-400" /> Buy Crypto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-lg">
                      <div className="flex justify-between text-white mb-2">
                        <span>Bitcoin (BTC)</span>
                        <span className="font-mono text-green-400">$98,420.00</span>
                      </div>
                      <div className="flex justify-between text-white mb-2">
                        <span>Ethereum (ETH)</span>
                        <span className="font-mono text-green-400">$2,840.00</span>
                      </div>
                      <div className="flex justify-between text-white">
                        <span>Omni Token (OMNI)</span>
                        <span className="font-mono text-cyan-400">$12.50</span>
                      </div>
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      Trade Assets
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/40 border-white/10 col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">Portfolio Overview</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-48 text-white/40">
                  <p>Connect wallet to view portfolio visualization</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* BANKING TAB */}
          <TabsContent value="banking">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="bg-black/40 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Deposit & Transfer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full bg-white/10 hover:bg-white/20 text-white h-12 justify-start px-6">
                    <DollarSign className="w-5 h-5 mr-3 text-green-400" />
                    Deposit USD via ACH
                  </Button>
                  <Button className="w-full bg-white/10 hover:bg-white/20 text-white h-12 justify-start px-6">
                    <ArrowRightLeft className="w-5 h-5 mr-3 text-blue-400" />
                    Wire Transfer
                  </Button>
                  <Elements stripe={stripePromise}>
                     <StripeCheckoutButton onSuccess={() => {}} />
                  </Elements>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SUBSCRIPTION TAB */}
          <TabsContent value="subscription">
            <div className="max-w-4xl mx-auto">
               <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                 <CardHeader className="text-center">
                   <CardTitle className="text-3xl text-white">Enterprise Plan</CardTitle>
                   <p className="text-white/60">Unlock full autonomy and unlimited agents</p>
                 </CardHeader>
                 <CardContent className="text-center pb-8">
                   <div className="text-5xl font-bold text-white mb-6">$499<span className="text-xl text-white/40 font-normal">/mo</span></div>
                   <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-6 text-lg rounded-full">
                     Upgrade Now
                   </Button>
                 </CardContent>
               </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}