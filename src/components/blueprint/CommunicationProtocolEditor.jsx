import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Send, Radio, Bell, Zap, Trash2 } from 'lucide-react';

const MessageTypes = [
  { id: 'request_help', label: 'Request Help', icon: '🆘', priority: 'high' },
  { id: 'share_info', label: 'Share Info', icon: '💬', priority: 'medium' },
  { id: 'warning', label: 'Warning', icon: '⚠️', priority: 'high' },
  { id: 'coordinate', label: 'Coordinate', icon: '🎯', priority: 'medium' },
  { id: 'status_update', label: 'Status Update', icon: '📊', priority: 'low' },
  { id: 'broadcast', label: 'Broadcast', icon: '📡', priority: 'low' }
];

const ResponseActions = [
  { id: 'move_to_sender', label: 'Move to Sender', icon: '🚶' },
  { id: 'acknowledge', label: 'Acknowledge', icon: '✅' },
  { id: 'relay_message', label: 'Relay Message', icon: '🔄' },
  { id: 'execute_task', label: 'Execute Task', icon: '⚡' },
  { id: 'ignore', label: 'Ignore', icon: '🚫' }
];

export default function CommunicationProtocolEditor({ show, onClose, onSaveProtocol, existingProtocol }) {
  const [protocol, setProtocol] = useState(existingProtocol || {
    name: 'New Protocol',
    rules: [],
    queueSettings: {
      maxQueueSize: 10,
      processingRate: 1
    },
    broadcastSettings: {
      range: 10,
      requireLineOfSight: false
    }
  });

  const addRule = () => {
    setProtocol({
      ...protocol,
      rules: [...protocol.rules, {
        id: Date.now(),
        messageType: 'request_help',
        priority: 'medium',
        responseAction: 'acknowledge',
        condition: 'always'
      }]
    });
  };

  const updateRule = (ruleId, updates) => {
    setProtocol({
      ...protocol,
      rules: protocol.rules.map(r => r.id === ruleId ? { ...r, ...updates } : r)
    });
  };

  const deleteRule = (ruleId) => {
    setProtocol({
      ...protocol,
      rules: protocol.rules.filter(r => r.id !== ruleId)
    });
  };

  const handleSave = () => {
    onSaveProtocol(protocol);
    onClose();
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <input
                  type="text"
                  value={protocol.name}
                  onChange={(e) => setProtocol({ ...protocol, name: e.target.value })}
                  className="text-2xl font-bold text-white bg-transparent border-none outline-none"
                  placeholder="Protocol Name"
                />
                <p className="text-white/60 text-sm">Define agent communication rules and behaviors</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Queue Settings */}
            <div className="mb-6 bg-white/5 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400" />
                Message Queue Settings
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Max Queue Size</label>
                  <input
                    type="number"
                    value={protocol.queueSettings.maxQueueSize}
                    onChange={(e) => setProtocol({
                      ...protocol,
                      queueSettings: { ...protocol.queueSettings, maxQueueSize: Number(e.target.value) }
                    })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Processing Rate (msg/sec)</label>
                  <input
                    type="number"
                    value={protocol.queueSettings.processingRate}
                    onChange={(e) => setProtocol({
                      ...protocol,
                      queueSettings: { ...protocol.queueSettings, processingRate: Number(e.target.value) }
                    })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Broadcast Settings */}
            <div className="mb-6 bg-white/5 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-400" />
                Broadcast Settings
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Broadcast Range</label>
                  <input
                    type="number"
                    value={protocol.broadcastSettings.range}
                    onChange={(e) => setProtocol({
                      ...protocol,
                      broadcastSettings: { ...protocol.broadcastSettings, range: Number(e.target.value) }
                    })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div className="flex items-center">
                  <label className="text-white/70 text-sm flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={protocol.broadcastSettings.requireLineOfSight}
                      onChange={(e) => setProtocol({
                        ...protocol,
                        broadcastSettings: { ...protocol.broadcastSettings, requireLineOfSight: e.target.checked }
                      })}
                      className="w-4 h-4"
                    />
                    Require Line of Sight
                  </label>
                </div>
              </div>
            </div>

            {/* Communication Rules */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Communication Rules
                </h3>
                <button onClick={addRule} className="flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-lg text-sm hover:bg-cyan-500/30">
                  <Plus className="w-4 h-4" />
                  Add Rule
                </button>
              </div>

              <div className="space-y-3">
                {protocol.rules.map((rule) => (
                  <div key={rule.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      <div>
                        <label className="text-white/60 text-xs mb-1 block">Message Type</label>
                        <select
                          value={rule.messageType}
                          onChange={(e) => updateRule(rule.id, { messageType: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm"
                        >
                          {MessageTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-white/60 text-xs mb-1 block">Priority</label>
                        <select
                          value={rule.priority}
                          onChange={(e) => updateRule(rule.id, { priority: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-white/60 text-xs mb-1 block">Response Action</label>
                        <select
                          value={rule.responseAction}
                          onChange={(e) => updateRule(rule.id, { responseAction: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm"
                        >
                          {ResponseActions.map(action => (
                            <option key={action.id} value={action.id}>{action.icon} {action.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-white/60 text-xs mb-1 block">Condition</label>
                        <select
                          value={rule.condition}
                          onChange={(e) => updateRule(rule.id, { condition: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm"
                        >
                          <option value="always">Always</option>
                          <option value="if_available">If Available</option>
                          <option value="if_close">If Close</option>
                        </select>
                      </div>
                    </div>

                    <button onClick={() => deleteRule(rule.id)} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1">
                      <Trash2 className="w-3 h-3" />
                      Delete Rule
                    </button>
                  </div>
                ))}

                {protocol.rules.length === 0 && (
                  <div className="text-center py-8 text-white/40">
                    No rules defined. Click "Add Rule" to create communication rules.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-white/10">
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:opacity-90">
                Save Protocol
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}