import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import AIEnhancedChat from '../components/communication/AIEnhancedChat';
import VoiceMessagePlayer from '../components/communication/VoiceMessagePlayer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Volume2, Users, Plus, Sparkles } from 'lucide-react';

export default function EnhancedCommunications() {
  const [userEmail, setUserEmail] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const { data: conversations } = useQuery({
    queryKey: ['conversations', userEmail],
    queryFn: () => base44.entities.AIConversation.filter({ user_email: userEmail }),
    enabled: !!userEmail,
    initialData: []
  });

  const { data: voiceMessages } = useQuery({
    queryKey: ['voiceMessages', userEmail],
    queryFn: () => base44.entities.VoiceMessage.filter({ user_email: userEmail }),
    enabled: !!userEmail,
    initialData: []
  });

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl">
                <MessageSquare className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Enhanced Communications</h1>
                <p className="text-white/60">AI-powered chat & voice messaging</p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Plus className="w-4 h-4 mr-2" />
              New Conversation
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <p className="text-white/60 text-xs">Conversations</p>
              </div>
              <p className="text-white text-2xl font-bold">{conversations.length}</p>
            </Card>
            <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-4 h-4 text-blue-400" />
                <p className="text-white/60 text-xs">Voice Messages</p>
              </div>
              <p className="text-white text-2xl font-bold">{voiceMessages.length}</p>
            </Card>
            <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <p className="text-white/60 text-xs">AI Enhanced</p>
              </div>
              <p className="text-white text-2xl font-bold">
                {conversations.filter(c => c.ai_enhanced).length}
              </p>
            </Card>
            <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-green-400" />
                <p className="text-white/60 text-xs">Active Chats</p>
              </div>
              <p className="text-white text-2xl font-bold">
                {conversations.filter(c => c.status === 'active').length}
              </p>
            </Card>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-4">
            <h3 className="text-white font-bold mb-4">Conversations</h3>
            <div className="space-y-2">
              {conversations.map((conv) => (
                <motion.div
                  key={conv.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveConversation(conv.id)}
                  className={`p-3 rounded-lg cursor-pointer ${
                    activeConversation === conv.id ? 'bg-purple-500/20' : 'bg-white/5'
                  }`}
                >
                  <p className="text-white font-bold text-sm">{conv.conversation_name}</p>
                  <p className="text-white/40 text-xs">{conv.messages?.length || 0} messages</p>
                  <div className="flex gap-2 mt-2">
                    {conv.ai_enhanced && (
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                        AI
                      </span>
                    )}
                    {conv.voice_enabled && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                        Voice
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
              {conversations.length === 0 && (
                <p className="text-white/40 text-sm text-center py-8">No conversations yet</p>
              )}
            </div>
          </Card>

          <div className="col-span-2">
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
                <TabsTrigger value="chat">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="voice">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Voice
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-4">
                <AIEnhancedChat
                  conversationId={activeConversation}
                  userEmail={userEmail}
                />
              </TabsContent>

              <TabsContent value="voice" className="mt-4">
                <VoiceMessagePlayer />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}