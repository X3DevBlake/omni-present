import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAvatar } from './AvatarContext';

// This component monitors agent status and triggers appropriate gestures
export default function AgentInteractionTrigger({ agentId, taskStatus, performance }) {
  const { triggerGesture, loadAgentAppearance } = useAvatar();

  useEffect(() => {
    if (!agentId) return;

    // Load agent appearance on mount
    loadAgentAppearance(agentId);

    // Subscribe to agent updates
    const unsubscribeAgent = base44.entities.SimulationAgent?.subscribe?.((event) => {
      if (event.data.id === agentId) {
        handleAgentStatusChange(event.data);
      }
    });

    const unsubscribeHolo = base44.entities.HolographicAgent?.subscribe?.((event) => {
      if (event.data.id === agentId) {
        handleAgentStatusChange(event.data);
      }
    });

    return () => {
      if (unsubscribeAgent) unsubscribeAgent();
      if (unsubscribeHolo) unsubscribeHolo();
    };
  }, [agentId]);

  useEffect(() => {
    if (!agentId || !taskStatus) return;

    // Trigger gestures based on task status
    switch (taskStatus) {
      case 'completed':
        triggerGesture('celebrate', agentId, 'Task completed successfully');
        break;
      case 'started':
        triggerGesture('nod', agentId, 'Task started');
        break;
      case 'helping':
        triggerGesture('wave', agentId, 'Agent offering help');
        break;
      case 'success':
        triggerGesture('thumbsup', agentId, 'Operation successful');
        break;
      case 'attention':
        triggerGesture('point', agentId, 'Needs attention');
        break;
      default:
        break;
    }
  }, [taskStatus, agentId, triggerGesture]);

  useEffect(() => {
    if (!agentId || !performance) return;

    // Trigger gestures based on performance metrics
    if (performance.efficiency > 0.9) {
      triggerGesture('celebrate', agentId, 'High performance achieved');
    } else if (performance.efficiency < 0.5) {
      triggerGesture('nod', agentId, 'Acknowledging low performance');
    }
  }, [performance, agentId, triggerGesture]);

  const handleAgentStatusChange = (agentData) => {
    // Handle real-time agent status changes
    if (agentData.status === 'active') {
      triggerGesture('wave', agentId, 'Agent became active');
    } else if (agentData.status === 'idle') {
      // No gesture for idle state
    }
  };

  return null;
}