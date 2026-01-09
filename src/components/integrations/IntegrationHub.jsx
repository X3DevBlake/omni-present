import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Cloud, Database, MessageCircle, DollarSign, BarChart, Lock, Zap } from 'lucide-react';

const integrationCategories = {
  'AI & ML': [
    { name: 'OpenAI GPT-4', icon: '🧠', connected: true, color: '#10b981' },
    { name: 'Google Gemini', icon: '✨', connected: true, color: '#3b82f6' },
    { name: 'Anthropic Claude', icon: '🤖', connected: false, color: '#a855f7' },
    { name: 'Hugging Face', icon: '🤗', connected: false, color: '#fbbf24' }
  ],
  'Data & Analytics': [
    { name: 'Google Analytics', icon: '📊', connected: true, color: '#ef4444' },
    { name: 'MongoDB Atlas', icon: '🍃', connected: false, color: '#10b981' },
    { name: 'BigQuery', icon: '📈', connected: false, color: '#3b82f6' }
  ],
  'Communication': [
    { name: 'Slack', icon: '💬', connected: true, color: '#a855f7' },
    { name: 'Discord', icon: '🎮', connected: false, color: '#6366f1' },
    { name: 'SendGrid', icon: '📧', connected: false, color: '#3b82f6' }
  ],
  'Financial': [
    { name: 'Stripe', icon: '💳', connected: false, color: '#6366f1' },
    { name: 'PayPal', icon: '💰', connected: false, color: '#0ea5e9' },
    { name: 'Coinbase', icon: '₿', connected: false, color: '#fbbf24' }
  ],
  'Productivity': [
    { name: 'Notion', icon: '📝', connected: false, color: '#ffffff' },
    { name: 'Google Workspace', icon: '📁', connected: true, color: '#3b82f6' },
    { name: 'GitHub', icon: '🐙', connected: false, color: '#ffffff' }
  ]
};

export default function IntegrationHub({ show, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  if (!show) return null;

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-8 h-8 text-cyan-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Integration Hub</h2>
          <p className="text-white/60 text-sm">Connect with 200+ services and platforms</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['All', ...Object.keys(integrationCategories)].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-300'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {Object.entries(integrationCategories)
          .filter(([cat]) => selectedCategory === 'All' || selectedCategory === cat)
          .map(([category, integrations]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-3">{category}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {integrations.map(integration => (
                  <div
                    key={integration.name}
                    className={`bg-white/5 border rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer ${
                      integration.connected ? 'border-green-500/40' : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{integration.icon}</span>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">{integration.name}</div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      integration.connected 
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-white/10 text-white/60'
                    }`}>
                      {integration.connected ? 'Connected' : 'Connect'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}