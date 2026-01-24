import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid, Grid3x3, Palette } from 'lucide-react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ProactiveAnomalyDetector3D from './ProactiveAnomalyDetector3D';
import GeopoliticalPredictor3D from './GeopoliticalPredictor3D';
import SystemHealthOverview from './SystemHealthOverview';
import EmergentGoalVisualizer3D from './EmergentGoalVisualizer3D';

export default function DashboardWidgetManager({ componentType = 'neural_alignment' }) {
  const [activeWidgets, setActiveWidgets] = useState([
    { id: 'health', component: 'SystemHealthOverview', enabled: true },
    { id: 'anomaly', component: 'ProactiveAnomalyDetector3D', enabled: true }
  ]);

  const availableWidgets = {
    neural_alignment: ['Neural Manifold', 'Phi Calculator', 'Telepathy Monitor'],
    sentient_finance: ['SystemHealthOverview', 'ProactiveAnomalyDetector3D', 'GeopoliticalPredictor3D'],
    haas_swarm: ['EmergentGoalVisualizer3D', 'RecursiveHAASMonitor3D'],
    all: ['SystemHealthOverview', 'ProactiveAnomalyDetector3D', 'GeopoliticalPredictor3D', 'EmergentGoalVisualizer3D']
  };

  const [theme, setTheme] = useState('finance_emerald');

  const themeColors = {
    neural_purple: 'from-purple-950 to-indigo-950',
    finance_emerald: 'from-emerald-950 to-teal-950',
    aether_cyan: 'from-cyan-950 to-blue-950',
    swarm_indigo: 'from-indigo-950 to-violet-950'
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(activeWidgets);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    
    setActiveWidgets(items);
  };

  const widgetComponents = {
    SystemHealthOverview: <SystemHealthOverview />,
    ProactiveAnomalyDetector3D: <ProactiveAnomalyDetector3D />,
    GeopoliticalPredictor3D: <GeopoliticalPredictor3D />,
    EmergentGoalVisualizer3D: <EmergentGoalVisualizer3D />
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeColors[theme]} p-6`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Custom Dashboard</h2>
            <p className="text-gray-400">Drag widgets to rearrange • Click to configure</p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                const themes = Object.keys(themeColors);
                const currentIdx = themes.indexOf(theme);
                setTheme(themes[(currentIdx + 1) % themes.length]);
              }}
              className="border-white/30 text-white"
            >
              <Palette className="w-4 h-4 mr-2" />
              Change Theme
            </Button>
            <Badge className="bg-white/20 text-white px-4 py-2">
              {activeWidgets.filter(w => w.enabled).length} active widgets
            </Badge>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="widgets">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {activeWidgets.filter(w => w.enabled).map((widget, index) => (
                  <Draggable key={widget.id} draggableId={widget.id} index={index}>
                    {(provided, snapshot) => (
                      <motion.div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={snapshot.isDragging ? 'opacity-70 scale-105' : ''}
                      >
                        {widgetComponents[widget.component] || (
                          <Card className="bg-black/60 border-white/20">
                            <CardContent className="p-6 text-white">
                              Widget: {widget.component}
                            </CardContent>
                          </Card>
                        )}
                      </motion.div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}