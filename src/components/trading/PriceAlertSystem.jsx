import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PriceAlertSystem({ userEmail }) {
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({
    asset_symbol: 'BTC',
    condition: 'above',
    target_price: 0
  });

  useEffect(() => {
    loadAlerts();
    
    // Subscribe to price updates and check alerts
    const unsubscribe = base44.entities.CryptoAsset.subscribe((event) => {
      if (event.type === 'update') {
        checkAlerts(event.data);
      }
    });

    return unsubscribe;
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await base44.entities.RealTimeAlert.list(
        { user_email: userEmail, category: 'price_alert' },
        '-created_date',
        50
      );
      setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const createAlert = async () => {
    try {
      await base44.entities.RealTimeAlert.create({
        user_email: userEmail,
        category: 'price_alert',
        title: `${newAlert.asset_symbol} Price Alert`,
        message: `Alert when ${newAlert.asset_symbol} goes ${newAlert.condition} $${newAlert.target_price}`,
        severity: 'medium',
        metadata: newAlert
      });
      
      await loadAlerts();
      setNewAlert({ asset_symbol: 'BTC', condition: 'above', target_price: 0 });
      alert('Price alert created!');
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };

  const checkAlerts = async (asset) => {
    for (const alert of alerts) {
      const metadata = alert.metadata || {};
      if (metadata.asset_symbol === asset.symbol) {
        const shouldTrigger = 
          (metadata.condition === 'above' && asset.current_price > metadata.target_price) ||
          (metadata.condition === 'below' && asset.current_price < metadata.target_price);

        if (shouldTrigger) {
          // Send notification via Slack
          await base44.integrations.Core.InvokeLLM({
            prompt: `Send Slack alert: ${asset.symbol} price is now $${asset.current_price} (${metadata.condition} target of $${metadata.target_price})`
          });

          // Send SMS for critical alerts
          await base44.integrations.Core.InvokeLLM({
            prompt: `Send SMS via Twilio: Price alert triggered for ${asset.symbol}`
          });

          // Mark as triggered
          await base44.entities.RealTimeAlert.update(alert.id, { status: 'triggered' });
        }
      }
    }
  };

  const deleteAlert = async (id) => {
    try {
      await base44.entities.RealTimeAlert.delete(id);
      await loadAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Bell className="w-5 h-5 text-cyan-400" />
          Price Alerts
        </h3>
      </div>

      {/* Create Alert Form */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
        <h4 className="text-white font-semibold text-sm">Create New Alert</h4>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Asset (BTC)"
            value={newAlert.asset_symbol}
            onChange={(e) => setNewAlert({ ...newAlert, asset_symbol: e.target.value })}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
          />
          <select
            value={newAlert.condition}
            onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>
          <input
            type="number"
            placeholder="Price"
            value={newAlert.target_price}
            onChange={(e) => setNewAlert({ ...newAlert, target_price: parseFloat(e.target.value) })}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
          />
        </div>
        <button
          onClick={createAlert}
          className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-400 text-cyan-300 rounded font-semibold hover:bg-cyan-500/30 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Alert
        </button>
      </div>

      {/* Active Alerts */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <AnimatePresence>
          {alerts.filter(a => a.status !== 'triggered').map((alert, idx) => {
            const metadata = alert.metadata || {};
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/5 border border-white/10 rounded p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {metadata.condition === 'above' ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <div>
                    <p className="text-white font-semibold text-sm">{metadata.asset_symbol}</p>
                    <p className="text-white/60 text-xs">
                      {metadata.condition} ${metadata.target_price}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="p-2 hover:bg-white/10 rounded"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}