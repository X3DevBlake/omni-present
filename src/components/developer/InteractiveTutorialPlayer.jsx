import React from 'react';
import InteractiveTutorial from './InteractiveTutorial';

export default function InteractiveTutorialPlayer() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <InteractiveTutorial tutorial="quickstart" />
      <InteractiveTutorial tutorial="agent_creation" />
    </div>
  );
}