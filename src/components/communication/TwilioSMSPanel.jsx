import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Loader2, CheckCircle, Bot } from 'lucide-react';

export default function TwilioSMSPanel({ userEmail }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const queryClient = useQueryClient();

  const { data: messages } = useQuery({
    queryKey: ['twilioMessages', userEmail],
    queryFn: () => base44.entities.TwilioMessage.filter({ user_email: userEmail }, '-created_date', 20),
    initialData: []
  });

  const { data: agents } = useQuery({
    queryKey: ['agents', userEmail],
    queryFn: () => base44.entities.Agent.filter({ user_email: userEmail }),
    initialData: []
  });

  const sendSms = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phoneNumber,
          message: message
        })
      });

      if (!response.ok) throw new Error('Failed to send SMS');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twilioMessages'] });
      setPhoneNumber('');
      setMessage('');
    }
  });

  const sendAutonomousSms = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/autonomous-sms-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent,
          phoneNumber: phoneNumber,
          eventType: 'proactive_notification'
        })
      });

      if (!response.ok) throw new Error('Failed to send autonomous SMS');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['twilioMessages'] });
      if (data.audio) {
        const audio = new Audio(data.audio);
        audio.play();
      }
    }
  });

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <MessageSquare className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">Twilio SMS</h3>
          <p className="text-white/60 text-sm">AI-powered SMS communication</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-white/80 text-sm mb-2 block">Phone Number</label>
          <Input
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="bg-white/5 border-white/10"
          />
        </div>

        <div>
          <label className="text-white/80 text-sm mb-2 block">
            Message ({message.length}/160)
          </label>
          <Textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 160))}
            className="bg-white/5 border-white/10 min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => sendSms.mutate()}
            disabled={!phoneNumber || !message || sendSms.isPending}
            className="bg-gradient-to-r from-green-500 to-emerald-500"
          >
            {sendSms.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send SMS
              </>
            )}
          </Button>

          <div className="flex gap-2">
            <Select value={selectedAgent} onValueChange={setSelectedAgent} className="flex-1">
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => sendAutonomousSms.mutate()}
              disabled={!phoneNumber || !selectedAgent || sendAutonomousSms.isPending}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              {sendAutonomousSms.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {(sendSms.isSuccess || sendAutonomousSms.isSuccess) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-green-400" />
            <p className="text-white text-sm">SMS sent successfully!</p>
          </motion.div>
        )}

        {sendAutonomousSms.data?.orchestration && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3"
          >
            <p className="text-white text-xs mb-2">
              <strong>AI Generated:</strong> {sendAutonomousSms.data.message}
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                Gemini: {sendAutonomousSms.data.orchestration.gemini}
              </span>
              {sendAutonomousSms.data.orchestration.mistral !== 'not used' && (
                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">
                  Mistral: {sendAutonomousSms.data.orchestration.mistral}
                </span>
              )}
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                Twilio: {sendAutonomousSms.data.orchestration.twilio}
              </span>
            </div>
          </motion.div>
        )}

        <div className="bg-black/20 rounded-lg p-4">
          <h4 className="text-white font-bold text-sm mb-3">Message History ({messages.length})</h4>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 rounded p-2"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/80 text-xs font-mono">{msg.to_number}</span>
                  <div className="flex items-center gap-2">
                    {msg.autonomous && <Bot className="w-3 h-3 text-purple-400" />}
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      msg.status === 'sent' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {msg.status}
                    </span>
                  </div>
                </div>
                <p className="text-white text-xs">{msg.message}</p>
                <p className="text-white/40 text-xs mt-1">
                  {new Date(msg.created_date).toLocaleString()}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}