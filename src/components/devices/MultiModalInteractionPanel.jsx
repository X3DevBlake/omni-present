import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Hand, Vibrate, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function MultiModalInteractionPanel({ deviceId, agentId }) {
  const [voiceCommand, setVoiceCommand] = useState('');
  const [gestureType, setGestureType] = useState('tap');
  const [hapticIntensity, setHapticIntensity] = useState(50);

  const executeMultiModal = async () => {
    const interaction = await base44.integrations.Core.InvokeLLM({
      prompt: `Execute multi-modal interaction:
Voice: "${voiceCommand}"
Gesture: ${gestureType}
Haptic: ${hapticIntensity}% intensity

Combine all modalities for optimal physical task execution.`,
      response_json_schema: {
        type: 'object',
        properties: {
          execution_plan: { type: 'string' },
          sequence: { type: 'array' }
        }
      }
    });

    await base44.entities.GestureCommand.create({
      agent_id: agentId,
      device_id: deviceId,
      gesture_type: gestureType,
      command: voiceCommand,
      parameters: { haptic_intensity: hapticIntensity, voice_enabled: true },
      success: true
    });
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        Multi-Modal Control
      </h3>

      <div className="space-y-4">
        <div>
          <label className="text-white/60 text-xs mb-2 block flex items-center gap-2">
            <Mic className="w-3 h-3" />
            Voice Command
          </label>
          <Input
            value={voiceCommand}
            onChange={(e) => setVoiceCommand(e.target.value)}
            placeholder="Turn on lights at 50% brightness"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div>
          <label className="text-white/60 text-xs mb-2 block flex items-center gap-2">
            <Hand className="w-3 h-3" />
            Gesture Type
          </label>
          <select
            value={gestureType}
            onChange={(e) => setGestureType(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
          >
            <option value="tap">Tap</option>
            <option value="swipe">Swipe</option>
            <option value="pinch">Pinch</option>
            <option value="rotate">Rotate</option>
          </select>
        </div>

        <div>
          <label className="text-white/60 text-xs mb-2 block flex items-center gap-2">
            <Vibrate className="w-3 h-3" />
            Haptic: {hapticIntensity}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={hapticIntensity}
            onChange={(e) => setHapticIntensity(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <Button onClick={executeMultiModal} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500">
          Execute Multi-Modal
        </Button>
      </div>
    </div>
  );
}