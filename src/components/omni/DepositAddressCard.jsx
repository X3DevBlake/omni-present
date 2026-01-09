import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, QrCode } from 'lucide-react';
import { toast } from 'sonner';

export default function DepositAddressCard({ currency, address, network }) {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-xl mb-1">Deposit {currency}</h3>
          <div className="text-white/60 text-sm">Network: {network}</div>
        </div>
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
          <QrCode className="w-8 h-8 text-white" />
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-4 mb-4">
        <div className="text-white/60 text-xs mb-2">Your Deposit Address</div>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-cyan-400 font-mono text-sm break-all">
            {address || 'Generating...'}
          </code>
          <button
            onClick={copyAddress}
            className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-400 rounded-lg transition-all"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
        <div className="text-yellow-300 text-xs space-y-1">
          <p>⚠️ Only send {currency} to this address</p>
          <p>⚠️ Ensure you're using the {network}</p>
          <p>⚠️ Minimum deposit: 1 {currency}</p>
        </div>
      </div>
    </motion.div>
  );
}