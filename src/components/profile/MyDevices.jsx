import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, MapPin, Activity, Battery, Wifi, WifiOff, Settings, Power, RefreshCw, Zap, Bot, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import DeviceControlPanel from '../devices/DeviceControlPanel';
import DeviceAIIntegration from '../devices/DeviceAIIntegration';

export default function MyDevices() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deviceTelemetry, setDeviceTelemetry] = useState(new Map());
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [showAIIntegration, setShowAIIntegration] = useState(false);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(updateTelemetry, 2000);
    return () => clearInterval(interval);
  }, []);

  const updateTelemetry = () => {
    setDeviceTelemetry(prev => {
      const updated = new Map(prev);
      orders.forEach(order => {
        if (order.status === 'delivered') {
          updated.set(order.device_id, {
            online: Math.random() > 0.1,
            battery: Math.floor(Math.random() * 100),
            temperature: (20 + Math.random() * 10).toFixed(1),
            uptime: Math.floor(Math.random() * 86400),
            lastSync: new Date(),
            activeAgents: Math.floor(Math.random() * 3),
            sensorReadings: {
              motion: Math.random() > 0.7,
              light: Math.floor(Math.random() * 1000),
              sound: Math.floor(Math.random() * 100)
            }
          });
        }
      });
      return updated;
    });
  };

  const loadOrders = async () => {
    try {
      const user = await base44.auth.me();
      const data = await base44.entities.Order.filter({ created_by: user.email }, '-created_date');
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'green';
      case 'shipped': return 'blue';
      case 'processing': return 'yellow';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-5 h-5" />;
      case 'shipped': return <Truck className="w-5 h-5" />;
      case 'processing': return <Clock className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  if (loading) {
    return <div className="text-white/60 text-center py-8">Loading your devices...</div>;
  }

  const sendCommand = async (deviceId, command) => {
    toast.info(`Sending ${command} to device...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`Command executed: ${command}`);
    updateTelemetry();
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <p className="text-white/60">No devices purchased yet</p>
        <a href="/DeviceShop" className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:opacity-90">
          Browse Device Shop
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">My Devices</h2>
      
      {orders.map((order, i) => {
        const color = getStatusColor(order.status);
        const telemetry = deviceTelemetry.get(order.device_id);
        const isDelivered = order.status === 'delivered';
        
        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-${color}-500/10 border border-${color}-500/30 rounded-2xl p-6`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-${color}-500/20 border border-${color}-500/40 flex items-center justify-center text-${color}-400`}>
                  {getStatusIcon(order.status)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold">{order.device_name}</h3>
                    {isDelivered && telemetry && (
                      <div className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${
                        telemetry.online ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {telemetry.online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                        {telemetry.online ? 'Online' : 'Offline'}
                      </div>
                    )}
                  </div>
                  <p className="text-white/60 text-sm">Order #{order.order_number}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-${color}-400 font-bold text-xl`}>${order.total_price}</div>
                <div className={`px-3 py-1 bg-${color}-500/20 border border-${color}-500/40 text-${color}-300 rounded-full text-xs capitalize mt-1`}>
                  {order.status}
                </div>
              </div>
            </div>

            {isDelivered && telemetry && (
              <div className="bg-black/40 rounded-xl p-4 mb-4">
                <h4 className="text-white font-semibold mb-3 text-sm">Live Telemetry</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Battery className={`w-4 h-4 ${telemetry.battery > 20 ? 'text-green-400' : 'text-red-400'}`} />
                      <span className="text-white/60 text-xs">Battery</span>
                    </div>
                    <div className="text-white font-bold">{telemetry.battery}%</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      <span className="text-white/60 text-xs">Temp</span>
                    </div>
                    <div className="text-white font-bold">{telemetry.temperature}°C</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="text-white/60 text-xs">Uptime</span>
                    </div>
                    <div className="text-white font-bold">{Math.floor(telemetry.uptime / 3600)}h</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Bot className="w-4 h-4 text-yellow-400" />
                      <span className="text-white/60 text-xs">Agents</span>
                    </div>
                    <div className="text-white font-bold">{telemetry.activeAgents}</div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-white/5 rounded p-2">
                    <span className="text-white/60">Motion:</span> <span className={telemetry.sensorReadings.motion ? 'text-green-400' : 'text-white/40'}>
                      {telemetry.sensorReadings.motion ? 'Detected' : 'None'}
                    </span>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <span className="text-white/60">Light:</span> <span className="text-white">{telemetry.sensorReadings.light} lux</span>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <span className="text-white/60">Sound:</span> <span className="text-white">{telemetry.sensorReadings.sound} dB</span>
                  </div>
                </div>
              </div>
            )}

            {isDelivered && telemetry?.online && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    setSelectedDevice({ ...order, telemetry });
                    setShowControlPanel(true);
                  }}
                  className="flex-1 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-lg text-sm hover:bg-cyan-500/30 flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Control
                </button>
                <button
                  onClick={() => {
                    setSelectedDevice({ ...order, telemetry });
                    setShowAIIntegration(true);
                  }}
                  className="flex-1 py-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-lg text-sm hover:bg-purple-500/30 flex items-center justify-center gap-2"
                >
                  <Bot className="w-4 h-4" />
                  AI Control
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60 text-xs mb-1">Quantity</div>
                <div className="text-white font-semibold">{order.quantity}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60 text-xs mb-1">Est. Delivery</div>
                <div className="text-white font-semibold">
                  {order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleDateString() : 'TBD'}
                </div>
              </div>
            </div>

            {order.shipping_address && (
              <div className="bg-white/5 rounded-lg p-3 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-white/60 mt-1" />
                <div className="text-white/70 text-sm">
                  <div>{order.shipping_address.fullName}</div>
                  <div>{order.shipping_address.address}</div>
                  <div>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}</div>
                </div>
              </div>
            )}

            {order.tracking_number && (
              <div className="mt-3 text-cyan-400 text-sm">
                Tracking: {order.tracking_number}
              </div>
            )}
          </motion.div>
        );
      })}

      <DeviceControlPanel
        show={showControlPanel}
        onClose={() => setShowControlPanel(false)}
        device={selectedDevice}
        onCommandSend={sendCommand}
      />

      <DeviceAIIntegration
        show={showAIIntegration}
        onClose={() => setShowAIIntegration(false)}
        device={selectedDevice}
      />
    </div>
  );
}