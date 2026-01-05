import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Share2, Target } from 'lucide-react';

export class AgentCommunicationProtocol {
  constructor() {
    this.messages = [];
    this.agents = new Map();
    this.taskDelegations = [];
    this.sharedKnowledge = new Map();
  }

  registerAgent(agent) {
    this.agents.set(agent.id, {
      ...agent,
      inbox: [],
      outbox: [],
      collaborators: []
    });
  }

  sendMessage(fromAgentId, toAgentId, message) {
    const msg = {
      id: Date.now(),
      from: fromAgentId,
      to: toAgentId,
      content: message.content,
      type: message.type || 'info',
      timestamp: new Date()
    };

    const recipient = this.agents.get(toAgentId);
    if (recipient) {
      recipient.inbox.push(msg);
      this.messages.push(msg);
    }
    return msg;
  }

  broadcast(fromAgentId, message) {
    const msgs = [];
    this.agents.forEach((agent, id) => {
      if (id !== fromAgentId) {
        msgs.push(this.sendMessage(fromAgentId, id, message));
      }
    });
    return msgs;
  }

  delegateTask(fromAgentId, toAgentId, task) {
    const delegation = {
      id: Date.now(),
      from: fromAgentId,
      to: toAgentId,
      task: task,
      status: 'pending',
      createdAt: new Date()
    };
    this.taskDelegations.push(delegation);
    this.sendMessage(fromAgentId, toAgentId, {
      content: `Task delegated: ${task.description}`,
      type: 'task'
    });
    return delegation;
  }

  shareKnowledge(agentId, key, value) {
    if (!this.sharedKnowledge.has(key)) {
      this.sharedKnowledge.set(key, []);
    }
    this.sharedKnowledge.get(key).push({
      agentId,
      value,
      timestamp: new Date()
    });
  }

  getSharedKnowledge(key) {
    return this.sharedKnowledge.get(key) || [];
  }

  getAgentInbox(agentId) {
    return this.agents.get(agentId)?.inbox || [];
  }

  coordinateMovement(agents, target) {
    // Simple coordination: spread agents around target
    const formations = [];
    const radius = 2;
    agents.forEach((agent, i) => {
      const angle = (i / agents.length) * Math.PI * 2;
      formations.push({
        agentId: agent.id,
        position: [
          target[0] + Math.cos(angle) * radius,
          target[1],
          target[2] + Math.sin(angle) * radius
        ]
      });
    });
    return formations;
  }
}

export function MultiAgentCoordinator({ agents, protocol, onCoordinationUpdate }) {
  const [activeCollaborations, setActiveCollaborations] = useState([]);
  const [communicationLog, setCommunicationLog] = useState([]);

  useEffect(() => {
    if (agents.length >= 2 && protocol) {
      agents.forEach(agent => protocol.registerAgent(agent));
      
      // Simulate autonomous collaboration
      const collaborationInterval = setInterval(() => {
        if (Math.random() > 0.7) {
          const agent1 = agents[Math.floor(Math.random() * agents.length)];
          const agent2 = agents.filter(a => a.id !== agent1.id)[0];
          
          if (agent2) {
            const collaborationType = ['task_delegation', 'information_share', 'coordinate_movement'][Math.floor(Math.random() * 3)];
            
            const collab = {
              type: collaborationType,
              agents: [agent1.id, agent2.id],
              timestamp: new Date(),
              id: Date.now()
            };
            
            setActiveCollaborations(prev => [...prev, collab].slice(-5));
            
            if (collaborationType === 'task_delegation') {
              protocol.delegateTask(agent1.id, agent2.id, {
                description: 'Explore new area',
                priority: 'medium'
              });
            } else if (collaborationType === 'information_share') {
              protocol.sendMessage(agent1.id, agent2.id, {
                content: 'Found interesting location',
                type: 'info'
              });
            }
            
            onCoordinationUpdate?.(collab);
          }
        }
      }, 5000);

      return () => clearInterval(collaborationInterval);
    }
  }, [agents, protocol]);

  return (
    <div className="fixed bottom-24 left-6 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 max-w-xs z-40">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5 text-cyan-400" />
        <h4 className="text-white font-semibold">Multi-Agent Coordination</h4>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {activeCollaborations.length === 0 ? (
          <p className="text-white/60 text-xs">No active collaborations</p>
        ) : (
          activeCollaborations.map(collab => (
            <motion.div key={collab.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-white/5 rounded-lg p-2">
              <div className="flex items-center gap-2 mb-1">
                {collab.type === 'task_delegation' && <Target className="w-3 h-3 text-blue-400" />}
                {collab.type === 'information_share' && <MessageSquare className="w-3 h-3 text-green-400" />}
                {collab.type === 'coordinate_movement' && <Share2 className="w-3 h-3 text-purple-400" />}
                <span className="text-white text-xs font-medium capitalize">{collab.type.replace('_', ' ')}</span>
              </div>
              <div className="text-white/60 text-[10px]">{collab.agents.length} agents collaborating</div>
            </motion.div>
          ))
        )}
      </div>

      {protocol && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-white/60 text-[10px]">
            {protocol.messages?.length || 0} messages exchanged
          </div>
        </div>
      )}
    </div>
  );
}