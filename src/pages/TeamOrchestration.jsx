import React from 'react';
import TeamOrchestrationHub from '../components/collaboration/TeamOrchestrationHub';
import { Users, GitBranch } from 'lucide-react';

export default function TeamOrchestration() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-blue-500" />
            Team Orchestration
          </h1>
          <p className="text-gray-600">
            Define multi-agent workflows, set communication protocols, and manage AI-driven task delegation
          </p>
        </div>

        <TeamOrchestrationHub />
      </div>
    </div>
  );
}