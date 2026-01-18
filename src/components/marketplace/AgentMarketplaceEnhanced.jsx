import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Download, ShoppingCart, MessageCircle } from 'lucide-react';

export default function AgentMarketplaceEnhanced() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    loadMarketplaceAgents();
  }, []);

  const loadMarketplaceAgents = () => {
    const mockAgents = [
      {
        id: 1,
        name: 'Financial Analyst Pro',
        creator: 'Alice Markets',
        description: 'Advanced financial analysis and market predictions',
        rating: 4.8,
        reviews: 342,
        downloads: 2840,
        price: '49',
        tags: ['finance', 'analysis', 'ml'],
        verified: true,
        featured: true
      },
      {
        id: 2,
        name: 'Data Quality Inspector',
        creator: 'DataGurus Inc',
        description: 'Automated data quality validation and reporting',
        rating: 4.6,
        reviews: 189,
        downloads: 1560,
        price: '29',
        tags: ['data', 'validation', 'qa'],
        verified: true,
        featured: false
      },
      {
        id: 3,
        name: 'Content Creator Bot',
        creator: 'Creative Labs',
        description: 'AI-powered content generation across multiple formats',
        rating: 4.9,
        reviews: 512,
        downloads: 4230,
        price: '0',
        tags: ['content', 'creative', 'automation'],
        verified: true,
        featured: true
      }
    ];
    setAgents(mockAgents);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2">Agent Marketplace</h2>
        <p className="text-white/60">Discover, review, and deploy verified AI agents</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent, idx) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-black/40 border-white/10 p-6 hover:border-white/30 transition-all flex flex-col h-full">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                  <p className="text-white/60 text-sm">by {agent.creator}</p>
                </div>
                {agent.verified && (
                  <Badge className="bg-green-500/20 text-green-400 border-0">Verified</Badge>
                )}
              </div>

              {/* Description */}
              <p className="text-white/70 text-sm mb-4 flex-grow">{agent.description}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(agent.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-white/20'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-white text-sm font-semibold">{agent.rating}</span>
                <span className="text-white/60 text-sm">({agent.reviews})</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {agent.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-white/60 text-sm mb-4">
                <span className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  {agent.downloads}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedAgent(agent)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Reviews
                </Button>
                <Button 
                  size="sm"
                  className="flex-1 bg-purple-500 hover:bg-purple-600"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {agent.price === '0' ? 'Deploy' : 'Buy'}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}