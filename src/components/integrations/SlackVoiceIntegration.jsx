import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MessageSquare, Zap, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SlackVoiceIntegration() {
  const [voiceMessages, setVoiceMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [summary, setSummary] = useState(null);

  const recordSlackVoiceMessage = async () => {
    try {
      if (!isRecording) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];

        mediaRecorder.ondataavailable = e => chunks.push(e.data);
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: 'audio/wav' });
          
          // Transcribe
          const transcription = await base44.integrations.Core.InvokeLLM({
            prompt: 'Transcribe this community voice message',
            file_urls: [URL.createObjectURL(audioBlob)],
          });

          // Generate Slack summary
          const slackSummary = await base44.integrations.Core.InvokeLLM({
            prompt: `Create concise Slack message summary:
            
Message: ${transcription}

Include:
1. 2-line summary
2. Key action items (if any)
3. Emoji reaction suggestion`,
            response_json_schema: {
              type: 'object',
              properties: {
                summary: { type: 'string' },
                actionItems: { type: 'array', items: { type: 'string' } },
                emoji: { type: 'string' },
              },
            },
          });

          const msg = {
            id: Date.now(),
            transcription,
            summary: slackSummary,
            audioUrl: URL.createObjectURL(audioBlob),
            timestamp: new Date(),
            sent: false,
          };

          setVoiceMessages(prev => [...prev, msg]);
        };

        mediaRecorder.start();
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Error recording:', error);
    }
  };

  const sendToSlack = async (message) => {
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Send this to Slack community:
        
Message: ${message.transcription}
Summary: ${message.summary.summary}
Action Items: ${message.summary.actionItems.join(', ')}

Post in #community-voice-messages with summary and link to full message.`,
      });

      setVoiceMessages(prev =>
        prev.map(m => m.id === message.id ? { ...m, sent: true } : m)
      );
    } catch (error) {
      console.error('Error sending:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Record Button */}
      <motion.div
        className="bg-white/5 border border-purple-400/30 rounded-lg p-6 text-center space-y-4"
      >
        <p className="text-white font-bold">Slack Voice Messages</p>
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={recordSlackVoiceMessage}
          className={`mx-auto p-4 rounded-full border-4 transition-all ${
            isRecording
              ? 'bg-red-500/30 border-red-400 animate-pulse'
              : 'bg-purple-500/20 border-purple-400'
          }`}
        >
          <Mic className="w-8 h-8 text-white" />
        </motion.button>
        <p className="text-white/60 text-sm">
          {isRecording ? 'Recording for Slack...' : 'Click to record message'}
        </p>
      </motion.div>

      {/* Messages List */}
      <div className="space-y-2">
        {voiceMessages.map((msg, idx) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`border rounded-lg p-3 cursor-pointer transition-all ${
              selectedMessage?.id === msg.id
                ? 'bg-cyan-500/20 border-cyan-400'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
            onClick={() => setSelectedMessage(msg)}
          >
            <div className="flex items-start gap-3">
              <Mic className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{msg.summary.summary}</p>
                <audio src={msg.audioUrl} controls className="w-full h-6 mt-2" />
              </div>
              {msg.sent && (
                <motion.span className="text-green-400 text-xs font-bold">Sent</motion.span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Message Details */}
      {selectedMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3"
        >
          <p className="text-white font-bold text-sm">Full Transcription:</p>
          <p className="text-white/80 text-sm">{selectedMessage.transcription}</p>

          {selectedMessage.summary.actionItems.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-400/20 rounded p-2">
              <p className="text-yellow-300 text-xs font-bold mb-1">Action Items:</p>
              {selectedMessage.summary.actionItems.map((item, i) => (
                <p key={i} className="text-yellow-200/80 text-xs">→ {item}</p>
              ))}
            </div>
          )}

          {!selectedMessage.sent && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => sendToSlack(selectedMessage)}
              className="w-full px-4 py-2 bg-green-500/20 border border-green-400 rounded text-green-300 text-sm hover:bg-green-500/30 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Send to Slack
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
}