import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function VoiceNavigationAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      setTranscript(command);
      handleVoiceCommand(command);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    if (isListening) {
      recognition.start();
    }

    return () => recognition.stop();
  }, [isListening]);

  const handleVoiceCommand = (command) => {
    const routes = {
      'agents': '/AIManagement',
      'ai agents': '/AIManagement',
      'simulation': '/SimulationStudio',
      'simulations': '/SimulationStudio',
      'monitoring': '/AlertManagementDashboard',
      'alerts': '/AlertManagementDashboard',
      'banking': '/EnhancedBankingHub',
      'ai labs': '/AILabsAdvanced',
      'home': '/Home',
      'analytics': '/AIAnalyticsHub',
    };

    for (const [keyword, path] of Object.entries(routes)) {
      if (command.includes(keyword)) {
        navigate(createPageUrl(path));
        break;
      }
    }
  };

  return (
    <motion.button
      onClick={() => setIsListening(!isListening)}
      className={`fixed bottom-24 right-6 z-40 rounded-full p-4 shadow-lg transition-all ${
        isListening 
          ? 'bg-red-600 animate-pulse' 
          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
      }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {isListening ? (
        <MicOff className="w-6 h-6 text-white" />
      ) : (
        <Mic className="w-6 h-6 text-white" />
      )}
      
      {transcript && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 whitespace-nowrap"
        >
          <p className="text-white text-sm">{transcript}</p>
        </motion.div>
      )}
    </motion.button>
  );
}