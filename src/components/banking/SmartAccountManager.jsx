import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Wallet, TrendingUp, Settings, Loader } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SmartAccountManager({ userEmail }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    account_name: '',
    account_type: 'checking',
    balance: 0
  });

  useEffect(() => {
    if (userEmail) loadAccounts();
  }, [userEmail]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.SmartBankAccount.list(
        { user_email: userEmail },
        '-created_date',
        50
      );
      setAccounts(data);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async () => {
    setCreating(true);
    try {
      await base44.entities.SmartBankAccount.create({
        ...newAccount,
        user_email: userEmail,
        ai_enabled: true,
        fraud_detection_enabled: true
      });
      await loadAccounts();
      setShowForm(false);
      setNewAccount({ account_name: '', account_type: 'checking', balance: 0 });
    } catch (error) {
      console.error('Error creating account:', error);
    } finally {
      setCreating(false);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Total Balance */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-lg p-6"
      >
        <p className="text-white/60 text-sm mb-1">Total Balance</p>
        <p className="text-white font-bold text-4xl">${totalBalance.toLocaleString()}</p>
        <p className="text-cyan-400 text-sm mt-2">{accounts.length} Active Accounts</p>
      </motion.div>

      {/* Create Account Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-400 text-cyan-300 rounded font-semibold hover:bg-cyan-500/30 flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Create New Account
      </button>

      {/* Create Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3"
        >
          <input
            type="text"
            placeholder="Account Name"
            value={newAccount.account_name}
            onChange={(e) => setNewAccount({ ...newAccount, account_name: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder:text-white/40"
          />
          <select
            value={newAccount.account_type}
            onChange={(e) => setNewAccount({ ...newAccount, account_type: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
          >
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="investment">Investment</option>
            <option value="crypto">Crypto</option>
          </select>
          <input
            type="number"
            placeholder="Initial Balance"
            value={newAccount.balance}
            onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder:text-white/40"
          />
          <button
            onClick={createAccount}
            disabled={creating}
            className="w-full px-4 py-2 bg-green-500/20 border border-green-400 text-green-300 rounded font-semibold hover:bg-green-500/30 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Account'}
          </button>
        </motion.div>
      )}

      {/* Accounts List */}
      <div className="space-y-3">
        {accounts.map((account, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-bold">{account.account_name}</h3>
                <p className="text-white/60 text-xs capitalize">{account.account_type}</p>
              </div>
              <p className="text-cyan-400 font-bold text-xl">${account.balance?.toLocaleString()}</p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              {account.ai_enabled && (
                <span className="text-cyan-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  AI Enabled
                </span>
              )}
              {account.fraud_detection_enabled && (
                <span className="text-green-400 flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  Fraud Protection
                </span>
              )}
            </div>

            {account.predicted_spending && (
              <div className="mt-3 bg-white/5 rounded p-2">
                <p className="text-white/60 text-xs">Predicted Spending</p>
                <p className="text-yellow-400 text-sm font-semibold">
                  ${account.predicted_spending?.toLocaleString()}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}