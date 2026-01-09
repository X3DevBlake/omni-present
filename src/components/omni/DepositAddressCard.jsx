import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, QrCode, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function DepositAddressCard({ currency, address, network }) {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success('Address copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getCurrencyColor = () => {
    switch (currency.toLowerCase()) {
      case 'omni': return 'from-cyan-500 to-blue-500';
      case 'eth': return 'from-purple-500 to-indigo-500';
      case 'usdt': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getCurrencyIcon = () => {
    switch (currency.toLowerCase()) {
      case 'omni': return '⚡';
      case 'eth': return '◆';
      case 'usdt': return '₮';
      default: return '●';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCurrencyColor()} flex items-center justify-center text-2xl`}>
          {getCurrencyIcon()}
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">{currency.toUpperCase()} Deposit</h3>
          <p className="text-white/60 text-sm">{network || 'Main Network'}</p>
        </div>
      </div>

      <div className="bg-black/60 rounded-xl p-4 mb-4 border border-white/5">
        <div className="flex items-center justify-center mb-3">
          <div className="w-48 h-48 bg-white rounded-xl p-3 flex items-center justify-center">
            <QrCode className="w-full h-full text-black" />
          </div>
        </div>
        <div className="text-center text-white/40 text-xs mb-2">Scan QR Code</div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-white/60 text-xs mb-1 block">Deposit Address</label>
          <div className="flex items-center gap-2 bg-black/60 rounded-xl p-3 border border-white/5">
            <code className="text-cyan-400 text-sm flex-1 break-all font-mono">
              {address || 'Address will be generated...'}
            </code>
            {address && (
              <button
                onClick={copyAddress}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              >
                {copied ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-white/60" />
                )}
              </button>
            )}
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
          <p className="text-yellow-400 text-xs">
            ⚠️ Only send {currency.toUpperCase()} to this address. Sending other assets may result in permanent loss.
          </p>
        </div>

        <div className="text-white/40 text-xs space-y-1">
          <p>• Minimum deposit: 0.001 {currency.toUpperCase()}</p>
          <p>• Confirmations required: {currency.toLowerCase() === 'usdt' ? 12 : currency.toLowerCase() === 'eth' ? 12 : 6}</p>
          <p>• Network fee: Paid by sender</p>
        </div>
      </div>
    </motion.div>
  );
}