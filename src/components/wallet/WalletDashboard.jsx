import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, ArrowRight, RefreshCw, Shield, Zap } from 'lucide-react';
import { motion } from "framer-motion";
import { base44 } from '@/api/base44Client';
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function WalletDashboard({ wallet, did, onTransfer }) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const queryClient = useQueryClient();

  const handleTransfer = async () => {
    if (!recipient || !amount) return;
    setIsTransferring(true);
    try {
      await base44.functions.invoke('transferTokens', {
        recipientAddress: recipient,
        amount: parseFloat(amount)
      });
      toast.success("Transfer initiated successfully");
      queryClient.invalidateQueries(['walletData']);
      setRecipient('');
      setAmount('');
    } catch (error) {
      toast.error("Transfer failed: " + error.message);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Wallet Card */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
        <Card className="relative bg-black/90 border-white/10 h-full overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Wallet className="w-32 h-32 text-purple-500" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-white">
              <Shield className="w-6 h-6 text-purple-400" />
              Omni Vault
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Balance</p>
              <h3 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-400">
                {wallet?.balance?.toLocaleString() || '0'} <span className="text-xl text-purple-400">OMNI</span>
              </h3>
            </div>
            
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-gray-400 text-xs mb-2">Wallet Address</p>
              <div className="font-mono text-cyan-400 break-all text-sm">
                {wallet?.address || 'Loading...'}
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-gray-400 text-xs mb-2">DID Identity</p>
              <div className="font-mono text-purple-400 break-all text-sm">
                {did?.did || 'Identity Not Forged'}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transfer Card */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
        <Card className="relative bg-black/90 border-white/10 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-white">
              <Zap className="w-6 h-6 text-cyan-400" />
              Transfer Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Recipient Address</label>
                <Input 
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..." 
                  className="bg-white/5 border-white/10 text-white focus:border-cyan-500" 
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Amount (OMNI)</label>
                <Input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00" 
                  className="bg-white/5 border-white/10 text-white focus:border-cyan-500" 
                />
              </div>
            </div>

            <Button 
              onClick={handleTransfer}
              disabled={isTransferring}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-6 text-lg rounded-xl mt-4"
            >
              {isTransferring ? (
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <ArrowRight className="w-5 h-5 mr-2" />
              )}
              {isTransferring ? 'Processing...' : 'Initiate Transfer'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}