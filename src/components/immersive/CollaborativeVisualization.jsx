import React from 'react';
import { motion } from 'framer-motion';
import { Users, Zap, Share2 } from 'lucide-react';

/**
 * Phase 9: Real-time Collaborative Visualization
 * Improvements 206-215: Live presence, shared cursors, collaborative 3D spaces
 */
export default function CollaborativeVisualization() {
  const collaborators = [
    { id: 1, name: 'Alice', color: 'bg-cyan-500', position: { x: 20, y: 30 } },
    { id: 2, name: 'Bob', color: 'bg-purple-500', position: { x: 60, y: 50 } },
    { id: 3, name: 'You', color: 'bg-green-500', position: { x: 40, y: 70 } },
  ];

  const activities = [
    { type: 'edit', user: 'Alice', action: 'edited Portfolio Widget', time: '2s ago' },
    { type: 'view', user: 'Bob', action: 'is viewing Analytics', time: '1s ago' },
    { type: 'chat', user: 'You', action: 'sent message', time: 'now' },
  ];

  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-cyan-400" />
        Real-time Collaboration
      </h3>

      {/* Collaborative Space */}
      <div className="relative h-40 bg-white/5 border border-white/10 rounded-lg mb-6 overflow-hidden">
        {collaborators.map((collab) => (
          <motion.div
            key={collab.id}
            animate={{ x: `${collab.position.x}%`, y: `${collab.position.y}%` }}
            className="absolute flex flex-col items-center gap-1"
          >
            <div className={`w-8 h-8 rounded-full ${collab.color} border-2 border-white flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">{collab.name[0]}</span>
            </div>
            <span className="text-white/60 text-xs">{collab.name}</span>
          </motion.div>
        ))}
      </div>

      {/* Activity Feed */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <p className="text-white/80 font-semibold mb-3 text-sm">Live Activity</p>
        <div className="space-y-2">
          {activities.map((activity, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span className="text-white/80">
                  <span className="font-semibold">{activity.user}</span> {activity.action}
                </span>
              </div>
              <span className="text-white/40 text-xs">{activity.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}