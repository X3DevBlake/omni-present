import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, Users, Play, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function EnhancedSecurityFeatures() {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [simulationResult, setSimulationResult] = useState(null);
  const queryClient = useQueryClient();

  const { data: multiSigTxns } = useQuery({
    queryKey: ['multisig-transactions'],
    queryFn: () => base44.entities.MultiSigTransaction.list()
  });

  const { data: vaults } = useQuery({
    queryKey: ['secure-vaults'],
    queryFn: () => base44.entities.SecureVault.list()
  });

  const simulateTransaction = async () => {
    if (!amount || !recipient) {
      toast.error('Amount and recipient required');
      return;
    }

    // Simulate transaction
    const result = {
      success: true,
      estimatedGas: 0.0021,
      finalAmount: parseFloat(amount) - 0.0021,
      priceImpact: 0.05,
      warnings: amount > 10000 ? ['High value transaction - multi-sig recommended'] : []
    };

    setSimulationResult(result);
    toast.success('Transaction simulated successfully');
  };

  const createMultiSig = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.MultiSigTransaction.create({
        from_address: '0x1234...5678',
        to_address: data.to,
        amount: data.amount,
        token: data.token,
        required_signatures: data.signers || 2,
        signatures: [],
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['multisig-transactions'] });
      toast.success('Multi-signature transaction created');
    }
  });

  const createVault = useMutation({
    mutationFn: (data) => base44.entities.SecureVault.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-vaults'] });
      toast.success('Secure vault created');
    }
  });

  return (
    <div className="space-y-6">
      {/* Multi-Signature Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Multi-Signature Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm mb-3">
              Require multiple approvals for high-value transfers (recommended for amounts over $10,000)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
              />
              <Input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Recipient address"
              />
            </div>
            <Button 
              onClick={() => createMultiSig.mutate({ to: recipient, amount: parseFloat(amount), token: 'OMNI', signers: 2 })}
              className="w-full mt-3"
            >
              Create Multi-Sig Transaction
            </Button>
          </div>

          {/* Pending Multi-Sig Transactions */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Pending Approvals</h4>
            {multiSigTxns?.filter(t => t.status === 'pending').map((txn) => (
              <div key={txn.id} className="p-3 rounded border bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-semibold">{txn.amount} {txn.token}</p>
                    <p className="text-xs text-gray-500">To: {txn.to_address}</p>
                  </div>
                  <Badge>{txn.signatures?.length}/{txn.required_signatures} signed</Badge>
                </div>
                <Button size="sm" className="w-full">Sign Transaction</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Simulation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-6 h-6 text-green-500" />
            Transaction Simulation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm mb-3">Preview transaction outcomes before confirmation</p>
            <Button onClick={simulateTransaction} className="w-full">
              <Play className="w-4 h-4 mr-2" />
              Simulate Transaction
            </Button>
          </div>

          {simulationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border bg-white"
            >
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Simulation Result
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">{amount} OMNI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Gas:</span>
                  <span className="font-semibold">{simulationResult.estimatedGas} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Final Amount:</span>
                  <span className="font-semibold">{simulationResult.finalAmount} OMNI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price Impact:</span>
                  <span className="font-semibold">{simulationResult.priceImpact}%</span>
                </div>
              </div>
              {simulationResult.warnings?.length > 0 && (
                <div className="mt-3 p-2 rounded bg-yellow-50 border border-yellow-200 text-xs">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 inline mr-2" />
                  {simulationResult.warnings[0]}
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Secure Vault */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-6 h-6 text-purple-500" />
            Secure Vault
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
            <p className="text-sm mb-3">
              Store recovery phrases and private keys with hardware wallet or MFA protection
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => createVault.mutate({ 
                vault_name: 'Recovery Phrase', 
                encrypted_data: 'encrypted_content', 
                vault_type: 'recovery_phrase',
                access_method: 'hardware_wallet'
              })}>
                <Shield className="w-4 h-4 mr-2" />
                Create Vault
              </Button>
              <Button variant="outline">
                Access Vault
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {vaults?.map((vault) => (
              <div key={vault.id} className="p-3 rounded border">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm">{vault.vault_name}</p>
                    <Badge variant="secondary" className="text-xs mt-1">{vault.vault_type}</Badge>
                  </div>
                  <Badge variant="outline">{vault.access_method}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}