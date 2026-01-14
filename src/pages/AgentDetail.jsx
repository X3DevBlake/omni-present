import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AgentDetailDashboard from '../components/agents/AgentDetailDashboard';
import { Bot } from 'lucide-react';

export default function AgentDetail() {
  const [searchParams] = useSearchParams();
  const agentId = searchParams.get('id');

  if (!agentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 flex items-center justify-center">
        <p className="text-gray-600">No agent selected</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Bot className="w-10 h-10 text-blue-500" />
            Agent Command Center
          </h1>
          <p className="text-gray-600">
            Comprehensive dashboard for agent management and monitoring
          </p>
        </div>

        <AgentDetailDashboard agentId={agentId} />
      </div>
    </div>
  );
}