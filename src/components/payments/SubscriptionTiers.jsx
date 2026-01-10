import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Crown, Rocket, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export default function SubscriptionTiers({ onSubscribe }) {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const tiers = [
    {
      id: 'free',
      name: 'Free',
      icon: Sparkles,
      color: 'from-gray-500 to-gray-600',
      price: { monthly: 0, yearly: 0 },
      description: 'Get started with basic features',
      features: [
        'Basic AI Budgeting',
        '3 Portfolio Insights/month',
        'Standard 3D Visualizations',
        'Community Support',
        'Single Wallet Connection'
      ],
      limits: [
        'Limited AI queries (10/day)',
        'Basic analytics only'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Rocket,
      color: 'from-cyan-500 to-blue-500',
      price: { monthly: 29, yearly: 290 },
      description: 'Perfect for serious investors',
      popular: true,
      features: [
        'Advanced AI Financial Planning',
        'Unlimited Portfolio Insights',
        'All 3D Visualizations',
        'AI Risk Mitigation',
        'Priority Support',
        'Multiple Wallet Connections',
        'Personalized Education Content',
        'Real-time Market Alerts',
        'Advanced Analytics Dashboard'
      ],
      limits: []
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Crown,
      color: 'from-purple-500 to-pink-500',
      price: { monthly: 99, yearly: 990 },
      description: 'For teams and institutions',
      features: [
        'Everything in Pro',
        'Autonomous Yield Optimizer',
        'Multi-Agent Coordination',
        'Custom AI Training',
        'White-label Solutions',
        'Dedicated Account Manager',
        'API Access',
        'Advanced Security Features',
        'Team Collaboration Tools',
        'Custom Integrations',
        'SLA Guarantee'
      ],
      limits: []
    }
  ];

  const getSavings = (tier) => {
    if (billingCycle === 'yearly') {
      const monthlyCost = tier.price.monthly * 12;
      const yearlyCost = tier.price.yearly;
      return monthlyCost - yearlyCost;
    }
    return 0;
  };

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-500'}`}>
          Monthly
        </span>
        <Switch
          checked={billingCycle === 'yearly'}
          onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
        />
        <span className={`text-sm ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-500'}`}>
          Yearly
        </span>
        {billingCycle === 'yearly' && (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Save up to 17%
          </Badge>
        )}
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          const savings = getSavings(tier);
          const price = billingCycle === 'monthly' ? tier.price.monthly : tier.price.yearly;
          const period = billingCycle === 'monthly' ? '/month' : '/year';

          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 z-10">
                  Most Popular
                </Badge>
              )}
              <Card className={`h-full ${tier.popular ? 'border-cyan-400 border-2' : 'border-white/10'} bg-black/40`}>
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white">{tier.name}</CardTitle>
                  <p className="text-sm text-gray-400">{tier.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Pricing */}
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">
                        ${price}
                      </span>
                      <span className="text-gray-400">{period}</span>
                    </div>
                    {savings > 0 && (
                      <p className="text-sm text-green-400 mt-1">
                        Save ${savings}/year
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                    {tier.limits.map((limit, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-600">—</div>
                        <span className="text-sm text-gray-500">{limit}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Button
                    className={`w-full ${
                      tier.id === 'free'
                        ? 'bg-gray-600 hover:bg-gray-700'
                        : `bg-gradient-to-r ${tier.color} hover:opacity-90`
                    }`}
                    onClick={() => onSubscribe?.(tier, billingCycle)}
                  >
                    {tier.id === 'free' ? 'Current Plan' : 'Subscribe Now'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Enterprise Contact */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Need a Custom Plan?</h3>
              <p className="text-gray-400">
                Contact our sales team for volume discounts and custom enterprise solutions
              </p>
            </div>
            <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-500/20">
              Contact Sales
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}