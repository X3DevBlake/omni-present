import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function MyDevices() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

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
                  <h3 className="text-white font-bold">{order.device_name}</h3>
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
    </div>
  );
}