import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid, Plus, Save, Trash } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function CustomDashboardBuilder() {
  const queryClient = useQueryClient();
  const [dashboardName, setDashboardName] = useState('');
  const [selectedComponent, setSelectedComponent] = useState('neural_alignment');
  const [selectedWidgets, setSelectedWidgets] = useState([]);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: dashboards } = useQuery({
    queryKey: ['dashboards'],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.DashboardConfiguration.filter({ user_email: u.email });
    },
    initialData: []
  });

  const createDashboardMutation = useMutation({
    mutationFn: async (config) => {
      const u = await base44.auth.me();
      return base44.entities.DashboardConfiguration.create({
        config_id: `dash_${Date.now()}`,
        user_email: u.email,
        dashboard_name: config.name,
        omega_component: config.component,
        layout_config: {
          widgets: config.widgets,
          color_theme: config.component === 'neural_alignment' ? 'neural_purple' : 
                       config.component === 'sentient_finance' ? 'finance_emerald' : 'aether_cyan'
        },
        active_visualizers: [config.component],
        notification_preferences: {
          enabled_types: ['anomaly_alert', 'market_opportunity'],
          priority_threshold: 'medium'
        }
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboards'] })
  });

  const availableWidgets = {
    neural_alignment: ['Neural Manifold View', 'Phi Calculator', 'Telepathy Monitor', 'Alignment Stats'],
    sentient_finance: ['Market Data Feed', 'OML Tokenization', 'Revenue Streams', 'Geopolitical Risk'],
    aether_display: ['Particle View', 'Force Balance', 'Stability Monitor', 'Focal Control'],
    haas_swarm: ['Swarm Hierarchy', 'Agent Nodes', 'GWT Broadcasts', 'Capability Score'],
    sim2real: ['Training Metrics', 'Reality Gap', 'Agent Decisions', 'Deployment Status'],
    crdt_sync: ['Device Nodes', 'Delta Queue', 'Sync Status', 'Anti-Entropy']
  };

  const handleSaveDashboard = () => {
    if (!dashboardName) return;
    
    createDashboardMutation.mutate({
      name: dashboardName,
      component: selectedComponent,
      widgets: selectedWidgets.map((w, idx) => ({
        widget_type: w,
        position: { x: idx % 2, y: Math.floor(idx / 2) },
        size: { width: 1, height: 1 },
        settings: {}
      }))
    });

    setDashboardName('');
    setSelectedWidgets([]);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-950/90 to-indigo-950/90 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <LayoutGrid className="w-6 h-6 text-purple-400" />
          Custom Dashboard Builder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6">
          <Input
            placeholder="Dashboard name..."
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            className="bg-black/60 border-purple-500/30 text-white"
          />

          <Select value={selectedComponent} onValueChange={setSelectedComponent}>
            <SelectTrigger className="bg-black/60 border-purple-500/30 text-white">
              <SelectValue placeholder="Select Omega Component" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="neural_alignment">Neural Alignment</SelectItem>
              <SelectItem value="sentient_finance">Sentient Finance</SelectItem>
              <SelectItem value="aether_display">Aether Display</SelectItem>
              <SelectItem value="haas_swarm">HAAS Swarm</SelectItem>
              <SelectItem value="sim2real">Sim2Real</SelectItem>
              <SelectItem value="crdt_sync">CRDT Sync</SelectItem>
            </SelectContent>
          </Select>

          <div>
            <div className="text-gray-400 text-sm mb-2">Available Widgets:</div>
            <div className="grid grid-cols-2 gap-2">
              {availableWidgets[selectedComponent]?.map((widget, idx) => (
                <Button
                  key={idx}
                  variant={selectedWidgets.includes(widget) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (selectedWidgets.includes(widget)) {
                      setSelectedWidgets(selectedWidgets.filter(w => w !== widget));
                    } else {
                      setSelectedWidgets([...selectedWidgets, widget]);
                    }
                  }}
                  className={selectedWidgets.includes(widget) ? 'bg-purple-600' : 'border-purple-500/50'}
                >
                  {widget}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={handleSaveDashboard}
          disabled={!dashboardName || selectedWidgets.length === 0}
          className="w-full bg-purple-600 hover:bg-purple-700 mb-4"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Dashboard
        </Button>

        {dashboards.length > 0 && (
          <div>
            <div className="text-white text-sm font-bold mb-3">Your Dashboards:</div>
            <div className="space-y-2">
              {dashboards.map((dash, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-black/60 rounded-lg p-3 border border-purple-500/20 flex justify-between items-center"
                >
                  <div>
                    <div className="text-white font-semibold text-sm">{dash.dashboard_name}</div>
                    <div className="text-gray-400 text-xs capitalize">{dash.omega_component.replace('_', ' ')}</div>
                  </div>
                  <Badge className="bg-purple-600">{dash.layout_config?.widgets?.length || 0} widgets</Badge>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}