import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Settings, Grid3x3, Save } from 'lucide-react';

export default function CustomizableDashboardBuilder() {
  const [widgets, setWidgets] = useState([
    { id: 1, title: 'Portfolio Performance', type: 'chart', size: 'large', pinned: true },
    { id: 2, title: 'Real-time Alerts', type: 'list', size: 'medium', pinned: true },
    { id: 3, title: 'Market Sentiment', type: 'gauge', size: 'small', pinned: false },
  ]);
  const [editMode, setEditMode] = useState(false);

  const availableWidgets = [
    { type: 'chart', name: 'Performance Chart' },
    { type: 'gauge', name: 'Sentiment Gauge' },
    { type: 'list', name: 'Alerts List' },
    { type: 'kpi', name: 'KPI Card' },
    { type: 'calendar', name: 'Event Calendar' },
    { type: 'heatmap', name: 'Correlation Map' },
  ];

  const handleAddWidget = (widgetType) => {
    setWidgets([...widgets, {
      id: Date.now(),
      title: `New ${widgetType}`,
      type: widgetType,
      size: 'medium',
      pinned: false,
    }]);
  };

  const handleRemoveWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const handlePinWidget = (id) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, pinned: !w.pinned } : w));
  };

  const pinnedWidgets = widgets.filter(w => w.pinned);
  const unpinnedWidgets = widgets.filter(w => !w.pinned);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Customizable Dashboard</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setEditMode(!editMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
            editMode
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
              : 'bg-white/10 border-white/20 text-white/80'
          }`}
        >
          <Grid3x3 className="w-4 h-4" />
          {editMode ? 'Done Editing' : 'Edit Layout'}
        </motion.button>
      </div>

      {/* Pinned Widgets */}
      <div className="space-y-2">
        <p className="text-white/60 text-sm font-semibold">Pinned Widgets</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pinnedWidgets.map(widget => (
            <motion.div
              key={widget.id}
              whileHover={editMode ? { scale: 1.02 } : {}}
              className="bg-white/5 border border-cyan-400/50 rounded-lg p-6 relative group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-bold">{widget.title}</p>
                  <p className="text-white/60 text-xs mt-1">{widget.type}</p>
                </div>
                {editMode && (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handlePinWidget(widget.id)}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      📌
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleRemoveWidget(widget.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}
              </div>
              <div className="mt-4 h-24 bg-white/5 rounded flex items-center justify-center text-white/40">
                {widget.type} visualization
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Unpinned Widgets */}
      <div className="space-y-2">
        <p className="text-white/60 text-sm font-semibold">Other Widgets</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {unpinnedWidgets.map(widget => (
            <motion.div
              key={widget.id}
              whileHover={editMode ? { scale: 1.02 } : {}}
              className="bg-white/5 border border-white/10 rounded-lg p-4 relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">{widget.title}</p>
                  <p className="text-white/60 text-xs">{widget.type}</p>
                </div>
                {editMode && (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handlePinWidget(widget.id)}
                      className="text-white/60 hover:text-white"
                    >
                      📌
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleRemoveWidget(widget.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}
              </div>
              <div className="mt-2 h-16 bg-white/5 rounded flex items-center justify-center text-white/30 text-xs">
                {widget.type}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Widgets */}
      {editMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-lg p-6"
        >
          <p className="text-white font-bold mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Widgets
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableWidgets.map(widget => (
              <motion.button
                key={widget.type}
                whileHover={{ y: -2 }}
                onClick={() => handleAddWidget(widget.type)}
                className="p-3 bg-white/10 border border-white/20 rounded-lg hover:border-cyan-400 hover:bg-cyan-500/10 transition-all text-left"
              >
                <p className="text-white text-sm font-semibold">{widget.name}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Save Button */}
      {editMode && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500/20 border border-green-400 rounded-lg text-green-300 hover:bg-green-500/30 transition-all"
        >
          <Save className="w-4 h-4" />
          Save Dashboard Layout
        </motion.button>
      )}
    </div>
  );
}