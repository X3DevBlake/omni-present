import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VoiceCommandInterface({ onCommand }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commands, setCommands] = useState([]);

  const toggleListening = () => {
    if (!listening) {
      setListening(true);
      // Simulate voice recognition
      setTimeout(() => {
        const mockCommands = [
          'Start training agent Alpha',
          'Generate new scenario',
          'Show performance metrics',
          'Export simulation data'
        ];
        const command = mockCommands[Math.floor(Math.random() * mockCommands.length)];
        setTranscript(command);
        setCommands([{ text: command, timestamp: new Date() }, ...commands].slice(0, 10));
        onCommand?.(command);
        setListening(false);
      }, 2000);
    } else {
      setListening(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Volume2 className="w-6 h-6 text-blue-400" />
        Voice Command Interface
      </h3>

      <div className="flex flex-col items-center mb-6">
        <motion.button
          onClick={toggleListening}
          className={`w-24 h-24 rounded-full flex items-center justify-center ${
            listening ? 'bg-red-500/30 border-red-500' : 'bg-blue-500/30 border-blue-500'
          } border-4 cursor-pointer`}
          animate={listening ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          {listening ? (
            <Mic className="w-12 h-12 text-red-400" />
          ) : (
            <MicOff className="w-12 h-12 text-blue-400" />
          )}
        </motion.button>
        <div className="text-white/60 text-sm mt-3">
          {listening ? 'Listening...' : 'Click to speak'}
        </div>
      </div>

      {transcript && (
        <div className="bg-black/20 rounded-lg p-4 mb-4">
          <div className="text-white/60 text-xs mb-1">Last Command</div>
          <div className="text-white font-medium">{transcript}</div>
        </div>
      )}

      <div className="space-y-2 max-h-48 overflow-y-auto">
        <h4 className="text-white/60 text-sm mb-2">Command History</h4>
        {commands.map((cmd, i) => (
          <div key={i} className="bg-black/20 rounded-lg p-2 text-sm">
            <div className="text-white">{cmd.text}</div>
            <div className="text-white/40 text-xs">{new Date(cmd.timestamp).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}