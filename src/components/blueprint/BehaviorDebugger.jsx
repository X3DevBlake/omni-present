import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipForward, RefreshCw, Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function BehaviorDebugger({ show, onClose, behavior, agent }) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [executionSpeed, setExecutionSpeed] = useState(1);
  const [breakpoints, setBreakpoints] = useState(new Set());

  const executeStep = () => {
    if (!behavior || !behavior.nodes) return;
    
    const nextStep = executionStep + 1;
    if (nextStep >= behavior.nodes.length) {
      setIsExecuting(false);
      setExecutionStep(0);
      return;
    }

    const node = behavior.nodes[nextStep];
    setCurrentNode(node);
    setExecutionStep(nextStep);
    
    setExecutionHistory(prev => [...prev, {
      step: nextStep,
      node: node,
      timestamp: Date.now(),
      status: 'executed',
      params: node.params
    }]);

    if (breakpoints.has(node.id)) {
      setIsExecuting(false);
    }
  };

  useEffect(() => {
    if (isExecuting) {
      const interval = setInterval(executeStep, 1000 / executionSpeed);
      return () => clearInterval(interval);
    }
  }, [isExecuting, executionStep, executionSpeed]);

  const reset = () => {
    setExecutionStep(0);
    setExecutionHistory([]);
    setCurrentNode(null);
    setIsExecuting(false);
  };

  const toggleBreakpoint = (nodeId) => {
    const newBreakpoints = new Set(breakpoints);
    if (newBreakpoints.has(nodeId)) {
      newBreakpoints.delete(nodeId);
    } else {
      newBreakpoints.add(nodeId);
    }
    setBreakpoints(newBreakpoints);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Behavior Debugger</h3>
              <p className="text-white/60 text-sm">{behavior?.name || 'No behavior loaded'}</p>
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg">
                <span className="text-white/60 text-sm">Speed</span>
                <select value={executionSpeed} onChange={(e) => setExecutionSpeed(Number(e.target.value))} className="bg-transparent text-white text-sm border-none outline-none">
                  <option value="0.5">0.5x</option>
                  <option value="1">1x</option>
                  <option value="2">2x</option>
                  <option value="4">4x</option>
                </select>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - Execution Controls */}
            <div className="w-80 border-r border-white/10 p-4 overflow-y-auto">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button onClick={() => setIsExecuting(!isExecuting)} className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${isExecuting ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300' : 'bg-green-500/20 border border-green-500/40 text-green-300'}`}>
                    {isExecuting ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Play</>}
                  </button>
                  <button onClick={executeStep} disabled={isExecuting} className="px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded-lg hover:bg-blue-500/30 disabled:opacity-50">
                    <SkipForward className="w-4 h-4" />
                  </button>
                  <button onClick={reset} className="px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-300 rounded-lg hover:bg-red-500/30">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span className="text-white text-sm font-semibold">Execution State</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Current Step:</span>
                      <span className="text-white">{executionStep}/{behavior?.nodes?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Status:</span>
                      <span className={isExecuting ? 'text-green-400' : 'text-yellow-400'}>{isExecuting ? 'Running' : 'Paused'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">History:</span>
                      <span className="text-white">{executionHistory.length} events</span>
                    </div>
                  </div>
                </div>

                {currentNode && (
                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-cyan-400 text-sm font-semibold">Current Node</span>
                    </div>
                    <div className="text-white font-medium mb-1">{currentNode.label}</div>
                    <div className="text-white/60 text-xs mb-2">{currentNode.type}</div>
                    {currentNode.params && Object.keys(currentNode.params).length > 0 && (
                      <div className="space-y-1">
                        {Object.entries(currentNode.params).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="text-white/60">{key}:</span> <span className="text-cyan-300">{value || 'null'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white text-sm font-semibold mb-2">Breakpoints</div>
                  <div className="text-white/60 text-xs mb-2">Click nodes to toggle breakpoints</div>
                  {breakpoints.size === 0 ? (
                    <p className="text-white/40 text-xs">No breakpoints set</p>
                  ) : (
                    <div className="space-y-1">
                      {Array.from(breakpoints).map(nodeId => {
                        const node = behavior?.nodes?.find(n => n.id === nodeId);
                        return node ? (
                          <div key={nodeId} className="flex items-center justify-between text-xs bg-red-500/20 rounded px-2 py-1">
                            <span className="text-white">{node.label}</span>
                            <button onClick={() => toggleBreakpoint(nodeId)} className="text-red-400 hover:text-red-300">×</button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center Panel - Behavior Tree Visualization */}
            <div className="flex-1 p-4 overflow-auto">
              <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl p-6 min-h-full">
                <h4 className="text-white font-semibold mb-4">Behavior Tree</h4>
                {behavior?.nodes && behavior.nodes.length > 0 ? (
                  <div className="space-y-2">
                    {behavior.nodes.map((node, i) => (
                      <div key={node.id} onClick={() => toggleBreakpoint(node.id)} className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${i === executionStep ? 'bg-cyan-500/20 border-cyan-500/50' : breakpoints.has(node.id) ? 'bg-red-500/10 border-red-500/40' : 'bg-white/5 border-white/10'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-white/40 text-sm font-mono">#{i}</div>
                            {i === executionStep && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                            {breakpoints.has(node.id) && <div className="w-2 h-2 rounded-full bg-red-400" />}
                            <div>
                              <div className="text-white font-medium">{node.label}</div>
                              <div className="text-white/60 text-xs">{node.type}</div>
                            </div>
                          </div>
                          {executionHistory.find(h => h.node.id === node.id) && (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40">No nodes to display</p>
                )}
              </div>
            </div>

            {/* Right Panel - Execution History */}
            <div className="w-80 border-l border-white/10 p-4 overflow-y-auto">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Execution History
              </h4>
              {executionHistory.length === 0 ? (
                <p className="text-white/40 text-sm">No execution history yet</p>
              ) : (
                <div className="space-y-2">
                  {executionHistory.slice().reverse().map((event, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-mono">
                            {event.step}
                          </div>
                          <span className="text-white text-sm font-medium">{event.node.label}</span>
                        </div>
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      </div>
                      <div className="text-white/60 text-xs mb-1">{new Date(event.timestamp).toLocaleTimeString()}</div>
                      {event.params && Object.keys(event.params).length > 0 && (
                        <div className="mt-2 space-y-1">
                          {Object.entries(event.params).map(([key, value]) => (
                            <div key={key} className="text-xs">
                              <span className="text-white/50">{key}:</span> <span className="text-cyan-300">{value || 'null'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}