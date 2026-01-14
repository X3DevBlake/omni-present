import React from 'react';
import AgentGovernanceHub from '../components/governance/AgentGovernanceHub';
import { Shield, Ban } from 'lucide-react';

export default function AgentGovernance() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-blue-500" />
            AI Agent Governance
          </h1>
          <p className="text-gray-600">
            Define interaction rules, hierarchies, and ethical oversight for agent operations
          </p>
        </div>

        <AgentGovernanceHub />
      </div>
    </div>
  );
}