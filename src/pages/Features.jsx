import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Sphere } from '@react-three/drei';
import AuroraBackground from '../components/omni/AuroraBackground';
import EnhancedHubNav from '../components/navigation/EnhancedHubNav';
import { Brain, Zap, Users, Target, BookOpen, Settings, TrendingUp, Share2 } from 'lucide-react';

const Feature3DCard = ({ feature, index }) => {
  const colors = [
    { primary: '#00f5ff', secondary: '#0084ff' },
    { primary: '#a855f7', secondary: '#ec4899' },
    { primary: '#10b981', secondary: '#34d399' },
    { primary: '#f59e0b', secondary: '#fbbf24' },
    { primary: '#ef4444', secondary: '#f87171' },
    { primary: '#06b6d4', secondary: '#22d3ee' },
    { primary: '#8b5cf6', secondary: '#a78bfa' },
    { primary: '#3b82f6', secondary: '#60a5fa' }
  ];

  const color = colors[index % colors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="h-64 bg-black/40 border border-white/10 rounded-2xl overflow-hidden relative group"
    >
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 5]} intensity={1} color={color.primary} />
        
        <Float speed={2} rotationIntensity={1}>
          <Sphere args={[1, 32, 32]}>
            <meshStandardMaterial
              color={color.primary}
              emissive={color.primary}
              emissiveIntensity={0.6}
              metalness={0.8}
              roughness={0.2}
            />
          </Sphere>
        </Float>

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={4} />
      </Canvas>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4 group-hover:from-black/90 transition-all">
        <div className="w-full">
          <p className="text-white font-bold text-sm group-hover:text-white transition-colors">{feature.title}</p>
          <p className="text-white/60 text-xs">{feature.description}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function Features() {
  const [selectedFeature, setSelectedFeature] = useState(null);

  const features = [
    {
      title: 'Goal-Driven Autonomy',
      description: 'Agents set and pursue goals independently',
      icon: Target,
      longDescription: 'Agents autonomously define short-term and long-term goals based on their personality, skills, and environment. The system proactively initiates actions and learns from outcomes without explicit user commands.',
      details: ['Personality-driven goal generation', 'Proactive behavior initiation', 'Goal-aware memory prioritization', 'Learning from autonomous actions']
    },
    {
      title: 'Dynamic Environments',
      description: 'Real-time parameter modification',
      icon: Settings,
      longDescription: 'Modify weather, physics, resources, and time in real-time. Create complex multi-stage events requiring coordinated agent responses.',
      details: ['Weather and physics control', 'Dynamic resource availability', 'Complex event triggers', 'Real-time parameter adjustment']
    },
    {
      title: 'Knowledge Synthesis',
      description: 'Cross-agent insight generation',
      icon: BookOpen,
      longDescription: 'Agents identify overlapping knowledge and form higher-level insights. Collaborative validation creates a robust knowledge graph.',
      details: ['Pattern recognition across agents', 'Hypothesis formation', 'Collaborative validation', 'Insight graph visualization']
    },
    {
      title: 'Memory Networks',
      description: 'Persistent and intelligent memory',
      icon: Brain,
      longDescription: 'Advanced memory system with AI-powered summarization, contextual retrieval, and proactive recall based on current goals.',
      details: ['Memory summarization', 'Contextual retrieval', 'Proactive recall', 'Memory network visualization']
    },
    {
      title: 'Skill Learning System',
      description: 'Custom and AI-suggested skills',
      icon: TrendingUp,
      longDescription: 'Teach agents custom skills or let AI suggest new ones based on experiences. Track proficiency and learning progression.',
      details: ['Custom skill definition', 'AI skill suggestions', 'Proficiency tracking', 'Progressive learning']
    },
    {
      title: 'Collaboration Hub',
      description: 'Team-based agent cooperation',
      icon: Users,
      longDescription: 'Agents form teams, share knowledge, and collaborate on complex tasks. Monitor team efficiency and knowledge distribution.',
      details: ['Team formation', 'Knowledge sharing', 'Task coordination', 'Performance tracking']
    },
    {
      title: 'Performance Analytics',
      description: 'KPI tracking and optimization',
      icon: Zap,
      longDescription: 'Track 7+ key metrics per agent with AI-driven analysis. Identify bottlenecks and get actionable improvement suggestions.',
      details: ['Multi-metric KPI dashboard', 'Performance trends', 'Bottleneck detection', 'AI optimization hints']
    },
    {
      title: 'Knowledge Sharing',
      description: 'Environment-wide knowledge repository',
      icon: Share2,
      longDescription: 'Agents publish findings to a shared repository. Others can adopt knowledge and contribute to a growing knowledge ecosystem.',
      details: ['Knowledge publishing', 'Impact scoring', 'Adoption tracking', 'Quality ratings']
    }
  ];

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <EnhancedHubNav currentHub="Features" />

      <div className="max-w-7xl mx-auto mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Platform <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Features</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Cutting-edge AI agent capabilities with immersive 3D visualizations and intelligent autonomy.
          </p>
        </motion.div>

        {/* 3D Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              onClick={() => setSelectedFeature(feature)}
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
            >
              <Feature3DCard feature={feature} index={i} />
            </motion.div>
          ))}
        </div>

        {/* Selected Feature Details */}
        {selectedFeature && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 border border-cyan-500/30 rounded-2xl p-8 mb-16"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{selectedFeature.title}</h2>
                <p className="text-white/60">{selectedFeature.longDescription}</p>
              </div>
              <button
                onClick={() => setSelectedFeature(null)}
                className="text-white/40 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-cyan-400 font-bold mb-3">Key Capabilities:</h3>
                <ul className="space-y-2">
                  {selectedFeature.details.map((detail, i) => (
                    <li key={i} className="flex gap-2 text-white/70">
                      <span className="text-cyan-400">✓</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="h-64 bg-white/5 border border-white/10 rounded-lg">
                <Canvas>
                  <ambientLight intensity={0.6} />
                  <pointLight position={[10, 10, 10]} intensity={1} />
                  <Float speed={2}>
                    <Sphere args={[1.5, 64, 64]}>
                      <meshStandardMaterial
                        color="#00f5ff"
                        emissive="#00f5ff"
                        emissiveIntensity={0.4}
                      />
                    </Sphere>
                  </Float>
                  <OrbitControls autoRotate />
                </Canvas>
              </div>
            </div>
          </motion.div>
        )}

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-black/40 border border-cyan-500/30 rounded-2xl p-8 mb-16 overflow-x-auto"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Feature Matrix</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/60 pb-3">Feature</th>
                <th className="text-center text-white/60 pb-3">AI Powered</th>
                <th className="text-center text-white/60 pb-3">Real-time</th>
                <th className="text-center text-white/60 pb-3">3D Visualization</th>
                <th className="text-center text-white/60 pb-3">Autonomous</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, i) => (
                <tr key={i} className="border-b border-white/10">
                  <td className="py-3 text-white">{feature.title}</td>
                  <td className="text-center"><span className="text-green-400">✓</span></td>
                  <td className="text-center"><span className="text-green-400">✓</span></td>
                  <td className="text-center"><span className="text-green-400">✓</span></td>
                  <td className="text-center"><span className="text-green-400">✓</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}