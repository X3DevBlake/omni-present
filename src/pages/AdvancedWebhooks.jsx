import React from 'react';
import AdvancedWebhookManager from '../components/webhooks/AdvancedWebhookManager';
import { Webhook } from 'lucide-react';

export default function AdvancedWebhooks() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Webhook className="w-10 h-10 text-blue-500" />
            Advanced Webhook Management
          </h1>
          <p className="text-gray-600">
            Dynamic templates, workflow integrations, and visual debugging tools
          </p>
        </div>

        <AdvancedWebhookManager />
      </div>
    </div>
  );
}