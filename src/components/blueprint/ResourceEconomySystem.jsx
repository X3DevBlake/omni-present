import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, TrendingUp, TrendingDown, ShoppingCart, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export class Market {
  constructor(resourceType) {
    this.resourceType = resourceType;
    this.price = 10;
    this.supply = 100;
    this.demand = 100;
    this.priceHistory = [];
    this.trades = [];
  }

  updatePrice() {
    const supplyDemandRatio = this.supply / Math.max(1, this.demand);
    const basePrice = 10;
    
    this.price = basePrice / Math.max(0.1, supplyDemandRatio);
    
    this.priceHistory.push({
      timestamp: Date.now(),
      price: this.price,
      supply: this.supply,
      demand: this.demand
    });

    if (this.priceHistory.length > 50) {
      this.priceHistory.shift();
    }
  }

  executeTrade(buyerId, sellerId, quantity) {
    const totalCost = this.price * quantity;
    
    this.trades.push({
      buyerId,
      sellerId,
      quantity,
      price: this.price,
      timestamp: Date.now()
    });

    this.supply -= quantity;
    this.demand += quantity * 0.5;
    this.updatePrice();

    return { cost: totalCost, quantity };
  }
}

export class TradeRoute {
  constructor(from, to, resourceType) {
    this.from = from;
    this.to = to;
    this.resourceType = resourceType;
    this.volume = 0;
    this.efficiency = 1.0;
    this.established = Date.now();
  }

  processFlow(amount) {
    this.volume += amount;
    return amount * this.efficiency;
  }
}

export class ResourceEconomy {
  constructor() {
    this.markets = new Map();
    this.tradeRoutes = [];
    this.agentWallets = new Map();
    this.inflationRate = 0;
    this.economicIndicators = {
      gdp: 0,
      unemployment: 0,
      marketStability: 1.0
    };
    
    ['food', 'water', 'materials', 'tools'].forEach(resource => {
      this.markets.set(resource, new Market(resource));
    });
  }

  initializeAgent(agentId, startingFunds = 100) {
    if (!this.agentWallets.has(agentId)) {
      this.agentWallets.set(agentId, {
        balance: startingFunds,
        inventory: new Map(),
        tradeHistory: []
      });
    }
  }

  executeTrade(buyerId, sellerId, resourceType, quantity) {
    const market = this.markets.get(resourceType);
    if (!market) return null;

    const buyerWallet = this.agentWallets.get(buyerId);
    const sellerWallet = this.agentWallets.get(sellerId);

    if (!buyerWallet || !sellerWallet) return null;

    const result = market.executeTrade(buyerId, sellerId, quantity);
    
    if (buyerWallet.balance >= result.cost) {
      buyerWallet.balance -= result.cost;
      sellerWallet.balance += result.cost;
      
      const buyerInv = buyerWallet.inventory.get(resourceType) || 0;
      buyerWallet.inventory.set(resourceType, buyerInv + quantity);
      
      buyerWallet.tradeHistory.push({ type: 'buy', resourceType, quantity, cost: result.cost, timestamp: Date.now() });
      sellerWallet.tradeHistory.push({ type: 'sell', resourceType, quantity, revenue: result.cost, timestamp: Date.now() });

      return result;
    }

    return null;
  }

  establishTradeRoute(fromId, toId, resourceType) {
    const existing = this.tradeRoutes.find(
      r => r.from === fromId && r.to === toId && r.resourceType === resourceType
    );

    if (!existing) {
      const route = new TradeRoute(fromId, toId, resourceType);
      this.tradeRoutes.push(route);
      return route;
    }

    return existing;
  }

  updateEconomy(scarcityEvents = []) {
    this.markets.forEach(market => {
      market.updatePrice();
      
      const scarcity = scarcityEvents.find(e => 
        e.affectedResources && e.affectedResources[market.resourceType]
      );

      if (scarcity) {
        market.supply *= scarcity.affectedResources[market.resourceType];
        market.demand *= 1.5;
      }
    });

    this.calculateInflation();
    this.updateEconomicIndicators();
  }

  calculateInflation() {
    const avgPriceChange = Array.from(this.markets.values()).map(market => {
      if (market.priceHistory.length < 2) return 0;
      const recent = market.priceHistory.slice(-2);
      return (recent[1].price - recent[0].price) / recent[0].price;
    }).reduce((sum, change) => sum + change, 0) / this.markets.size;

    this.inflationRate = avgPriceChange;
  }

  updateEconomicIndicators() {
    const totalTrades = Array.from(this.markets.values()).reduce(
      (sum, m) => sum + m.trades.length, 0
    );

    this.economicIndicators.gdp = totalTrades * 10;
    this.economicIndicators.marketStability = Math.max(0, 1 - Math.abs(this.inflationRate) * 10);
  }

  getStats() {
    return {
      markets: this.markets.size,
      tradeRoutes: this.tradeRoutes.length,
      totalTrades: Array.from(this.markets.values()).reduce((sum, m) => sum + m.trades.length, 0),
      inflationRate: this.inflationRate,
      gdp: this.economicIndicators.gdp,
      marketStability: this.economicIndicators.marketStability
    };
  }
}

export default function ResourceEconomySystem({ show, onClose, agents, scarcityEvents }) {
  const [economy] = useState(new ResourceEconomy());
  const [selectedMarket, setSelectedMarket] = useState('food');
  const [economicStats, setEconomicStats] = useState(null);
  const [priceChartData, setPriceChartData] = useState([]);
  const [topTraders, setTopTraders] = useState([]);

  useEffect(() => {
    agents.forEach(agent => economy.initializeAgent(agent.id));
  }, [agents]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate trades
      if (agents.length > 1 && Math.random() > 0.6) {
        const buyer = agents[Math.floor(Math.random() * agents.length)];
        const seller = agents[Math.floor(Math.random() * agents.length)];
        
        if (buyer.id !== seller.id) {
          const resources = ['food', 'water', 'materials', 'tools'];
          const resource = resources[Math.floor(Math.random() * resources.length)];
          const quantity = Math.floor(Math.random() * 5) + 1;
          
          const result = economy.executeTrade(buyer.id, seller.id, resource, quantity);
          if (result) {
            // Trade successful
          }
        }
      }

      economy.updateEconomy(scarcityEvents || []);
      setEconomicStats(economy.getStats());
      
      const market = economy.markets.get(selectedMarket);
      if (market) {
        setPriceChartData(market.priceHistory.slice(-20));
      }

      updateTopTraders();
    }, 2000);

    return () => clearInterval(interval);
  }, [agents, economy, selectedMarket, scarcityEvents]);

  const updateTopTraders = () => {
    const traders = agents.map(agent => {
      const wallet = economy.agentWallets.get(agent.id);
      return {
        id: agent.id,
        name: agent.name,
        color: agent.color,
        balance: wallet?.balance || 0,
        trades: wallet?.tradeHistory.length || 0
      };
    }).sort((a, b) => b.balance - a.balance).slice(0, 5);

    setTopTraders(traders);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Resource Economy System</h3>
                <p className="text-white/60 text-sm">Dynamic markets, trade routes, and economic indicators</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 p-6 overflow-y-auto">
              {economicStats && (
                <>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-white/60 text-xs mb-1">GDP</div>
                      <div className="text-white text-2xl font-bold">{economicStats.gdp.toFixed(0)}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-white/60 text-xs mb-1">Total Trades</div>
                      <div className="text-cyan-400 text-2xl font-bold">{economicStats.totalTrades}</div>
                    </div>
                    <div className={`rounded-xl p-4 border ${
                      economicStats.inflationRate > 0.1 ? 'bg-red-500/10 border-red-500/30' :
                      economicStats.inflationRate < -0.1 ? 'bg-blue-500/10 border-blue-500/30' :
                      'bg-white/5 border-white/10'
                    }`}>
                      <div className="text-white/60 text-xs mb-1">Inflation</div>
                      <div className={`text-2xl font-bold ${
                        economicStats.inflationRate > 0 ? 'text-red-400' : 'text-blue-400'
                      }`}>
                        {(economicStats.inflationRate * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-white/60 text-xs mb-1">Market Stability</div>
                      <div className="text-green-400 text-2xl font-bold">
                        {(economicStats.marketStability * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="text-white font-semibold">Market Prices</h4>
                      <select
                        value={selectedMarket}
                        onChange={(e) => setSelectedMarket(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
                      >
                        {Array.from(economy.markets.keys()).map(resource => (
                          <option key={resource} value={resource}>{resource}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={priceChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                          <XAxis dataKey="timestamp" stroke="#ffffff60" tickFormatter={(ts) => new Date(ts).toLocaleTimeString()} />
                          <YAxis stroke="#ffffff60" />
                          <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
                          <Legend />
                          <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} name="Price" />
                          <Line type="monotone" dataKey="supply" stroke="#3b82f6" strokeWidth={2} name="Supply" />
                          <Line type="monotone" dataKey="demand" stroke="#ec4899" strokeWidth={2} name="Demand" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-white font-semibold mb-3">Trade Routes</h4>
                      {economy.tradeRoutes.length === 0 ? (
                        <p className="text-white/60 text-sm text-center py-4">No trade routes established</p>
                      ) : (
                        <div className="space-y-2">
                          {economy.tradeRoutes.slice(0, 5).map((route, i) => {
                            const fromAgent = agents.find(a => a.id === route.from);
                            const toAgent = agents.find(a => a.id === route.to);
                            
                            return (
                              <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
                                <div className="flex items-center gap-2 text-sm mb-1">
                                  <span className="text-white">{fromAgent?.name}</span>
                                  <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                                  <span className="text-white">{toAgent?.name}</span>
                                </div>
                                <div className="text-white/60 text-xs">
                                  {route.resourceType} • Volume: {route.volume.toFixed(0)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-3">Top Traders</h4>
                      <div className="space-y-2">
                        {topTraders.map((trader, i) => (
                          <div key={trader.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: trader.color }} />
                                <span className="text-white text-sm">{trader.name}</span>
                              </div>
                              <span className="text-green-400 text-sm font-bold">${trader.balance.toFixed(0)}</span>
                            </div>
                            <div className="text-white/60 text-xs">{trader.trades} trades</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="w-80 border-l border-white/10 p-4 overflow-y-auto">
              <h4 className="text-white font-semibold mb-3 text-sm">Current Prices</h4>
              <div className="space-y-2 mb-6">
                {Array.from(economy.markets.entries()).map(([resource, market]) => {
                  const priceChange = market.priceHistory.length > 1
                    ? market.priceHistory[market.priceHistory.length - 1].price - market.priceHistory[market.priceHistory.length - 2].price
                    : 0;

                  return (
                    <div key={resource} className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm capitalize">{resource}</span>
                        <span className="text-green-400 text-sm font-bold">${market.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/60">Supply: {market.supply.toFixed(0)}</span>
                        <span className={`flex items-center gap-1 ${priceChange > 0 ? 'text-red-400' : priceChange < 0 ? 'text-green-400' : 'text-white/60'}`}>
                          {priceChange > 0 ? <TrendingUp className="w-3 h-3" /> : priceChange < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                          {Math.abs(priceChange).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {economicStats && (economicStats.inflationRate > 0.2 || economicStats.marketStability < 0.5) && (
                <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-4">
                  <h4 className="text-red-400 font-semibold mb-2 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Economic Alert
                  </h4>
                  {economicStats.inflationRate > 0.2 && (
                    <p className="text-white/70 text-xs mb-1">High inflation detected</p>
                  )}
                  {economicStats.marketStability < 0.5 && (
                    <p className="text-white/70 text-xs">Market instability</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}