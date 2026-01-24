import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link2, TrendingUp, Globe, Cpu, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function ExternalIntegrationsPanel() {
  const [marketData, setMarketData] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [iotData, setIotData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFinancialData = async () => {
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('omega/unifiedAPIGateway', {
        integration_type: 'financial_market',
        endpoint: 'current_price',
        params: { asset: 'BTC/USD' }
      });
      setMarketData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch market data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGeopoliticalData = async () => {
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('omega/unifiedAPIGateway', {
        integration_type: 'geopolitical_news',
        endpoint: 'risk_analysis',
        params: { region: 'global' }
      });
      setGeoData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch geo data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIoTData = async () => {
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('omega/unifiedAPIGateway', {
        integration_type: 'iot_devices',
        endpoint: 'device_status',
        params: { device_id: 'aether_001' }
      });
      setIotData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch IoT data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-950/90 via-zinc-950/90 to-gray-950/90 backdrop-blur-xl border-slate-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Link2 className="w-7 h-7 text-slate-400" />
          External Platform Integrations
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Unified API gateway for market data, geopolitical feeds, and IoT devices
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="financial" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/60">
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="geopolitical">Geopolitical</TabsTrigger>
            <TabsTrigger value="iot">IoT Devices</TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-4">
            <Button
              onClick={fetchFinancialData}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Fetch Market Data
            </Button>

            {marketData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/60 rounded-lg p-4 border border-green-500/30"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-400 text-xs">Asset</div>
                    <div className="text-white font-bold">{marketData.asset}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Price</div>
                    <div className="text-green-400 font-bold text-xl">
                      ${marketData.price_usd?.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">24h Change</div>
                    <div className={`font-bold ${marketData.change_24h_percent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {marketData.change_24h_percent > 0 ? '+' : ''}{marketData.change_24h_percent?.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Sentiment</div>
                    <Badge className={marketData.market_sentiment === 'bullish' ? 'bg-green-600' : 'bg-red-600'}>
                      {marketData.market_sentiment}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="geopolitical" className="space-y-4">
            <Button
              onClick={fetchGeopoliticalData}
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <Globe className="w-4 h-4 mr-2" />
              Fetch Geopolitical Intel
            </Button>

            {geoData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="bg-black/60 rounded-lg p-4 border border-orange-500/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Risk Level</span>
                    <Badge className={geoData.risk_level > 0.7 ? 'bg-red-600' : 'bg-amber-600'}>
                      {(geoData.risk_level * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="text-white text-xs">Region: {geoData.region}</div>
                </div>

                {geoData.headlines && (
                  <div className="bg-black/60 rounded-lg p-3 border border-orange-500/20">
                    <div className="text-orange-400 text-xs font-bold mb-2">Headlines</div>
                    <div className="space-y-1">
                      {geoData.headlines.slice(0, 3).map((headline, idx) => (
                        <div key={idx} className="text-gray-300 text-xs">• {headline}</div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="iot" className="space-y-4">
            <Button
              onClick={fetchIoTData}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Cpu className="w-4 h-4 mr-2" />
              Query IoT Devices
            </Button>

            {iotData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/60 rounded-lg p-4 border border-blue-500/30"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white font-bold">{iotData.device_id}</span>
                  <Badge className="bg-green-600">{iotData.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-gray-400">Temperature</div>
                    <div className="text-white font-bold">{iotData.telemetry?.temperature_c?.toFixed(1)}°C</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Power</div>
                    <div className="text-white font-bold">{iotData.telemetry?.power_consumption_w?.toFixed(0)}W</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Quality</div>
                    <div className="text-white font-bold">
                      {(iotData.telemetry?.projection_quality * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Uptime</div>
                    <div className="text-white font-bold">{iotData.telemetry?.uptime_hours}h</div>
                  </div>
                </div>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}