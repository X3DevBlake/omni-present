import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Shield, Target, Loader } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AdvancedOrderPanel({ userEmail, asset }) {
  const [orderType, setOrderType] = useState('market');
  const [order, setOrder] = useState({
    asset_symbol: asset?.symbol || 'BTC',
    order_type: 'market',
    side: 'buy',
    quantity: 0,
    limit_price: 0,
    stop_loss: 0,
    take_profit: 0,
    auto_execute: true
  });
  const [executing, setExecuting] = useState(false);

  const executeOrder = async () => {
    setExecuting(true);
    try {
      const trade = await base44.entities.TradeExecution.create({
        user_email: userEmail,
        asset_symbol: order.asset_symbol,
        order_type: order.order_type,
        side: order.side,
        quantity: order.quantity,
        limit_price: order.limit_price || null,
        stop_loss: order.stop_loss || null,
        take_profit: order.take_profit || null,
        status: 'pending',
        executed_at: new Date().toISOString()
      });

      // Autonomous execution via LLM
      const execution = await base44.integrations.Core.InvokeLLM({
        prompt: `Execute this ${order.order_type} order autonomously:
Asset: ${order.asset_symbol}
Side: ${order.side}
Quantity: ${order.quantity}
${order.limit_price ? `Limit Price: $${order.limit_price}` : ''}
${order.stop_loss ? `Stop Loss: $${order.stop_loss}` : ''}
${order.take_profit ? `Take Profit: $${order.take_profit}` : ''}

Simulate execution and return status.`,
        response_json_schema: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            executed_price: { type: 'number' },
            fees: { type: 'number' },
            confirmation: { type: 'string' }
          }
        }
      });

      await base44.entities.TradeExecution.update(trade.id, {
        status: 'executed',
        executed_price: execution.executed_price,
        fees: execution.fees
      });

      alert(`Order executed at $${execution.executed_price}!`);
      setOrder({ ...order, quantity: 0 });
    } catch (error) {
      console.error('Error executing order:', error);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
      <h3 className="text-white font-bold flex items-center gap-2">
        <Target className="w-5 h-5 text-cyan-400" />
        Advanced Order Execution
      </h3>

      {/* Order Type Selector */}
      <div className="grid grid-cols-3 gap-2">
        {['market', 'limit', 'stop-loss'].map((type) => (
          <button
            key={type}
            onClick={() => {
              setOrderType(type);
              setOrder({ ...order, order_type: type });
            }}
            className={`px-3 py-2 rounded font-semibold text-sm ${
              orderType === type
                ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Asset & Side */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-white/60 text-xs mb-1 block">Asset</label>
          <input
            type="text"
            value={order.asset_symbol}
            onChange={(e) => setOrder({ ...order, asset_symbol: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
          />
        </div>
        <div>
          <label className="text-white/60 text-xs mb-1 block">Side</label>
          <select
            value={order.side}
            onChange={(e) => setOrder({ ...order, side: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>
      </div>

      {/* Quantity */}
      <div>
        <label className="text-white/60 text-xs mb-1 block">Quantity</label>
        <input
          type="number"
          step="0.001"
          value={order.quantity}
          onChange={(e) => setOrder({ ...order, quantity: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
        />
      </div>

      {/* Conditional Fields */}
      {orderType === 'limit' && (
        <div>
          <label className="text-white/60 text-xs mb-1 block">Limit Price</label>
          <input
            type="number"
            step="0.01"
            value={order.limit_price}
            onChange={(e) => setOrder({ ...order, limit_price: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
          />
        </div>
      )}

      {/* Stop Loss & Take Profit */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-white/60 text-xs mb-1 block flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Stop Loss
          </label>
          <input
            type="number"
            step="0.01"
            value={order.stop_loss}
            onChange={(e) => setOrder({ ...order, stop_loss: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="text-white/60 text-xs mb-1 block flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Take Profit
          </label>
          <input
            type="number"
            step="0.01"
            value={order.take_profit}
            onChange={(e) => setOrder({ ...order, take_profit: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            placeholder="Optional"
          />
        </div>
      </div>

      {/* Execute Button */}
      <button
        onClick={executeOrder}
        disabled={executing || !order.quantity}
        className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded font-semibold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {executing ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Executing Order...
          </>
        ) : (
          <>
            <DollarSign className="w-4 h-4" />
            Execute {order.side.toUpperCase()} Order
          </>
        )}
      </button>
    </div>
  );
}