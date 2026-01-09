import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function EventsCalendar() {
  const events = [
    { id: 1, title: 'AI Summit 2026', date: '2026-02-15', time: '9:00 AM', location: 'Virtual', type: 'Conference' },
    { id: 2, title: 'Agent Training Workshop', date: '2026-01-20', time: '2:00 PM', location: 'San Francisco', type: 'Workshop' },
    { id: 3, title: 'Campus Meetup', date: '2026-01-18', time: '6:00 PM', location: 'Virtual', type: 'Meetup' }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Events Calendar</h1>
          <p className="text-white/60">Upcoming conferences, workshops, and meetups</p>
        </motion.div>

        <div className="grid gap-6">
          {events.map((event, i) => (
            <motion.div key={event.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-black/50 transition-all cursor-pointer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">{event.type}</span>
                  </div>
                  <h3 className="text-white font-bold text-xl mb-3">{event.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </span>
                  </div>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:opacity-90">
                  Register
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}