import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Play, Pause, RotateCcw, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CollaborativeSimulation({ show, onClose, scenario }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [collaborators, setCollaborators] = useState([
    { id: 1, name: 'Alice', color: '#00f5ff', cursorPos: { x: 0, y: 0 } },
    { id: 2, name: 'Bob', color: '#a855f7', cursorPos: { x: 0, y: 0 } },
  ]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 0.1;
        if (next >= (scenario?.totalDuration || 100)) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });

      // Simulate events
      if (Math.random() > 0.95) {
        setEvents(prev => [...prev, {
          time: currentTime,
          type: ['agent_spawn', 'resource_depleted', 'milestone_reached'][Math.floor(Math.random() * 3)],
          description: 'Event occurred',
        }].slice(-10));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCollaborators(prev => prev.map(c => ({
        ...c,
        cursorPos: {
          x: Math.random() * 100,
          y: Math.random() * 100,
        }
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 max-w-6xl w-full max-h-[90vh]"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Collaborative Simulation</h2>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className={isPlaying ? 'bg-red-500/20 hover:bg-red-500/30' : 'bg-green-500/20 hover:bg-green-500/30'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button onClick={() => setCurrentTime(0)} variant="outline" className="border-white/20 text-white">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <div className="text-white font-mono">
              {currentTime.toFixed(1)}s / {scenario?.totalDuration || 100}s
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <div className="flex -space-x-2">
              {collaborators.map(c => (
                <div
                  key={c.id}
                  className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: c.color }}
                >
                  {c.name[0]}
                </div>
              ))}
            </div>
            <span className="text-white text-sm">{collaborators.length} collaborating</span>
          </div>
        </div>

        <div className="relative h-96 bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10" />
          
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
              style={{ width: `${(currentTime / (scenario?.totalDuration || 100)) * 100}%` }}
            />
          </div>

          {/* Collaborator cursors */}
          {collaborators.map(c => (
            <motion.div
              key={c.id}
              className="absolute w-4 h-4 rounded-full border-2 border-white pointer-events-none"
              style={{
                backgroundColor: c.color,
                left: `${c.cursorPos.x}%`,
                top: `${c.cursorPos.y}%`,
              }}
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              <div className="absolute left-full ml-2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {c.name}
              </div>
            </motion.div>
          ))}

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Video className="w-16 h-16 text-cyan-400 mx-auto mb-2" />
              <div className="text-white text-lg">Simulation Playback</div>
              <div className="text-white/60 text-sm">Real-time collaborative visualization</div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3">Event Timeline</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-white/40 text-sm">No events yet...</div>
            ) : (
              events.map((event, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="text-cyan-400 font-mono">{event.time.toFixed(1)}s</div>
                  <div className="text-white/80">{event.type}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}