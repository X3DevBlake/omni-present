import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import AutomatedTradingDashboard from '../components/trading/AutomatedTradingDashboard';
import TransactionMonitor from '../components/trading/TransactionMonitor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, DollarSign } from 'lucide-react';

export default function AutomatedFinanceHub() {
  const [userEmail, setUserEmail] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <TrendingUp className="w-10 h-10 text-cyan-400" />
            Automated Finance Hub
          </h1>
          <p className="text-white/60">AI-driven trading and transaction automation</p>
        </motion.div>

        <Tabs defaultValue="trading" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
            <TabsTrigger value="trading" className="data-[state=active]:bg-cyan-500/20">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-cyan-500/20">
              <DollarSign className="w-4 h-4 mr-2" />
              Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trading" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
            >
              {userEmail ? (
                <AutomatedTradingDashboard userEmail={userEmail} />
              ) : (
                <div className="text-center py-12 text-white/40">Please log in</div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
            >
              {userEmail ? (
                <TransactionMonitor userEmail={userEmail} />
              ) : (
                <div className="text-center py-12 text-white/40">Please log in</div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}