import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SocialDynamicsViewer({ simulationId }) {
  const [dynamics, setDynamics] = useState(null);

  useEffect(() => {
    loadDynamics();
    const interval = setInterval(loadDynamics, 10000);
    return () => clearInterval(interval);
  }, [simulationId]);

  const loadDynamics = async () => {
    const models = await base44.entities.SocialDynamicsModel.list({ simulation_id: simulationId }, '-created_date', 1);
    if (models.length > 0) setDynamics(models[0]);
  };

  if (!dynamics) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-lg p-4">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-cyan-400" />
        Social Dynamics
      </h3>
      
      <div className="space-y-3">
        <div className="bg-white/5 rounded p-3">
          <p className="text-white/60 text-xs mb-1">Crowd Sentiment</p>
          <p className="text-cyan-400 font-bold">{dynamics.crowd_behavior?.sentiment}</p>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
            <div>
              <p className="text-white/60">Cohesion</p>
              <p className="text-green-400">{(dynamics.crowd_behavior?.cohesion * 100).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-white/60">Volatility</p>
              <p className="text-orange-400">{(dynamics.crowd_behavior?.volatility * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>

        {dynamics.emergent_groups?.length > 0 && (
          <div className="bg-white/5 rounded p-3">
            <p className="text-white/60 text-xs mb-2">Emergent Groups</p>
            {dynamics.emergent_groups.map((group, i) => (
              <div key={i} className="mb-2 last:mb-0">
                <p className="text-white text-sm font-semibold">{group.group_name}</p>
                <p className="text-white/60 text-xs">{group.members?.length} members</p>
              </div>
            ))}
          </div>
        )}

        {dynamics.social_trends?.length > 0 && (
          <div className="bg-white/5 rounded p-3">
            <p className="text-white/60 text-xs mb-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Trending Topics
            </p>
            <div className="flex flex-wrap gap-1">
              {dynamics.social_trends.map((trend, i) => (
                <span key={i} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                  {trend}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}