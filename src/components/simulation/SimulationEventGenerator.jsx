import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Zap, Trophy, Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SimulationEventGenerator({ agentStates = [] }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [simulationState, setSimulationState] = useState({
    time: 0,
    difficulty: 'medium',
    worldConditions: {}
  });

  const EVENT_TYPES = {
    challenge: { icon: '⚡', color: 'from-red-500/20 to-orange-500/20', label: 'Challenge' },
    opportunity: { icon: '💡', color: 'from-green-500/20 to-emerald-500/20', label: 'Opportunity' },
    discovery: { icon: '🔍', color: 'from-cyan-500/20 to-blue-500/20', label: 'Discovery' },
    hazard: { icon: '⚠️', color: 'from-yellow-500/20 to-orange-500/20', label: 'Hazard' },
    social: { icon: '🤝', color: 'from-purple-500/20 to-pink-500/20', label: 'Social Event' }
  };

  useEffect(() => {
    const generateEvents = async () => {
      if (agentStates.length === 0) return;

      setLoading(true);
      try {
        const prompt = `You are a simulation event generator for an AI agent environment.
        
Agent States: ${JSON.stringify(agentStates)}
Simulation Time: ${simulationState.time}
Difficulty: ${simulationState.difficulty}

Generate 2-4 events that would challenge or benefit these agents based on their personalities and current states.
Format as JSON array:
[
  {
    "type": "challenge|opportunity|discovery|hazard|social",
    "title": "Event title",
    "description": "What happens",
    "affectedAgents": ["agent_id"],
    "impact": "How it affects agents",
    "difficulty": "easy|medium|hard"
  }
]`;

        const response = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: 'object',
            properties: {
              events: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    affectedAgents: { type: 'array', items: { type: 'string' } },
                    impact: { type: 'string' },
                    difficulty: { type: 'string' }
                  }
                }
              }
            }
          }
        });

        const newEvents = (response.events || []).map((event, i) => ({
          ...event,
          id: `event_${Date.now()}_${i}`,
          timestamp: new Date().toLocaleTimeString(),
          active: true
        }));

        setEvents(prev => [
          ...newEvents,
          ...prev.slice(0, 9)
        ]);
      } catch (err) {
        console.error('Failed to generate events:', err);
      } finally {
        setLoading(false);
      }
    };

    const interval = setInterval(() => {
      setSimulationState(prev => ({ ...prev, time: prev.time + 1 }));
      generateEvents();
    }, 8000);

    return () => clearInterval(interval);
  }, [agentStates, simulationState.difficulty]);

  const resolveEvent = (eventId) => {
    setEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, active: false } : e
    ));
  };

  return (
    <div className="bg-black/40 border border-orange-500/30 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-400" />
          Dynamic Event Generator
        </h3>
        <span className="text-xs text-white/50">T: {simulationState.time}s</span>
      </div>

      {/* Difficulty Control */}
      <div className="space-y-2">
        <label className="text-white/60 text-xs">Simulation Difficulty</label>
        <select
          value={simulationState.difficulty}
          onChange={(e) => setSimulationState(prev => ({ ...prev, difficulty: e.target.value }))}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="extreme">Extreme</option>
        </select>
      </div>

      {/* Events List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-center py-4 text-white/40 text-xs">
            Waiting for events...
          </div>
        ) : (
          events.map(event => {
            const eventType = EVENT_TYPES[event.type] || EVENT_TYPES.discovery;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-gradient-to-r ${eventType.color} border border-white/10 rounded-lg p-3 transition-all ${
                  !event.active ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-lg">{eventType.icon}</span>
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">{event.title}</p>
                    <p className="text-white/70 text-xs">{event.description}</p>
                  </div>
                </div>

                <div className="space-y-1 mb-2">
                  <p className="text-white/60 text-xs">
                    <strong>Impact:</strong> {event.impact}
                  </p>
                  <div className="flex gap-1 flex-wrap">
                    {event.affectedAgents?.map(agent => (
                      <span key={agent} className="text-xs bg-white/10 px-2 py-0.5 rounded text-white/60">
                        {agent}
                      </span>
                    ))}
                  </div>
                </div>

                {event.active && (
                  <motion.button
                    onClick={() => resolveEvent(event.id)}
                    whileHover={{ scale: 1.05 }}
                    className="w-full py-1 text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded transition-all"
                  >
                    Resolve
                  </motion.button>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Active Events Count */}
      <div className="text-center text-white/60 text-xs">
        {events.filter(e => e.active).length} active event(s)
      </div>
    </div>
  );
}