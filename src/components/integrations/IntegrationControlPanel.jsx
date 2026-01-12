import React from 'react';
import { Slack, MessageCircle, Phone, FileText, Zap, Mic } from 'lucide-react';

export default function IntegrationControlPanel() {
  const integrations = [
    { name: 'Slack', icon: Slack, color: 'from-purple-500/20 to-pink-500/20 border-purple-400/30', status: 'active' },
    { name: 'ElevenLabs', icon: Mic, color: 'from-cyan-500/20 to-blue-500/20 border-cyan-400/30', status: 'active' },
    { name: 'Twilio', icon: Phone, color: 'from-red-500/20 to-orange-500/20 border-red-400/30', status: 'active' },
    { name: 'Google Docs', icon: FileText, color: 'from-green-500/20 to-emerald-500/20 border-green-400/30', status: 'active' },
    { name: 'Zapier', icon: Zap, color: 'from-orange-500/20 to-yellow-500/20 border-orange-400/30', status: 'active' }
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        Active Integrations
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {integrations.map(integration => {
          const Icon = integration.icon;
          return (
            <div key={integration.name} className={`bg-gradient-to-br ${integration.color} rounded-lg p-3`}>
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5" />
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
              <p className="text-white font-semibold text-sm">{integration.name}</p>
              <p className="text-white/60 text-xs">{integration.status}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}