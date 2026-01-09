import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Settings, Play, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function IntegrationBuilder({ onSave }) {
  const [steps, setSteps] = useState([]);
  const [selectedStep, setSelectedStep] = useState(null);

  const stepTypes = [
    { id: 'trigger', name: 'Trigger', icon: '⚡', color: 'yellow' },
    { id: 'action', name: 'Action', icon: '▶️', color: 'blue' },
    { id: 'condition', name: 'Condition', icon: '❓', color: 'purple' },
    { id: 'transform', name: 'Transform', icon: '🔄', color: 'green' }
  ];

  const addStep = (type) => {
    const newStep = {
      id: Date.now().toString(),
      type: type.id,
      name: type.name,
      icon: type.icon,
      color: type.color,
      config: {}
    };
    setSteps([...steps, newStep]);
    toast.success('Step added');
  };

  const removeStep = (stepId) => {
    setSteps(steps.filter(s => s.id !== stepId));
    toast.success('Step removed');
  };

  const saveWorkflow = () => {
    if (steps.length === 0) {
      toast.error('Add at least one step');
      return;
    }
    onSave && onSave({ steps });
    toast.success('Workflow saved!');
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-xl">Integration Builder</h3>
        <div className="flex gap-2">
          <button
            onClick={saveWorkflow}
            className="px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-400 rounded-lg hover:bg-green-500/30 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button className="px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-400 rounded-lg hover:bg-blue-500/30 flex items-center gap-2">
            <Play className="w-4 h-4" />
            Test
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Step Types */}
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Add Steps</h4>
          <div className="space-y-2">
            {stepTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => addStep(type)}
                className={`w-full p-3 bg-${type.color}-500/20 border border-${type.color}-500/40 text-${type.color}-400 rounded-lg hover:bg-${type.color}-500/30 flex items-center gap-2 text-sm`}
              >
                <span className="text-xl">{type.icon}</span>
                <Plus className="w-4 h-4" />
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* Workflow Canvas */}
        <div className="lg:col-span-3">
          <h4 className="text-white font-semibold mb-3 text-sm">Workflow ({steps.length} steps)</h4>
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 min-h-[400px]">
            {steps.length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/40">
                Add steps to build your integration workflow
              </div>
            ) : (
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    className={`bg-${step.color}-500/10 border border-${step.color}-500/30 rounded-lg p-4 cursor-pointer hover:bg-${step.color}-500/20 transition-all`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedStep(step)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{step.icon}</div>
                        <div>
                          <div className="text-white font-semibold">{index + 1}. {step.name}</div>
                          <div className="text-white/60 text-xs">Click to configure</div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeStep(step.id);
                        }}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}