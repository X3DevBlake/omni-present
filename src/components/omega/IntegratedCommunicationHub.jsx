import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Send, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function IntegratedCommunicationHub({ contextId }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const { data: user } = useQuery({
    queryKey: ['current_user'],
    queryFn: () => base44.auth.me()
  });

  const { data: chatHistory } = useQuery({
    queryKey: ['collab_chat', contextId],
    queryFn: () => base44.entities.CollaborationChat.filter({ 
      context_id: contextId 
    }, '-created_date', 50),
    initialData: []
  });

  useEffect(() => {
    if (chatHistory) {
      setMessages(chatHistory);
    }
  }, [chatHistory]);

  // Real-time message subscription
  useEffect(() => {
    if (!contextId) return;

    const unsubscribe = base44.entities.CollaborationChat.subscribe((event) => {
      if (event.data?.context_id === contextId && event.type === 'create') {
        queryClient.invalidateQueries({ queryKey: ['collab_chat'] });
      }
    });

    return unsubscribe;
  }, [contextId]);

  const sendMutation = useMutation({
    mutationFn: (msg) => base44.entities.CollaborationChat.create({
      context_id: contextId,
      sender_email: user.email,
      message_text: msg,
      message_type: 'text'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collab_chat'] });
      setMessage('');
    }
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate(message);
  };

  return (
    <Card className="bg-gradient-to-br from-violet-950/90 via-purple-950/90 to-fuchsia-950/90 backdrop-blur-xl border-violet-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-violet-400" />
          Integrated Communication
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/60">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="video">Video Call</TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <div className="space-y-3">
              <div className="bg-black/60 rounded-lg p-3 border border-violet-500/20 h-[250px] overflow-y-auto">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`mb-3 ${msg.sender_email === user?.email ? 'text-right' : 'text-left'}`}
                  >
                    <Badge className="bg-violet-600 mb-1 text-xs">
                      {msg.sender_email?.split('@')[0]}
                    </Badge>
                    <div className={`inline-block rounded-lg p-2 max-w-[80%] ${
                      msg.sender_email === user?.email ? 
                      'bg-violet-600' : 'bg-black/80'
                    }`}>
                      <div className="text-white text-sm">{msg.message_text}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-black/60 border-violet-500/30 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button onClick={handleSend} className="bg-violet-600">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="video">
            <div className="bg-black/60 rounded-lg p-8 border border-violet-500/20 text-center">
              <Phone className="w-12 h-12 text-violet-400 mx-auto mb-4" />
              <div className="text-white text-sm mb-3">Start a video call with collaborators</div>
              <Button className="bg-violet-600">
                <Phone className="w-4 h-4 mr-2" />
                Start Call
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}