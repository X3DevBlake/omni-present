import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Star, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function OmniCardManager({ userEmail }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: cards = [] } = useQuery({
    queryKey: ['omniCards', userEmail],
    queryFn: () => base44.entities.OmniCardV2.filter({ user_email: userEmail }, '-created_date', 10),
    enabled: !!userEmail
  });

  const createCardMutation = useMutation({
    mutationFn: (cardData) => base44.entities.OmniCardV2.create({
      ...cardData,
      user_email: userEmail,
      status: 'pending'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omniCards'] });
      setShowCreateForm(false);
      toast.success('Card created! Pending activation.');
    }
  });

  const cardTiers = {
    basic: { color: 'from-slate-500 to-gray-600', benefits: ['2% cashback', 'No annual fee'] },
    silver: { color: 'from-gray-400 to-gray-500', benefits: ['3% cashback', '$50 annual fee', 'Priority support'] },
    gold: { color: 'from-yellow-500 to-yellow-600', benefits: ['4% cashback', '$100 annual fee', 'Concierge service'] },
    platinum: { color: 'from-blue-400 to-blue-600', benefits: ['5% cashback', '$300 annual fee', 'VIP benefits'] },
    diamond: { color: 'from-purple-500 to-pink-500', benefits: ['6% cashback', '$500 annual fee', 'Ultimate rewards'] }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Omni Cards</h2>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> New Card
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 border border-cyan-500/30 rounded-2xl p-6"
        >
          <h3 className="text-white font-bold mb-4">Create New Card</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(cardTiers).map(([type, config]) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  createCardMutation.mutate({ card_type: type });
                }}
                className={`bg-gradient-to-br ${config.color} rounded-lg p-4 text-center text-white font-bold capitalize`}
                disabled={createCardMutation.isPending}
              >
                {type}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {cards.map((card, idx) => {
          const tierConfig = cardTiers[card.card_type] || cardTiers.basic;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-gradient-to-br ${tierConfig.color} rounded-2xl p-8 text-white relative overflow-hidden h-64`}
            >
              {/* Card background effects */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
              </div>

              {/* Card content */}
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-white/80 text-sm uppercase tracking-wider">Card</p>
                    <h3 className="text-2xl font-bold capitalize">{card.card_type}</h3>
                  </div>
                  <CreditCard className="w-8 h-8" />
                </div>

                <div className="mb-6">
                  <p className="text-white/80 text-xs mb-1">Card Number</p>
                  <p className="font-mono text-lg">{card.card_number}</p>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-white/80 text-xs">Balance</p>
                    <p className="text-xl font-bold">${card.balance.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-xs">Rewards</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-300" />
                      <span className="font-bold">{card.rewards_balance}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status badge */}
              <div className="absolute top-4 right-4 px-3 py-1 bg-black/40 rounded-full text-xs font-semibold capitalize">
                {card.status}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Benefits explanation */}
      <Card className="bg-cyan-500/10 border-cyan-500/30 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          Card Tier Benefits
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(cardTiers).map(([type, config]) => (
            <div key={type} className="p-3 bg-black/20 rounded-lg">
              <p className="text-white font-semibold capitalize mb-2">{type}</p>
              <ul className="text-white/70 text-xs space-y-1">
                {config.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}