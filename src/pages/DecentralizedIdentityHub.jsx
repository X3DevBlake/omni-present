import React from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import DIDManager from '../components/did/DIDManager';
import { Shield, Lock } from 'lucide-react';

export default function DecentralizedIdentityHub() {
  return (
    <AuroraBackground className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-6 space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-4">
            <Shield className="w-12 h-12 text-cyan-400" />
            Decentralized Identity Hub
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Manage your sovereign identity, verifiable credentials, and reputation across the Omni ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <DIDManager />
          </div>
          
          <div className="space-y-6">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-400" />
                Privacy Control
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Your DID allows you to prove claims (like age, skill, or ownership) without revealing the underlying data.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">• Zero-Knowledge Proofs enabled</li>
                <li className="flex items-center gap-2">• Selective Disclosure</li>
                <li className="flex items-center gap-2">• GDPR Compliant</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}