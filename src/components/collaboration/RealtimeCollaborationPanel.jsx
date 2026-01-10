import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Edit, Eye } from 'lucide-react';

export default function RealtimeCollaborationPanel() {
  const [collaborators, setCollaborators] = useState([
    { id: 1, name: 'Alice', status: 'editing', color: '#00f5ff' },
    { id: 2, name: 'Bob', status: 'viewing', color: '#a855f7' },
    { id: 3, name: 'Charlie', status: 'editing', color: '#10b981' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCollaborators(prev => prev.map(c => ({
        ...c,
        status: Math.random() > 0.5 ? 'editing' : 'viewing'
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Users className="w-6 h-6 text-cyan-400" />
        Real-Time Collaboration
      </h3>

      <div className="space-y-3">
        {collaborators.map((collab) => (
          <motion.div
            key={collab.id}
            layout
            className="bg-black/20 rounded-lg p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: collab.color }}
              >
                {collab.name[0]}
              </div>
              <div>
                <div className="text-white font-medium">{collab.name}</div>
                <div className="text-white/60 text-xs flex items-center gap-1">
                  {collab.status === 'editing' ? (
                    <><Edit className="w-3 h-3" /> Editing</>
                  ) : (
                    <><Eye className="w-3 h-3" /> Viewing</>
                  )}
                </div>
              </div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: collab.color }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}