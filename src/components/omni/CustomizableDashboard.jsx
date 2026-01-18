import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Activity, AlertTriangle, X, Plus } from 'lucide-react';

export default function CustomizableDashboard({ userRole, onClose }) {
  const [widgets, setWidgets] = useState([
    { id: 'cost', title: 'Cost Management', icon: DollarSign, enabled: true, role: ['devops', 'executive'] },
    { id: 'anomaly', title: 'Anomaly Detection', icon: AlertTriangle, enabled: true, role: ['developer', 'devops'] },
    { id: 'performance', title: 'Performance Metrics', icon: TrendingUp, enabled: true, role: ['developer', 'devops', 'data_scientist'] },
    { id: 'health', title: 'System Health', icon: Activity, enabled: true, role: ['devops', 'executive'] }
  ]);



  const toggleWidget = (id) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Customize Dashboard</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 text-white/70 text-sm">
          Toggle to show/hide
        </div>

        <div className="space-y-3">
          {widgets.map((widget) => {
            const Icon = widget.icon;
            return (
              <div
                key={widget.id}
                className="p-4 rounded-xl border bg-white/5 border-white/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium">{widget.title}</span>
                    <span className="text-xs text-white/50">
                      {widget.role.join(', ')}
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={widget.enabled}
                      onChange={() => toggleWidget(widget.id)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-white/70 text-sm">Show</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        <button className="mt-6 w-full py-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Add Custom Widget
        </button>
      </motion.div>
    </motion.div>
  );
}