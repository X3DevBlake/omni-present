/**
 * Voice Command Interface
 * - Natural language voice commands
 * - Real-time transcription
 * - Command visualization
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Volume2 } from 'lucide-react';

export function VoiceCommandInterface({ onCommand }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [suggestions, setSuggestions] = useState([
    'Show portfolio',
    'Open analytics',
    'Show transactions',
    'Check alerts',
    'Update settings'
  ]);
  const recognitionRef = useRef(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech Recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setTranscript('Listening...');
    };

    recognitionRef.current.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        interim += event.results[i][0].transcript;
      }
      setTranscript(interim);

      if (event.results[event.results.length - 1].isFinal) {
        onCommand?.(interim);
        setIsListening(false);
      }
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
      setTranscript('Error listening');
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return (
    <div className="space-y-4">
      {/* Microphone Button */}
      <Button
        onClick={isListening ? stopListening : startListening}
        className={`w-full py-8 text-lg font-semibold ${
          isListening
            ? 'bg-red-600 hover:bg-red-700 animate-pulse'
            : 'bg-cyan-600 hover:bg-cyan-700'
        }`}
      >
        <Mic className="w-6 h-6 mr-2" />
        {isListening ? 'Listening...' : 'Start Voice Command'}
      </Button>

      {/* Transcript Display */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-black/40 border border-cyan-500/30 rounded-lg p-4"
          >
            <p className="text-white text-sm mb-2">Transcript:</p>
            <p className="text-cyan-400 font-mono text-sm">{transcript}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions */}
      <div className="space-y-2">
        <p className="text-gray-400 text-xs">Try these commands:</p>
        <div className="grid grid-cols-2 gap-2">
          {suggestions.map((suggestion, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.05 }}
              onClick={() => onCommand?.(suggestion)}
              className="bg-black/40 border border-white/10 hover:border-cyan-400/50 text-white text-xs p-2 rounded transition-all"
            >
              {suggestion}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}