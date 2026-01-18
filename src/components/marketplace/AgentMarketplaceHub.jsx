import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Star, Users } from 'lucide-react';

const FEATURED_AGENTS = [
  {
    id: 1,
    name: 'Market Analyzer Pro',
    category: 'Finance',
    rating: 4.8,
    reviews: 342,
    downloads: 1250,
    price: 99,
    description: 'Advanced market analysis with real-time sentiment tracking',
    features: ['Real-time data', 'ML predictions', 'Risk assessment'],
  },
  {
    id: 2,
    name: 'Content Generator',
    category: 'Automation',
    rating: 4.6,
    reviews: 218,
    downloads: 890,
    price: 49,
    description: 'AI-powered content creation for multiple platforms',
    features: ['Multi-format', 'Brand voice', 'SEO optimized'],
  },
  {
    id: 3,
    name: 'Customer Support Bot',
    category: 'Support',
    rating: 4.9,
    reviews: 567,
    downloads: 2100,
    price: 79,
    description: '24/7 intelligent customer support automation',
    features: ['24/7 availability', 'Multi-language', 'Intent detection'],
  },
];

export default function AgentMarketplaceHub() {
  const [selectedAgent, setSelectedAgent] = useState(null);

  return (
    <div className="space-y-6">
      {/* Featured Agents */}
      <div className="grid lg:grid-cols-3 gap-4">
        {FEATURED_AGENTS.map((agent, idx) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card
              onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}
              className="bg-black/40 border-white/10 hover:border-white/30 transition-all cursor-pointer p-4"
            >
              {/* Header */}
              <div className="mb-3">
                <h4 className="text-white font-bold text-lg">{agent.name}</h4>
                <Badge className="bg-cyan-500/30 text-cyan-300 text-xs mt-1">{agent.category}</Badge>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(agent.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`}
                    />
                  ))}
                </div>
                <span className="text-white font-semibold text-sm">{agent.rating}</span>
                <span className="text-white/60 text-xs">({agent.reviews})</span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 mb-4 text-xs text-white/60">
                <div className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {agent.downloads}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {agent.reviews} reviews
                </div>
              </div>

              {/* Price */}
              <div className="text-white font-bold text-xl mb-4">${agent.price}</div>

              {/* Description */}
              <p className="text-white/70 text-sm mb-4">{agent.description}</p>

              {/* Expanded Details */}
              {selectedAgent?.id === agent.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-4 border-t border-white/10 space-y-3"
                >
                  <div>
                    <p className="text-white/60 text-xs mb-2">Key Features</p>
                    <div className="space-y-1">
                      {agent.features.map((feat, i) => (
                        <p key={i} className="text-white/80 text-sm">
                          ✓ {feat}
                        </p>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 mt-3">
                    <Download className="w-4 h-4 mr-2" /> Install Agent
                  </Button>
                </motion.div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}