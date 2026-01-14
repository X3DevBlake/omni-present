import React from 'react';
import AdvancedSimulationEnvironment from '../components/simulation/AdvancedSimulationEnvironment';
import { Zap, TrendingUp } from 'lucide-react';

export default function SimulationLab() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Zap className="w-10 h-10 text-purple-500" />
            AI Simulation Laboratory
          </h1>
          <p className="text-gray-600">
            Create multi-agent scenarios, test emergent behaviors, and analyze team orchestration effectiveness
          </p>
        </div>

        <AdvancedSimulationEnvironment />
      </div>
    </div>
  );
}