import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipBack, SkipForward, Save, FolderOpen, Zap, Clock, Rewind, FastForward } from 'lucide-react';
import { toast } from 'sonner';

export class SimulationStateManager {
  constructor() {
    this.states = [];
    this.currentStateIndex = -1;
    this.maxStates = 100;
    this.autoSaveInterval = null;
  }

  saveState(simulationData, timestamp = Date.now()) {
    const state = {
      id: `state_${timestamp}`,
      timestamp,
      data: JSON.parse(JSON.stringify(simulationData)), // Deep copy
      label: `State at ${new Date(timestamp).toLocaleTimeString()}`
    };

    this.states.push(state);
    this.currentStateIndex = this.states.length - 1;

    // Limit states to prevent memory issues
    if (this.states.length > this.maxStates) {
      this.states.shift();
      this.currentStateIndex--;
    }

    return state;
  }

  loadState(index) {
    if (index >= 0 && index < this.states.length) {
      this.currentStateIndex = index;
      return this.states[index].data;
    }
    return null;
  }

  rewind(steps = 1) {
    const targetIndex = Math.max(0, this.currentStateIndex - steps);
    return this.loadState(targetIndex);
  }

  fastForward(steps = 1) {
    const targetIndex = Math.min(this.states.length - 1, this.currentStateIndex + steps);
    return this.loadState(targetIndex);
  }

  getCurrentState() {
    return this.states[this.currentStateIndex];
  }

  getAllStates() {
    return this.states;
  }

  exportState(index) {
    const state = this.states[index];
    if (state) {
      return JSON.stringify(state, null, 2);
    }
    return null;
  }

  importState(stateJson) {
    try {
      const state = JSON.parse(stateJson);
      this.states.push(state);
      this.currentStateIndex = this.states.length - 1;
      return state;
    } catch (error) {
      console.error('Failed to import state:', error);
      return null;
    }
  }

  clearStates() {
    this.states = [];
    this.currentStateIndex = -1;
  }
}

export default function SimulationTimeControl({ 
  show, 
  onClose, 
  onSimulationUpdate,
  getCurrentSimulationData,
  isSimulating,
  onPlayPause
}) {
  const [stateManager] = useState(new SimulationStateManager());
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [savedStates, setSavedStates] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [stateName, setStateName] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branches, setBranches] = useState([]);
  const [autoSave, setAutoSave] = useState(false);
  const fileInputRef = useRef(null);

  const handlePlayPause = () => {
    setIsPaused(!isPaused);
    onPlayPause?.(!isPaused);
  };

  const handleTimeSpeedChange = (speed) => {
    setTimeSpeed(speed);
    toast.info(`Time speed: ${speed}x`);
  };

  const handleSaveState = () => {
    const simulationData = getCurrentSimulationData?.();
    if (simulationData) {
      const state = stateManager.saveState(simulationData);
      state.label = stateName || state.label;
      setSavedStates([...stateManager.getAllStates()]);
      setStateName('');
      setShowSaveDialog(false);
      toast.success('Simulation state saved!');
    }
  };

  const handleLoadState = (index) => {
    const state = stateManager.loadState(index);
    if (state) {
      onSimulationUpdate?.(state);
      setShowLoadDialog(false);
      toast.success('Simulation state loaded!');
    }
  };

  const handleRewind = (steps) => {
    const state = stateManager.rewind(steps);
    if (state) {
      onSimulationUpdate?.(state);
      toast.info(`Rewound ${steps} step${steps > 1 ? 's' : ''}`);
    } else {
      toast.error('Cannot rewind further');
    }
  };

  const handleFastForward = (steps) => {
    const state = stateManager.fastForward(steps);
    if (state) {
      onSimulationUpdate?.(state);
      toast.info(`Fast-forwarded ${steps} step${steps > 1 ? 's' : ''}`);
    } else {
      toast.error('Cannot fast-forward further');
    }
  };

  const handleExportState = (index) => {
    const stateJson = stateManager.exportState(index);
    if (stateJson) {
      const blob = new Blob([stateJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `simulation_state_${Date.now()}.json`;
      a.click();
      toast.success('State exported!');
    }
  };

  const handleImportState = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const state = stateManager.importState(e.target.result);
        if (state) {
          setSavedStates([...stateManager.getAllStates()]);
          toast.success('State imported!');
        } else {
          toast.error('Failed to import state');
        }
      };
      reader.readAsText(file);
    }
  };

  const createBranch = () => {
    const currentState = stateManager.getCurrentState();
    if (currentState) {
      const branch = {
        id: `branch_${Date.now()}`,
        name: `Branch ${branches.length + 1}`,
        fromState: currentState.id,
        timestamp: Date.now(),
        divergencePoint: currentTime
      };
      setBranches([...branches, branch]);
      toast.success('Scenario branch created!');
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-4xl" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Simulation Time Control</h3>
                <p className="text-white/60 text-sm">Advanced time manipulation and state management</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Playback Controls */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
              <h4 className="text-blue-400 font-semibold mb-4">Playback Controls</h4>
              
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={() => handleRewind(10)}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  title="Rewind 10 steps"
                >
                  <SkipBack className="w-6 h-6 text-white" />
                </button>
                
                <button
                  onClick={() => handleRewind(1)}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  title="Rewind 1 step"
                >
                  <Rewind className="w-5 h-5 text-white" />
                </button>

                <button
                  onClick={handlePlayPause}
                  className="p-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 transition-opacity"
                >
                  {isPaused ? <Play className="w-8 h-8 text-white" /> : <Pause className="w-8 h-8 text-white" />}
                </button>

                <button
                  onClick={() => handleFastForward(1)}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  title="Fast-forward 1 step"
                >
                  <FastForward className="w-5 h-5 text-white" />
                </button>

                <button
                  onClick={() => handleFastForward(10)}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  title="Fast-forward 10 steps"
                >
                  <SkipForward className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Time Dilation */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/70 text-sm">Time Dilation</span>
                  <span className="text-cyan-400 font-bold">{timeSpeed}x</span>
                </div>
                <div className="flex gap-2">
                  {[0.1, 0.25, 0.5, 1, 2, 5, 10].map(speed => (
                    <button
                      key={speed}
                      onClick={() => handleTimeSpeedChange(speed)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        timeSpeed === speed
                          ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-300'
                          : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: '45%' }} />
                </div>
                <div className="flex justify-between mt-2 text-xs text-white/60">
                  <span>00:00</span>
                  <span>Current: {currentTime.toFixed(1)}s</span>
                  <span>∞</span>
                </div>
              </div>
            </div>

            {/* State Management */}
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
              <h4 className="text-green-400 font-semibold mb-4">State Management</h4>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="flex items-center justify-center gap-2 py-3 bg-green-500/20 border border-green-500/40 text-green-300 rounded-xl hover:bg-green-500/30"
                >
                  <Save className="w-5 h-5" />
                  Save State
                </button>
                <button
                  onClick={() => setShowLoadDialog(true)}
                  className="flex items-center justify-center gap-2 py-3 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded-xl hover:bg-blue-500/30"
                >
                  <FolderOpen className="w-5 h-5" />
                  Load State
                </button>
              </div>

              <div className="text-white/70 text-sm mb-2">
                {savedStates.length} saved state{savedStates.length !== 1 ? 's' : ''}
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="rounded"
                />
                <label className="text-white/70 text-sm">Auto-save every 10 seconds</label>
              </div>
            </div>

            {/* Scenario Branching */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
              <h4 className="text-purple-400 font-semibold mb-4">Scenario Branching</h4>
              <p className="text-white/60 text-sm mb-4">
                Create alternate timelines to test different scenarios from the same starting point
              </p>
              
              <button
                onClick={createBranch}
                className="w-full flex items-center justify-center gap-2 py-3 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-xl hover:bg-purple-500/30"
              >
                <Zap className="w-5 h-5" />
                Create Branch from Current State
              </button>

              {branches.length > 0 && (
                <div className="mt-4 space-y-2">
                  {branches.map(branch => (
                    <div key={branch.id} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white text-sm font-medium">{branch.name}</div>
                          <div className="text-white/60 text-xs">
                            Diverged at {new Date(branch.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedBranch(branch)}
                          className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded text-xs hover:bg-purple-500/30"
                        >
                          Switch
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Save Dialog */}
          {showSaveDialog && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
              <div className="bg-black/90 border border-white/20 rounded-xl p-6 max-w-md w-full">
                <h4 className="text-white font-semibold mb-4">Save Simulation State</h4>
                <input
                  type="text"
                  placeholder="State name (optional)"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 mb-4"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveState}
                    className="flex-1 py-2 bg-green-500/20 border border-green-500/40 text-green-300 rounded-lg hover:bg-green-500/30"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowSaveDialog(false)}
                    className="px-4 py-2 bg-white/5 border border-white/10 text-white/70 rounded-lg hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Load Dialog */}
          {showLoadDialog && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
              <div className="bg-black/90 border border-white/20 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <h4 className="text-white font-semibold mb-4">Load Simulation State</h4>
                {savedStates.length === 0 ? (
                  <p className="text-white/60 text-center py-8">No saved states available</p>
                ) : (
                  <div className="space-y-2 mb-4">
                    {savedStates.map((state, index) => (
                      <div key={state.id} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <div className="text-white text-sm font-medium">{state.label}</div>
                          <div className="text-white/60 text-xs">
                            {new Date(state.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleLoadState(index)}
                            className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded text-xs hover:bg-blue-500/30"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleExportState(index)}
                            className="px-3 py-1 bg-green-500/20 border border-green-500/40 text-green-300 rounded text-xs hover:bg-green-500/30"
                          >
                            Export
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportState}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-lg hover:bg-purple-500/30"
                  >
                    Import State
                  </button>
                  <button
                    onClick={() => setShowLoadDialog(false)}
                    className="px-4 py-2 bg-white/5 border border-white/10 text-white/70 rounded-lg hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}