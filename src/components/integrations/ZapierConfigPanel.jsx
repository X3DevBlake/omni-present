import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Check, AlertCircle, ExternalLink } from 'lucide-react';

export default function ZapierConfigPanel() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [testStatus, setTestStatus] = useState(null);

  const testConnection = async () => {
    try {
      const response = await fetch('/api/functions/zapier-relay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'test_connection',
          agent_id: 'test',
          agent_name: 'Test Agent',
          user_email: 'test@example.com',
          data: { message: 'Test from Base44 AI Lab' }
        })
      });
      const data = await response.json();
      setTestStatus(data.ok ? 'success' : 'error');
    } catch (error) {
      setTestStatus('error');
    }
  };

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-500/20 rounded-lg">
          <Zap className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">Zapier Integration</h3>
          <p className="text-white/60 text-sm">Connect AI agents to 6,000+ apps</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-400 text-sm font-bold mb-2">Setup Instructions:</p>
          <ol className="text-white/80 text-xs space-y-1 list-decimal list-inside">
            <li>Create a Zap in Zapier with "Webhooks by Zapier" trigger</li>
            <li>Select "Catch Hook" and copy the webhook URL</li>
            <li>Add ZAPIER_WEBHOOK_URL to Dashboard → Secrets</li>
            <li>Test the connection below</li>
          </ol>
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-white text-sm font-bold mb-2">Automated Events:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-white/80">Document Generation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-white/80">AI Messages</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-white/80">SMS Notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-white/80">Team Formation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-white/80">Predictions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-white/80">Task Completions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-white/80">Proactive Alerts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-white/80">Agent Decisions</span>
            </div>
          </div>
        </div>

        <Button
          onClick={testConnection}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500"
        >
          <Zap className="w-4 h-4 mr-2" />
          Test Zapier Connection
        </Button>

        {testStatus && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 p-3 rounded-lg ${
              testStatus === 'success'
                ? 'bg-green-500/10 border border-green-500/30'
                : 'bg-red-500/10 border border-red-500/30'
            }`}
          >
            {testStatus === 'success' ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">Connection successful!</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm">Connection failed - check secrets</span>
              </>
            )}
          </motion.div>
        )}

        <a
          href="https://zapier.com/app/zaps"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <span className="text-white text-sm">Open Zapier Dashboard</span>
          <ExternalLink className="w-4 h-4 text-white/60" />
        </a>
      </div>
    </Card>
  );
}