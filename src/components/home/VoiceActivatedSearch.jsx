import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mic, Search, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VoiceActivatedSearch({ onSearch }) {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      setQuery(speechResult);
      if (onSearch) {
        onSearch(speechResult);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch && query) {
      onSearch(query);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search agents, models, analytics, or ask a question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-24 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={isListening ? 'destructive' : 'secondary'}
              className={isListening ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-white/20 hover:bg-white/30'}
              onClick={isListening ? () => setIsListening(false) : startVoiceRecognition}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
            >
              Search
            </Button>
          </div>
        </div>
      </form>

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 text-center"
          >
            <p className="text-cyan-400 text-sm">🎤 Listening...</p>
          </motion.div>
        )}
        
        {transcript && !isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 text-center"
          >
            <p className="text-white/70 text-sm">Heard: "{transcript}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}