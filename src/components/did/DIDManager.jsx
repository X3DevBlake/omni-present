import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Fingerprint, Shield, Award, Plus, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function DIDManager() {
  const [newDID, setNewDID] = useState('');
  const queryClient = useQueryClient();

  // Mock data for initial render, replace with real data fetching
  const { data: dids = [], isLoading } = useQuery({
    queryKey: ['dids'],
    queryFn: () => base44.entities.DIDIdentity.list(),
    initialData: [
      { did: 'did:omni:user:123456789', reputation_score: 850, created_at: new Date().toISOString() }
    ]
  });

  const createDIDMutation = useMutation({
    mutationFn: async () => {
      // Logic to create DID via backend function would go here
      // For now, we simulate creating a record
      return base44.entities.DIDIdentity.create({
        did: `did:omni:${Math.random().toString(36).substring(7)}`,
        user_id: 'current_user',
        public_key: 'mock_pub_key',
        controller: 'self',
        reputation_score: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dids'] });
      toast.success('New Decentralized Identity Created');
    }
  });

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Fingerprint className="w-6 h-6 text-cyan-400" />
            Your Decentralized Identities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dids.map((did, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center"
              >
                <div>
                  <div className="font-mono text-cyan-300 text-sm">{did.did}</div>
                  <div className="text-xs text-gray-400">Created: {new Date(did.created_at).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Reputation</div>
                    <div className="font-bold text-white">{did.reputation_score}</div>
                  </div>
                  <Badge variant="outline" className="border-green-500 text-green-400">Verified</Badge>
                </div>
              </motion.div>
            ))}
            
            <Button 
              onClick={() => createDIDMutation.mutate()}
              className="w-full bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/50"
            >
              <Plus className="w-4 h-4 mr-2" /> Create New Identity
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-black/40 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              Verifiable Credentials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded bg-white/5">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-white text-sm font-semibold">Senior Developer</div>
                  <div className="text-xs text-gray-400">Issued by Omni Academy</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded bg-white/5">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-white text-sm font-semibold">Top Contributor</div>
                  <div className="text-xs text-gray-400">Issued by DAO Governance</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Linked Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Omni Tokens</span>
                <span className="text-white">Linked</span>
              </div>
              <div className="flex justify-between">
                <span>Staking Rewards</span>
                <span className="text-white">Linked</span>
              </div>
              <div className="flex justify-between">
                <span>Agent Profiles</span>
                <span className="text-white">3 Agents</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}