import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Send, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SlackVoiceAdvisor() {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceMessages, setVoiceMessages] = useState([]);
  const [callSummary, setCallSummary] = useState(null);

  const recordVoiceMessage = async () => {
    try {
      if (!isRecording) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];

        mediaRecorder.ondataavailable = e => chunks.push(e.data);
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: 'audio/wav' });
          await sendToSlack(audioBlob);
        };

        mediaRecorder.start();
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Microphone error:', error);
    }
  };

  const sendToSlack = async (audioBlob) => {
    try {
      // Transcribe and analyze
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: 'Transcribe this financial advisor voice message',
        file_urls: [URL.createObjectURL(audioBlob)],
      });

      // Generate summary for Slack
      const summary = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize this advisor message for Slack notification:
        
Message: ${response}

Create brief summary with key points and action items.`,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            actionItems: { type: 'array', items: { type: 'string' } },
          },
        },
      });

      setVoiceMessages(prev => [...prev, { 
        audioUrl: URL.createObjectURL(audioBlob),
        summary: summary.summary,
        timestamp: new Date() 
      }]);

      setIsRecording(false);
    } catch (error) {
      console.error('Error processing voice:', error);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-lg">
      <h3 className="text-white font-bold">Voice Messages in Slack</h3>

      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={recordVoiceMessage}
        className={`w-full py-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
          isRecording
            ? 'bg-red-500/20 border-red-400'
            : 'bg-cyan-500/20 border-cyan-400'
        }`}
      >
        <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse text-red-400' : 'text-cyan-300'}`} />
        <span className="text-white text-sm">{isRecording ? 'Recording...' : 'Record Message'}</span>
      </motion.button>

      <div className="space-y-2">
        {voiceMessages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 border border-white/10 rounded p-3"
          >
            <audio src={msg.audioUrl} controls className="w-full mb-2 h-8" />
            <p className="text-white/80 text-sm">{msg.summary}</p>
            <p className="text-white/40 text-xs mt-1">{msg.timestamp.toLocaleTimeString()}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}