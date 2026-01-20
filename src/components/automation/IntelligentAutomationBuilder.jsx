import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function IntelligentAutomationBuilder({ onCreateAutomation, isCreating, existingAutomations }) {
  const [config, setConfig] = useState({
    automation_goal: '',
    target_entities: [],
    expected_outcome: ''
  });

  const [selectedEntity, setSelectedEntity] = useState('');

  const availableEntities = [
    'Agent', 'Simulation', 'OmniTransaction', 'MarketDataStream',
    'IntelligenceAlert', 'WorkflowTemplate', 'GeopoliticalEvent'
  ];

  const handleAddEntity = () => {
    if (selectedEntity && !config.target_entities.includes(selectedEntity)) {
      setConfig({
        ...config,
        target_entities: [...config.target_entities, selectedEntity]
      });
      setSelectedEntity('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Builder Form */}
      <div className="lg:col-span-1">
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              AI Automation Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-400 mb-2 block">Automation Goal</Label>
              <Input
                placeholder="e.g., Sync agent data to analytics hub"
                value={config.automation_goal}
                onChange={(e) => setConfig({ ...config, automation_goal: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-400 mb-2 block">Target Entities</Label>
              <div className="flex gap-2 mb-2">
                <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Select entity" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEntities.map(entity => (
                      <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddEntity} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.target_entities.map(entity => (
                  <Badge key={entity} className="bg-purple-500/20 text-purple-400">
                    {entity}
                    <button
                      onClick={() => setConfig({
                        ...config,
                        target_entities: config.target_entities.filter(e => e !== entity)
                      })}
                      className="ml-2 text-purple-300 hover:text-white"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-slate-400 mb-2 block">Expected Outcome</Label>
              <Textarea
                placeholder="Describe what should happen when this automation runs..."
                value={config.expected_outcome}
                onChange={(e) => setConfig({ ...config, expected_outcome: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
              />
            </div>

            <Button
              onClick={() => onCreateAutomation(config)}
              disabled={isCreating || !config.automation_goal || config.target_entities.length === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isCreating ? 'Creating...' : 'Create Automation'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Existing Automations */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-white font-bold text-lg">Existing Automations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {existingAutomations.slice(0, 6).map((automation, idx) => (
            <motion.div
              key={automation.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-bold text-sm">{automation.rule_name}</h4>
                    {automation.is_active ? (
                      <Badge className="bg-green-500/20 text-green-400 text-xs">Active</Badge>
                    ) : (
                      <Badge className="bg-slate-500/20 text-slate-400 text-xs">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">{automation.trigger_type}</Badge>
                    {automation.ai_optimized && (
                      <Badge className="bg-purple-500/20 text-purple-400 text-xs">AI</Badge>
                    )}
                  </div>
                  {automation.execution_stats && (
                    <div className="text-xs text-slate-400 space-y-1">
                      <div>Executions: {automation.execution_stats.total_executions}</div>
                      <div>Success: {automation.execution_stats.success_count}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}