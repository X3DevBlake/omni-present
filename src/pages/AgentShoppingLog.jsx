import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ExternalLink, CheckCircle, Clock, XCircle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import moment from 'moment';

export default function AgentShoppingLog() {
  const [purchases] = useState([
    {
      id: '1',
      agent_name: 'Shopping Assistant',
      platform: 'Amazon',
      item_name: 'Wireless Mouse',
      cost: 25.5,
      status: 'delivered',
      tracking_number: '1Z999AA10123456784',
      created_date: new Date(Date.now() - 172800000),
      reasoning: 'User frequently uses computer, current mouse showing wear'
    },
    {
      id: '2',
      agent_name: 'Research Agent',
      platform: 'Amazon',
      item_name: 'Python Programming Book',
      cost: 45.0,
      status: 'shipped',
      tracking_number: '1Z999AA10123456785',
      created_date: new Date(Date.now() - 86400000),
      reasoning: 'Matches user learning goals in data science'
    },
    {
      id: '3',
      agent_name: 'Travel Planner',
      platform: 'Booking.com',
      item_name: 'Hotel Reservation',
      cost: 150.0,
      status: 'pending',
      created_date: new Date(),
      reasoning: 'Upcoming trip detected in calendar'
    },
  ]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'shipped': return <Package className="w-5 h-5 text-blue-400" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-white/40" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-400';
      case 'shipped': return 'text-blue-400';
      case 'pending': return 'text-yellow-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-white/60';
    }
  };

  const totalSpent = purchases.reduce((sum, p) => sum + p.cost, 0);

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Agent <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Shopping Log</span>
          </h1>
          <p className="text-white/60 text-lg">Track autonomous purchases made by AI agents</p>
        </motion.div>

        {/* Summary */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-white/60 text-sm mb-1">Total Purchases</div>
              <div className="text-white text-3xl font-bold">{purchases.length}</div>
            </div>
            <div>
              <div className="text-white/60 text-sm mb-1">Total Spent</div>
              <div className="text-red-400 text-3xl font-bold">${totalSpent.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-white/60 text-sm mb-1">Delivered</div>
              <div className="text-green-400 text-3xl font-bold">
                {purchases.filter(p => p.status === 'delivered').length}
              </div>
            </div>
            <div>
              <div className="text-white/60 text-sm mb-1">In Transit</div>
              <div className="text-blue-400 text-3xl font-bold">
                {purchases.filter(p => p.status === 'shipped').length}
              </div>
            </div>
          </div>
        </div>

        {/* Purchase List */}
        <div className="space-y-4">
          {purchases.map((purchase, index) => (
            <motion.div
              key={purchase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl mb-1">{purchase.item_name}</h3>
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <span>by {purchase.agent_name}</span>
                      <span>•</span>
                      <span>{purchase.platform}</span>
                      <span>•</span>
                      <span>{moment(purchase.created_date).format('MMM D, YYYY')}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-red-400 text-2xl font-bold mb-1">${purchase.cost.toFixed(2)}</div>
                  <div className={`flex items-center gap-2 justify-end ${getStatusColor(purchase.status)}`}>
                    {getStatusIcon(purchase.status)}
                    <span className="text-sm capitalize">{purchase.status}</span>
                  </div>
                </div>
              </div>

              {/* Reasoning */}
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <div className="text-white/60 text-xs mb-1">Agent's Reasoning</div>
                <p className="text-white text-sm">{purchase.reasoning}</p>
              </div>

              {/* Tracking */}
              {purchase.tracking_number && (
                <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                  <div>
                    <div className="text-blue-300 text-xs mb-1">Tracking Number</div>
                    <code className="text-blue-400 font-mono text-sm">{purchase.tracking_number}</code>
                  </div>
                  <a
                    href={`https://www.track.com/${purchase.tracking_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-sm"
                  >
                    Track
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}