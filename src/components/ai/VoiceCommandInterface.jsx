import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, Loader2, Brain, Sparkles } from 'lucide-react';

export default function VoiceCommandInterface({ agentId, deviceId, userEmail }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);
  const queryClient = useQueryClient();

  const processCommand = useMutation({
    mutationFn: async (voiceInput) => {
      const response = await fetch('/api/functions/unified-orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: voiceInput,
          inputType: 'voice',
          agentId,
          deviceId
        })
      });

      if (!response.ok) throw new Error('Failed to process command');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.audio) {
        const audio = new Audio(data.audio);
        audio.play();
      }
      queryClient.invalidateQueries();
    }
  });

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        setIsProcessing(true);
        processCommand.mutate(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsProcessing(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Mic className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">Voice Command Interface</h3>
          <p className="text-white/60 text-sm">Speak naturally to control everything</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-black/20 rounded-lg p-6 min-h-[120px] flex items-center justify-center">
          {isListening && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="p-4 bg-blue-500/20 rounded-full"
            >
              <Mic className="w-8 h-8 text-blue-400" />
            </motion.div>
          )}
          
          {!isListening && !isProcessing && (
            <div className="text-center">
              <MicOff className="w-8 h-8 text-white/40 mx-auto mb-2" />
              <p className="text-white/60 text-sm">Click to start speaking</p>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
              <Brain className="w-6 h-6 text-cyan-400 animate-pulse" />
              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
          )}
        </div>

        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-lg p-4"
          >
            <p className="text-white/60 text-xs mb-1">Transcript:</p>
            <p className="text-white">{transcript}</p>
          </motion.div>
        )}

        {processCommand.data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="w-4 h-4 text-purple-400" />
              <p className="text-white/60 text-xs">AI Response:</p>
            </div>
            <p className="text-white text-sm mb-2">{processCommand.data.response}</p>
            
            {processCommand.data.orchestration && (
              <div className="flex gap-2 mt-3">
                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                  {processCommand.data.orchestration.gemini}
                </span>
                {processCommand.data.orchestration.mistral !== 'not used' && (
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">
                    Mistral: {processCommand.data.orchestration.mistral}
                  </span>
                )}
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                  {processCommand.data.orchestration.elevenlabs}
                </span>
              </div>
            )}
          </motion.div>
        )}

        <Button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`w-full ${
            isListening 
              ? 'bg-gradient-to-r from-red-500 to-pink-500' 
              : 'bg-gradient-to-r from-blue-500 to-cyan-500'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4 mr-2" />
              Stop Listening
            </>
          ) : isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Start Voice Command
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}