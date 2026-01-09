import React from 'react';
import { Check, Plus } from 'lucide-react';

export default function IntegrationCard({ integration, onToggle }) {
  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-black/50 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{integration.icon}</div>
          <div>
            <h4 className="text-white font-semibold">{integration.name}</h4>
            <p className="text-white/60 text-xs">{integration.category}</p>
          </div>
        </div>
        {integration.installed && (
          <div className="p-1 bg-green-500/20 rounded-full">
            <Check className="w-4 h-4 text-green-400" />
          </div>
        )}
      </div>
      <p className="text-white/60 text-sm mb-3">{integration.description}</p>
      <button
        onClick={() => onToggle(integration.id)}
        className={`w-full py-2 rounded-lg font-medium text-sm ${
          integration.installed
            ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
            : 'bg-blue-500/20 border border-blue-500/40 text-blue-400 hover:bg-blue-500/30'
        }`}
      >
        {integration.installed ? 'Uninstall' : 'Install'}
      </button>
    </div>
  );
}