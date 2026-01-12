import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CollaborativeOpportunityDetector() {
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    detectOpportunities();
    const interval = setInterval(detectOpportunities, 30000);
    return () => clearInterval(interval);
  }, []);

  const detectOpportunities = async () => {
    const agents = await base44.entities.HolographicAgent.list();
    
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze agent skills and identify collaboration opportunities:
${agents.map(a => `${a.name}: ${JSON.stringify(a.capabilities)}`).join('\n')}

Find complementary skill sets and suggest collaborative tasks.`,
      response_json_schema: {
        type: 'object',
        properties: {
          opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                agents: { type: 'array' },
                synergy_score: { type: 'number' },
                benefit: { type: 'string' }
              }
            }
          }
        }
      }
    });

    setOpportunities(result.opportunities || []);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-400" />
        Collaboration Opportunities
      </h3>

      <div className="space-y-3">
        {opportunities.slice(0, 4).map((opp, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-semibold text-sm">{opp.title}</p>
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-bold">
                {opp.synergy_score}/100
              </span>
            </div>
            <p className="text-white/60 text-xs mb-2">{opp.benefit}</p>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-cyan-400" />
              <span className="text-cyan-400 text-xs">{opp.agents?.length} agents</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}