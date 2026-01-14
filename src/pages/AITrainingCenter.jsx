import React from 'react';
import AIAgentTrainingModule from '../components/training/AIAgentTrainingModule';
import { Brain, Zap } from 'lucide-react';

export default function AITrainingCenter() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Brain className="w-10 h-10 text-purple-500" />
            AI Training Center
          </h1>
          <p className="text-gray-600">
            Fine-tune agents with custom datasets, reinforcement learning, and A/B testing
          </p>
        </div>

        <AIAgentTrainingModule />
      </div>
    </div>
  );
}