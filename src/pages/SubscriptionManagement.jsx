import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check, Zap } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function SubscriptionManagement() {
  const plans = [
    { name: 'Free', price: 0, features: ['5 Agents', 'Basic Support', '1GB Storage'], current: false },
    { name: 'Pro', price: 29, features: ['50 Agents', 'Priority Support', '50GB Storage', 'Advanced Analytics'], current: true },
    { name: 'Enterprise', price: 199, features: ['Unlimited Agents', '24/7 Support', '1TB Storage', 'Custom Integrations'], current: false }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Subscription Management</h1>
          <p className="text-white/60">Manage your plan and billing</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div key={i} className={`bg-black/40 backdrop-blur-xl border rounded-xl p-6 ${plan.current ? 'border-cyan-500/40 ring-2 ring-cyan-500/20' : 'border-white/10'}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              {plan.current && (
                <div className="text-cyan-400 text-sm font-semibold mb-2">Current Plan</div>
              )}
              <h3 className="text-white font-bold text-2xl mb-2">{plan.name}</h3>
              <div className="text-white text-4xl font-bold mb-4">
                ${plan.price}
                <span className="text-lg text-white/60">/mo</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, j) => (
                  <li key={j} className="text-white/70 text-sm flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-xl font-bold ${
                plan.current 
                  ? 'bg-white/5 text-white/60 cursor-default' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90'
              }`}>
                {plan.current ? 'Active' : 'Upgrade'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}