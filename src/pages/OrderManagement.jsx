import React from 'react';
import { motion } from 'framer-motion';
import { Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function OrderManagement() {
  const orders = [
    { id: 1, item: 'Omni-Core Pro', date: '2026-01-05', status: 'delivered', total: 599.99 },
    { id: 2, item: 'Neural Sensor Array', date: '2026-01-03', status: 'shipped', total: 299.99 },
    { id: 3, item: 'Vision Module', date: '2025-12-28', status: 'processing', total: 449.99 }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Order Management</h1>
          <p className="text-white/60">Track your purchases and downloads</p>
        </motion.div>

        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div key={order.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{order.item}</h3>
                    <p className="text-white/60 text-sm">Ordered on {order.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-lg mb-1">${order.total}</div>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                    order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}