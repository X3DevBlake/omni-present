import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Shield, Briefcase, GraduationCap, Home, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerifiableCredentialManager() {
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const credentials = [
    {
      id: 'vc-1',
      type: 'Identity Verification',
      icon: Shield,
      issuer: 'Global ID Authority',
      issued: '2025-06-15',
      expires: '2027-06-15',
      status: 'active',
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/40'
    },
    {
      id: 'vc-2',
      type: 'Professional License',
      icon: Briefcase,
      issuer: 'Professional Council',
      issued: '2024-03-10',
      expires: '2026-03-10',
      status: 'active',
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/40'
    },
    {
      id: 'vc-3',
      type: 'Education Certificate',
      icon: GraduationCap,
      issuer: 'University Blockchain',
      issued: '2023-12-01',
      expires: 'Never',
      status: 'active',
      color: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/40'
    },
    {
      id: 'vc-4',
      type: 'Address Proof',
      icon: Home,
      issuer: 'Municipal Authority',
      issued: '2025-01-05',
      expires: '2026-01-05',
      status: 'active',
      color: 'from-orange-500/20 to-red-500/20',
      borderColor: 'border-orange-500/40'
    }
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-bold text-xl flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-400" />
            Verifiable Credentials
          </h3>
          <p className="text-white/60 text-sm">Your digital badges and proofs as 3D keys</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Request Credential
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {credentials.map((credential) => {
          const Icon = credential.icon;
          return (
            <motion.div
              key={credential.id}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              onClick={() => setSelectedCredential(credential)}
              className={`cursor-pointer bg-gradient-to-br ${credential.color} border ${credential.borderColor} rounded-xl p-4 relative overflow-hidden`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              
              <div className="flex flex-col items-center text-center mb-3">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-white font-bold text-sm mb-1">{credential.type}</div>
                <div className="text-white/60 text-xs">{credential.issuer}</div>
              </div>

              <div className="text-center">
                <div className="text-white/40 text-xs mb-1">Issued</div>
                <div className="text-white text-xs">{credential.issued}</div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-3">
                <Button size="sm" variant="outline" className="w-full">
                  <Eye className="w-3 h-3 mr-2" />
                  View Details
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedCredential && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-white font-bold text-lg mb-2">{selectedCredential.type}</h4>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Verified & Active</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCredential(null)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div>
                  <div className="text-white/60 text-sm">Issuer</div>
                  <div className="text-white">{selectedCredential.issuer}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm">Issue Date</div>
                  <div className="text-white">{selectedCredential.issued}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-white/60 text-sm">Expiry Date</div>
                  <div className="text-white">{selectedCredential.expires}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm">Credential ID</div>
                  <div className="text-white font-mono text-sm">{selectedCredential.id}</div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 rounded-lg p-4 mb-4">
              <div className="text-white/60 text-sm mb-2">Cryptographic Proof</div>
              <div className="text-white/80 font-mono text-xs break-all">
                0x8f3d2c9a7b6e1f4d5c8a2e9b3f7d1c6a4e8b2f9d5c3a7e1b8f4d2c9a6e3b7f1d
              </div>
            </div>

            <div className="flex gap-3">
              <Button size="sm" variant="outline">
                Share Credential
              </Button>
              <Button size="sm" variant="outline">
                Download as QR
              </Button>
              <Button size="sm" variant="outline" className="bg-red-500/10 border-red-500/30 text-red-400">
                Revoke Access
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}