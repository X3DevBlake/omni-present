import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, DollarSign, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentIntegration({ show, onClose, item, onPurchaseComplete }) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });

  const processPayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setProcessing(false);
    toast.success('Payment successful!');
    onPurchaseComplete?.(item);
    onClose();
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