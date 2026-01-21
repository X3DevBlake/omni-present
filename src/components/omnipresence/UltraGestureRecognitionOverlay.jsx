import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Hand, Zap, Move, RotateCcw, Target, CheckCircle } from 'lucide-react';

export default function UltraGestureRecognitionOverlay({ onGestureDetected, context = {} }) {
  const [isTracking, setIsTracking] = useState(false);
  const [lastGesture, setLastGesture] = useState(null);
  const [handPosition, setHandPosition] = useState({ x: 0, y: 0, z: 0 });
  const trackingRef = useRef(null);

  const nlpEnhanceMutation = useMutation({
    mutationFn: async (gestureData) => {
      const response = await base44.functions.invoke('omega-nlp-interpreter', {
        input_type: 'gesture',
        raw_input: gestureData.gesture_type,
        context: gestureData.context
      });
      return response.data;
    }
  });

  const gestureRecognitionMutation = useMutation({
    mutationFn: async (gestureData) => {
      // First enhance with omega NLP
      const nlpResponse = await base44.functions.invoke('omega-nlp-interpreter', {
        input_type: 'gesture',
        raw_input: gestureData.gesture_type,
        context: gestureData.context
      });
      
      // Then execute gesture
      const response = await base44.functions.invoke('gesture-recognition-engine', {
        ...gestureData,
        nlp_enhancement: nlpResponse.data.interpretation
      });
      return response.data;
    },
    onSuccess: (data) => {
      setLastGesture(data);
      onGestureDetected && onGestureDetected(data);
      if (data.success && data.interpretation?.confidence > 0.6) {
        toast.success(data.feedback || 'Gesture recognized with omega NLP');
      }
    }
  });

  // Simulate gesture detection (in real app, use camera/sensor)
  const detectGesture = (type) => {
    const gestureData = {
      gesture_type: type,
      hand_position: handPosition,
      velocity: Math.random() * 2,
      context: context
    };
    
    gestureRecognitionMutation.mutate(gestureData);
  };

  const gestures = [
    { type: 'swipe_left', icon: '👈', label: 'Swipe Left', color: '#3b82f6' },
    { type: 'swipe_right', icon: '👉', label: 'Swipe Right', color: '#3b82f6' },
    { type: 'pinch', icon: '🤏', label: 'Pinch', color: '#10b981' },
    { type: 'grab', icon: '✊', label: 'Grab', color: '#f59e0b' },
    { type: 'point', icon: '☝️', label: 'Point', color: '#ec4899' },
    { type: 'wave', icon: '👋', label: 'Wave', color: '#06b6d4' },
    { type: 'circle', icon: '⭕', label: 'Circle', color: '#a855f7' }
  ];

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Hand className="w-5 h-5 text-purple-400" />
          Ultra Gesture Recognition
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsTracking(!isTracking)}
            variant={isTracking ? 'default' : 'outline'}
            className={isTracking ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
          >
            {isTracking ? (
              <><Zap className="w-4 h-4 mr-2" /> Tracking Active</>
            ) : (
              <><Hand className="w-4 h-4 mr-2" /> Start Tracking</>
            )}
          </Button>

          {lastGesture && lastGesture.interpretation && (
            <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/50 px-3 py-1.5 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-300 text-sm">{lastGesture.interpretation.command_type}</span>
              <Badge className="bg-green-500/30 text-green-300 text-xs">
                {((lastGesture.interpretation.confidence || 0) * 100).toFixed(0)}%
              </Badge>
            </div>
          )}
        </div>

        <div>
          <p className="text-slate-300 text-sm mb-3">Gesture Library</p>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {gestures.map(gesture => (
              <button
                key={gesture.type}
                onClick={() => detectGesture(gesture.type)}
                disabled={gestureRecognitionMutation.isPending}
                className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 rounded-lg p-3 transition-all flex flex-col items-center gap-2"
              >
                <span className="text-2xl">{gesture.icon}</span>
                <span className="text-xs text-slate-300">{gesture.label}</span>
              </button>
            ))}
          </div>
        </div>

        {lastGesture?.interpretation && (
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
            <p className="text-white font-bold mb-2">Last Interpretation</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Command:</span>
                <Badge>{lastGesture.interpretation.command_type}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Target:</span>
                <span className="text-white text-sm">{lastGesture.interpretation.target_type || 'None'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Executed:</span>
                {lastGesture.execution_result ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <X className="w-5 h-5 text-slate-500" />
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-3 border border-purple-500/30">
          <p className="text-purple-300 text-xs">
            💡 <span className="font-bold">Tip:</span> Use gestures to manipulate objects, assign tasks, and control the environment without touching controls.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}