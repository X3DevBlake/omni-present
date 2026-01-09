import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PlaidConnect({ onSuccess }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState([]);

  // Simulated Plaid integration
  const handleConnectBank = async () => {
    setIsConnecting(true);
    
    // In a real implementation, this would:
    // 1. Initialize Plaid Link
    // 2. Open Plaid OAuth flow
    // 3. Receive access token
    // 4. Store token securely in backend
    
    // Simulating connection delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockAccount = {
      id: `acc_${Date.now()}`,
      institution: 'Chase Bank',
      account_type: 'checking',
      last4: '1234',
      name: 'My Checking Account',
    };
    
    setConnectedAccounts([...connectedAccounts, mockAccount]);
    setIsConnecting(false);
    toast.success('Bank account connected successfully!');
    
    if (onSuccess) {
      onSuccess(mockAccount);
    }
  };

  const removeAccount = (accountId) => {
    setConnectedAccounts(connectedAccounts.filter(acc => acc.id !== accountId));
    toast.success('Bank account removed');
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Connect Your Bank</h3>
            <p className="text-white/60 text-sm">Securely link your bank account via Plaid</p>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-blue-300 text-sm">
              <p className="font-medium mb-1">Bank-level security</p>
              <p className="text-blue-300/80">
                Your credentials are encrypted and never stored on our servers. Plaid uses read-only access to verify your account.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleConnectBank}
          disabled={isConnecting}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {isConnecting ? 'Connecting...' : 'Connect Bank Account'}
        </button>
      </div>

      {connectedAccounts.length > 0 && (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h4 className="text-white font-bold mb-4">Connected Accounts</h4>
          <div className="space-y-3">
            {connectedAccounts.map(account => (
              <div
                key={account.id}
                className="bg-white/5 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-white font-medium">{account.institution}</div>
                    <div className="text-white/60 text-sm">
                      {account.account_type} •••• {account.last4}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeAccount(account.id)}
                  className="px-3 py-1 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-yellow-300 text-sm">
            <p className="font-medium mb-1">Important</p>
            <ul className="list-disc list-inside space-y-1 text-yellow-300/80">
              <li>Linking a bank account is required for fiat deposits</li>
              <li>You can link multiple accounts</li>
              <li>Instant verification - no micro-deposits needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}