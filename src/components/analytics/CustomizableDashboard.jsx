import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Activity, Users, Settings, Plus } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WIDGET_TYPES = {
  performance: {
    title: 'Performance Metrics',
    icon: TrendingUp,
    component: ({ data }) => {
      const validData = (data || []).filter(d => d && typeof d.value !== 'undefined');
      return validData.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={validData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="name" stroke="#ffffff60" />
            <YAxis stroke="#ffffff60" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #ffffff20' }} />
            <Line type="monotone" dataKey="value" stroke="#00f5ff" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : <div className="h-[200px] flex items-center justify-center text-white/40">No data</div>;
    }
  },
  agents: {
    title: 'Active Agents',
    icon: Users,
    component: ({ data }) => (
      <div className="grid grid-cols-2 gap-4">
        {(data || []).slice(0, 4).map((agent, idx) => (
          <div key={idx} className="bg-white/5 p-3 rounded-lg">
            <p className="text-white/80 text-sm font-medium">{agent.name}</p>
            <p className="text-white/40 text-xs">{agent.status}</p>
          </div>
        ))}
      </div>
    )
  },
  automations: {
    title: 'Recent Automations',
    icon: Activity,
    component: ({ data }) => (
      <div className="space-y-2">
        {(data || []).slice(0, 5).map((auto, idx) => (
          <div key={idx} className="flex items-center justify-between bg-white/5 p-2 rounded">
            <p className="text-white/80 text-xs">{auto.name}</p>
            <span className={`text-xs ${auto.success ? 'text-green-400' : 'text-red-400'}`}>
              {auto.success ? '✓' : '✗'}
            </span>
          </div>
        ))}
      </div>
    )
  },
  comparison: {
    title: 'Agent Comparison',
    icon: BarChart3,
    component: ({ data }) => {
      const validData = (data || []).filter(d => d && typeof d.efficiency !== 'undefined');
      return validData.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={validData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="name" stroke="#ffffff60" />
            <YAxis stroke="#ffffff60" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #ffffff20' }} />
            <Bar dataKey="efficiency" fill="#00f5ff" isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      ) : <div className="h-[200px] flex items-center justify-center text-white/40">No data</div>;
    }
  }
};

export default function CustomizableDashboard({ initialWidgets = ['performance', 'agents', 'automations'] }) {
  const [widgets, setWidgets] = useState(initialWidgets);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Mock data
  const mockData = {
    performance: [
      { name: 'Mon', value: 85 },
      { name: 'Tue', value: 88 },
      { name: 'Wed', value: 92 },
      { name: 'Thu', value: 87 },
      { name: 'Fri', value: 95 }
    ],
    agents: [
      { name: 'Trading Agent', status: 'Active' },
      { name: 'Monitor Agent', status: 'Active' },
      { name: 'Alert Agent', status: 'Idle' },
      { name: 'Analysis Agent', status: 'Active' }
    ],
    automations: [
      { name: 'Price Alert Workflow', success: true },
      { name: 'Portfolio Rebalance', success: true },
      { name: 'Report Generation', success: false },
      { name: 'Data Sync', success: true },
      { name: 'Backup Process', success: true }
    ],
    comparison: [
      { name: 'Agent A', efficiency: 92 },
      { name: 'Agent B', efficiency: 85 },
      { name: 'Agent C', efficiency: 88 }
    ]
  };

  const handleDragEnd = (result) => {
    if (!result?.destination || !result?.source) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgets(items);
  };

  const addWidget = (widgetType) => {
    if (!widgets.includes(widgetType)) {
      setWidgets([...widgets, widgetType]);
    }
    setShowAddMenu(false);
  };

  const removeWidget = (widgetType) => {
    setWidgets(widgets.filter(w => w !== widgetType));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Customize Dashboard
        </h3>
        <Button
          size="sm"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="bg-purple-500 hover:bg-purple-600"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Widget
        </Button>
      </div>

      {showAddMenu && (
        <Card className="bg-white/5 border-purple-500/30">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(WIDGET_TYPES).map(([key, widget]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => addWidget(key)}
                  disabled={widgets.includes(key)}
                  className="justify-start"
                >
                  <widget.icon className="w-4 h-4 mr-2" />
                  {widget.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {widgets.map((widgetKey, index) => {
                const widget = WIDGET_TYPES[widgetKey];
                if (!widget) return null;

                return (
                  <Draggable key={widgetKey} draggableId={widgetKey} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={snapshot.isDragging ? 'opacity-50' : ''}
                      >
                        <Card className="bg-white/5 border-purple-500/20 hover:border-purple-500/40 transition-all">
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-white text-sm flex items-center gap-2">
                              <widget.icon className="w-4 h-4" />
                              {widget.title}
                            </CardTitle>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeWidget(widgetKey)}
                              className="h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          </CardHeader>
                          <CardContent>
                            <widget.component data={mockData[widgetKey]} />
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}