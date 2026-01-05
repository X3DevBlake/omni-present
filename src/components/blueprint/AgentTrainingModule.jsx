import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, BookOpen, Brain, Target, Save, Download, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AgentTrainingModule({ show, onClose, agent, onTrainingComplete }) {
  const [trainingMode, setTrainingMode] = useState('documents');
  const [documents, setDocuments] = useState([]);
  const [interactionLogs, setInteractionLogs] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [newObjective, setNewObjective] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingMetrics, setTrainingMetrics] = useState(null);

  const handleDocumentUpload = async (e) => {
    const files = Array.from(e.target.files);
    setIsTraining(true);

    try {
      const uploadedDocs = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedDocs.push({ name: file.name, url: file_url });
      }
      setDocuments([...documents, ...uploadedDocs]);
      toast.success(`${files.length} documents uploaded`);
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setIsTraining(false);
    }
  };

  const startTraining = async () => {
    if (documents.length === 0 && objectives.length === 0) {
      toast.error('Add training data or objectives');
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);

    // Simulate progressive training
    const progressInterval = setInterval(() => {
      setTrainingProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const trainingData = await base44.integrations.Core.InvokeLLM({
        prompt: `Train AI agent "${agent.name}" using the following:
        
        Objectives: ${objectives.join(', ')}
        Documents: ${documents.length} training documents
        Agent Personality: ${agent.personality}
        
        Generate:
        1. Learned behaviors and patterns
        2. Decision-making rules
        3. Performance improvements
        4. Skill acquisition
        5. Adaptive strategies
        6. Training metrics (success rate, efficiency, adaptability)`,
        file_urls: documents.map(d => d.url),
        response_json_schema: {
          type: "object",
          properties: {
            learnedBehaviors: { type: "array", items: { type: "string" } },
            decisionRules: { type: "array", items: { type: "object" } },
            improvements: { type: "object" },
            skills: { type: "array", items: { type: "string" } },
            strategies: { type: "array", items: { type: "string" } },
            metrics: {
              type: "object",
              properties: {
                successRate: { type: "number" },
                efficiency: { type: "number" },
                adaptability: { type: "number" }
              }
            }
          }
        }
      });

      clearInterval(progressInterval);
      setTrainingProgress(100);
      setTrainingMetrics(trainingData.metrics);

      const trainedAgent = {
        ...agent,
        training: {
          ...trainingData,
          completedAt: new Date().toISOString(),
          iterations: 1
        }
      };

      onTrainingComplete(trainedAgent);
      toast.success('Training complete!');
    } catch (error) {
      clearInterval(progressInterval);
      toast.error('Training failed');
    } finally {
      setIsTraining(false);
    }
  };

  const saveTrainingState = async () => {
    try {
      const user = await base44.auth.me();
      const trainingStates = user.agent_training_states || [];
      
      const newState = {
        agentId: agent.id,
        agentName: agent.name,
        documents,
        objectives,
        metrics: trainingMetrics,
        savedAt: new Date().toISOString()
      };

      await base44.auth.updateMe({
        agent_training_states: [...trainingStates, newState]
      });

      toast.success('Training state saved!');
    } catch (error) {
      toast.error('Failed to save state');
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10">
            <X className="w-5 h-5 text-white/70" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
              <Brain className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Agent Training Module</h3>
              <p className="text-white/60">Train {agent.name} with advanced AI learning</p>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            {['documents', 'objectives', 'reinforcement'].map(mode => (
              <button key={mode} onClick={() => setTrainingMode(mode)} className={`px-4 py-2 rounded-lg text-sm capitalize ${trainingMode === mode ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-300' : 'bg-white/5 border border-white/10 text-white/60'}`}>
                {mode}
              </button>
            ))}
          </div>

          {trainingMode === 'documents' && (
            <div className="space-y-4">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  <h4 className="text-purple-400 font-semibold">Training Documents</h4>
                </div>
                <p className="text-white/60 text-sm mb-3">Upload documents for agent to learn from</p>
                <label className="block">
                  <input type="file" multiple accept=".txt,.pdf,.doc,.docx" onChange={handleDocumentUpload} className="hidden" />
                  <div className="w-full py-3 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-xl hover:bg-purple-500/30 cursor-pointer text-center font-medium">
                    Upload Documents
                  </div>
                </label>
                {documents.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {documents.map((doc, i) => (
                      <div key={i} className="px-3 py-2 bg-white/5 rounded text-white/70 text-sm">{doc.name}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {trainingMode === 'objectives' && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-blue-400" />
                  <h4 className="text-blue-400 font-semibold">Learning Objectives</h4>
                </div>
                <div className="flex gap-2 mb-3">
                  <input type="text" value={newObjective} onChange={(e) => setNewObjective(e.target.value)} placeholder="E.g., Navigate efficiently, Avoid obstacles..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                  <button onClick={() => { if (newObjective.trim()) { setObjectives([...objectives, newObjective]); setNewObjective(''); } }} className="px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded-lg">Add</button>
                </div>
                {objectives.length > 0 && (
                  <div className="space-y-1">
                    {objectives.map((obj, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded">
                        <span className="text-white/70 text-sm">{obj}</span>
                        <button onClick={() => setObjectives(objectives.filter((_, idx) => idx !== i))} className="text-red-400 text-xs">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {trainingMode === 'reinforcement' && (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <h4 className="text-green-400 font-semibold">Reinforcement Learning</h4>
                </div>
                <p className="text-white/60 text-sm mb-3">Agent will learn from environment interactions</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-green-400 mb-1">Reward Function</div>
                    <select className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm">
                      <option>Task Completion</option>
                      <option>Efficiency</option>
                      <option>Exploration</option>
                    </select>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-green-400 mb-1">Learning Rate</div>
                    <input type="number" step="0.01" defaultValue="0.1" className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {isTraining && (
            <div className="mt-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-cyan-400 font-medium">Training Progress</span>
                <span className="text-cyan-300">{trainingProgress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all" style={{ width: `${trainingProgress}%` }} />
              </div>
            </div>
          )}

          {trainingMetrics && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                <div className="text-xs text-green-400 mb-1">Success Rate</div>
                <div className="text-2xl font-bold text-white">{(trainingMetrics.successRate * 100).toFixed(0)}%</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                <div className="text-xs text-blue-400 mb-1">Efficiency</div>
                <div className="text-2xl font-bold text-white">{(trainingMetrics.efficiency * 100).toFixed(0)}%</div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3">
                <div className="text-xs text-purple-400 mb-1">Adaptability</div>
                <div className="text-2xl font-bold text-white">{(trainingMetrics.adaptability * 100).toFixed(0)}%</div>
              </div>
            </motion.div>
          )}

          <div className="mt-6 flex gap-3">
            <button onClick={startTraining} disabled={isTraining} className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              <Brain className="w-5 h-5" />
              {isTraining ? 'Training...' : 'Start Training'}
            </button>
            <button onClick={saveTrainingState} className="px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 flex items-center gap-2">
              <Save className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}