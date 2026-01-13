import React from 'react';
import WebhookManager from '../components/webhooks/WebhookManager';

export default function WebhooksHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Webhook Management</h1>
          <p className="text-gray-600">
            Configure custom webhooks with event triggers and conditional logic
          </p>
        </div>

        <WebhookManager />
      </div>
    </div>
  );
}