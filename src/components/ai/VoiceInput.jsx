import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { toast } from 'sonner';

export default function VoiceInput({ onTranscript, isActive }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(interimTranscript || finalTranscript);

      if (finalTranscript) {
        onTranscript(finalTranscript.trim());
        setTranscript('');
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Microphone permission denied');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (isActive) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (isActive && recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    } else if (!isActive && recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="absolute bottom-20 left-4 right-4">
      <motion.div
        className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              scale: isListening ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 1,
              repeat: isListening ? Infinity : 0,
            }}
            className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
          >
            <Mic className="w-4 h-4 text-white" />
          </motion.div>
          <div className="flex-1">
            <div className="text-white/60 text-xs mb-1">
              {isListening ? 'Listening...' : 'Initializing microphone...'}
            </div>
            {transcript && (
              <div className="text-white text-sm">{transcript}</div>
            )}
          </div>
        </div>

        <div className="flex gap-1 mt-2">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full"
              animate={{
                height: isListening ? [4, Math.random() * 20 + 4, 4] : 4,
              }}
              transition={{
                duration: 0.5,
                repeat: isListening ? Infinity : 0,
                delay: i * 0.05,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}