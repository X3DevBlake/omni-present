import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Clock, Users, Loader } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { scheduleVideoCallWithCalendar } from '../../functions/video/video-call-orchestration';

export default function GoogleCalendarIntegration() {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Portfolio Review',
      date: '2026-01-15',
      time: '14:00',
      participants: [{ name: 'Financial Advisor', email: 'advisor@example.com' }],
      duration: 60,
      status: 'scheduled',
    },
  ]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    duration: 60,
    participants: [],
  });
  const [scheduling, setScheduling] = useState(false);
  const [participantEmail, setParticipantEmail] = useState('');

  const addParticipant = () => {
    if (!participantEmail) return;
    setNewEvent(prev => ({
      ...prev,
      participants: [...prev.participants, { email: participantEmail, name: participantEmail }],
    }));
    setParticipantEmail('');
  };

  const scheduleCall = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;

    setScheduling(true);
    try {
      const result = await scheduleVideoCallWithCalendar({
        title: newEvent.title,
        description: 'Financial consultation video call',
        date: newEvent.date,
        time: newEvent.time,
        duration: newEvent.duration,
        participants: newEvent.participants,
        videoLink: `https://zoom.us/j/${Date.now()}`,
      });

      setEvents(prev => [...prev, {
        id: Date.now(),
        ...newEvent,
        status: 'scheduled',
      }]);

      setNewEvent({ title: '', date: '', time: '', duration: 60, participants: [] });
    } catch (error) {
      console.error('Error scheduling call:', error);
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Schedule New Call */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3"
      >
        <p className="text-white font-bold text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Schedule Video Call
        </p>

        <input
          type="text"
          value={newEvent.title}
          onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Call title (e.g., Portfolio Review)"
          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/40 text-sm"
          disabled={scheduling}
        />

        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
            className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
            disabled={scheduling}
          />
          <input
            type="time"
            value={newEvent.time}
            onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
            className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
            disabled={scheduling}
          />
        </div>

        {/* Add Participants */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="email"
              value={participantEmail}
              onChange={(e) => setParticipantEmail(e.target.value)}
              placeholder="Add participant email..."
              className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/40 text-sm"
              disabled={scheduling}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={addParticipant}
              disabled={!participantEmail || scheduling}
              className="px-3 py-2 bg-cyan-500/20 border border-cyan-400 rounded text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 text-sm"
            >
              Add
            </motion.button>
          </div>

          {newEvent.participants.length > 0 && (
            <div className="space-y-1">
              {newEvent.participants.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white/10 rounded px-2 py-1 text-xs">
                  <p className="text-white">{p.email}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setNewEvent(prev => ({
                      ...prev,
                      participants: prev.participants.filter((_, i) => i !== idx),
                    }))}
                    className="text-red-400 hover:text-red-300"
                  >
                    ✕
                  </motion.button>
                </div>
              ))}
            </div>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={scheduleCall}
          disabled={!newEvent.title || !newEvent.date || !newEvent.time || scheduling}
          className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-semibold"
        >
          {scheduling ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Scheduling...
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4" />
              Schedule Call
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Upcoming Events */}
      <div className="space-y-2">
        <p className="text-white font-bold text-sm">Upcoming Calls</p>
        {events.map(event => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-lg p-3"
          >
            <p className="text-white font-semibold text-sm">{event.title}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-white/60">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {event.date}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {event.time}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {event.participants.length + 1}
              </div>
            </div>
            <div className="mt-2 flex gap-1 flex-wrap">
              {event.participants.slice(0, 2).map((p, idx) => (
                <span key={idx} className="text-xs px-2 py-0.5 bg-cyan-500/20 rounded text-cyan-300">
                  {p.name}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}