import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Volume2, Smartphone, Bot, Monitor, Brain, TrendingUp, FileText, Sparkles } from 'lucide-react';
import ConversationDocumenter from '../components/conversations/ConversationDocumenter';
import VisualGenerator from '../components/conversations/VisualGenerator';
import PredictiveAnalyticsDashboard from '../components/analytics/PredictiveAnalyticsDashboard';

export default function UnifiedConversationHub() {
  const [userEmail, setUserEmail] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const aggregateConversations = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/unified-conversation-aggregator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeRange })
      });
      if (!response.ok) throw new Error('Failed to aggregate');
      return response.json();
    }
  });

  useEffect(() => {
    if (userEmail) {
      aggregateConversations.mutate();
    }
  }, [userEmail, timeRange]);

  const timeline = aggregateConversations.data?.timeline || [];
  const stats = aggregateConversations.data?.stats || {};

  const filteredTimeline = filterType === 'all' 
    ? timeline 
    : timeline.filter(item => item.type === filterType);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'gemini': return <Brain className="w-4 h-4 text-cyan-400" />;
      case 'chat': return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case 'voice': return <Volume2 className="w-4 h-4 text-blue-400" />;
      case 'sms': return <Smartphone className="w-4 h-4 text-green-400" />;
      case 'autonomous': return <Bot className="w-4 h-4 text-pink-400" />;
      case 'device_control': return <Monitor className="w-4 h-4 text-orange-400" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'gemini': return 'border-cyan-500/30 bg-cyan-500/10';
      case 'chat': return 'border-purple-500/30 bg-purple-500/10';
      case 'voice': return 'border-blue-500/30 bg-blue-500/10';
      case 'sms': return 'border-green-500/30 bg-green-500/10';
      case 'autonomous': return 'border-pink-500/30 bg-pink-500/10';
      case 'device_control': return 'border-orange-500/30 bg-orange-500/10';
      default: return 'border-white/10 bg-white/5';
    }
  };

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
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Unified Conversation Hub</h1>
                <p className="text-white/60">All AI communications in one place</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="bg-white/5 border-white/10 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => aggregateConversations.mutate()}
                disabled={aggregateConversations.isPending}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                <p className="text-white/60 text-xs">Gemini</p>
              </div>
              <p className="text-white text-2xl font-bold">{stats.byType?.gemini || 0}</p>
            </Card>
            <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <p className="text-white/60 text-xs">Chat</p>
              </div>
              <p className="text-white text-2xl font-bold">{stats.byType?.chat || 0}</p>
            </Card>
            <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-4 h-4 text-blue-400" />
                <p className="text-white/60 text-xs">Voice</p>
              </div>
              <p className="text-white text-2xl font-bold">{stats.byType?.voice || 0}</p>
            </Card>
            <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-4 h-4 text-green-400" />
                <p className="text-white/60 text-xs">SMS</p>
              </div>
              <p className="text-white text-2xl font-bold">{stats.byType?.sms || 0}</p>
            </Card>
            <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-pink-400" />
                <p className="text-white/60 text-xs">Autonomous</p>
              </div>
              <p className="text-white text-2xl font-bold">{stats.autonomous || 0}</p>
            </Card>
            <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-yellow-400" />
                <p className="text-white/60 text-xs">Total</p>
              </div>
              <p className="text-white text-2xl font-bold">{stats.total || 0}</p>
            </Card>
          </div>
        </motion.div>

        <div className="flex gap-3 mb-4">
          {['all', 'gemini', 'chat', 'voice', 'sms', 'autonomous', 'device_control'].map(type => (
            <Button
              key={type}
              onClick={() => setFilterType(type)}
              variant={filterType === type ? 'default' : 'outline'}
              className={filterType === type ? 'bg-purple-500' : ''}
            >
              {type.replace('_', ' ')}
            </Button>
          ))}
        </div>

        <PredictiveAnalyticsDashboard userEmail={userEmail} />

        <div className="grid grid-cols-3 gap-4 mb-6">
          <ConversationDocumenter />
          <VisualGenerator userEmail={userEmail} />
          <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Brain className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">Simulation Ready</h3>
                <p className="text-white/60 text-sm">All conversations logged</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Data Points</span>
                <span className="text-white font-bold">{stats.total || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Autonomous</span>
                <span className="text-cyan-400 font-bold">{stats.autonomous || 0}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          {filteredTimeline.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`border rounded-lg p-4 ${getTypeColor(item.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-black/20 rounded-lg">
                  {getTypeIcon(item.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm capitalize">{item.type}</span>
                      {item.autonomous && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                          Autonomous
                        </span>
                      )}
                      {item.sentiment && (
                        <span className="text-white/60 text-xs">
                          Sentiment: {item.sentiment}
                        </span>
                      )}
                    </div>
                    <span className="text-white/40 text-xs">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-white text-sm mb-2">{item.content}</p>
                  {item.response && (
                    <p className="text-white/60 text-sm italic">→ {item.response.substring(0, 100)}...</p>
                  )}
                  {item.audioUrl && (
                    <audio controls className="w-full mt-2" src={item.audioUrl} />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}