import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Calendar, AlertCircle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function MaintenanceSchedule() {
  const schedules = [
    { id: 1, device: 'Omni-Core Pro', task: 'Sensor Calibration', dueDate: '2026-01-15', priority: 'high' },
    { id: 2, device: 'Neural Sensor', task: 'Firmware Check', dueDate: '2026-01-20', priority: 'medium' },
    { id: 3, device: 'Vision Module', task: 'Lens Cleaning', dueDate: '2026-01-25', priority: 'low' }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Maintenance Schedule</h1>
          <p className="text-white/60">Plan and track service intervals</p>
        </motion.div>

        <div className="space-y-4">
          {schedules.map((schedule, i) => (
            <motion.div key={schedule.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    schedule.priority === 'high' ? 'bg-red-500/20' :
                    schedule.priority === 'medium' ? 'bg-yellow-500/20' :
                    'bg-green-500/20'
                  }`}>
                    <Wrench className={`w-6 h-6 ${
                      schedule.priority === 'high' ? 'text-red-400' :
                      schedule.priority === 'medium' ? 'text-yellow-400' :
                      'text-green-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">{schedule.device}</h3>
                    <p className="text-white/60 text-sm">{schedule.task}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white/60 text-sm flex items-center gap-1 mb-1">
                    <Calendar className="w-4 h-4" />
                    {schedule.dueDate}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    schedule.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    schedule.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {schedule.priority}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}