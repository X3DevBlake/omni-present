import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DynamicScenarioDesigner({ onCreateScenario, scenarios, isCreating }) {
  const [config, setConfig] = useState({
    scenario_type: 'economic',
    complexity: 'medium',
    objectives: ''
  });

  const scenarioTypes = [
    { value: 'economic', label: 'Economic Simulation' },
    { value: 'social', label: 'Social Dynamics' },
    { value: 'environmental', label: 'Environmental Crisis' },
    { value: 'conflict', label: 'Conflict Resolution' },
    { value: 'collaboration', label: 'Team Collaboration' },
    { value: 'disaster', label: 'Disaster Response' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration Panel */}
      <div className="lg:col-span-1">
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-400" />
              AI Scenario Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-400 mb-2 block">Scenario Type</Label>
              <Select value={config.scenario_type} onValueChange={(val) => setConfig({ ...config, scenario_type: val })}>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scenarioTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-400 mb-2 block">Complexity Level</Label>
              <Select value={config.complexity} onValueChange={(val) => setConfig({ ...config, complexity: val })}>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Simple interactions</SelectItem>
                  <SelectItem value="medium">Medium - Multi-agent dynamics</SelectItem>
                  <SelectItem value="high">High - Complex emergent behaviors</SelectItem>
                  <SelectItem value="expert">Expert - Advanced AI learning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-400 mb-2 block">Objectives</Label>
              <Textarea
                placeholder="Describe what you want to simulate or achieve..."
                value={config.objectives}
                onChange={(e) => setConfig({ ...config, objectives: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white min-h-[120px]"
              />
            </div>

            <Button
              onClick={() => onCreateScenario(config)}
              disabled={isCreating || !config.objectives}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isCreating ? 'Generating...' : 'Generate Scenario'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Scenarios Grid */}
      <div className="lg:col-span-2 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios.slice(0, 6).map((scenario, idx) => (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-slate-900/60 border-slate-700 hover:border-purple-500 transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white text-sm">{scenario.scenario_name}</CardTitle>
                    {scenario.ai_generated && (
                      <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                        AI Generated
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 text-xs mb-3 line-clamp-2">
                    {scenario.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {scenario.complexity_level}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => setActiveSimulation(scenario.id)}
                      className="text-xs"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Launch
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}