import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus, Trash2 } from 'lucide-react';

export default function DynamicEventControls({ onEventTrigger }) {
  const [events, setEvents] = useState([
    { id: 1, type: 'resource_scarcity', severity: 70, active: false },
    { id: 2, type: 'unexpected_challenge', severity: 50, active: false }
  ]);
  const [newEvent, setNewEvent] = useState({ type: '', severity: 50 });

  const eventTypes = [
    'resource_scarcity',
    'unexpected_challenge',
    'collaboration_bonus',
    'time_pressure',
    'knowledge_gap'
  ];

  const toggleEvent = (eventId) => {
    const updated = events.map(e => 
      e.id === eventId ? { ...e, active: !e.active } : e
    );
    setEvents(updated);
    const event = updated.find(e => e.id === eventId);
    if (event.active) {
      onEventTrigger?.(event);
    }
  };

  const addEvent = () => {
    if (!newEvent.type) return;
    const event = {
      id: Date.now(),
      ...newEvent,
      active: false
    };
    setEvents([...events, event]);
    setNewEvent({ type: '', severity: 50 });
  };

  const removeEvent = (eventId) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  return (
    <div className="space-y-3">
      <h4 className="text-white font-bold text-sm flex items-center gap-2">
        <Zap className="w-4 h-4 text-yellow-400" />
        Dynamic Events
      </h4>

      <div className="space-y-2">
        {events.map(event => (
          <div key={event.id} className="p-3 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm capitalize">{event.type.replace(/_/g, ' ')}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleEvent(event.id)}
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    event.active 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {event.active ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => removeEvent(event.id)}>
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-xs">Severity:</span>
              <div className="flex-1 h-1 bg-black/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-red-400"
                  style={{ width: `${event.severity}%` }}
                />
              </div>
              <span className="text-yellow-400 text-xs font-bold">{event.severity}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
        <p className="text-white/70 text-xs mb-2">Add New Event:</p>
        <div className="flex gap-2 mb-2">
          <select
            value={newEvent.type}
            onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
            className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
          >
            <option value="">Select type...</option>
            {eventTypes.map(type => (
              <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={addEvent}
            className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded text-green-400 font-semibold text-xs flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add
          </motion.button>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={newEvent.severity}
          onChange={(e) => setNewEvent({ ...newEvent, severity: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
}