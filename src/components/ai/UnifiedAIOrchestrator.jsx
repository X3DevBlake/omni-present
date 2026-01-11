import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Brain, Sparkles, Volume2, Network } from 'lucide-react';

export default function UnifiedAIOrchestrator({ userEmail }) {
  const { data: geminiInteractions } = useQuery({
    queryKey: ['gemini', userEmail],
    queryFn: () => base44.entities.GeminiInteraction.filter({ user_email: userEmail }, '-created_date', 10),
    initialData: []
  });

  const { data: agents } = useQuery({
    queryKey: ['agents', userEmail],
    queryFn: () => base44.entities.Agent.filter({ user_email: userEmail }),
    initialData: []
  });

  const { data: voiceMessages } = useQuery({
    queryKey: ['voice', userEmail],
    queryFn: () => base44.entities.VoiceMessage.filter({ user_email: userEmail }),
    initialData: []
  });

  const stats = {
    gemini: geminiInteractions.length,
    mistral: agents.filter(a => a.personality?.model === 'mistral').length,
    elevenlabs: voiceMessages.filter(v => v.status === 'ready').length,
    integrated: geminiInteractions.filter(i => i.context?.mistralInsight || i.context?.deviceControl).length
  };

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
          <Network className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">Unified AI Orchestration</h3>
          <p className="text-white/60 text-sm">All AI systems connected & working together</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-cyan-400" />
            <span className="text-white/80 text-xs">Gemini</span>
          </div>
          <p className="text-white text-2xl font-bold">{stats.gemini}</p>
          <p className="text-white/40 text-xs">Interactions</p>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-white/80 text-xs">Mistral</span>
          </div>
          <p className="text-white text-2xl font-bold">{stats.mistral}</p>
          <p className="text-white/40 text-xs">Agents</p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="w-4 h-4 text-blue-400" />
            <span className="text-white/80 text-xs">ElevenLabs</span>
          </div>
          <p className="text-white text-2xl font-bold">{stats.elevenlabs}</p>
          <p className="text-white/40 text-xs">Voice Messages</p>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Network className="w-4 h-4 text-purple-400" />
            <span className="text-white/80 text-xs">Integrated</span>
          </div>
          <p className="text-white text-2xl font-bold">{stats.integrated}</p>
          <p className="text-white/40 text-xs">Multi-AI Tasks</p>
        </div>
      </div>

      <div className="bg-black/20 rounded-lg p-4">
        <h4 className="text-white font-bold text-sm mb-3">Recent Multi-AI Operations</h4>
        <div className="space-y-2">
          {geminiInteractions
            .filter(i => i.context?.mistralInsight || i.context?.deviceControl)
            .slice(0, 3)
            .map((interaction) => (
              <motion.div
                key={interaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 rounded p-2"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-3 h-3 text-cyan-400" />
                  {interaction.context?.mistralInsight && (
                    <Sparkles className="w-3 h-3 text-orange-400" />
                  )}
                  {interaction.context?.deviceControl && (
                    <Volume2 className="w-3 h-3 text-blue-400" />
                  )}
                  <span className="text-white/60 text-xs capitalize">{interaction.interaction_type}</span>
                </div>
                <p className="text-white text-xs">{interaction.prompt?.substring(0, 60)}...</p>
                <p className="text-white/40 text-xs mt-1">
                  {new Date(interaction.created_date).toLocaleString()}
                </p>
              </motion.div>
            ))}
        </div>
      </div>
    </Card>
  );
}