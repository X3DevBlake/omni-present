import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, TrendingUp, Award, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

const TRAINING_SCENARIOS = [
  { id: 'survival', name: 'Survival Training', skills: ['gathering', 'crafting', 'endurance'], emotionalImpact: { fear: -10, confidence: 15 }, duration: 10 },
  { id: 'diplomacy', name: 'Diplomacy Training', skills: ['negotiation', 'persuasion', 'empathy'], emotionalImpact: { trust: 20, anger: -15 }, duration: 12 },
  { id: 'combat', name: 'Combat Training', skills: ['combat', 'tactics', 'awareness'], emotionalImpact: { fear: -15, confidence: 20 }, duration: 15 },
  { id: 'leadership', name: 'Leadership Training', skills: ['leadership', 'coordination', 'inspiration'], emotionalImpact: { confidence: 25, trust: 10 }, duration: 14 },
  { id: 'exploration', name: 'Exploration Training', skills: ['exploration', 'navigation', 'observation'], emotionalImpact: { curiosity: 20, fear: -5 }, duration: 10 },
  { id: 'craftsmanship', name: 'Craftsmanship Training', skills: ['crafting', 'engineering', 'precision'], emotionalImpact: { satisfaction: 15, patience: 10 }, duration: 16 },
  { id: 'stealth', name: 'Stealth Training', skills: ['stealth', 'patience', 'awareness'], emotionalImpact: { confidence: 10, fear: -10 }, duration: 11 },
  { id: 'medicine', name: 'Medical Training', skills: ['medicine', 'biology', 'empathy'], emotionalImpact: { compassion: 20, satisfaction: 15 }, duration: 18 }
];

export default function AgentTrainingModule({ show, onClose, agent, onTrainingComplete }) {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [skillGains, setSkillGains] = useState({});

  useEffect(() => {
    if (agent && agent.trainingHistory) {
      setTrainingHistory(agent.trainingHistory);
    }
  }, [agent]);

  useEffect(() => {
    if (!isTraining) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (selectedScenario.duration * 10));
        if (newProgress >= 100) {
          completeTraining();
          return 100;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isTraining, selectedScenario]);

  const startTraining = (scenario) => {
    setSelectedScenario(scenario);
    setProgress(0);
    setIsTraining(true);
    toast.success(`Starting ${scenario.name}`);
  };

  const pauseTraining = () => {
    setIsTraining(false);
    toast.info('Training paused');
  };

  const completeTraining = () => {
    setIsTraining(false);
    
    const gains = {};
    selectedScenario.skills.forEach(skill => {
      const gain = Math.floor(Math.random() * 10) + 10;
      gains[skill] = gain;
      
      if (!agent.skills.includes(skill)) {
        agent.skills.push(skill);
      }
    });

    setSkillGains(gains);
    
    const trainingRecord = {
      scenario: selectedScenario.name,
      completedAt: Date.now(),
      skillGains: gains,
      emotionalImpact: selectedScenario.emotionalImpact
    };

    setTrainingHistory([trainingRecord, ...trainingHistory].slice(0, 10));
    agent.trainingHistory = [trainingRecord, ...(agent.trainingHistory || [])].slice(0, 10);
    agent.experience = (agent.experience || 0) + 50;

    onTrainingComplete?.(agent);
    toast.success('Training completed!', { icon: '🎓' });
  };

  if (!show || !agent) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Agent Training</h3>
                <p className="text-white/60 text-sm">{agent.name} - {agent.type}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {!isTraining ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-semibold mb-4">Select Training Scenario</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {TRAINING_SCENARIOS.map(scenario => (
                      <motion.div key={scenario.id} whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-white/5 to-white/10 border border-white/20 rounded-xl p-4 cursor-pointer" onClick={() => startTraining(scenario)}>
                        <div className="flex items-start justify-between mb-3">
                          <h5 className="text-white font-semibold">{scenario.name}</h5>
                          <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded">{scenario.duration}s</span>
                        </div>
                        <div className="mb-3">
                          <div className="text-white/60 text-xs mb-2">Skills Trained:</div>
                          <div className="flex flex-wrap gap-1">
                            {scenario.skills.map(skill => (
                              <span key={skill} className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded">{skill}</span>
                            ))}
                          </div>
                        </div>
                        <button className="w-full py-2 bg-green-500/20 border border-green-500/40 text-green-300 rounded-lg text-sm hover:bg-green-500/30">
                          <Play className="w-4 h-4 inline mr-1" />
                          Start Training
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {trainingHistory.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-5 h-5 text-purple-400" />
                      <h4 className="text-purple-400 font-semibold">Training History</h4>
                    </div>
                    <div className="space-y-2">
                      {trainingHistory.map((record, i) => (
                        <div key={i} className="bg-white/5 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-white font-medium">{record.scenario}</span>
                            <span className="text-white/60 text-xs">{new Date(record.completedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(record.skillGains).map(([skill, gain]) => (
                              <span key={skill} className="text-xs px-2 py-0.5 bg-green-500/20 text-green-300 rounded">
                                {skill} +{gain}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-green-400 font-semibold text-lg">{selectedScenario.name}</h4>
                    <button onClick={pauseTraining} className="px-4 py-2 bg-orange-500/20 border border-orange-500/40 text-orange-300 rounded-lg text-sm hover:bg-orange-500/30">
                      <Pause className="w-4 h-4 inline mr-1" />
                      Pause
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/70">Training Progress</span>
                      <span className="text-green-400">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/60 text-xs mb-2">Skills Being Trained</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedScenario.skills.map(skill => (
                          <span key={skill} className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/60 text-xs mb-2">Emotional Impact</div>
                      <div className="space-y-1">
                        {Object.entries(selectedScenario.emotionalImpact).map(([emotion, value]) => (
                          <div key={emotion} className="flex justify-between text-xs">
                            <span className="text-white/80 capitalize">{emotion}</span>
                            <span className={value > 0 ? 'text-green-400' : 'text-red-400'}>{value > 0 ? '+' : ''}{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {progress === 100 && Object.keys(skillGains).length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-6 h-6 text-yellow-400" />
                      <h4 className="text-yellow-400 font-semibold text-lg">Training Complete!</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(skillGains).map(([skill, gain]) => (
                        <div key={skill} className="bg-white/5 rounded-lg p-3">
                          <div className="text-white/60 text-xs capitalize">{skill}</div>
                          <div className="text-yellow-400 text-xl font-bold">+{gain}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}