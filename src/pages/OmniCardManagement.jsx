import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Unlock, Settings, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuroraBackground from '../components/omni/AuroraBackground';
import OmniCard3DViewer from '../components/omni/OmniCard3DViewer';
import CardCustomizer from '../components/omni/CardCustomizer';
import TransactionList from '../components/omni/TransactionList';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function OmniCardManagement() {
  const [user, setUser] = useState(null);
  const [cardTransactions, setCardTransactions] = useState([]);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Initialize card if not exists
      if (!userData.card_number) {
        const mockCardNumber = '**** **** **** ' + Math.floor(1000 + Math.random() * 9000);
        await base44.auth.updateMe({
          card_number: mockCardNumber,
          card_status: 'active',
          card_design_config: { color: '#00f5ff', material: 'standard' }
        });
        userData.card_number = mockCardNumber;
        userData.card_status = 'active';
      }

      const txs = await base44.entities.OmniTransaction.filter(
        { user_id: userData.id, type: 'spend' },
        '-created_date',
        20
      );
      setCardTransactions(txs);
    } catch (err) {
      toast.error('Failed to load card data');
    } finally {
      setLoading(false);
    }
  };

  const toggleCardStatus = async () => {
    const newStatus = user.card_status === 'active' ? 'frozen' : 'active';
    await base44.auth.updateMe({ card_status: newStatus });
    setUser({ ...user, card_status: newStatus });
    toast.success(`Card ${newStatus === 'active' ? 'activated' : 'frozen'}!`);
  };

  const handleDesignChange = async (newDesign) => {
    await base44.auth.updateMe({ card_design_config: newDesign });
    setUser({ ...user, card_design_config: newDesign });
    toast.success('Card design updated!');
  };

  const getTierInfo = () => {
    const tiers = {
      pioneer: { name: 'Pioneer', cashback: '1%', color: 'text-gray-400' },
      explorer: { name: 'Explorer', cashback: '2%', color: 'text-blue-400' },
      voyager: { name: 'Voyager', cashback: '8%', color: 'text-purple-400' },
      ascendant: { name: 'Ascendant', cashback: '10%', color: 'text-pink-400' },
      sovereign: { name: 'Sovereign', cashback: '12%', color: 'text-yellow-400' },
    };
    return tiers[user?.card_tier] || tiers.pioneer;
  };

  const tierInfo = getTierInfo();

  const cardData = {
    name: user?.full_name || 'CARD HOLDER',
    number: user?.card_number || '**** **** **** ****',
    expiry: '12/28',
    cvv: '***',
  };

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Omni <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Card</span>
          </h1>
          <p className="text-white/60 text-lg">Manage your Omni Card and transactions</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Card Viewer */}
          <div>
            <OmniCard3DViewer
              design={user?.card_design_config}
              cardData={cardData}
              onDesignChange={handleDesignChange}
            />

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                onClick={toggleCardStatus}
                className={`py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  user?.card_status === 'active'
                    ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
                    : 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30'
                }`}
              >
                {user?.card_status === 'active' ? (
                  <><Lock className="w-4 h-4" /> Freeze Card</>
                ) : (
                  <><Unlock className="w-4 h-4" /> Activate Card</>
                )}
              </button>

              <button
                onClick={() => setShowCustomizer(!showCustomizer)}
                className="py-3 px-4 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl font-medium hover:bg-cyan-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Customize
              </button>
            </div>
          </div>

          {/* Card Info & Stats */}
          <div className="space-y-6">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-xl">Card Tier</h3>
                <Link
                  to={createPageUrl('OmniCardStore')}
                  className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Upgrade
                </Link>
              </div>
              <div className={`text-3xl font-bold ${tierInfo.color} mb-2`}>{tierInfo.name}</div>
              <div className="text-white/60">Cashback Rate: <span className="text-green-400 font-bold">{tierInfo.cashback}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <div className="text-white/60 text-sm mb-1">Card Balance</div>
                <div className="text-white text-2xl font-bold">${(user?.omni_balance || 0 * 0.0245).toFixed(2)}</div>
              </div>

              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <div className="text-white/60 text-sm mb-1">Cashback Earned</div>
                <div className="text-green-400 text-2xl font-bold">$45.20</div>
              </div>

              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <div className="text-white/60 text-sm mb-1">Monthly Spend</div>
                <div className="text-white text-2xl font-bold">$1,234</div>
              </div>

              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <div className="text-white/60 text-sm mb-1">Status</div>
                <div className={`text-lg font-bold ${
                  user?.card_status === 'active' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {user?.card_status === 'active' ? 'Active' : 'Frozen'}
                </div>
              </div>
            </div>

            <Link
              to={createPageUrl('FiatDeposit')}
              className="block w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-center"
            >
              Add Funds to Card
            </Link>
          </div>
        </div>

        {/* Customizer */}
        {showCustomizer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8"
          >
            <CardCustomizer
              currentDesign={user?.card_design_config}
              onDesignChange={handleDesignChange}
              unlockedSlots={user?.card_tier === 'sovereign' ? 100 : user?.card_tier === 'ascendant' ? 50 : user?.card_tier === 'voyager' ? 25 : 10}
            />
          </motion.div>
        )}

        {/* Recent Transactions */}
        <div>
          <h2 className="text-white font-bold text-2xl mb-4">Recent Card Transactions</h2>
          <TransactionList transactions={cardTransactions} isLoading={loading} />
        </div>
      </div>
    </AuroraBackground>
  );
}