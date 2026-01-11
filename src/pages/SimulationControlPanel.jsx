import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Pause, RotateCcw, Zap, Camera, FastForward, Rewind, Sparkles, Brain, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuroraBackground from '../components/omni/AuroraBackground';
import { toast } from 'sonner';

export default function SimulationControlPanel() {
  const [userEmail, setUserEmail] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeScale, setTimeScale] = useState(1);
  const [geminiMessage, setGeminiMessage] = useState('');
  const [copilotMessages, setCopilotMessages] = useState([]);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const { data: snapshots } = useQuery({
    queryKey: ['snapshots', userEmail],
    queryFn: () => base44.entities.SimulationSnapshot.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const geminiCopilot = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/gemini-simulation-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: geminiMessage,
          simulationContext: { isRunning, timeScale },
          userEmail
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCopilotMessages([...copilotMessages, 
        { role: 'user', text: geminiMessage },
        { role: 'assistant', text: data.response.answer, suggestions: data.response }
      ]);
      setGeminiMessage('');
    }
  });

  const injectEvents = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/dynamic-event-injection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulationId: 'sim-001',
          currentState: { agents: 5, time: 100 },
          userEmail
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`${data.scheduled_count} events injected`);
    }
  });

  const createSnapshot = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/snapshot-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          simulationId: 'sim-001',
          stateData: { time: Date.now() },
          agentStates: [],
          environmentState: {},
          metrics: {},
          userEmail
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snapshots'] });
      toast.success('Snapshot created');
    }
  });

  const analyzeEmergent = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/emergent-behavior-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulationData: { events: [], agents: [] },
          userEmail
        })
      });
      return response.json();
    }
  });

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Simulation Control Panel
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            AI-powered simulation orchestration with Gemini copilot
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <Card className="bg-black/40 border-white/10 p-6 lg:col-span-2">
            <Tabs defaultValue="controls">
              <TabsList className="bg-black/40 border border-white/10">
                <TabsTrigger value="controls">Controls</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="controls" className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => setIsRunning(!isRunning)}
                    className={`${isRunning ? 'bg-orange-500' : 'bg-green-500'}`}
                  >
                    {isRunning ? <><Pause className="w-4 h-4 mr-2" />Pause</> : <><Play className="w-4 h-4 mr-2" />Start</>}
                  </Button>
                  <Button variant="outline" onClick={() => setIsRunning(false)}>
                    <RotateCcw className="w-4 h-4 mr-2" />Reset
                  </Button>
                  <Button variant="outline" onClick={() => createSnapshot.mutate()}>
                    <Camera className="w-4 h-4 mr-2" />Snapshot
                  </Button>
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Time Scale: {timeScale}x
                  </label>
                  <div className="flex items-center gap-4">
                    <Rewind className="w-5 h-5 text-cyan-400" />
                    <Slider
                      value={[timeScale]}
                      onValueChange={([v]) => setTimeScale(v)}
                      min={0.1}
                      max={10}
                      step={0.1}
                      className="flex-1"
                    />
                    <FastForward className="w-5 h-5 text-purple-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-4">
                    <p className="text-white/60 text-sm">Simulation Time</p>
                    <p className="text-white text-2xl font-bold">00:05:32</p>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
                    <p className="text-white/60 text-sm">Active Agents</p>
                    <p className="text-white text-2xl font-bold">12</p>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="events">
                <div className="space-y-4">
                  <Button
                    onClick={() => injectEvents.mutate()}
                    disabled={injectEvents.isPending}
                    className="bg-gradient-to-r from-orange-500 to-red-500"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Inject Dynamic Events
                  </Button>
                  
                  {injectEvents.data?.events?.map((event, i) => (
                    <Card key={i} className="bg-white/5 border-white/10 p-4">
                      <h4 className="text-white font-semibold mb-1">{event.name}</h4>
                      <p className="text-white/60 text-sm mb-2">{event.description}</p>
                      <div className="flex gap-4 text-xs text-white/50">
                        <span>Trigger: T+{event.trigger_time}s</span>
                        <span>Difficulty: {event.difficulty}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="snapshots">
                <div className="space-y-3">
                  {snapshots?.map(snapshot => (
                    <Card key={snapshot.id} className="bg-white/5 border-white/10 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-semibold">{snapshot.snapshot_name}</h4>
                          <p className="text-white/60 text-xs">{new Date(snapshot.created_date).toLocaleString()}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          <RotateCcw className="w-3 h-3 mr-1" />Restore
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analysis">
                <div className="space-y-4">
                  <Button
                    onClick={() => analyzeEmergent.mutate()}
                    disabled={analyzeEmergent.isPending}
                    className="bg-gradient-to-r from-green-500 to-emerald-500"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Analyze Emergent Behaviors
                  </Button>

                  {analyzeEmergent.data?.analysis?.emergent_patterns?.map((pattern, i) => (
                    <Card key={i} className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 p-4">
                      <h4 className="text-white font-semibold mb-2">{pattern.pattern_name}</h4>
                      <p className="text-white/80 text-sm mb-2">{pattern.description}</p>
                      <div className="text-xs text-white/60">
                        <p>Emerged at: T+{pattern.emergence_time}s</p>
                        <p>Significance: {pattern.significance}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Gemini Copilot */}
          <Card className="bg-black/40 border-white/10 p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Gemini Copilot
            </h3>

            <div className="h-[400px] overflow-y-auto mb-4 space-y-3">
              {copilotMessages.map((msg, i) => (
                <div key={i} className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-cyan-500/10 border border-cyan-500/30 ml-8' : 'bg-purple-500/10 border border-purple-500/30 mr-8'}`}>
                  <p className="text-white text-sm">{msg.text}</p>
                  {msg.suggestions?.optimizations && (
                    <div className="mt-2 space-y-1">
                      {msg.suggestions.optimizations.map((opt, j) => (
                        <p key={j} className="text-xs text-cyan-400">• {opt}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Ask Gemini anything..."
                value={geminiMessage}
                onChange={(e) => setGeminiMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && geminiCopilot.mutate()}
                className="bg-white/5 border-white/10"
              />
              <Button
                onClick={() => geminiCopilot.mutate()}
                disabled={!geminiMessage || geminiCopilot.isPending}
                className="bg-gradient-to-r from-cyan-500 to-purple-500"
              >
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AuroraBackground>
  );
}