import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function VoiceNavigationControl() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const navigate = useNavigate();

  const pageMap = {
    'home': 'HomeEnhanced',
    'agents': 'AIAgentMarketplace',
    'marketplace': 'AIAgentMarketplace',
    'analytics': 'AnalyticsIntelligenceHub',
    'collaboration': 'CollaborationOrchestrationHub',
    'security': 'SecurityComplianceHub',
    'simulation': 'SimulationHub',
    'labs': 'NextGenMLHub',
    'ai labs': 'NextGenMLHub',
    'defi': 'AdvancedDeFiHub',
    'banking': 'EnhancedBankingHub'
  };

  const startVoiceNavigation = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice navigation not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      const speech = event.results[0][0].transcript.toLowerCase();
      setTranscript(speech);
      
      const navigationCommands = ['go to', 'navigate to', 'open', 'show me', 'take me to'];
      let targetPage = null;

      navigationCommands.forEach(cmd => {
        if (speech.includes(cmd)) {
          const query = speech.replace(cmd, '').trim();
          
          Object.keys(pageMap).forEach(key => {
            if (query.includes(key)) {
              targetPage = pageMap[key];
            }
          });
        }
      });

      if (targetPage) {
        toast.success(`Navigating to ${targetPage.replace(/([A-Z])/g, ' $1').trim()}`);
        setTimeout(() => {
          navigate(createPageUrl(targetPage));
        }, 500);
      } else {
        toast.info(`Heard: "${speech}" - try "Go to [page name]"`);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice recognition failed');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="fixed top-20 right-6 z-40">
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="mb-2"
          >
            <Card className="bg-gradient-to-r from-purple-900/95 to-pink-900/95 border-purple-400/50 backdrop-blur-md">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-sm">Listening for navigation command...</span>
                </div>
                {transcript && (
                  <p className="text-white/60 text-xs mt-2">"{transcript}"</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        onClick={startVoiceNavigation}
        className={`rounded-full w-12 h-12 shadow-2xl ${
          isListening
            ? 'bg-gradient-to-r from-red-600 to-pink-600 animate-pulse'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
        }`}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </Button>
    </div>
  );
}