import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Calendar, Filter, Download } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function ActivityLog() {
  const [activities, setActivities] = useState([]);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const mockActivities = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      type: ['login', 'device', 'agent', 'simulation', 'purchase'][Math.floor(Math.random() * 5)],
      action: ['Created agent', 'Started simulation', 'Updated device', 'Logged in', 'Made purchase'][Math.floor(Math.random() * 5)],
      details: 'Additional context about this action',
      timestamp: new Date(Date.now() - i * 3600000),
      ip: '192.168.1.' + Math.floor(Math.random() * 255),
      location: 'San Francisco, CA'
    }));
    setActivities(mockActivities);
  }, []);

  const filteredActivities = filterType === 'all'
    ? activities
    : activities.filter(a => a.type === filterType);

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <Activity className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Activity Log</h1>
                <p className="text-white/60">Track all account activity</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-300 rounded-xl text-sm hover:bg-green-500/30 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          <div className="flex gap-2">
            {['all', 'login', 'device', 'agent', 'simulation', 'purchase'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-xl text-sm capitalize ${
                  filterType === type
                    ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="space-y-3">
          {filteredActivities.map((activity, i) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activity.type === 'login' ? 'bg-green-500/20' :
                    activity.type === 'device' ? 'bg-cyan-500/20' :
                    activity.type === 'agent' ? 'bg-purple-500/20' :
                    activity.type === 'simulation' ? 'bg-blue-500/20' :
                    'bg-yellow-500/20'
                  }`}>
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{activity.action}</h3>
                    <p className="text-white/60 text-sm mb-2">{activity.details}</p>
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <span>{activity.timestamp.toLocaleString()}</span>
                      <span>IP: {activity.ip}</span>
                      <span>{activity.location}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs capitalize ${
                  activity.type === 'login' ? 'bg-green-500/20 text-green-300' :
                  activity.type === 'device' ? 'bg-cyan-500/20 text-cyan-300' :
                  activity.type === 'agent' ? 'bg-purple-500/20 text-purple-300' :
                  activity.type === 'simulation' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {activity.type}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}