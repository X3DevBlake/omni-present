import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function VoiceCommandInterface() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commands, setCommands] = useState([]);

  const availableCommands = [
    { phrase: "show agents", action: "Navigate to agents page" },
    { phrase: "create workflow", action: "Open workflow builder" },
    { phrase: "system status", action: "Display system health" },
    { phrase: "optimize performance", action: "Run optimization analysis" },
    { phrase: "show analytics", action: "Navigate to analytics dashboard" }
  ];

  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      setTranscript('Listening...');
      
      // Simulate voice recognition
      setTimeout(() => {
        const randomCommand = availableCommands[Math.floor(Math.random() * availableCommands.length)];
        setTranscript(randomCommand.phrase);
        
        setTimeout(() => {
          toast.success(`Executing: ${randomCommand.action}`);
          setCommands(prev => [...prev, { ...randomCommand, timestamp: new Date() }]);
          setIsListening(false);
          setTranscript('');
        }, 1000);
      }, 2000);
    } else {
      setIsListening(false);
      setTranscript('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-6 h-6 text-blue-500" />
          Voice Command Interface
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
          <motion.button
            onClick={toggleListening}
            className={`p-8 rounded-full ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isListening ? (
              <MicOff className="w-12 h-12" />
            ) : (
              <Mic className="w-12 h-12" />
            )}
          </motion.button>
          
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex gap-2"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-2 h-2 bg-red-500 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="w-2 h-2 bg-red-500 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="w-2 h-2 bg-red-500 rounded-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {transcript && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-lg font-semibold text-gray-700"
            >
              "{transcript}"
            </motion.p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Available Commands
          </h3>
          <div className="space-y-2">
            {availableCommands.map((cmd, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded border bg-gray-50">
                <span className="text-sm font-medium">"{cmd.phrase}"</span>
                <Badge variant="secondary">{cmd.action}</Badge>
              </div>
            ))}
          </div>
        </div>

        {commands.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Recent Commands</h3>
            <div className="space-y-1">
              {commands.slice(-3).reverse().map((cmd, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm text-gray-600 p-2 rounded bg-green-50 border border-green-200"
                >
                  ✓ {cmd.action}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}