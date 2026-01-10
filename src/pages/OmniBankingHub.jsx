import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import OmniBankDashboard from '../components/banking/OmniBankDashboard';
import CryptoTokenGrid from '../components/crypto/CryptoTokenGrid';
import { Wallet, Coins, Settings, History } from 'lucide-react';

export default function OmniBankingHub() {
  const [userEmail, setUserEmail] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Wallet className="w-10 h-10 text-cyan-400" />
            Omni Banking Hub
          </h1>
          <p className="text-white/60">Unified banking, trading, and crypto management</p>
        </motion.div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-cyan-500/20">
              <Wallet className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="crypto" className="data-[state=active]:bg-cyan-500/20">
              <Coins className="w-4 h-4 mr-2" />
              Crypto
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-cyan-500/20">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-cyan-500/20">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
            >
              {userEmail ? (
                <OmniBankDashboard userEmail={userEmail} />
              ) : (
                <div className="text-center py-12 text-white/40">Please log in to view your accounts</div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="crypto" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
            >
              <CryptoTokenGrid />
            </motion.div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
            >
              <div className="text-center py-12 text-white/40">Transaction history coming soon</div>
            </motion.div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
            >
              <div className="text-center py-12 text-white/40">Banking settings coming soon</div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}