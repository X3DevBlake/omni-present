import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Radio, Users, MessageSquare, AlertCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export class Message {
  constructor(senderId, content, type = 'direct') {
    this.id = `msg_${Date.now()}_${Math.random()}`;
    this.senderId = senderId;
    this.content = content;
    this.type = type; // 'direct', 'broadcast', 'group'
    this.priority = 1; // 1-5
    this.timestamp = Date.now();
    this.recipientIds = [];
    this.status = 'pending'; // pending, sent, received, read
    this.protocol = 'standard';
  }
}

export class MessageQueue {
  constructor() {
    this.queue = [];
    this.maxSize = 100;
    this.processing = false;
  }

  enqueue(message) {
    this.queue.push(message);
    this.queue.sort((a, b) => b.priority - a.priority);
    
    if (this.queue.length > this.maxSize) {
      this.queue = this.queue.slice(0, this.maxSize);
    }
  }

  dequeue() {
    return this.queue.shift();
  }

  peek() {
    return this.queue[0];
  }

  getByPriority(priority) {
    return this.queue.filter(m => m.priority >= priority);
  }

  size() {
    return this.queue.length;
  }

  clear() {
    this.queue = [];
  }
}

export class CommunicationHub {
  constructor() {
    this.agents = new Map();
    this.messageQueues = new Map();
    this.messageHistory = [];
    this.protocols = {
      standard: { latency: 0, reliability: 1.0 },
      urgent: { latency: 0, reliability: 1.0, priorityBoost: 2 },
      broadcast: { latency: 0.1, reliability: 0.95 },
      encrypted: { latency: 0.2, reliability: 1.0 }
    };
    this.bottlenecks = [];
    this.stats = {
      totalSent: 0,
      totalReceived: 0,
      avgLatency: 0,
      droppedMessages: 0
    };
  }

  registerAgent(agentId) {
    if (!this.messageQueues.has(agentId)) {
      this.messageQueues.set(agentId, new MessageQueue());
    }
  }

  sendMessage(message, recipientIds) {
    message.recipientIds = recipientIds;
    message.status = 'sent';
    
    const protocol = this.protocols[message.protocol] || this.protocols.standard;
    
    recipientIds.forEach(recipientId => {
      const queue = this.messageQueues.get(recipientId);
      if (queue) {
        const modifiedMessage = { ...message };
        if (protocol.priorityBoost) {
          modifiedMessage.priority += protocol.priorityBoost;
        }
        
        // Simulate reliability
        if (Math.random() < protocol.reliability) {
          queue.enqueue(modifiedMessage);
          this.stats.totalSent++;
        } else {
          this.stats.droppedMessages++;
        }
      }
    });

    this.messageHistory.push(message);
    this.detectBottlenecks();
  }

  broadcast(message, excludeIds = []) {
    message.type = 'broadcast';
    const recipientIds = Array.from(this.messageQueues.keys()).filter(id => !excludeIds.includes(id));
    this.sendMessage(message, recipientIds);
  }

  receiveMessages(agentId, count = 5) {
    const queue = this.messageQueues.get(agentId);
    if (!queue) return [];

    const messages = [];
    for (let i = 0; i < count && queue.size() > 0; i++) {
      const msg = queue.dequeue();
      if (msg) {
        msg.status = 'received';
        messages.push(msg);
        this.stats.totalReceived++;
      }
    }

    return messages;
  }

  detectBottlenecks() {
    const bottlenecks = [];
    
    this.messageQueues.forEach((queue, agentId) => {
      if (queue.size() > 20) {
        bottlenecks.push({
          agentId,
          queueSize: queue.size(),
          severity: queue.size() > 50 ? 'high' : 'medium'
        });
      }
    });

    this.bottlenecks = bottlenecks;
  }

  getStats() {
    return {
      ...this.stats,
      activeQueues: this.messageQueues.size,
      totalQueuedMessages: Array.from(this.messageQueues.values()).reduce((sum, q) => sum + q.size(), 0),
      bottlenecks: this.bottlenecks.length
    };
  }

  getCommunicationGraph() {
    const nodes = Array.from(this.messageQueues.keys());
    const edges = [];
    
    this.messageHistory.slice(-50).forEach(msg => {
      msg.recipientIds.forEach(recipientId => {
        const existingEdge = edges.find(e => e.from === msg.senderId && e.to === recipientId);
        if (existingEdge) {
          existingEdge.weight++;
        } else {
          edges.push({ from: msg.senderId, to: recipientId, weight: 1, type: msg.type });
        }
      });
    });

    return { nodes, edges };
  }
}

export default function AgentCommunicationSystem({ show, onClose, agents }) {
  const [commHub] = useState(new CommunicationHub());
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const [messageType, setMessageType] = useState('direct');
  const [messagePriority, setMessagePriority] = useState(3);
  const [protocol, setProtocol] = useState('standard');
  const [recipientIds, setRecipientIds] = useState([]);
  const [stats, setStats] = useState(null);
  const [communicationGraph, setCommunicationGraph] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    agents.forEach(agent => commHub.registerAgent(agent.id));
    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
  }, [agents]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Auto-receive messages
      if (selectedAgent) {
        const newMessages = commHub.receiveMessages(selectedAgent.id, 3);
        if (newMessages.length > 0) {
          setMessages(prev => [...prev, ...newMessages].slice(-20));
        }
      }

      // Simulate some agent-to-agent communication
      if (Math.random() > 0.7 && agents.length > 1) {
        const sender = agents[Math.floor(Math.random() * agents.length)];
        const receiver = agents[Math.floor(Math.random() * agents.length)];
        if (sender.id !== receiver.id) {
          const msg = new Message(sender.id, 'Automated message', 'direct');
          msg.priority = Math.floor(Math.random() * 5) + 1;
          commHub.sendMessage(msg, [receiver.id]);
        }
      }

      setStats(commHub.getStats());
      setCommunicationGraph(commHub.getCommunicationGraph());
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedAgent, agents]);

  const handleSendMessage = () => {
    if (!selectedAgent || !messageContent.trim()) return;

    const message = new Message(selectedAgent.id, messageContent, messageType);
    message.priority = messagePriority;
    message.protocol = protocol;

    if (messageType === 'broadcast') {
      commHub.broadcast(message, [selectedAgent.id]);
      toast.success('Broadcast message sent!');
    } else {
      if (recipientIds.length === 0) {
        toast.error('Select recipients');
        return;
      }
      commHub.sendMessage(message, recipientIds);
      toast.success(`Message sent to ${recipientIds.length} agent(s)`);
    }

    setMessageContent('');
    setRecipientIds([]);
  };

  const toggleRecipient = (agentId) => {
    setRecipientIds(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <Radio className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Agent Communication Hub</h3>
                <p className="text-white/60 text-sm">Message queuing, protocols, and network visualization</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r border-white/10 p-4 overflow-y-auto">
              <h4 className="text-white font-semibold mb-3 text-sm">Select Agent</h4>
              <div className="space-y-2 mb-6">
                {agents.map(agent => {
                  const queue = commHub.messageQueues.get(agent.id);
                  const queueSize = queue?.size() || 0;
                  
                  return (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedAgent?.id === agent.id
                          ? 'bg-blue-500/20 border border-blue-500/40'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: agent.color }} />
                        <span className="text-white text-sm font-medium">{agent.name}</span>
                      </div>
                      <div className="text-xs text-white/60">
                        {queueSize} queued
                      </div>
                    </button>
                  );
                })}
              </div>

              {stats && (
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4">
                  <h4 className="text-cyan-400 font-semibold mb-3 text-sm">Network Stats</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/60">Sent</span>
                      <span className="text-white font-semibold">{stats.totalSent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Received</span>
                      <span className="text-green-400 font-semibold">{stats.totalReceived}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Queued</span>
                      <span className="text-yellow-400 font-semibold">{stats.totalQueuedMessages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Dropped</span>
                      <span className="text-red-400 font-semibold">{stats.droppedMessages}</span>
                    </div>
                    {stats.bottlenecks > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-orange-400">
                        <AlertCircle className="w-3 h-3" />
                        <span>{stats.bottlenecks} bottleneck(s)</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {selectedAgent && (
                <>
                  {/* Message Compose */}
                  <div className="p-4 border-b border-white/10">
                    <h4 className="text-white font-semibold mb-3">Send Message from {selectedAgent.name}</h4>
                    
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <select
                        value={messageType}
                        onChange={(e) => setMessageType(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                      >
                        <option value="direct">Direct Message</option>
                        <option value="broadcast">Broadcast</option>
                        <option value="group">Group</option>
                      </select>

                      <select
                        value={protocol}
                        onChange={(e) => setProtocol(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                      >
                        <option value="standard">Standard</option>
                        <option value="urgent">Urgent</option>
                        <option value="encrypted">Encrypted</option>
                      </select>

                      <select
                        value={messagePriority}
                        onChange={(e) => setMessagePriority(parseInt(e.target.value))}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                      >
                        <option value="1">Priority 1 (Low)</option>
                        <option value="2">Priority 2</option>
                        <option value="3">Priority 3 (Medium)</option>
                        <option value="4">Priority 4</option>
                        <option value="5">Priority 5 (Urgent)</option>
                      </select>
                    </div>

                    {messageType === 'direct' && (
                      <div className="mb-3">
                        <label className="text-white/70 text-xs mb-2 block">Recipients</label>
                        <div className="flex gap-2 flex-wrap">
                          {agents.filter(a => a.id !== selectedAgent.id).map(agent => (
                            <button
                              key={agent.id}
                              onClick={() => toggleRecipient(agent.id)}
                              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                                recipientIds.includes(agent.id)
                                  ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-300'
                                  : 'bg-white/10 border border-white/20 text-white/60 hover:bg-white/20'
                              }`}
                            >
                              {agent.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 text-sm"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded-lg hover:bg-blue-500/30 flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send
                      </button>
                    </div>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    <h4 className="text-white font-semibold mb-3">Received Messages</h4>
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-2" />
                        <p className="text-white/60 text-sm">No messages yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {messages.map(msg => {
                          const sender = agents.find(a => a.id === msg.senderId);
                          return (
                            <div key={msg.id} className={`p-3 rounded-lg border ${
                              msg.priority >= 4 
                                ? 'bg-red-500/10 border-red-500/30'
                                : 'bg-white/5 border-white/10'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sender?.color }} />
                                  <span className="text-white text-sm font-medium">{sender?.name || 'Unknown'}</span>
                                  {msg.type === 'broadcast' && (
                                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded">Broadcast</span>
                                  )}
                                  {msg.priority >= 4 && (
                                    <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-xs rounded">Urgent</span>
                                  )}
                                </div>
                                <span className="text-white/60 text-xs">
                                  {new Date(msg.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-white/80 text-sm">{msg.content}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Communication Graph */}
            {communicationGraph && (
              <div className="w-80 border-l border-white/10 p-4 overflow-y-auto">
                <h4 className="text-white font-semibold mb-3 text-sm">Communication Pathways</h4>
                <div className="space-y-2">
                  {communicationGraph.edges.slice(-10).map((edge, i) => {
                    const sender = agents.find(a => a.id === edge.from);
                    const receiver = agents.find(a => a.id === edge.to);
                    
                    return (
                      <div key={i} className="bg-white/5 rounded-lg p-2 border border-white/10">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sender?.color }} />
                          <span className="text-white/80">{sender?.name}</span>
                          <span className="text-white/40">→</span>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: receiver?.color }} />
                          <span className="text-white/80">{receiver?.name}</span>
                        </div>
                        <div className="text-white/60 text-xs mt-1">
                          {edge.weight} message{edge.weight > 1 ? 's' : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {commHub.bottlenecks.length > 0 && (
                  <div className="mt-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-3">
                    <h4 className="text-orange-400 font-semibold mb-2 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Bottlenecks Detected
                    </h4>
                    {commHub.bottlenecks.map((bn, i) => {
                      const agent = agents.find(a => a.id === bn.agentId);
                      return (
                        <div key={i} className="text-xs text-white/80 mb-1">
                          {agent?.name}: {bn.queueSize} queued ({bn.severity})
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}