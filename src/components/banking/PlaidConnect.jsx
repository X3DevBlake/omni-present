import React from 'react';
import { motion } from 'framer-motion';
import { usePlaidLink } from 'react-plaid-link';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Building2, Loader } from 'lucide-react';

export default function PlaidConnect({ userEmail, onSuccess }) {
  const [loading, setLoading] = React.useState(false);
  const [linkToken, setLinkToken] = React.useState(null);

  React.useEffect(() => {
    async function getLinkToken() {
      setLoading(true);
      const token = await base44.integrations.Plaid.createLinkToken(userEmail);
      setLinkToken(token);
      setLoading(false);
    }
    getLinkToken();
  }, [userEmail]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken) => {
      await base44.integrations.Plaid.exchangeToken(publicToken);
      onSuccess?.();
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg p-6 text-center"
    >
      <Building2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
      <h3 className="text-xl font-bold text-white mb-2">Connect Your Bank</h3>
      <p className="text-white/60 text-sm mb-4">
        Securely link your bank account to get credit analysis, loan approvals, and AI-powered insights.
      </p>

      <Button
        onClick={() => open()}
        disabled={!ready || loading}
        className="w-full bg-green-500 hover:bg-green-600 text-white"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          'Connect with Plaid'
        )}
      </Button>

      <p className="text-xs text-white/50 mt-4">
        Powered by Plaid. Your data is encrypted and secure.
      </p>
    </motion.div>
  );
}