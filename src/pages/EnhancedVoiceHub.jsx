import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AuroraBackground from '@/components/omni/AuroraBackground';
import VoiceCommandVisualizer3D from '@/components/voice/VoiceCommandVisualizer3D';
import { Mic, MicOff, MessageSquare, Activity } from 'lucide-react';

export default function EnhancedVoiceHub() {
  const [isListening, setIsListening] = useState(false);
  const queryClient = useQueryClient();

  const { data: voiceInteractions = [] } = useQuery({
    queryKey: ['voice-interactions'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return [];
      return base44.entities.VoiceInteraction.filter({ user_id: user.id });
    }
  });

  const processVoiceMutation = useMutation({
    mutationFn: async ({ transcription }) => {
      const response = await base44.functions.invoke('processVoiceCommand', {
        transcription
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['voice-interactions']);
    }
  });

  const totalCommands = voiceInteractions.length;
  const avgSentiment = voiceInteractions.length > 0
    ? voiceInteractions.reduce((sum, v) => sum + (v.sentiment || 0), 0) / voiceInteractions.length
    : 0;

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl font-bold text-white flex items-center justify-center gap-3">
            <Mic className="w-12 h-12 text-cyan-400" />
            Enhanced Voice Hub
          </h1>
          <p className="text-xl text-gray-300">
            AI-powered voice commands and natural language interaction
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Commands</p>
                  <p className="text-3xl font-bold text-white">{totalCommands}</p>
                </div>
                <MessageSquare className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Sentiment</p>
                  <p className="text-3xl font-bold text-white">{(avgSentiment * 100).toFixed(0)}%</p>
                </div>
                <Activity className="w-10 h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <p className="text-xl font-bold text-white">{isListening ? 'Listening' : 'Ready'}</p>
                </div>
                {isListening ? (
                  <Mic className="w-10 h-10 text-red-400 animate-pulse" />
                ) : (
                  <MicOff className="w-10 h-10 text-green-400" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="3d" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900/50">
            <TabsTrigger value="3d">3D Voice Visualizer</TabsTrigger>
            <TabsTrigger value="history">Command History</TabsTrigger>
          </TabsList>

          <TabsContent value="3d">
            <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
              <CardContent className="p-0 h-full">
                <VoiceCommandVisualizer3D
                  isListening={isListening}
                  recentCommands={voiceInteractions.slice(0, 5)}
                />
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/50 border-slate-700 mt-4">
              <CardContent className="pt-6">
                <Button
                  onClick={() => setIsListening(!isListening)}
                  className={`w-full ${isListening 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-5 h-5 mr-2" />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 mr-2" />
                      Start Voice Command
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-3">
              {voiceInteractions.map((interaction) => (
                <Card key={interaction.id} className="bg-slate-900/50 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className="bg-purple-600">{interaction.intent}</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(interaction.created_date).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-white mb-2">"{interaction.transcription}"</p>
                    {interaction.response_text && (
                      <p className="text-sm text-gray-400 italic">→ {interaction.response_text}</p>
                    )}
                    {interaction.action_taken && (
                      <Badge variant="outline" className="text-cyan-400 border-cyan-400 mt-2">
                        Action: {interaction.action_taken}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}