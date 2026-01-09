import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Sphere } from '@react-three/drei';
import { Play, BarChart3, Settings, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function Environment3D({ type }) {
  return (
    <group>
      {type === 'urban' && (
        <>
          <Box args={[2, 4, 2]} position={[-3, 2, 0]}>
            <meshStandardMaterial color="#4a5568" />
          </Box>
          <Box args={[2, 3, 2]} position={[3, 1.5, 0]}>
            <meshStandardMaterial color="#2d3748" />
          </Box>
          <Box args={[10, 0.2, 10]} position={[0, -0.1, 0]}>
            <meshStandardMaterial color="#1a202c" />
          </Box>
        </>
      )}
      {type === 'data' && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <Sphere key={i} args={[0.3, 16, 16]} position={[Math.cos(i) * 3, Math.sin(i * 0.5) * 2, Math.sin(i) * 3]}>
              <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.5} />
            </Sphere>
          ))}
        </>
      )}
      {type === 'collaborative' && (
        <>
          {[0, 1, 2, 3].map(i => (
            <Box key={i} args={[1, 1, 1]} position={[Math.cos(i * Math.PI / 2) * 2, 0, Math.sin(i * Math.PI / 2) * 2]}>
              <meshStandardMaterial color={['#00f5ff', '#a855f7', '#ec4899', '#10b981'][i]} />
            </Box>
          ))}
        </>
      )}
    </group>
  );
}

export default function SimulatedEnvironments() {
  const [environments] = useState([
    { id: 1, name: 'Urban Navigation', type: 'urban', difficulty: 'medium', focus: 'Problem-solving' },
    { id: 2, name: 'Data Processing Lab', type: 'data', difficulty: 'hard', focus: 'Analysis' },
    { id: 3, name: 'Collaborative Workspace', type: 'collaborative', difficulty: 'easy', focus: 'Teamwork' },
    { id: 4, name: 'Crisis Management', type: 'urban', difficulty: 'extreme', focus: 'Decision-making' }
  ]);

  const [selectedEnv, setSelectedEnv] = useState(environments[0]);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [scenario, setScenario] = useState(null);

  const generateScenario = async () => {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a detailed training scenario for ${selectedEnv.name} environment focusing on ${selectedEnv.focus}. Include objectives, challenges, success criteria, and collaboration opportunities.`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          objectives: { type: 'array', items: { type: 'string' } },
          challenges: { type: 'array', items: { type: 'string' } },
          success_criteria: { type: 'array', items: { type: 'string' } },
          duration: { type: 'string' }
        }
      }
    });
    setScenario(response);
  };

  const runSimulation = async () => {
    setSimulationRunning(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const results = {
      completed: true,
      duration: '4m 23s',
      tasksCompleted: Math.floor(Math.random() * 5 + 8),
      collaborationScore: Math.floor(Math.random() * 30 + 65),
      problemsSolved: Math.floor(Math.random() * 4 + 6),
      efficiency: Math.floor(Math.random() * 20 + 75),
      insights: [
        'Strong performance in resource allocation',
        'Could improve response time under pressure',
        'Excellent collaboration with team members'
      ],
      recommendations: [
        'Practice high-pressure decision scenarios',
        'Focus on optimizing task prioritization'
      ]
    };
    
    setAnalytics(results);
    setSimulationRunning(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-bold text-xl mb-4">Simulated Training Environments</h3>

        {/* Environment Selection */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {environments.map(env => (
            <motion.div
              key={env.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setSelectedEnv(env);
                setScenario(null);
                setAnalytics(null);
              }}
              className={`p-4 rounded-xl border cursor-pointer ${
                selectedEnv.id === env.id
                  ? 'bg-purple-500/20 border-purple-500/50'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-bold">{env.name}</h4>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  env.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                  env.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  env.difficulty === 'hard' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {env.difficulty}
                </span>
              </div>
              <p className="text-white/60 text-sm">Focus: {env.focus}</p>
            </motion.div>
          ))}
        </div>

        {/* 3D Environment Preview */}
        <div className="h-64 bg-black/20 rounded-xl overflow-hidden mb-6">
          <Canvas camera={{ position: [0, 3, 8], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Environment3D type={selectedEnv.type} />
            <OrbitControls />
          </Canvas>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={generateScenario}
            className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Generate Scenario
          </motion.button>
          {scenario && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={runSimulation}
              disabled={simulationRunning}
              className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              {simulationRunning ? 'Running...' : 'Start Simulation'}
            </motion.button>
          )}
        </div>

        {/* Generated Scenario */}
        {scenario && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl"
          >
            <h4 className="text-cyan-400 font-bold mb-2">{scenario.title}</h4>
            <p className="text-white/70 text-sm mb-3">{scenario.description}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-white/60 text-xs mb-2">Objectives:</p>
                {scenario.objectives.map((obj, idx) => (
                  <p key={idx} className="text-white text-sm">• {obj}</p>
                ))}
              </div>
              <div>
                <p className="text-white/60 text-xs mb-2">Challenges:</p>
                {scenario.challenges.map((ch, idx) => (
                  <p key={idx} className="text-orange-400 text-sm">⚠ {ch}</p>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Post-Simulation Analytics */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-xl"
          >
            <h4 className="text-green-400 font-bold text-lg mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Simulation Analytics
            </h4>
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-white/60 text-xs mb-1">Duration</p>
                <p className="text-white font-bold text-xl">{analytics.duration}</p>
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-white/60 text-xs mb-1">Tasks Completed</p>
                <p className="text-green-400 font-bold text-xl">{analytics.tasksCompleted}</p>
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-white/60 text-xs mb-1">Collaboration</p>
                <p className="text-purple-400 font-bold text-xl">{analytics.collaborationScore}%</p>
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-white/60 text-xs mb-1">Efficiency</p>
                <p className="text-cyan-400 font-bold text-xl">{analytics.efficiency}%</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-white/60 text-sm mb-2">Key Insights:</p>
                {analytics.insights.map((insight, idx) => (
                  <p key={idx} className="text-white text-sm mb-1">✓ {insight}</p>
                ))}
              </div>
              <div>
                <p className="text-white/60 text-sm mb-2">Recommendations:</p>
                {analytics.recommendations.map((rec, idx) => (
                  <p key={idx} className="text-yellow-400 text-sm mb-1">→ {rec}</p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}