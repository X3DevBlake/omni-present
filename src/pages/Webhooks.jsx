import React from 'react';
import { motion } from 'framer-motion';
import { Webhook } from 'lucide-react';
import WebhookDashboard4D from '@/components/webhooks/WebhookDashboard4D';

export default function Webhooks() {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500/20 to-purple-500/20 border border-orange-500/10">
              <Webhook className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Webhook Orchestration</h1>
              <p className="text-white/40 text-sm">Real-time event-driven automation with 4D pipeline monitoring</p>
            </div>
          </div>
        </motion.div>

        <WebhookDashboard4D />
      </div>
    </div>
  );
}
