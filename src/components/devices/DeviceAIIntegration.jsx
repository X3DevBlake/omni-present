import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, Link2, Activity, Zap, TrendingUp, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DeviceAIIntegration({ show, onClose, device }) {
  const [availableAgents, setAvailableAgents] = useState([]);
  const [assignedAgent, setAssignedAgent] = useState(null);
  const [dataFlow, setDataFlow] = useState([]);
  const [aiResponses, setAiResponses] = useState([]);

  useEffect(() => {
    if (show) {
      loadAgents();
      simulateDataFlow();
    }
  }, [show]);

  const loadAgents = () => {
    const mockAgents = [
      { id: 'agent_1', name: 'Environmental Monitor', type: 'sensor_analysis', color: '#10b981' },
      { id: 'agent_2', name: 'Predictive Maintenance', type: 'health_check', color: '#3b82f6' },
      { id: 'agent_3', name: 'Behavior Optimizer', type: 'optimization', color: '#a855f7' },
      { id: 'agent_4', name: 'Security Guardian', type: 'security', color: '#ef4444' }
    ];
    setAvailableAgents(mockAgents);
  };

  const simulateDataFlow = () => {
    const interval = setInterval(() => {
      if (!device?.telemetry) return;
      
      setDataFlow(prev => [...prev, {
        timestamp: new Date(),
        temperature: device.telemetry.temperature,
        battery: device.telemetry.battery,
        motion: device.telemetry.sensorReadings.motion
      }].slice(-10));

      if (assignedAgent) {
        setAiResponses(prev => [...prev, {
          timestamp: new Date(),
          agent: assignedAgent.name,
          analysis: `Analyzing sensor data... ${Math.random() > 0.5 ? 'Normal operation' : 'Optimization suggested'}`,
          action: Math.random() > 0.7 ? 'Adjusting sensitivity' : null
        }].slice(-5));
      }
    }, 3000);

    return () => clearInterval(interval);
  };

  const assignAgent = async (agent) => {
    setAssignedAgent(agent);
    toast.success(`${agent.name} assigned to device`);
    
    try {
      const user = await base44.auth.me();
      const deviceAgents = user.device_ai_assignments || {};
      deviceAgents[device.device_id] = agent.id;
      await base44.auth.updateMe({ device_ai_assignments: deviceAgents });
    } catch (err) {
      console.error('Failed to save assignment');
    }
  };

  if (!show || !device) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10">
            <X className="w-5 h-5 text-white/70" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">AI Device Integration</h3>
              <p className="text-white/60 text-sm">{device.device_name}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-white font-semibold mb-3">Assign AI Agent</h4>
              <div className="space-y-2">
                {availableAgents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => assignAgent(agent)}
                    className={`w-full p-4 rounded-xl border transition-all text-left ${
                      assignedAgent?.id === agent.id
                        ? 'bg-purple-500/20 border-purple-500/40'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${agent.color}30` }}>
                        <Bot className="w-5 h-5" style={{ color: agent.color }} />
                      </div>
                      <div>
                        <div className="text-white font-medium">{agent.name}</div>
                        <div className="text-white/60 text-xs">{agent.type}</div>
                      </div>
                      {assignedAgent?.id === agent.id && (
                        <div className="ml-auto px-2 py-1 bg-green-500/20 border border-green-500/40 text-green-300 rounded text-xs">
                          Active
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Real-time Data Flow</h4>
              <div className="bg-black/40 rounded-xl p-4 h-64 overflow-y-auto">
                {dataFlow.length === 0 ? (
                  <div className="text-white/40 text-sm text-center py-8">
                    Waiting for sensor data...
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dataFlow.map((data, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/5 rounded-lg p-2 text-xs"
                      >
                        <div className="text-white/60 mb-1">
                          {data.timestamp.toLocaleTimeString()}
                        </div>
                        <div className="flex gap-3 text-white/80">
                          <span>🌡️ {data.temperature}°C</span>
                          <span>🔋 {data.battery}%</span>
                          <span>{data.motion ? '🟢 Motion' : '⚪ Still'}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {assignedAgent && (
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-purple-400" />
                <h4 className="text-purple-400 font-semibold">AI Analysis Stream</h4>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {aiResponses.length === 0 ? (
                  <div className="text-white/40 text-sm">Agent is analyzing device data...</div>
                ) : (
                  aiResponses.map((response, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-purple-400 text-xs font-medium">{response.agent}</span>
                        <span className="text-white/40 text-xs">{response.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <div className="text-white/80 text-sm">{response.analysis}</div>
                      {response.action && (
                        <div className="mt-2 px-2 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded text-xs inline-block">
                          ⚡ Action: {response.action}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}