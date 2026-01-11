import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import GeminiChatInterface from '../components/gemini/GeminiChatInterface';
import AutonomousGeminiDashboard from '../components/gemini/AutonomousGeminiDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { Sparkles, Brain, MessageSquare, BarChart3 } from 'lucide-react';

export default function GeminiHub() {
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  if (!userEmail) {
    return (
      <AuroraBackground className="min-h-screen flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Gemini Hub</h1>
              <p className="text-white/60">Autonomous AI-powered intelligence</p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="autonomous" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
            <TabsTrigger value="autonomous" className="data-[state=active]:bg-purple-500/20">
              <Brain className="w-4 h-4 mr-2" />
              Autonomous Agent
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-blue-500/20">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-green-500/20">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="autonomous" className="mt-6">
            <AutonomousGeminiDashboard userEmail={userEmail} />
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <GeminiChatInterface userEmail={userEmail} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="text-white">Analytics coming soon...</div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}