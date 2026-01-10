import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import LoanApplicationForm from '../components/loans/LoanApplicationForm';
import PlaidConnect from '../components/banking/PlaidConnect';
import { Landmark, TrendingUp } from 'lucide-react';

export default function LoansAndCredit() {
  const [userEmail, setUserEmail] = React.useState(null);
  const [plaidConnected, setPlaidConnected] = React.useState(false);

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const { data: creditScore } = useQuery({
    queryKey: ['creditScore', userEmail],
    queryFn: () => userEmail ? base44.entities.CreditScore.filter({ user_email: userEmail }) : null,
    enabled: !!userEmail,
  });

  const { data: loans } = useQuery({
    queryKey: ['loans', userEmail],
    queryFn: () => userEmail ? base44.entities.LoanApplication.filter({ user_email: userEmail }) : null,
    enabled: !!userEmail,
  });

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Landmark className="w-10 h-10 text-cyan-400" />
            Loans & Credit
          </h1>
          <p className="text-white/60">Apply for loans and manage your credit profile</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {!plaidConnected ? (
              <PlaidConnect userEmail={userEmail} onSuccess={() => setPlaidConnected(true)} />
            ) : null}

            {plaidConnected && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
              >
                <LoanApplicationForm
                  userEmail={userEmail}
                  creditScore={creditScore?.[0]}
                />
              </motion.div>
            )}

            {/* Loan Applications */}
            {loans && loans.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4">Your Applications</h3>
                <div className="space-y-3">
                  {loans.map((loan) => (
                    <div
                      key={loan.id}
                      className="bg-white/5 border border-white/10 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-white font-bold capitalize">{loan.loan_type} Loan</p>
                          <p className="text-white/60 text-sm">${loan.loan_amount?.toFixed(0)}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          loan.status === 'approved' ? 'bg-green-500/20 text-green-400'
                          : loan.status === 'rejected' ? 'bg-red-500/20 text-red-400'
                          : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {loan.status}
                        </span>
                      </div>
                      {loan.status === 'approved' && (
                        <p className="text-cyan-400 text-sm">Rate: {loan.approval_rate?.toFixed(2)}%</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {creditScore && creditScore.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-lg p-6"
              >
                <h4 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Credit Profile
                </h4>
                <p className="text-white/60 text-xs mb-2">Overall Score</p>
                <p className="text-4xl font-bold text-cyan-400 mb-4">{creditScore[0].overall_score}</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/60">Default Risk</span>
                    <span className="text-white">{creditScore[0].default_risk?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Accounts</span>
                    <span className="text-white">{creditScore[0].analysis?.total_accounts}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}