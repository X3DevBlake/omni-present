import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Target, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PersonalityBuilder from '../agents/PersonalityBuilder';
import KnowledgeBaseTrainer from '../agents/KnowledgeBaseTrainer';
import GoalsEthicsEditor from '../agents/GoalsEthicsEditor';
import AdaptiveBehaviorEngine from '../agents/AdaptiveBehaviorEngine';

export default function AgentPersonalizationHub({ agent, onAgentUpdate }) {
  const [showPersonality, setShowPersonality] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [showGoals, setShowGoals] = useState(false);

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-6">Agent Personalization</h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div
          onClick={() => setShowPersonality(true)}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 cursor-pointer hover:scale-105 transition-transform"
        >
          <Sparkles className="w-12 h-12 text-purple-400 mb-4" />
          <h4 className="text-white font-bold text-lg mb-2">Custom Personality</h4>
          <p className="text-white/60 text-sm">Define unique traits, backstory, and speaking style</p>
        </div>

        <div
          onClick={() => setShowTraining(true)}
          className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6 cursor-pointer hover:scale-105 transition-transform"
        >
          <Brain className="w-12 h-12 text-cyan-400 mb-4" />
          <h4 className="text-white font-bold text-lg mb-2">Knowledge Training</h4>
          <p className="text-white/60 text-sm">Train on custom data, documents, or knowledge bases</p>
        </div>

        <div
          onClick={() => setShowGoals(true)}
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6 cursor-pointer hover:scale-105 transition-transform"
        >
          <Target className="w-12 h-12 text-green-400 mb-4" />
          <h4 className="text-white font-bold text-lg mb-2">Goals & Ethics</h4>
          <p className="text-white/60 text-sm">Set custom goals and ethical guidelines</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-6">
          <Shield className="w-12 h-12 text-orange-400 mb-4" />
          <h4 className="text-white font-bold text-lg mb-2">Adaptive Learning</h4>
          <p className="text-white/60 text-sm">Agent learns from your interactions automatically</p>
        </div>
      </div>

      <AdaptiveBehaviorEngine
        agent={agent}
        interactions={agent?.interactionHistory || []}
      />

      <PersonalityBuilder
        show={showPersonality}
        onClose={() => setShowPersonality(false)}
        onPersonalityCreate={(personality) => {
          onAgentUpdate?.({ ...agent, personality });
          setShowPersonality(false);
        }}
      />

      <KnowledgeBaseTrainer
        show={showTraining}
        onClose={() => setShowTraining(false)}
        agent={agent}
        onTrainingComplete={onAgentUpdate}
      />

      <GoalsEthicsEditor
        show={showGoals}
        onClose={() => setShowGoals(false)}
        agent={agent}
        onSave={(updated) => {
          onAgentUpdate?.(updated);
          setShowGoals(false);
        }}
      />
    </div>
  );
}