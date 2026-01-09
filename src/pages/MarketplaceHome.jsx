import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Package, Plug, Users, Upload, CreditCard, FileText } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function MarketplaceHome() {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full">
            <span className="text-green-400 text-sm font-semibold">🛒 Marketplace Hub</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Asset & Integration
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"> Marketplace</span>
          </h1>
          <p className="text-white/60 text-lg max-w-3xl mx-auto">
            Buy, sell, and discover AI agents, blueprints, integrations, and more
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Assets', value: '12.5K', icon: Package, color: 'green' },
            { label: 'Integrations', value: '500+', icon: Plug, color: 'blue' },
            { label: 'Creators', value: '3.2K', icon: Users, color: 'purple' },
            { label: 'Sales This Month', value: '$45K', icon: CreditCard, color: 'yellow' }
          ].map((stat, i) => (
            <motion.div key={i} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-400 mb-2`} />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Browse Assets', description: 'Explore 3D models, agents, and blueprints', icon: Package, page: 'AssetBrowser', gradient: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30' },
            { title: 'Integration Store', description: '500+ integrations for every use case', icon: Plug, page: 'IntegrationStore', gradient: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30' },
            { title: 'Creator Dashboard', description: 'Manage your marketplace listings', icon: Users, page: 'CreatorDashboard', gradient: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' },
            { title: 'Service Providers', description: 'Find professional AI consultants', icon: Users, page: 'ServiceProviders', gradient: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/30' },
            { title: 'Upload Asset', description: 'Sell your creations to the community', icon: Upload, page: 'AssetUpload', gradient: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30' },
            { title: 'Order Management', description: 'Track purchases and downloads', icon: ShoppingBag, page: 'OrderManagement', gradient: 'from-indigo-500/20 to-purple-500/20', border: 'border-indigo-500/30' },
            { title: 'Payment History', description: 'View transactions and earnings', icon: CreditCard, page: 'PaymentHistory', gradient: 'from-pink-500/20 to-red-500/20', border: 'border-pink-500/30' }
          ].map((item, i) => (
            <Link key={i} to={createPageUrl(item.page)}>
              <motion.div className={`bg-gradient-to-br ${item.gradient} border ${item.border} rounded-2xl p-6 hover:scale-105 transition-all cursor-pointer group`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.description}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}