import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Star, TrendingUp, BarChart3, Bell, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

const TEMPLATES = [
  {
    id: 1,
    name: 'Crypto Trading Agent',
    description: 'Automated crypto trading with technical analysis',
    category: 'finance',
    icon: TrendingUp,
    downloads: 1250,
    rating: 4.8,
    behaviors: [
      { trigger: 'Price crosses moving average', action: 'Execute trade', priority: 'high' },
      { trigger: 'RSI overbought/oversold', action: 'Send alert', priority: 'medium' }
    ],
    apis: [
      { name: 'CoinGecko', endpoint: 'https://api.coingecko.com/api/v3/coins/markets', method: 'GET' }
    ]
  },
  {
    id: 2,
    name: 'Portfolio Monitor',
    description: 'Real-time portfolio tracking and rebalancing',
    category: 'analytics',
    icon: BarChart3,
    downloads: 890,
    rating: 4.6,
    behaviors: [
      { trigger: 'Portfolio drift > 5%', action: 'Rebalance positions', priority: 'high' },
      { trigger: 'Daily report time', action: 'Generate report', priority: 'low' }
    ],
    apis: []
  },
  {
    id: 3,
    name: 'Price Alert Agent',
    description: 'Smart price alerts with multi-channel notifications',
    category: 'automation',
    icon: Bell,
    downloads: 2100,
    rating: 4.9,
    behaviors: [
      { trigger: 'Price target reached', action: 'Send multi-channel alert', priority: 'high' }
    ],
    apis: [
      { name: 'CryptoCompare', endpoint: 'https://min-api.cryptocompare.com/data/price', method: 'GET' }
    ]
  },
  {
    id: 4,
    name: 'Risk Management Agent',
    description: 'Automated risk assessment and position sizing',
    category: 'finance',
    icon: Shield,
    downloads: 670,
    rating: 4.7,
    behaviors: [
      { trigger: 'Volatility spike detected', action: 'Reduce position size', priority: 'high' },
      { trigger: 'Correlation threshold breached', action: 'Diversify holdings', priority: 'medium' }
    ],
    apis: []
  }
];

export default function AgentTemplateMarketplace({ onDeploy }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const queryClient = useQueryClient();

  const deployTemplateMutation = useMutation({
    mutationFn: (template) => base44.entities.Agent.create({
      name: template.name,
      description: template.description,
      category: template.category,
      behaviors: template.behaviors,
      api_integrations: template.apis,
      self_monitoring: true,
      self_correction: true,
      monitoring_threshold: 80,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      onDeploy?.();
    },
  });

  const filteredTemplates = TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-md text-white"
        >
          <option value="all">All Categories</option>
          <option value="finance">Finance</option>
          <option value="analytics">Analytics</option>
          <option value="automation">Automation</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template, idx) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-white/5 border-purple-500/20 hover:border-purple-500/40 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <template.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-sm">{template.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-purple-500/20 text-purple-300 text-xs">{template.category}</Badge>
                        <div className="flex items-center gap-1 text-yellow-400 text-xs">
                          <Star className="w-3 h-3 fill-current" />
                          {template.rating}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white/60 text-xs mb-3">{template.description}</p>
                <div className="space-y-2 mb-4">
                  <p className="text-white/80 text-xs font-medium">Behaviors:</p>
                  {template.behaviors.slice(0, 2).map((behavior, idx) => (
                    <div key={idx} className="text-white/60 text-xs pl-3 border-l-2 border-purple-500/30">
                      {behavior.trigger} → {behavior.action}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-white/40 text-xs">
                    <Download className="w-3 h-3" />
                    {template.downloads}
                  </div>
                  <Button
                    size="sm"
                    className="bg-purple-500 hover:bg-purple-600"
                    onClick={() => deployTemplateMutation.mutate(template)}
                  >
                    Deploy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}