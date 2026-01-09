import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Zap, Users } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import EnhancedHubNav from '../components/navigation/EnhancedHubNav';
import AgentCommunicationArena3D from '../components/communication/AgentCommunicationArena3D';
import AgentCameraCapture from '../components/communication/AgentCameraCapture';
import AgentVoiceChat from '../components/communication/AgentVoiceChat';
import AgentVideoCall from '../components/communication/AgentVideoCall';
import IntegratedCommunicationHub from '../components/communication/IntegratedCommunicationHub';

export default function Communications() {
  const [activeTab, setActiveTab] = useState('arena');

  const tabs = [
    { id: 'arena', label: '🎮 3D Arena', icon: 'arena' },
    { id: 'camera', label: '📸 Capture & Recognize', icon: 'camera' },
    { id: 'voice', label: '🎤 Voice Chat', icon: 'voice' },
    { id: 'video', label: '📹 Video Call', icon: 'video' },
    { id: 'integrations', label: '🔗 Integrations', icon: 'integrations' },
  ];

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <EnhancedHubNav currentHub="Communications" />

      <div className="max-w-7xl mx-auto mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Agent <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Communication Hub</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Multi-modal interaction with AI agents: video calls, voice chat, camera recognition, and integrated communication services.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-white/10 overflow-x-auto pb-3">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-100'
                  : 'text-white/60 hover:text-white border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 3D Arena Tab */}
        {activeTab === 'arena' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-black/30 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8"
            >
              <AgentCommunicationArena3D />
            </motion.div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: Users, label: 'Active Agents', value: '4', color: 'cyan' },
                { icon: MessageSquare, label: 'Messages Today', value: '127', color: 'purple' },
                { icon: Zap, label: 'System Activity', value: '89%', color: 'green' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                const colorClasses = {
                  cyan: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/30',
                  purple: 'from-purple-500/10 to-pink-500/10 border-purple-500/30',
                  green: 'from-green-500/10 to-emerald-500/10 border-green-500/30',
                };
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-gradient-to-br ${colorClasses[stat.color]} border rounded-xl p-4`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-white/60" />
                      <div>
                        <p className="text-white/60 text-xs">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Camera Capture Tab */}
        {activeTab === 'camera' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-6">
            <AgentCameraCapture onObjectDetected={(objects) => console.log('Objects detected:', objects)} />
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">📚 How It Works</h3>
              <div className="space-y-3 text-white/70 text-sm">
                <p><span className="text-cyan-400">1. Capture:</span> Use your camera to take photos or record videos</p>
                <p><span className="text-purple-400">2. Analyze:</span> AI vision model analyzes the media and identifies objects</p>
                <p><span className="text-pink-400">3. Simulate:</span> Detected objects are placed in the 3D simulation</p>
                <p><span className="text-green-400">4. Interact:</span> Agents can now see and interact with real objects</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Voice Chat Tab */}
        {activeTab === 'voice' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-6">
            <AgentVoiceChat agentName="Agent-01" />
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">🎤 Voice Chat Features</h3>
              <div className="space-y-3 text-white/70 text-sm">
                <p><span className="text-cyan-400">✓ Real-time Speech Recognition:</span> Your voice is converted to text in real-time</p>
                <p><span className="text-purple-400">✓ AI Response:</span> Agent generates intelligent responses based on conversation context</p>
                <p><span className="text-pink-400">✓ Personality Mode:</span> Agent maintains consistent personality throughout chat</p>
                <p><span className="text-yellow-400">⚠ Note:</span> Text-to-Speech feature coming soon for agent audio responses</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Video Call Tab */}
        {activeTab === 'video' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <AgentVideoCall />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4">📹 Video Call Capabilities</h3>
                <ul className="text-white/70 text-sm space-y-2">
                  <li>✓ Real-time video streaming from agent perspective</li>
                  <li>✓ Multi-modal AI comprehension (vision + context)</li>
                  <li>✓ Live agent avatar with dynamic animations</li>
                  <li>✓ Real-time conversation with lifelike responses</li>
                  <li>✓ Facial expression & emotion detection</li>
                </ul>
              </div>
              <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4">🚀 Advanced Features</h3>
                <ul className="text-white/70 text-sm space-y-2">
                  <li>• Agent sees everything around it in simulation</li>
                  <li>• Real-time scene understanding & analysis</li>
                  <li>• Emotional tone adaptation</li>
                  <li>• Context-aware problem solving</li>
                  <li>• Persistent memory of interactions</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <IntegratedCommunicationHub />
          </motion.div>
        )}
      </div>
    </AuroraBackground>
  );
}