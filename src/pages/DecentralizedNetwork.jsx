import React from 'react';
import DecentralizedNetworkHub from '../components/decentralized/DecentralizedNetworkHub';
import { Globe, Shield } from 'lucide-react';

export default function DecentralizedNetwork() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Globe className="w-10 h-10 text-indigo-500" />
            Decentralized Agent Network
          </h1>
          <p className="text-gray-600">
            Cross-platform agent collaboration with blockchain security and transparent governance
          </p>
        </div>

        <DecentralizedNetworkHub />
      </div>
    </div>
  );
}