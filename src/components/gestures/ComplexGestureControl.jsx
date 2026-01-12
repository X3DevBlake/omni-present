import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Hand } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ComplexGestureControl({ agentId, deviceId }) {
  const [sequence, setSequence] = useState([]);
  const [executing, setExecuting] = useState(false);

  const gestureTypes = ['swipe', 'pinch', 'rotate', 'tap', 'hold', 'wave'];

  const addStep = (gesture) => {
    setSequence([...sequence, { gesture_type: gesture, timing_ms: 200 }]);
  };

  const executeSequence = async () => {
    setExecuting(true);
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Execute complex gesture sequence: ${JSON.stringify(sequence)}`
      });
      await base44.entities.ComplexGestureSequence.create({
        agent_id: agentId,
        device_id: deviceId,
        gesture_steps: sequence.map((s, i) => ({ ...s, step_number: i + 1 })),
        execution_success: true
      });
      setSequence([]);
    } catch (error) {
      console.error('Gesture execution error:', error);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <h3 className="text-white font-bold mb-3 flex items-center gap-2">
        <Hand className="w-5 h-5 text-cyan-400" />
        Complex Gesture Control
      </h3>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {gestureTypes.map(gesture => (
          <button
            key={gesture}
            onClick={() => addStep(gesture)}
            className="px-3 py-2 bg-purple-500/20 border border-purple-400/30 text-purple-300 rounded hover:bg-purple-500/30 text-xs"
          >
            {gesture}
          </button>
        ))}
      </div>

      {sequence.length > 0 && (
        <div className="bg-white/5 rounded p-3 mb-3">
          <p className="text-white/60 text-xs mb-2">Sequence ({sequence.length} steps)</p>
          <div className="flex gap-1 flex-wrap">
            {sequence.map((step, i) => (
              <span key={i} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                {i + 1}. {step.gesture_type}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={executeSequence}
        disabled={sequence.length === 0 || executing}
        className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded font-semibold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Zap className="w-4 h-4" />
        {executing ? 'Executing...' : 'Execute with Haptic Feedback'}
      </button>
    </div>
  );
}