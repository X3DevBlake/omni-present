import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown, Loader } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import Enhanced3DCardTier from '../components/omni/Enhanced3DCardTier';
import BackButton from '../components/navigation/BackButton';

export default function OmniCardStore() {
  const [user, setUser] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      let tierData = await base44.entities.CardTier.list();
      
      // If no tiers exist, create them
      if (tierData.length === 0) {
        const defaultTiers = [
          {
            tier_id: 'pioneer',
            name: 'Omni Pioneer Card',
            cost: 0,
            cashback_rate: 1,
            deposit_match_rate: 0,
            deposit_match_cap: 0,
            benefits: ['Basic card features', '1% cashback on all purchases'],
            customization_slots: 10,
            is_premium: false
          },
          {
            tier_id: 'explorer',
            name: 'Omni Explorer Card',
            cost: 0,
            cashback_rate: 2,
            deposit_match_rate: 0,
            deposit_match_cap: 0,
            benefits: ['Enhanced card design', '2% cashback on select categories', 'Priority support'],
            customization_slots: 15,
            is_premium: false
          },
          {
            tier_id: 'voyager',
            name: 'Omni Voyager Card',
            cost: 100,
            cashback_rate: 8,
            deposit_match_rate: 0.5,
            deposit_match_cap: 500,
            benefits: ['8% cashback on all transactions', 'Basic travel insurance', '25 customization options', '0.5% deposit match up to $500/month'],
            customization_slots: 25,
            is_premium: true
          },
          {
            tier_id: 'ascendant',
            name: 'Omni Ascendant Card',
            cost: 500,
            cashback_rate: 10,
            deposit_match_rate: 0.75,
            deposit_match_cap: 1000,
            benefits: ['10% cashback on all transactions', 'Premium travel rewards', 'Airport lounge access', '50 exclusive designs', '0.75% deposit match up to $1000/month'],
            customization_slots: 50,
            is_premium: true
          },
          {
            tier_id: 'sovereign',
            name: 'Omni Sovereign Card',
            cost: 2000,
            cashback_rate: 12,
            deposit_match_rate: 1,
            deposit_match_cap: 2500,
            benefits: ['12% cashback on all transactions', 'Dedicated concierge service', 'Premium travel rewards', 'All 100+ customization options', 'Limited-edition designs', '1% deposit match up to $2500/month'],
            customization_slots: 100,
            is_premium: true
          },
        ];

        for (const tier of defaultTiers) {
          await base44.entities.CardTier.create(tier);
        }
        tierData = defaultTiers;
      }

      setTiers(tierData);
    } catch (err) {
      toast.error('Failed to load card tiers');
    }
  };

  const handlePurchase = async (tier) => {
    if (tier.cost > (user?.omni_balance || 0)) {
      toast.error('Insufficient Omni balance');
      return;
    }

    setPurchasing(tier.tier_id);

    await new Promise(resolve => setTimeout(resolve, 1500));

    await base44.auth.updateMe({
      card_tier: tier.tier_id,
      omni_balance: (user.omni_balance || 0) - tier.cost
    });

    await base44.entities.OmniTransaction.create({
      user_id: user.id,
      type: 'spend',
      amount: tier.cost,
      currency: 'omni',
      status: 'confirmed',
      metadata: { purchase_type: 'card_tier_upgrade', tier: tier.tier_id }
    });

    setPurchasing(null);
    toast.success(`Successfully upgraded to ${tier.name}!`);
    loadData();
  };

  const getTierIcon = (tierId) => {
    const icons = {
      pioneer: '🌱',
      explorer: '🔍',
      voyager: '🚀',
      ascendant: '⭐',
      sovereign: '👑',
    };
    return icons[tierId] || '💳';
  };

  const getTierGradient = (tierId) => {
    const gradients = {
      pioneer: 'from-gray-500 to-slate-500',
      explorer: 'from-blue-500 to-cyan-500',
      voyager: 'from-purple-500 to-pink-500',
      ascendant: 'from-pink-500 to-rose-500',
      sovereign: 'from-yellow-500 to-orange-500',
    };
    return gradients[tierId] || 'from-gray-500 to-slate-500';
  };

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <BackButton />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Omni <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Card Tiers</span>
          </h1>
          <p className="text-white/60 text-lg">Choose the perfect card tier for your needs</p>
          <div className="mt-4 text-cyan-400 text-lg">
            Your Balance: <span className="font-bold">{(user?.omni_balance || 0).toFixed(2)} OMNI</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiers.map((tier, index) => (
            <Enhanced3DCardTier
              key={tier.tier_id}
              tier={tier.tier_id}
              name={tier.name}
              benefits={tier.benefits}
            />
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}