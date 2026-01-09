import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Download, Calendar, TrendingUp, Package } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { base44 } from '@/api/base44Client';

export default function Billing() {
  const [plan, setPlan] = useState('pro');
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const mockInvoices = Array.from({ length: 6 }, (_, i) => ({
      id: `inv_${i}`,
      date: new Date(2026, 0, 9 - i),
      amount: 49.99,
      status: 'paid'
    }));
    setInvoices(mockInvoices);
  }, []);

  const plans = [
    { id: 'starter', name: 'Starter', price: 19, agents: 10, devices: 2, storage: '10GB' },
    { id: 'pro', name: 'Pro', price: 49, agents: 100, devices: 10, storage: '100GB' },
    { id: 'enterprise', name: 'Enterprise', price: 199, agents: 'Unlimited', devices: 'Unlimited', storage: '1TB' }
  ];

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Billing & Subscription</h1>
          <p className="text-white/60">Manage your plan and payment methods</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {plans.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-black/40 backdrop-blur-xl border rounded-2xl p-6 ${
                plan === p.id ? 'border-cyan-500/50 ring-2 ring-cyan-500/30' : 'border-white/10'
              }`}
            >
              <div className="text-center mb-6">
                <h3 className="text-white font-bold text-xl mb-2">{p.name}</h3>
                <div className="text-4xl font-bold text-cyan-400 mb-1">${p.price}</div>
                <div className="text-white/60 text-sm">per month</div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">AI Agents</span>
                  <span className="text-white font-semibold">{p.agents}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Devices</span>
                  <span className="text-white font-semibold">{p.devices}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Storage</span>
                  <span className="text-white font-semibold">{p.storage}</span>
                </div>
              </div>
              <button
                onClick={() => setPlan(p.id)}
                className={`w-full py-3 rounded-xl font-medium transition-all ${
                  plan === p.id
                    ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                }`}
              >
                {plan === p.id ? 'Current Plan' : 'Upgrade'}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cyan-400" />
              Payment Method
            </h3>
            <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded" />
                <div>
                  <div className="text-white font-semibold">•••• 4242</div>
                  <div className="text-white/60 text-sm">Expires 12/27</div>
                </div>
              </div>
              <button className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-lg text-sm hover:bg-cyan-500/30">
                Update
              </button>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Usage This Month
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">API Calls</span>
                <span className="text-green-400 font-semibold">12,450 / 50,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Storage Used</span>
                <span className="text-purple-400 font-semibold">45GB / 100GB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Active Devices</span>
                <span className="text-cyan-400 font-semibold">7 / 10</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Billing History
            </h3>
            <button className="px-4 py-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-lg text-sm hover:bg-purple-500/30 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export All
            </button>
          </div>
          <div className="space-y-2">
            {invoices.map(invoice => (
              <div key={invoice.id} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-cyan-400" />
                  <div>
                    <div className="text-white font-semibold">${invoice.amount.toFixed(2)}</div>
                    <div className="text-white/60 text-sm">{invoice.date.toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-green-500/20 border border-green-500/40 text-green-300 rounded-full text-xs">
                    Paid
                  </div>
                  <button className="text-cyan-400 hover:text-cyan-300 text-sm">Download</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}