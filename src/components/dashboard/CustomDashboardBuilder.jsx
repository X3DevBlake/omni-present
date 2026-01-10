import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Settings, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function CustomDashboardBuilder({ userId }) {
  const [dashboards, setDashboards] = useState([]);
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [widgets, setWidgets] = useState([]);

  const availableWidgets = [
    { id: 'portfolio-3d', name: 'Financial Galaxy 3D', icon: '🌌' },
    { id: 'spending-cityscape', name: 'Transaction Cityscape 3D', icon: '🏙️' },
    { id: 'market-map', name: 'Global Market Map 3D', icon: '🌍' },
    { id: 'sentiment-chart', name: 'Sentiment Analysis', icon: '📊' },
    { id: 'agent-collaboration', name: 'Agent Network', icon: '🤝' },
    { id: 'goals-tracker', name: 'Goals Progress', icon: '🎯' }
  ];

  const handleAddWidget = (widget) => {
    setWidgets([...widgets, { ...widget, instanceId: Math.random() }]);
  };

  const handleRemoveWidget = (instanceId) => {
    setWidgets(widgets.filter(w => w.instanceId !== instanceId));
  };

  const handleSaveDashboard = async () => {
    // Save dashboard configuration
    if (selectedDashboard) {
      // Update existing
    } else {
      // Create new
      setDashboards([...dashboards, { id: Math.random(), name: 'New Dashboard', widgets }]);
    }
    setIsCreating(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-cyan-400" />
            Custom Dashboard Builder
          </h2>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-gradient-to-r from-cyan-500 to-purple-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isCreating ? 'Cancel' : 'New Dashboard'}
          </Button>
        </div>
      </motion.div>

      <Tabs defaultValue="dashboards" className="w-full">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="dashboards">My Dashboards</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboards" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboards.map((dashboard) => (
              <motion.div
                key={dashboard.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-cyan-500/30 hover:border-cyan-400/60 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-white font-bold text-lg">{dashboard.name}</h3>
                  <Eye className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-white/60 text-sm mb-4">{dashboard.widgets?.length || 0} widgets</p>
                <Button variant="outline" size="sm" className="w-full">
                  View Dashboard
                </Button>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="builder" className="mt-6">
          <AnimatePresence>
            {isCreating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 mb-6"
              >
                <h3 className="text-white font-bold text-lg mb-4">Available Widgets</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {availableWidgets.map((widget) => (
                    <motion.button
                      key={widget.id}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleAddWidget(widget)}
                      className="p-4 rounded-lg bg-white/5 border border-white/20 hover:border-cyan-400/50 text-center transition-all"
                    >
                      <div className="text-3xl mb-2">{widget.icon}</div>
                      <div className="text-white font-semibold text-sm">{widget.name}</div>
                    </motion.button>
                  ))}
                </div>

                {widgets.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3">Selected Widgets</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                      {widgets.map((widget) => (
                        <motion.div
                          key={widget.instanceId}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="p-3 rounded-lg bg-white/10 border border-green-500/30 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{widget.icon}</span>
                            <span className="text-white text-sm">{widget.name}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveWidget(widget.instanceId)}
                            className="p-1 hover:bg-red-500/20 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </button>
                        </motion.div>
                      ))}
                    </div>

                    <Button
                      onClick={handleSaveDashboard}
                      className="w-full bg-gradient-to-r from-green-500 to-cyan-500 text-white font-semibold"
                    >
                      Save Dashboard
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}