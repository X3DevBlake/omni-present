import React from 'react';
import AIProactiveMonitor from '../components/monitoring/AIProactiveMonitor';
import { Shield } from 'lucide-react';

export default function ProactiveMonitoring() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-purple-500" />
            AI Proactive Monitoring
          </h1>
          <p className="text-gray-600">
            Real-time threat detection, performance monitoring, and automated alerts
          </p>
        </div>

        <AIProactiveMonitor />
      </div>
    </div>
  );
}