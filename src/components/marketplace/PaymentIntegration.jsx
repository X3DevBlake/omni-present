import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, DollarSign, CheckCircle, MapPin, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function PaymentIntegration({ show, onClose, item, isPhysicalDevice = false, onPurchaseComplete }) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    phone: ''
  });

  const processPayment = async () => {
    if (isPhysicalDevice) {
      if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city) {
        toast.error('Please complete shipping address');
        return;
      }
    }

    setProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (isPhysicalDevice) {
        // Create order and update stock
        const orderNumber = `ORD-${Date.now()}`;
        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

        const order = await base44.entities.Order.create({
          order_number: orderNumber,
          device_id: item.id,
          device_name: item.name,
          quantity: 1,
          total_price: item.price,
          status: 'processing',
          shipping_address: shippingAddress,
          payment_method: 'card',
          estimated_delivery: estimatedDelivery.toISOString().split('T')[0]
        });

        // Update device stock
        await base44.entities.PhysicalDevice.update(item.id, {
          stock_quantity: item.stock_quantity - 1
        });

        toast.success('Payment successful!');
        onPurchaseComplete?.(order);
      } else {
        toast.success('Payment successful!');
        onPurchaseComplete?.(item);
      }
    } catch (error) {
      toast.error('Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10">
            <X className="w-5 h-5 text-white/70" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Complete Purchase</h3>
              <p className="text-white/60 text-sm">{item?.name}</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70">Price</span>
              <span className="text-white font-bold text-xl">${item?.price}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">Processing Fee</span>
              <span className="text-white/70">$0.00</span>
            </div>
            <div className="border-t border-white/10 mt-3 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">Total</span>
                <span className="text-green-400 font-bold text-2xl">${item?.price}</span>
              </div>
            </div>
          </div>

          {isPhysicalDevice && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <h4 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Shipping Address
              </h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 text-sm"
                />
                <input
                  type="text"
                  placeholder="Street Address"
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.number}
                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Expiry</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40"
                />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40"
                />
              </div>
            </div>
          </div>

          <button
            onClick={processPayment}
            disabled={processing}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing ? (
              'Processing...'
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Complete Purchase
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}