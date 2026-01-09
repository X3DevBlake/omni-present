import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Download, CreditCard } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function BillingInvoicing() {
  const invoices = [
    { id: 1, number: 'INV-2026-001', date: '2026-01-01', amount: 4999.00, status: 'paid' },
    { id: 2, number: 'INV-2025-012', date: '2025-12-01', amount: 4999.00, status: 'paid' },
    { id: 3, number: 'INV-2025-011', date: '2025-11-01', amount: 4999.00, status: 'paid' }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Billing & Invoicing</h1>
          <p className="text-white/60">Manage organizational finances</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <DollarSign className="w-6 h-6 text-green-400 mb-2" />
            <div className="text-2xl font-bold text-white">$14,997</div>
            <div className="text-white/60 text-sm">YTD Spend</div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <CreditCard className="w-6 h-6 text-blue-400 mb-2" />
            <div className="text-2xl font-bold text-white">$4,999</div>
            <div className="text-white/60 text-sm">Current Month</div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <Download className="w-6 h-6 text-purple-400 mb-2" />
            <div className="text-2xl font-bold text-white">12</div>
            <div className="text-white/60 text-sm">Invoices</div>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left text-white/70 text-sm font-medium p-4">Invoice</th>
                <th className="text-left text-white/70 text-sm font-medium p-4">Date</th>
                <th className="text-left text-white/70 text-sm font-medium p-4">Amount</th>
                <th className="text-left text-white/70 text-sm font-medium p-4">Status</th>
                <th className="text-left text-white/70 text-sm font-medium p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, i) => (
                <motion.tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
                  <td className="p-4 text-white">{invoice.number}</td>
                  <td className="p-4 text-white/70">{invoice.date}</td>
                  <td className="p-4 text-white">${invoice.amount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">{invoice.status}</span>
                  </td>
                  <td className="p-4">
                    <button className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AuroraBackground>
  );
}