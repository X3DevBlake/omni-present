import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hand, Plus, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function GestureSequenceBuilder({ agentId, deviceId }) {
  const [steps, setSteps] = useState([]);

  const addStep = () => {
    setSteps([...steps, {
      step_number: steps.length + 1,
      gesture_type: 'tap',
      haptic_response: { intensity: 50, duration_ms: 100 },
      timing_ms: 500
    }]);
  };

  const executeSequence = async () => {
    await base44.entities.ComplexGestureSequence.create({
      agent_id: agentId,
      device_id: deviceId,
      gesture_steps: steps,
      command_result: 'executed',
      execution_success: true
    });
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Hand className="w-5 h-5 text-cyan-400" />
        Gesture Sequence Builder
      </h3>

      <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 border border-white/10 rounded p-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
              <span className="text-cyan-400 font-bold text-sm">{i + 1}</span>
            </div>
            <div className="flex-1">
              <select
                value={step.gesture_type}
                onChange={(e) => {
                  const newSteps = [...steps];
                  newSteps[i].gesture_type = e.target.value;
                  setSteps(newSteps);
                }}
                className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs"
              >
                <option value="tap">Tap</option>
                <option value="swipe">Swipe</option>
                <option value="pinch">Pinch</option>
                <option value="rotate">Rotate</option>
                <option value="hold">Hold</option>
              </select>
            </div>
            <button
              onClick={() => setSteps(steps.filter((_, idx) => idx !== i))}
              className="p-2 hover:bg-red-500/20 rounded"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button onClick={addStep} variant="outline" className="flex-1">
          <Plus className="w-4 h-4 mr-2" />
          Add Step
        </Button>
        <Button onClick={executeSequence} disabled={steps.length === 0} className="flex-1 bg-cyan-500 hover:bg-cyan-600">
          Execute Sequence
        </Button>
      </div>
    </div>
  );
}