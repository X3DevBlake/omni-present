import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, Lock, Unlock, Pause, Settings, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import OmniCard3DViewer from '../components/omni/OmniCard3DViewer';
import CardCustomizerAdvanced from '../components/banking/CardCustomizerAdvanced';
import { toast } from 'sonner';

export default function EnhancedOmniCardHub() {
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCardNumber, setShowCardNumber] = useState({});
  const queryClient = useQueryClient();

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['omnicards'],
    queryFn: () => base44.entities.OmniCardExtended.filter({}).limit(50),
    initialData: []
  });

  const manageCardMutation = useMutation({
    mutationFn: async ({ action, card_id, data }) => {
      const response = await base44.functions.invoke('manage-omnicard', {
        action,
        card_id,
        data
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['omnicards']);
      toast.success('Card updated successfully');
    }
  });

  const handleCardAction = (action, cardId, data = {}) => {
    manageCardMutation.mutate({ action, card_id: cardId, data });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-500',
      suspended: 'bg-yellow-500',
      frozen: 'bg-blue-500',
      expired: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Omni Card Management</h1>
          <p className="text-slate-400">Manage your virtual and physical cards</p>
        </motion.div>

        <Tabs defaultValue="cards" className="space-y-6">
          <TabsList className="bg-slate-900/60">
            <TabsTrigger value="cards">My Cards</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="cards">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Add New Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="bg-slate-900/60 border-slate-700 h-full flex items-center justify-center min-h-[300px] cursor-pointer hover:border-purple-500 transition-all">
                  <CardContent className="text-center">
                    <Plus className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-white font-bold text-xl mb-2">Add New Card</h3>
                    <p className="text-slate-400 text-sm">Create a new virtual or physical card</p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Existing Cards */}
              {cards.map((card, idx) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-slate-900/60 border-slate-700 overflow-hidden">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            {card.card_type} Card
                          </CardTitle>
                          <Badge className={`mt-2 ${getStatusColor(card.card_status)}`}>
                            {card.card_status}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedCard(card.id === selectedCard ? null : card.id)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* 3D Card Visualizer */}
                      <div className="h-[200px] mb-4">
                        <OmniCard3DViewer card={card} />
                      </div>

                      {/* Card Number */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-400 text-sm">Card Number</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCardNumber({
                              ...showCardNumber,
                              [card.id]: !showCardNumber[card.id]
                            })}
                          >
                            {showCardNumber[card.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                        <p className="text-white font-mono">
                          {showCardNumber[card.id] ? card.card_number : '•••• •••• •••• ••••'}
                        </p>
                      </div>

                      {/* Spending */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">Monthly Spending</span>
                          <span className="text-white">
                            ${card.current_month_spending?.toLocaleString()} / ${card.spending_limit_monthly?.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min((card.current_month_spending / card.spending_limit_monthly) * 100, 100)}%`
                            }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      {selectedCard === card.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-2 pt-4 border-t border-slate-700"
                        >
                          <Button
                            onClick={() => handleCardAction(card.card_status === 'active' ? 'freeze' : 'activate', card.id)}
                            className="w-full"
                            variant="outline"
                          >
                            {card.card_status === 'active' ? <Lock className="w-4 h-4 mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
                            {card.card_status === 'active' ? 'Freeze Card' : 'Activate Card'}
                          </Button>
                          <Button
                            onClick={() => handleCardAction('suspend', card.id)}
                            className="w-full"
                            variant="outline"
                          >
                            <Pause className="w-4 h-4 mr-2" />
                            Suspend Card
                          </Button>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="customize">
            <CardCustomizerAdvanced onSave={(design) => {
              if (selectedCard) {
                handleCardAction('customize_design', selectedCard, { design });
              }
            }} />
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">Transaction history will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}