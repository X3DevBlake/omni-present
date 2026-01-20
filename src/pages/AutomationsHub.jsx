import React from 'react';
import AutomationDashboard from '../components/automations/AutomationDashboard';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function AutomationsHub() {
  return (
    <AuroraBackground className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Automations Hub</h1>
          <p className="text-white/70">Manage and monitor all platform automations</p>
        </div>

        <AutomationDashboard />
      </div>
    </AuroraBackground>
  );
}