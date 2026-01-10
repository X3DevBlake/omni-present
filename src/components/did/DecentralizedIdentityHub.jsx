import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, Users, Globe, Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DecentralizedIdentityHub() {
  const [selectedDID, setSelectedDID] = useState(null);

  const dids = [
    {
      id: 'did:omni:main',
      name: 'Primary Identity',
      type: 'Personal',
      status: 'active',
      credentials: 12,
      verifiers: 8,
      reputation: 92
    },
    {
      id: 'did:omni:finance',
      name: 'Financial Identity',
      type: 'Finance',
      status: 'active',
      credentials: 6,
      verifiers: 15,
      reputation: 88
    },
    {
      id: 'did:omni:social',
      name: 'Social Identity',
      type: 'Social',
      status: 'active',
      credentials: 8,
      verifiers: 5,
      reputation: 85
    }
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-bold text-xl flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-400" />
            Decentralized Identity Hub
          </h3>
          <p className="text-white/60 text-sm">Manage your sovereign digital identities</p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-purple-500">
          <Key className="w-4 h-4 mr-2" />
          Create New DID
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {dids.map((did) => (
          <motion.div
            key={did.id}
            onClick={() => setSelectedDID(did)}
            whileHover={{ scale: 1.02 }}
            className={`cursor-pointer bg-gradient-to-br p-4 rounded-xl border-2 transition-all ${
              selectedDID?.id === did.id
                ? 'from-cyan-500/20 to-purple-500/20 border-cyan-500'
                : 'from-white/5 to-white/10 border-white/10 hover:border-white/30'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-bold">{did.name}</div>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-white/40 text-xs mb-3 font-mono">{did.id}</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-white/60 text-xs">Credentials</div>
                <div className="text-cyan-400 font-bold">{did.credentials}</div>
              </div>
              <div>
                <div className="text-white/60 text-xs">Verifiers</div>
                <div className="text-purple-400 font-bold">{did.verifiers}</div>
              </div>
              <div>
                <div className="text-white/60 text-xs">Rep</div>
                <div className="text-green-400 font-bold">{did.reputation}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedDID && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-6"
        >
          <h4 className="text-white font-bold mb-4">DID Details: {selectedDID.name}</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <div className="text-white/60 text-sm mb-1">DID Identifier</div>
                <div className="text-white font-mono text-sm bg-black/40 p-2 rounded">{selectedDID.id}</div>
              </div>
              <div>
                <div className="text-white/60 text-sm mb-1">Type</div>
                <div className="text-white">{selectedDID.type}</div>
              </div>
              <div>
                <div className="text-white/60 text-sm mb-1">Status</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 capitalize">{selectedDID.status}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg">
                <Key className="w-5 h-5 text-cyan-400" />
                <div className="flex-1">
                  <div className="text-white/60 text-xs">Public Key</div>
                  <div className="text-white text-sm font-mono">0x7a8b...9c3d</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
                <div className="flex-1">
                  <div className="text-white/60 text-xs">Verifiers</div>
                  <div className="text-white text-sm">{selectedDID.verifiers} trusted entities</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg">
                <Globe className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <div className="text-white/60 text-xs">Reputation Score</div>
                  <div className="text-white text-sm">{selectedDID.reputation}/100</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            <Button variant="outline" size="sm">
              <Lock className="w-4 h-4 mr-2" />
              Manage Permissions
            </Button>
            <Button variant="outline" size="sm">
              Export DID Document
            </Button>
            <Button variant="outline" size="sm" className="bg-red-500/10 border-red-500/30 text-red-400">
              Revoke DID
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}