import React from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

export default function AgentInteractionLines({ interactions, agents }) {
  const getAgentPosition = (agentId) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent?.current_location) return [0, 0, 0];
    return [
      agent.current_location.latitude || 0,
      agent.current_location.altitude || 0,
      agent.current_location.longitude || 0
    ];
  };

  const getLineColor = (type) => {
    switch (type) {
      case 'text_message': return '#00FFFF';
      case 'voice_call': return '#39FF14';
      case 'video_call': return '#8A2BE2';
      default: return '#FFFFFF';
    }
  };

  // Only show recent interactions (last 10)
  const recentInteractions = interactions.slice(0, 10);

  return (
    <group>
      {recentInteractions.map((interaction, idx) => {
        const posA = getAgentPosition(interaction.agent_a_id);
        const posB = getAgentPosition(interaction.agent_b_id);
        const color = getLineColor(interaction.interaction_type);

        return (
          <Line
            key={`${interaction.agent_a_id}-${interaction.agent_b_id}-${idx}`}
            points={[posA, posB]}
            color={color}
            lineWidth={2}
            transparent
            opacity={0.6}
            dashed
            dashScale={50}
            dashSize={3}
            dashOffset={0}
          />
        );
      })}
    </group>
  );
}