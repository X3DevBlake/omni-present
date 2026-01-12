import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function RealTimeProgressSync() {
  const [collaborations, setCollaborations] = useState([]);
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => {
    loadCollaborations();
    
    const unsubscribe = base44.entities.AgentCollaboration.subscribe((event) => {
      if (event.type === 'create' || event.type === 'update') {
        loadCollaborations();
      }
    });

    return unsubscribe;
  }, []);

  const loadCollaborations = async () => {
    const collab = await base44.entities.AgentCollaboration.list('-created_date', 10);
    setCollaborations(collab);
    
    const conflicted = collab.filter(c => c.status === 'conflict');
    setConflicts(conflicted);
  };

  const resolveConflict = async (collabId) => {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: 'Suggest conflict resolution strategy for agent collaboration task overlap',
      response_json_schema: {
        type: 'object',
        properties: {
          strategy: { type: 'string' },
          reassignment: { type: 'object' }
        }
      }
    });

    await base44.entities.AgentCollaboration.update(collabId, {
      status: 'active',
      conflict_resolution: result.strategy
    });
    
    loadCollaborations();
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <RefreshCw className="w-5 h-5 text-green-400" />
        Progress Sync
      </h3>

      {conflicts.length > 0 && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-400/30 rounded">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <p className="text-red-400 font-semibold text-sm">{conflicts.length} Conflicts Detected</p>
          </div>
          {conflicts.map(conflict => (
            <div key={conflict.id} className="mb-2">
              <p className="text-white/80 text-xs mb-1">{conflict.collaboration_name}</p>
              <button
                onClick={() => resolveConflict(conflict.id)}
                className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs"
              >
                Auto-Resolve
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {collaborations.filter(c => c.status === 'active').map(collab => (
          <div key={collab.id} className="bg-white/5 rounded p-2">
            <div className="flex justify-between items-center">
              <p className="text-white text-sm">{collab.collaboration_name}</p>
              <div className="w-16 bg-white/10 rounded-full h-1.5">
                <div className="bg-green-400 h-1.5 rounded-full" style={{ width: `${collab.progress || 0}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}