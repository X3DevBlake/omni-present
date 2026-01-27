import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, Clock, History } from 'lucide-react';
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function TransactionList({ transactions = [] }) {
  return (
    <Card className="bg-black/80 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <History className="w-5 h-5 text-gray-400" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No transactions recorded in the ledger yet.
            </div>
          ) : (
            transactions.map((tx, idx) => (
              <motion.div
                key={tx.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    tx.type === 'transfer' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                  }`}>
                    {tx.type === 'transfer' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {tx.type === 'transfer' ? 'Outgoing Transfer' : 'Incoming Deposit'}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      {format(new Date(tx.timestamp), 'PPpp')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    tx.type === 'transfer' ? 'text-white' : 'text-green-400'
                  }`}>
                    {tx.type === 'transfer' ? '-' : '+'}{tx.amount} OMNI
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {tx.status}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}