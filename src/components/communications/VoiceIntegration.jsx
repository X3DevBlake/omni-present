import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Volume2, Square } from 'lucide-react';

export default function VoiceIntegration() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcription, setTranscription] = useState('');

  const handleStartRecording = () => {
    setIsRecording(true);
    // Simulate recording
    setTimeout(() => {
      setTranscription('What is the current market sentiment analysis?');
    }, 2000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handlePlayResponse = () => {
    setIsPlaying(true);
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Recording */}
      <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Mic className="w-5 h-5" /> Voice Command
        </h3>
        <div className="space-y-4">
          {!isRecording ? (
            <Button onClick={handleStartRecording} className="w-full bg-cyan-600 hover:bg-cyan-700 h-12">
              <Mic className="w-5 h-5 mr-2" /> Start Recording
            </Button>
          ) : (
            <motion.div className="w-full">
              <Button onClick={handleStopRecording} className="w-full bg-red-600 hover:bg-red-700 h-12">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="w-2 h-2 bg-white rounded-full mr-2"
                />
                Stop Recording
              </Button>
              <div className="mt-3 flex justify-center gap-2">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-cyan-400 rounded-full"
                    animate={{ height: [8, 20, 8] }}
                    transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.05 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {transcription && (
            <div className="bg-black/40 rounded-lg p-4">
              <p className="text-white/60 text-xs mb-1">Transcription</p>
              <p className="text-white">{transcription}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Voice Response */}
      <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Volume2 className="w-5 h-5" /> Agent Response
        </h3>
        <div className="space-y-4">
          <div className="bg-black/40 rounded-lg p-4">
            <p className="text-white/60 text-xs mb-1">Response Text</p>
            <p className="text-white">
              Based on current market analysis, sentiment indicators show a moderately bullish trend. We recommend monitoring the tech sector for volatility.
            </p>
          </div>

          {!isPlaying ? (
            <Button onClick={handlePlayResponse} className="w-full bg-purple-600 hover:bg-purple-700 h-12">
              <Volume2 className="w-5 h-5 mr-2" /> Play Response
            </Button>
          ) : (
            <Button disabled className="w-full bg-purple-600/50 h-12">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="mr-2">
                <Square className="w-4 h-4" />
              </motion.div>
              Playing...
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}