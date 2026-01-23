import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Hand, Mic, Eye, Brain, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function MultiModalController({ onCommand }) {
  const [activeMode, setActiveMode] = useState('gesture');
  const [isListening, setIsListening] = useState(false);
  const [gestureData, setGestureData] = useState(null);

  const commandMutation = useMutation({
    mutationFn: async ({ type, data, context }) => {
      const response = await base44.functions.invoke('multiModalCommandProcessor', {
        interaction_type: type,
        input_data: data,
        spatial_context: context
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Command executed: ${data.intent}`);
      if (onCommand) onCommand(data);
    }
  });

  // Gesture detection
  useEffect(() => {
    if (activeMode !== 'gesture') return;

    let touchStart = null;
    
    const handleTouchStart = (e) => {
      touchStart = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    };

    const handleTouchEnd = (e) => {
      if (!touchStart) return;
      
      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
        time: Date.now()
      };

      const dx = touchEnd.x - touchStart.x;
      const dy = touchEnd.y - touchStart.y;
      const duration = touchEnd.time - touchStart.time;

      let gestureType = 'tap';
      if (Math.abs(dx) > 100) gestureType = dx > 0 ? 'swipe_right' : 'swipe_left';
      else if (Math.abs(dy) > 100) gestureType = dy > 0 ? 'swipe_down' : 'swipe_up';

      const gesture = {
        gesture_type: gestureType,
        start_point: { x: touchStart.x, y: touchStart.y, z: 0 },
        end_point: { x: touchEnd.x, y: touchEnd.y, z: 0 },
        velocity: Math.sqrt(dx * dx + dy * dy) / duration,
        duration_ms: duration
      };

      setGestureData(gesture);
      
      commandMutation.mutate({
        type: 'gesture',
        data: gesture,
        context: { environment_id: 'default' }
      });

      touchStart = null;
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeMode]);

  // Voice recognition
  const handleVoiceCommand = () => {
    setIsListening(true);
    
    // In production, use Web Speech API or ElevenLabs
    setTimeout(() => {
      const mockTranscript = "Navigate to the nearest agent";
      
      commandMutation.mutate({
        type: 'voice',
        data: {
          transcript: mockTranscript,
          language: 'en-US'
        },
        context: { environment_id: 'default' }
      });
      
      setIsListening(false);
    }, 2000);
  };

  const modes = [
    { id: 'gesture', label: 'Gesture', icon: Hand, color: 'indigo' },
    { id: 'voice', label: 'Voice', icon: Mic, color: 'purple' },
    { id: 'gaze', label: 'Gaze', icon: Eye, color: 'cyan' },
    { id: 'thought', label: 'Thought', icon: Brain, color: 'pink' }
  ];

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Multi-Modal Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {modes.map(mode => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.id;
            
            return (
              <motion.button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isActive
                    ? `border-${mode.color}-500 bg-${mode.color}-900/30`
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <Icon className={`w-6 h-6 mx-auto mb-2 ${
                  isActive ? `text-${mode.color}-400` : 'text-slate-400'
                }`} />
                <div className={`text-sm ${isActive ? 'text-white' : 'text-slate-400'}`}>
                  {mode.label}
                </div>
              </motion.button>
            );
          })}
        </div>

        {activeMode === 'voice' && (
          <Button
            onClick={handleVoiceCommand}
            disabled={isListening || commandMutation.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Mic className="w-4 h-4 mr-2" />
            {isListening ? 'Listening...' : 'Start Voice Command'}
          </Button>
        )}

        {gestureData && (
          <div className="p-3 bg-slate-800 rounded-lg border border-indigo-700">
            <div className="text-sm text-slate-400 mb-2">Last Gesture</div>
            <Badge variant="outline" className="bg-indigo-900 text-indigo-200">
              {gestureData.gesture_type}
            </Badge>
          </div>
        )}

        {commandMutation.isPending && (
          <div className="text-center text-sm text-slate-400">
            Processing command...
          </div>
        )}
      </CardContent>
    </Card>
  );
}