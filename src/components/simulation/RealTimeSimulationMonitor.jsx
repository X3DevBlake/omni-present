import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, SkipBack } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export default function RealTimeSimulationMonitor({ simulation }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [agentStates, setAgentStates] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => prev + (0.1 * playbackSpeed));
      
      // Simulate agent activity
      setAgentStates([
        { id: 1, name: 'Agent Alpha', action: 'Exploring', x: Math.random() * 100, y: Math.random() * 100 },
        { id: 2, name: 'Agent Beta', action: 'Gathering', x: Math.random() * 100, y: Math.random() * 100 },
        { id: 3, name: 'Agent Gamma', action: 'Building', x: Math.random() * 100, y: Math.random() * 100 },
      ]);

      if (Math.random() > 0.9) {
        setEvents(prev => [...prev, {
          time: currentTime,
          type: ['decision', 'interaction', 'task_complete'][Math.floor(Math.random() * 3)],
          agent: ['Agent Alpha', 'Agent Beta', 'Agent Gamma'][Math.floor(Math.random() * 3)],
        }].slice(-20));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, currentTime]);

  const stepForward = () => {
    setCurrentTime(prev => prev + 1);
  };

  const stepBackward = () => {
    setCurrentTime(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4">Real-Time Simulation Monitor</h3>

      {/* Playback Controls */}
      <div className="bg-black/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentTime(0)}
              size="sm"
              variant="ghost"
              className="text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              onClick={stepBackward}
              size="sm"
              variant="ghost"
              className="text-white"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-cyan-500/20 hover:bg-cyan-500/30"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              onClick={stepForward}
              size="sm"
              variant="ghost"
              className="text-white"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-white font-mono">{currentTime.toFixed(1)}s</div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Playback Speed</span>
            <span className="text-cyan-400 text-sm">{playbackSpeed}x</span>
          </div>
          <Slider
            value={[playbackSpeed]}
            onValueChange={([v]) => setPlaybackSpeed(v)}
            min={0.1}
            max={5}
            step={0.1}
          />
        </div>
      </div>

      {/* Live Visualization */}
      <div className="bg-black/20 rounded-lg p-4 mb-6 h-64 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5" />
        {agentStates.map(agent => (
          <motion.div
            key={agent.id}
            animate={{ left: `${agent.x}%`, top: `${agent.y}%` }}
            className="absolute w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
            title={`${agent.name}: ${agent.action}`}
          >
            {agent.id}
          </motion.div>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-cyan-400">{agentStates.length}</div>
          <div className="text-white/60 text-xs">Active Agents</div>
        </div>
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{events.length}</div>
          <div className="text-white/60 text-xs">Events</div>
        </div>
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">{(Math.random() * 100).toFixed(0)}%</div>
          <div className="text-white/60 text-xs">Efficiency</div>
        </div>
      </div>

      {/* Event Log */}
      <div className="bg-black/20 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3">Event Timeline</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {events.slice(-5).reverse().map((event, i) => (
            <div key={i} className="text-sm flex items-center gap-2">
              <span className="text-cyan-400 font-mono">{event.time.toFixed(1)}s</span>
              <span className="text-white/60">{event.agent}</span>
              <span className="text-white capitalize">{event.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}