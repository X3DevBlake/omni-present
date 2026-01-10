import React from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader, CheckCircle } from 'lucide-react';

export default function LoanApplicationForm({ userEmail, creditScore }) {
  const [formData, setFormData] = React.useState({
    loanAmount: '',
    loanType: 'personal',
    purpose: '',
    termMonths: 12,
  });
  const [submitted, setSubmitted] = React.useState(false);

  const createLoan = useMutation({
    mutationFn: async (data) => {
      const application = {
        user_email: userEmail,
        loan_amount: parseFloat(data.loanAmount),
        loan_type: data.loanType,
        purpose: data.purpose,
        term_months: parseInt(data.termMonths),
        status: 'pending',
        credit_score: creditScore?.overall_score || 650,
      };

      // AI-driven approval logic
      const approval = await base44.integrations.Core.InvokeLLM({
        prompt: `Evaluate loan application with credit score ${application.credit_score} for $${application.loan_amount}. Provide approval decision and interest rate.`,
        response_json_schema: {
          type: 'object',
          properties: {
            approved: { type: 'boolean' },
            approval_rate: { type: 'number' },
            max_amount: { type: 'number' },
          }
        }
      });

      return await base44.entities.LoanApplication.create({
        ...application,
        status: approval.approved ? 'approved' : 'rejected',
        approval_rate: approval.approval_rate,
        approved_amount: approval.max_amount,
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    }
  });

  const handleSubmit = () => {
    if (formData.loanAmount && formData.purpose) {
      createLoan.mutate(formData);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 text-center"
      >
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-white mb-2">Application Submitted!</h3>
        <p className="text-white/70">We'll review your application and notify you within 24 hours.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-lg p-6 space-y-4"
    >
      <h3 className="text-xl font-bold text-white">Apply for a Loan</h3>

      {creditScore && (
        <div className="bg-white/5 border border-white/10 rounded p-3">
          <p className="text-sm text-white/70">Your Credit Score</p>
          <p className="text-3xl font-bold text-cyan-400">{creditScore.overall_score}</p>
          <p className="text-xs text-white/50">Risk: {creditScore.default_risk?.toFixed(1)}%</p>
        </div>
      )}

      <div>
        <label className="block text-white/70 text-sm mb-2">Loan Amount</label>
        <Input
          type="number"
          placeholder="$5,000"
          value={formData.loanAmount}
          onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
          className="bg-white/5 border-white/10 text-white"
        />
      </div>

      <div>
        <label className="block text-white/70 text-sm mb-2">Loan Type</label>
        <select
          value={formData.loanType}
          onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
          className="w-full bg-white/5 border border-white/10 text-white rounded px-3 py-2"
        >
          <option value="personal">Personal</option>
          <option value="advance">Advance</option>
          <option value="business">Business</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>

      <div>
        <label className="block text-white/70 text-sm mb-2">Purpose</label>
        <Textarea
          placeholder="Tell us what you need this loan for..."
          value={formData.purpose}
          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          className="bg-white/5 border-white/10 text-white h-20"
        />
      </div>

      <div>
        <label className="block text-white/70 text-sm mb-2">Term (months)</label>
        <Input
          type="number"
          min="3"
          max="60"
          value={formData.termMonths}
          onChange={(e) => setFormData({ ...formData, termMonths: e.target.value })}
          className="bg-white/5 border-white/10 text-white"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!formData.loanAmount || !formData.purpose || createLoan.isPending}
        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
      >
        {createLoan.isPending ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Application'
        )}
      </Button>
    </motion.div>
  );
}