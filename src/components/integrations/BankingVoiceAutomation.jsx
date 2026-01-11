import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageSquare, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function BankingVoiceAutomation() {
  const [voiceCommands, setVoiceCommands] = useState([
    { id: 1, command: 'Show my cards', action: 'cards', enabled: true },
    { id: 2, command: 'Crypto analysis', action: 'crypto', enabled: true },
    { id: 3, command: 'DeFi opportunities', action: 'defi', enabled: true },
  ]);
  const [isRecording, setIsRecording] = useState(false);

  const toggleCommand = (id) => {
    setVoiceCommands(prev =>
      prev.map(cmd => cmd.id === id ? { ...cmd, enabled: !cmd.enabled } : cmd)
    );
  };

  const sendToSlack = async (message) => {
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Send Slack notification: ${message}`,
      });
    } catch (error) {
      console.error('Error sending to Slack:', error);
    }
  };

  const recordVoiceCommand = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];

        mediaRecorder.ondataavailable = e => chunks.push(e.data);
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: 'audio/wav' });
          const transcription = await base44.integrations.Core.InvokeLLM({
            prompt: 'Transcribe this voice command for banking',
            file_urls: [URL.createObjectURL(audioBlob)],
          });
          
          if (transcription) {
            await sendToSlack(`Voice Command: ${transcription}`);
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Microphone error:', error);
      }
    }
  };

  return (
    <div className="space-y-3 p-4 bg-white/5 border border-white/10 rounded-lg">
      <h3 className="text-white font-bold text-sm">Voice Automation</h3>

      <div className="space-y-2">
        {voiceCommands.map(cmd => (
          <motion.div
            key={cmd.id}
            className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded"
          >
            <div className="flex-1">
              <p className="text-white text-xs">{cmd.command}</p>
              <p className="text-white/40 text-xs">{cmd.action}</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cmd.enabled}
                onChange={() => toggleCommand(cmd.id)}
                className="w-3 h-3 rounded"
              />
              <span className="text-white/60 text-xs">Enabled</span>
            </label>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={recordVoiceCommand}
        className={`w-full py-2 rounded border text-sm transition-all flex items-center justify-center gap-2 ${
          isRecording
            ? 'bg-red-500/20 border-red-400 text-red-300'
            : 'bg-cyan-500/20 border-cyan-400 text-cyan-300 hover:bg-cyan-500/30'
        }`}
      >
        <Phone className="w-4 h-4" />
        {isRecording ? 'Recording...' : 'Record Voice Command'}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        className="w-full py-2 px-3 bg-green-500/20 border border-green-400 rounded text-green-300 text-sm hover:bg-green-500/30 flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        Save to Zapier Workflow
      </motion.button>
    </div>
  );
}