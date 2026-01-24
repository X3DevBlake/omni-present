import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Lock, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function OMLTransactionInterface({ agentId }) {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [txResult, setTxResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const executeTransaction = async () => {
    if (!amount || !recipient) return;
    
    setIsProcessing(true);
    
    try {
      const response = await base44.functions.invoke('omlTransactionAPI', {
        transaction_type: 'transfer',
        amount: parseFloat(amount),
        recipient,
        agent_id: agentId
      });

      setTxResult(response.data);
    } catch (error) {
      console.error('Transaction failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-950/90 to-green-950/90 backdrop-blur-xl border-emerald-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-emerald-400" />
          OML Transaction Interface
        </CardTitle>
        <p className="text-gray-300 text-sm">Secure blockchain transactions with loyalty verification</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Amount (USD)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-black/60 border-emerald-500/30 text-white"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Recipient Address</label>
            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="bg-black/60 border-emerald-500/30 text-white font-mono text-sm"
            />
          </div>
        </div>

        {txResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/60 rounded-lg p-4 border border-green-500/30 mb-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-green-400" />
              <div className="text-green-400 text-sm font-bold">Transaction Verified</div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">TX Hash:</span>
                <span className="text-white font-mono">{txResult.transaction_proof?.tx_id.substr(0, 16)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">OML Verified:</span>
                <Badge className="bg-green-600">{txResult.oml_verified ? 'Yes' : 'No'}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Confirmations:</span>
                <span className="text-white">{txResult.transaction_proof?.confirmation_blocks || 0}/12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">New Balance:</span>
                <span className="text-emerald-400 font-bold">${txResult.new_capital_balance?.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        )}

        <Button
          onClick={executeTransaction}
          disabled={isProcessing || !amount || !recipient}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          <Send className="w-4 h-4 mr-2" />
          {isProcessing ? 'Processing...' : 'Execute Transaction'}
        </Button>
      </CardContent>
    </Card>
  );
}