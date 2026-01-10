import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

export default function StripeCheckout({ tier, billingCycle, onSuccess }) {
  const [loading, setLoading] = React.useState(false);

  const createCheckout = useMutation({
    mutationFn: async () => {
      setLoading(true);
      const response = await base44.integrations.Stripe.createCheckoutSession({
        tier,
        billingCycle
      });
      window.location.href = response.url;
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-lg p-6 text-center"
    >
      <h3 className="text-xl font-bold text-white mb-2">Ready to upgrade?</h3>
      <p className="text-white/60 text-sm mb-4">Secure checkout powered by Stripe</p>

      <Button
        onClick={() => createCheckout.mutate()}
        disabled={loading || createCheckout.isPending}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
      >
        {loading || createCheckout.isPending ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          'Proceed to Checkout'
        )}
      </Button>

      <p className="text-xs text-white/50 mt-4">
        Your payment information is secure and encrypted. No charges until confirmed.
      </p>
    </motion.div>
  );
}