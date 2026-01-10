import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, GitBranch, Play, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MultiStageScenarioBuilder({ show, onClose, onScenarioCreate }) {
  const [scenarioName, setScenarioName] = useState('');
  const [stages, setStages] = useState([{
    id: 1,
    name: 'Initial Stage',
    duration: 60,
    conditions: [],
    actions: [],
    branches: []
  }]);
  const [selectedStage, setSelectedStage] = useState(0);

  const addStage = () => {
    setStages([...stages, {
      id: stages.length + 1,
      name: `Stage ${stages.length + 1}`,
      duration: 60,
      conditions: [],
      actions: [],
      branches: []
    }]);
  };

  const addBranch = (stageIndex) => {
    const updated = [...stages];
    updated[stageIndex].branches.push({
      condition: '',
      nextStage: stages.length > stageIndex + 1 ? stageIndex + 2 : 1,
      probability: 50
    });
    setStages(updated);
  };

  const addCondition = (stageIndex) => {
    const updated = [...stages];
    updated[stageIndex].conditions.push({
      type: 'agent_count',
      operator: '>',
      value: 5
    });
    setStages(updated);
  };

  const addAction = (stageIndex) => {
    const updated = [...stages];
    updated[stageIndex].actions.push({
      type: 'spawn_agent',
      params: {}
    });
    setStages(updated);
  };

  const saveScenario = () => {
    onScenarioCreate({
      name: scenarioName,
      stages,
      totalDuration: stages.reduce((sum, s) => sum + s.duration, 0)
    });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg">
          <X className="w-5 h-5 text-white" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Multi-Stage Scenario Builder</h2>

        <div className="mb-6">
          <Input
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            placeholder="Scenario Name"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 space-y-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Stages</h3>
              <Button onClick={addStage} size="sm" className="bg-cyan-500/20 hover:bg-cyan-500/30">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {stages.map((stage, i) => (
              <div
                key={stage.id}
                onClick={() => setSelectedStage(i)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedStage === i
                    ? 'bg-cyan-500/20 border border-cyan-500/50'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="text-white font-medium">{stage.name}</div>
                <div className="text-white/60 text-xs">{stage.duration}s duration</div>
                {stage.branches.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-purple-400 text-xs">
                    <GitBranch className="w-3 h-3" />
                    {stage.branches.length} branches
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="col-span-2">
            {stages[selectedStage] && (
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Stage Name</label>
                  <Input
                    value={stages[selectedStage].name}
                    onChange={(e) => {
                      const updated = [...stages];
                      updated[selectedStage].name = e.target.value;
                      setStages(updated);
                    }}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">Duration (seconds)</label>
                  <Input
                    type="number"
                    value={stages[selectedStage].duration}
                    onChange={(e) => {
                      const updated = [...stages];
                      updated[selectedStage].duration = parseInt(e.target.value);
                      setStages(updated);
                    }}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">Conditions</h4>
                    <Button onClick={() => addCondition(selectedStage)} size="sm" variant="ghost">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {stages[selectedStage].conditions.map((cond, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <Select value={cond.type}>
                        <SelectTrigger className="bg-white/5 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agent_count">Agent Count</SelectItem>
                          <SelectItem value="resource_level">Resource Level</SelectItem>
                          <SelectItem value="time_elapsed">Time Elapsed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input value={cond.value} className="bg-white/5 text-white w-20" />
                    </div>
                  ))}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">Actions</h4>
                    <Button onClick={() => addAction(selectedStage)} size="sm" variant="ghost">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {stages[selectedStage].actions.map((action, i) => (
                    <div key={i} className="p-2 bg-black/20 rounded mb-2 text-white text-sm">
                      {action.type}
                    </div>
                  ))}
                </div>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      Branching Logic
                    </h4>
                    <Button onClick={() => addBranch(selectedStage)} size="sm" variant="ghost">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {stages[selectedStage].branches.map((branch, i) => (
                    <div key={i} className="p-3 bg-black/20 rounded mb-2">
                      <div className="text-white text-sm mb-2">Branch {i + 1}</div>
                      <Input
                        placeholder="Condition"
                        className="bg-white/5 text-white text-sm mb-2"
                        value={branch.condition}
                      />
                      <div className="flex gap-2">
                        <Select value={String(branch.nextStage)}>
                          <SelectTrigger className="bg-white/5 text-white text-sm">
                            <SelectValue placeholder="Next Stage" />
                          </SelectTrigger>
                          <SelectContent>
                            {stages.map((s, idx) => (
                              <SelectItem key={s.id} value={String(idx + 1)}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="Probability %"
                          className="bg-white/5 text-white text-sm w-24"
                          value={branch.probability}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={onClose} variant="outline" className="border-white/20 text-white">
            Cancel
          </Button>
          <Button onClick={saveScenario} className="bg-gradient-to-r from-cyan-500 to-purple-500">
            <Save className="w-4 h-4 mr-2" />
            Save Scenario
          </Button>
        </div>
      </motion.div>
    </div>
  );
}