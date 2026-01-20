import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Zap, Plus, Settings, AlertTriangle } from 'lucide-react';

export default function RealTimeInterventionPanel({ simulation, agents, onIntervene, isPending }) {
  const [intervention, setIntervention] = useState({
    intervention_type: 'parameter_change',
    target: {},
    new_value: {}
  });

  const handleIntervene = () => {
    if (!simulation?.id) {
      return;
    }

    onIntervene({
      simulation_id: simulation.id,
      intervention_type: intervention.intervention_type,
      target: intervention.target,
      new_value: intervention.new_value
    });
  };

  return (
    <Card className="bg-slate-900/60 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Real-Time Intervention Controls
        </CardTitle>
        <p className="text-slate-400 text-sm">
          Modify running simulations and observe emergent behaviors
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="parameters" className="space-y-4">
          <TabsList className="grid grid-cols-3 bg-slate-800">
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="parameters" className="space-y-4">
            <div>
              <Label className="text-slate-400 mb-2 block">Parameter Name</Label>
              <Select
                value={intervention.target.parameter_name}
                onValueChange={(val) => setIntervention({
                  ...intervention,
                  intervention_type: 'parameter_change',
                  target: { ...intervention.target, parameter_name: val }
                })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Select parameter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="resource_availability">Resource Availability</SelectItem>
                  <SelectItem value="time_scale">Time Scale</SelectItem>
                  <SelectItem value="complexity">Complexity Level</SelectItem>
                  <SelectItem value="cooperation_bias">Cooperation Bias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-400 mb-2 block">
                New Value: {intervention.new_value.parameter_value || 50}
              </Label>
              <Slider
                value={[intervention.new_value.parameter_value || 50]}
                onValueChange={([val]) => setIntervention({
                  ...intervention,
                  new_value: { parameter_value: val }
                })}
                min={0}
                max={100}
                step={1}
                className="mb-2"
              />
            </div>

            <Button
              onClick={handleIntervene}
              disabled={isPending || !simulation}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Settings className="w-4 h-4 mr-2" />
              Apply Parameter Change
            </Button>
          </TabsContent>

          <TabsContent value="agents" className="space-y-4">
            <div>
              <Label className="text-slate-400 mb-2 block">Agent Type</Label>
              <Select
                value={intervention.new_value.agent_type}
                onValueChange={(val) => setIntervention({
                  ...intervention,
                  intervention_type: 'agent_injection',
                  new_value: { ...intervention.new_value, agent_type: val }
                })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Select agent type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="explorer">Explorer</SelectItem>
                  <SelectItem value="trader">Trader</SelectItem>
                  <SelectItem value="mediator">Mediator</SelectItem>
                  <SelectItem value="disruptor">Disruptor</SelectItem>
                  <SelectItem value="learner">Learner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-400 mb-2 block">Behavior Profile</Label>
              <Select
                value={intervention.new_value.behavior_profile}
                onValueChange={(val) => setIntervention({
                  ...intervention,
                  new_value: { ...intervention.new_value, behavior_profile: val }
                })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Select behavior" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cooperative">Cooperative</SelectItem>
                  <SelectItem value="competitive">Competitive</SelectItem>
                  <SelectItem value="exploratory">Exploratory</SelectItem>
                  <SelectItem value="adaptive">Adaptive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleIntervene}
              disabled={isPending || !simulation}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Inject Agent
            </Button>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div>
              <Label className="text-slate-400 mb-2 block">Event Type</Label>
              <Select
                value={intervention.new_value.event_type}
                onValueChange={(val) => setIntervention({
                  ...intervention,
                  intervention_type: 'event_trigger',
                  new_value: { ...intervention.new_value, event_type: val }
                })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resource_surge">Resource Surge</SelectItem>
                  <SelectItem value="environmental_shift">Environmental Shift</SelectItem>
                  <SelectItem value="communication_disruption">Communication Disruption</SelectItem>
                  <SelectItem value="goal_change">Goal Change</SelectItem>
                  <SelectItem value="external_threat">External Threat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-400 mb-2 block">Severity</Label>
              <Select
                value={intervention.new_value.severity}
                onValueChange={(val) => setIntervention({
                  ...intervention,
                  new_value: { ...intervention.new_value, severity: val }
                })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Impact</SelectItem>
                  <SelectItem value="medium">Medium Impact</SelectItem>
                  <SelectItem value="high">High Impact</SelectItem>
                  <SelectItem value="critical">Critical Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleIntervene}
              disabled={isPending || !simulation}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Trigger Event
            </Button>
          </TabsContent>
        </Tabs>

        {!simulation && (
          <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-yellow-400 text-xs">
              Select an active simulation to enable real-time interventions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}