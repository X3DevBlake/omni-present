import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Brain, Sparkles, Zap, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Badge } from '@/components/ui/badge';

export default function ContextAwareAssistantHub() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [currentPage] = useState(window.location.pathname);

  const { data: context } = useQuery({
    queryKey: ['platform-context'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const contexts = await base44.entities.PlatformContext.filter({ user_id: user.id });
      return contexts[0];
    },
  });

  const askAssistant = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('contextAwareAssistant', {
        current_page: currentPage,
        user_query: query
      });
      return response.data;
    }
  });

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Context-Aware AI Assistant
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            AI assistant that understands your context and provides proactive suggestions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
            <Brain className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-white text-2xl font-bold">
              {context?.ai_suggestions?.length || 0}
            </p>
            <p className="text-white/60 text-sm">Active Suggestions</p>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-4">
            <MessageSquare className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-white text-2xl font-bold">
              {context?.recent_actions?.length || 0}
            </p>
            <p className="text-white/60 text-sm">Recent Actions</p>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 p-4">
            <Zap className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-white text-2xl font-bold">
              {context?.context_score?.toFixed(0) || 0}%
            </p>
            <p className="text-white/60 text-sm">Context Understanding</p>
          </Card>
        </div>

        <Card className="bg-black/40 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Ask the Assistant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What would you like help with?"
              className="bg-white/5 border-white/10 text-white min-h-[100px]"
            />
            <Button
              onClick={() => askAssistant.mutate()}
              disabled={askAssistant.isPending || !query}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Ask Assistant
            </Button>
          </CardContent>
        </Card>

        {askAssistant.data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
              <CardContent className="p-6">
                <h3 className="text-purple-300 font-bold mb-4">Response</h3>
                <p className="text-white leading-relaxed">{askAssistant.data.response}</p>
              </CardContent>
            </Card>

            {askAssistant.data.suggestions?.length > 0 && (
              <Card className="bg-black/40 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Proactive Suggestions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {askAssistant.data.suggestions.map((suggestion, i) => (
                    <Card key={i} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white font-bold">{suggestion.suggestion}</h4>
                          <Badge className="bg-cyan-500">
                            {suggestion.confidence?.toFixed(0)}% confidence
                          </Badge>
                        </div>
                        <p className="text-white/60 text-sm">{suggestion.rationale}</p>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}

            {askAssistant.data.automated_actions?.length > 0 && (
              <Card className="bg-black/40 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Available Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {askAssistant.data.automated_actions.map((action, i) => (
                    <Card key={i} className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
                      <CardContent className="p-4">
                        <h4 className="text-green-300 font-bold mb-1">{action.action}</h4>
                        <p className="text-white/70 text-sm">{action.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {context?.ai_suggestions?.length > 0 && (
          <Card className="bg-black/40 border-white/10 mt-8">
            <CardHeader>
              <CardTitle className="text-white">Current Context Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {context.ai_suggestions.map((suggestion, i) => (
                <Card key={i} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white">{suggestion.suggestion}</span>
                      <Badge className="bg-purple-500">
                        {suggestion.confidence?.toFixed(0)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AuroraBackground>
  );
}