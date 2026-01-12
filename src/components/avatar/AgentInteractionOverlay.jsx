import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, ThumbsUp, MessageCircle, Sparkles } from 'lucide-react';
import { useAvatar } from './AvatarContext';

const GESTURE_ICONS = {
  waving: Hand,
  thumbsup: ThumbsUp,
  nodding: MessageCircle,
  celebrating: Sparkles
};

export default function AgentInteractionOverlay({ agents }) {
  const { triggerGesture } = useAvatar();
  const [activeGestures, setActiveGestures] = useState({});

  useEffect(() => {
    // Monitor gesture queues and display them
    agents.forEach(agent => {
      if (agent.gesture_queue?.length > 0) {
        const latestGesture = agent.gesture_queue[agent.gesture_queue.length - 1];
        const timeSince = Date.now() - new Date(latestGesture.trigger_time).getTime();
        
        if (timeSince < 3000) { // Show gesture for 3 seconds
          setActiveGestures(prev => ({
            ...prev,
            [agent.id]: latestGesture.gesture_type
          }));

          setTimeout(() => {
            setActiveGestures(prev => {
              const updated = { ...prev };
              delete updated[agent.id];
              return updated;
            });
          }, 3000 - timeSince);
        }
      }
    });
  }, [agents]);

  const handleGestureClick = (agentId, gesture) => {
    triggerGesture(agentId, gesture);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
      <div className="flex items-center justify-between mb-2">
        <p className="text-white text-xs font-semibold">
          {agents.length} Agent{agents.length !== 1 ? 's' : ''} Nearby
        </p>
      </div>

      <div className="space-y-2 max-h-32 overflow-y-auto">
        {agents.slice(0, 3).map(agent => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <p className="text-white text-xs font-medium truncate max-w-[120px]">
                  {agent.avatar_name || 'Agent'}
                </p>
              </div>

              {/* Gesture Display */}
              <AnimatePresence>
                {activeGestures[agent.id] && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-1"
                  >
                    {React.createElement(GESTURE_ICONS[activeGestures[agent.id]] || Sparkles, {
                      className: "w-4 h-4 text-yellow-400"
                    })}
                    <span className="text-yellow-400 text-xs">
                      {activeGestures[agent.id]}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Gesture Triggers */}
            <div className="flex gap-1 mt-2">
              {['waving', 'thumbsup', 'nodding'].map(gesture => {
                const Icon = GESTURE_ICONS[gesture];
                return (
                  <button
                    key={gesture}
                    onClick={() => handleGestureClick(agent.id, gesture)}
                    className="p-1 bg-white/5 hover:bg-white/20 rounded transition-all"
                    title={`Trigger ${gesture}`}
                  >
                    <Icon className="w-3 h-3 text-white/60 hover:text-white" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {agents.length > 3 && (
        <p className="text-white/60 text-xs text-center mt-2">
          +{agents.length - 3} more agents
        </p>
      )}
    </div>
  );
}