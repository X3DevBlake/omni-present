import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Calendar, CreditCard, Check, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EnterprisePaymentPlans({ onContactSales }) {
  const [customQuote, setCustomQuote] = useState({
    users: '',
    duration: '12',
    features: []
  });

  const plans = [
    {
      id: 'startup',
      name: 'Startup Plan',
      users: '5-20',
      price: 499,
      billingPeriod: 'monthly',
      description: 'Perfect for growing teams',
      features: [
        'Up to 20 user seats',
        'All Pro features included',
        'Basic API access (10k calls/month)',
        'Email support (24h response)',
        'Monthly strategy call',
        'Team collaboration tools',
        'Shared wallets & portfolios',
        '99.5% uptime SLA'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'business',
      name: 'Business Plan',
      users: '20-100',
      price: 1499,
      billingPeriod: 'monthly',
      description: 'For established organizations',
      popular: true,
      features: [
        'Up to 100 user seats',
        'All Enterprise features',
        'Advanced API access (100k calls/month)',
        'Priority support (4h response)',
        'Weekly strategy calls',
        'Custom AI model training',
        'White-label options',
        'Advanced security & compliance',
        'Dedicated account manager',
        '99.9% uptime SLA'
      ],
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'corporate',
      name: 'Corporate Plan',
      users: '100+',
      price: 'Custom',
      billingPeriod: 'contact sales',
      description: 'Enterprise-grade solutions',
      features: [
        'Unlimited user seats',
        'Everything in Business',
        'Unlimited API access',
        '24/7 dedicated support',
        'Daily check-ins & strategy',
        'Custom integrations',
        'On-premise deployment option',
        'Advanced compliance (SOC2, GDPR)',
        'Multiple dedicated managers',
        '99.99% uptime SLA',
        'Custom SLA options'
      ],
      color: 'from-orange-500 to-red-500'
    }
  ];

  const paymentOptions = [
    {
      id: 'monthly',
      name: 'Monthly Billing',
      description: 'Pay month-to-month with no commitment',
      icon: Calendar,
      multiplier: 1
    },
    {
      id: 'quarterly',
      name: 'Quarterly Billing',
      description: 'Save 10% with quarterly payments',
      icon: Calendar,
      multiplier: 0.9,
      discount: 10
    },
    {
      id: 'annual',
      name: 'Annual Billing',
      description: 'Save 20% with annual commitment',
      icon: Calendar,
      multiplier: 0.8,
      discount: 20
    }
  ];

  const additionalFeatures = [
    { id: 'sso', name: 'SSO Integration', price: 200 },
    { id: 'audit', name: 'Advanced Audit Logs', price: 150 },
    { id: 'training', name: 'Team Training Program', price: 500 },
    { id: 'custom-dev', name: 'Custom Development', price: 'quote' }
  ];

  return (
    <div className="space-y-8">
      {/* Enterprise Plans */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Enterprise Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 z-10">
                  Most Popular
                </Badge>
              )}
              <Card className={`h-full ${plan.popular ? 'border-purple-400 border-2' : 'border-white/10'} bg-black/40`}>
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                  <p className="text-sm text-gray-400">{plan.description}</p>
                  <Badge variant="outline" className="border-white/20 text-gray-400 w-fit">
                    <Users className="w-3 h-3 mr-1" />
                    {plan.users} users
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Pricing */}
                  <div>
                    {typeof plan.price === 'number' ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-white">${plan.price}</span>
                          <span className="text-gray-400">/{plan.billingPeriod}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          ${(plan.price / parseInt(plan.users.split('-')[0])).toFixed(2)}/user
                        </p>
                      </>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Button
                    className={`w-full bg-gradient-to-r ${plan.color}`}
                    onClick={() => onContactSales?.(plan)}
                  >
                    {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Payment Options */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Payment Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paymentOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card key={option.id} className="bg-black/40 border-white/10 hover:border-cyan-400/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white">{option.name}</h4>
                        {option.discount && (
                          <Badge className="bg-green-500/20 text-green-400">
                            Save {option.discount}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{option.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Custom Quote Builder */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-purple-400" />
            Custom Quote Builder
          </CardTitle>
          <p className="text-sm text-gray-400">Get a personalized quote based on your needs</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Number of Users</label>
              <Input
                type="number"
                placeholder="e.g., 50"
                value={customQuote.users}
                onChange={(e) => setCustomQuote({...customQuote, users: e.target.value})}
                className="bg-black/40 border-white/10"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Contract Duration</label>
              <Select value={customQuote.duration} onValueChange={(value) => setCustomQuote({...customQuote, duration: value})}>
                <SelectTrigger className="bg-black/40 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Month</SelectItem>
                  <SelectItem value="3">3 Months</SelectItem>
                  <SelectItem value="6">6 Months</SelectItem>
                  <SelectItem value="12">12 Months (Save 20%)</SelectItem>
                  <SelectItem value="24">24 Months (Save 30%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Additional Features</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {additionalFeatures.map((feature) => (
                <div key={feature.id} className="flex items-center justify-between bg-black/40 rounded p-3 border border-white/10">
                  <span className="text-sm text-white">{feature.name}</span>
                  <span className="text-sm text-cyan-400">
                    {typeof feature.price === 'number' ? `+$${feature.price}/mo` : 'Custom'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500" onClick={() => onContactSales?.(customQuote)}>
            Request Custom Quote
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}