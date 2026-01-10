import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Send, Download, RefreshCw, Eye, EyeOff, Copy, ExternalLink } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

function TokenSphere({ color, position }) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
      <Sphere args={[0.8, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

export default function EnhancedNativeWallet() {
  const [balances, setBalances] = useState({
    OMNI: 0,
    ETH: 0,
    USDT: 0
  });
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [walletAddress] = useState('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
  const [sendAmount, setSendAmount] = useState('');
  const [sendTo, setSendTo] = useState('');
  const [selectedToken, setSelectedToken] = useState('OMNI');
  const [depositModalOpen, setDepositModalOpen] = useState(false);

  useEffect(() => {
    loadBalances();
  }, []);

  const loadBalances = async () => {
    const user = await base44.auth.me();
    setBalances({
      OMNI: user.omni_balance || 0,
      ETH: user.eth_balance || 0,
      USDT: user.usdt_balance || 0
    });
  };

  const handleDeposit = async (token, amount) => {
    const user = await base44.auth.me();
    const key = `${token.toLowerCase()}_balance`;
    await base44.auth.updateMe({
      [key]: (user[key] || 0) + parseFloat(amount)
    });
    await loadBalances();
    toast.success(`Deposited ${amount} ${token}`);
    setDepositModalOpen(false);
  };

  const handleSend = async () => {
    if (!sendTo || !sendAmount) {
      toast.error('Please fill all fields');
      return;
    }

    const amount = parseFloat(sendAmount);
    if (amount > balances[selectedToken]) {
      toast.error('Insufficient balance');
      return;
    }

    const user = await base44.auth.me();
    const key = `${selectedToken.toLowerCase()}_balance`;
    await base44.auth.updateMe({
      [key]: (user[key] || 0) - amount
    });

    await loadBalances();
    toast.success(`Sent ${amount} ${selectedToken} to ${sendTo.substring(0, 6)}...${sendTo.substring(38)}`);
    setSendAmount('');
    setSendTo('');
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success('Address copied!');
  };

  return (
    <div className="space-y-6">
      {/* 3D Token Visualization */}
      <div className="h-64 bg-black/20 rounded-2xl overflow-hidden border border-white/10 mb-6">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <TokenSphere color="#00f5ff" position={[-2, 0, 0]} />
          <TokenSphere color="#a855f7" position={[0, 0, 0]} />
          <TokenSphere color="#10b981" position={[2, 0, 0]} />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
        </Canvas>
      </div>

      {/* Wallet Address */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/5 border border-cyan-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-sm">Your Wallet Address</span>
          <div className="flex gap-2">
            <button onClick={copyAddress} className="p-2 bg-cyan-500/20 rounded-lg hover:bg-cyan-500/30">
              <Copy className="w-4 h-4 text-cyan-400" />
            </button>
            <a href={`https://etherscan.io/address/${walletAddress}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-cyan-500/20 rounded-lg hover:bg-cyan-500/30">
              <ExternalLink className="w-4 h-4 text-cyan-400" />
            </a>
          </div>
        </div>
        <div className="font-mono text-white font-bold text-lg break-all">{walletAddress}</div>
      </div>

      {/* Balances */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { token: 'OMNI', balance: balances.OMNI, color: 'from-cyan-500/20 to-blue-500/10', border: 'border-cyan-500/30', icon: '💎' },
          { token: 'ETH', balance: balances.ETH, color: 'from-purple-500/20 to-indigo-500/10', border: 'border-purple-500/30', icon: '⟠' },
          { token: 'USDT', balance: balances.USDT, color: 'from-green-500/20 to-emerald-500/10', border: 'border-green-500/30', icon: '💵' }
        ].map((item, idx) => (
          <motion.div
            key={item.token}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-gradient-to-br ${item.color} border ${item.border} rounded-xl p-5`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{item.icon}</span>
              <span className="text-white/60 text-sm font-semibold">{item.token}</span>
            </div>
            <div className="text-white font-bold text-2xl mb-1">{item.balance.toFixed(4)}</div>
            <div className="text-white/60 text-xs">≈ ${(item.balance * (item.token === 'USDT' ? 1 : item.token === 'ETH' ? 2400 : 0.5)).toFixed(2)}</div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Send */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-cyan-400" />
            Send Tokens
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-white/60 text-sm mb-2 block">Token</label>
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
              >
                <option value="OMNI">OMNI</option>
                <option value="ETH">ETH</option>
                <option value="USDT">USDT</option>
              </select>
            </div>

            <div>
              <label className="text-white/60 text-sm mb-2 block">Recipient Address</label>
              <input
                type="text"
                value={sendTo}
                onChange={(e) => setSendTo(e.target.value)}
                placeholder="0x..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
              />
            </div>

            <div>
              <label className="text-white/60 text-sm mb-2 block">Amount</label>
              <input
                type="number"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
              />
              <div className="text-white/40 text-xs mt-1">Available: {balances[selectedToken].toFixed(4)} {selectedToken}</div>
            </div>

            <button
              onClick={handleSend}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:opacity-90"
            >
              Send {selectedToken}
            </button>
          </div>
        </div>

        {/* Receive */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-green-400" />
            Receive / Deposit
          </h3>

          <div className="space-y-3">
            <button
              onClick={() => setDepositModalOpen(true)}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:opacity-90"
            >
              Deposit Funds
            </button>

            <div className="p-4 bg-white/5 rounded-xl text-center">
              <div className="text-white/60 text-sm mb-2">Send tokens to:</div>
              <div className="font-mono text-white text-sm break-all mb-3">{walletAddress}</div>
              <div className="w-32 h-32 bg-white mx-auto rounded-lg flex items-center justify-center">
                <div className="text-xs text-gray-800">QR Code</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {depositModalOpen && (
        <DepositModal
          onClose={() => setDepositModalOpen(false)}
          onDeposit={handleDeposit}
        />
      )}
    </div>
  );
}

function DepositModal({ onClose, onDeposit }) {
  const [token, setToken] = useState('ETH');
  const [amount, setAmount] = useState('');

  const handleSubmit = () => {
    if (amount && parseFloat(amount) > 0) {
      onDeposit(token, amount);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full"
      >
        <h2 className="text-white font-bold text-2xl mb-6">Deposit Funds</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-white/60 text-sm mb-2 block">Token</label>
            <select
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
            >
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDT">Tether (USDT)</option>
              <option value="OMNI">Omni Token</option>
            </select>
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
            />
          </div>

          <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
            <p className="text-cyan-400 text-sm">
              This simulates a blockchain deposit. In production, this would connect to your wallet provider.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:opacity-90"
          >
            Confirm Deposit
          </button>
        </div>
      </motion.div>
    </div>
  );
}