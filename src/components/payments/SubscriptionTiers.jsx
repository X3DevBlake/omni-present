import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TIERS = [
  {
    name: 'Free',
    id: 'free',
    price: 0,
    billing: 'month',
    description: 'Get started with basic features',
    features: [
      'Basic dashboard',
      'View transactions (30 days)',
      'Standard support',
      'Limited AI forecasts'
    ],
    cta: 'Current Plan',
    highlighted: false
  },
  {
    name: 'Starter',
    id: 'starter',
    price: 29,
    billing: 'month',
    annual: 290,
    description: 'Perfect for individuals',
    features: [
      'All Free features',
      'Advanced budgeting',
      'Transaction history (1 year)',
      'AI-powered forecasting',
      'Crypto portfolio tracking',
      'Priority support'
    ],
    cta: 'Upgrade to Starter',
    highlighted: false
  },
  {
    name: 'Pro',
    id: 'pro',
    price: 99,
    billing: 'month',
    annual: 990,
    description: 'For active traders & investors',
    features: [
      'All Starter features',
      'Crypto trading bot',
      'Real-time market alerts',
      'Advanced analytics',
      'Exchange API integration',
      'Unlimited simulations',
      'Dedicated account manager'
    ],
    cta: 'Upgrade to Pro',
    highlighted: true
  },
  {
    name: 'Enterprise',
    id: 'enterprise',
    price: 299,
    billing: 'month',
    annual: 2990,
    description: 'For enterprises & teams',
    features: [
      'All Pro features',
      'Loan & credit services',
      'Team collaboration',
      'Custom integrations',
      'Advanced security',
      'White-label options',
      '24/7 support',
      'Custom AI models'
    ],
    cta: 'Contact Sales',
    highlighted: false
  }
];

export default function SubscriptionTiers({ onSelectTier }) {
  const [billingCycle, setBillingCycle] = React.useState('monthly');

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={billingCycle === 'monthly' ? 'text-white font-bold' : 'text-white/60'}>
          Monthly
        </span>
        <button
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
          className="relative inline-flex h-8 w-14 items-center rounded-full bg-white/10 border border-white/20"
        >
          <motion.div
            initial={false}
            animate={{ x: billingCycle === 'annual' ? 28 : 2 }}
            className="h-6 w-6 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
          />
        </button>
        <span className={billingCycle === 'annual' ? 'text-white font-bold' : 'text-white/60'}>
          Annual <span className="text-green-400 text-sm">(Save 17%)</span>
        </span>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TIERS.map((tier, idx) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -10 }}
            className={`relative rounded-2xl p-6 transition-all ${
              tier.highlighted
                ? 'bg-gradient-to-br from-cyan-600/30 to-blue-600/30 border-2 border-cyan-400 shadow-lg shadow-cyan-500/20'
                : 'bg-white/5 border border-white/10 hover:border-white/20'
            }`}
          >
            {tier.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-1 bg-gradient-to-r from-cyan-400 to-blue-500 px-3 py-1 rounded-full">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold text-white">Most Popular</span>
                </div>
              </div>
            )}

            <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
            <p className="text-white/60 text-sm mb-4">{tier.description}</p>

            <div className="mb-6">
              {tier.price === 0 ? (
                <p className="text-3xl font-bold text-white">Free</p>
              ) : (
                <>
                  <p className="text-4xl font-bold text-white">
                    ${billingCycle === 'monthly' ? tier.price : Math.round(tier.annual / 12)}/mo
                  </p>
                  <p className="text-xs text-white/50 mt-1">
                    {billingCycle === 'annual' ? `Billed $${tier.annual}/year` : 'Billed monthly'}
                  </p>
                </>
              )}
            </div>

            <Button
              onClick={() => onSelectTier?.(tier.id, billingCycle)}
              disabled={tier.id === 'free'}
              className={`w-full mb-6 ${
                tier.highlighted
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {tier.cta}
            </Button>

            <div className="space-y-3">
              {tier.features.map((feature, fidx) => (
                <div key={fidx} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-white/70">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}