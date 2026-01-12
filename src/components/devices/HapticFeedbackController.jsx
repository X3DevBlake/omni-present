import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Vibrate, Zap, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function HapticFeedbackController({ deviceId, agentId }) {
  const [intensity, setIntensity] = useState(50);
  const [duration, setDuration] = useState(200);

  const triggerHaptic = async () => {
    await base44.entities.GestureCommand.create({
      agent_id: agentId,
      device_id: deviceId,
      gesture_type: 'haptic_trigger',
      command: 'vibrate',
      parameters: { intensity, duration_ms: duration },
      success: true
    });
  };

  const getAISuggestion = async () => {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: 'Suggest optimal haptic feedback for button press confirmation',
      response_json_schema: {
        type: 'object',
        properties: {
          intensity: { type: 'number' },
          duration_ms: { type: 'number' }
        }
      }
    });
    setIntensity(result.intensity);
    setDuration(result.duration_ms);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Vibrate className="w-5 h-5 text-purple-400" />
        Haptic Control
      </h3>

      <div className="space-y-4">
        <div>
          <label className="text-white/60 text-xs mb-2 block">Intensity: {intensity}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-white/60 text-xs mb-2 block">Duration: {duration}ms</label>
          <input
            type="range"
            min="50"
            max="1000"
            step="50"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={triggerHaptic} className="flex-1 bg-purple-500 hover:bg-purple-600">
            <Play className="w-4 h-4 mr-2" />
            Test Haptic
          </Button>
          <Button onClick={getAISuggestion} variant="outline" className="flex-1">
            <Zap className="w-4 h-4 mr-2" />
            AI Suggest
          </Button>
        </div>
      </div>
    </div>
  );
}