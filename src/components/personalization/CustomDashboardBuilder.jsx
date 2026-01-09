import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout, Plus, Trash2, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomDashboardBuilder() {
  const [widgets, setWidgets] = useState([
    { id: 1, name: 'Portfolio Balance', type: 'chart' },
    { id: 2, name: 'Recent Transactions', type: 'list' },
    { id: 3, name: 'Market Overview', type: 'chart' }
  ]);
  const [availableWidgets] = useState([
    { name: 'Portfolio Balance', type: 'chart' },
    { name: 'Price Charts', type: 'chart' },
    { name: 'Transaction History', type: 'list' },
    { name: 'Market News', type: 'news' },
    { name: 'AI Recommendations', type: 'ai' },
    { name: 'Account Stats', type: 'stats' }
  ]);

  const addWidget = (widget) => {
    const newWidget = { ...widget, id: Date.now() };
    setWidgets(prev => [...prev, newWidget]);
    toast.success(`Added ${widget.name}`);
  };

  const removeWidget = (id) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div className="bg-black/40 border border-cyan-500/30 rounded-2xl p-6 space-y-4">
      <h3 className="text-white font-bold flex items-center gap-2">
        <Layout className="w-5 h-5 text-cyan-400" />
        Customize Dashboard
      </h3>

      <div>
        <p className="text-white/70 text-sm font-bold mb-2">Current Widgets: {widgets.length}</p>
        <div className="space-y-2">
          {widgets.map(widget => (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between"
            >
              <div>
                <p className="text-white font-bold text-sm">{widget.name}</p>
                <p className="text-white/60 text-xs capitalize">{widget.type}</p>
              </div>
              <motion.button
                onClick={() => removeWidget(widget.id)}
                whileHover={{ scale: 1.1 }}
                className="p-2 hover:bg-red-500/20 text-red-400 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <p className="text-white/70 text-sm font-bold mb-2">Available Widgets</p>
        <div className="grid grid-cols-2 gap-2">
          {availableWidgets
            .filter(w => !widgets.find(existing => existing.name === w.name))
            .map((widget, i) => (
              <motion.button
                key={i}
                onClick={() => addWidget(widget)}
                whileHover={{ scale: 1.05 }}
                className="py-2 px-3 text-xs bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded hover:bg-cyan-500/30 transition-all flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3" />
                {widget.name}
              </motion.button>
            ))}
        </div>
      </div>
    </div>
  );
}