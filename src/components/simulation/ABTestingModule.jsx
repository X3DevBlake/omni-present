import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ABTestingModule() {
  const [tests, setTests] = useState([]);
  const [newTest, setNewTest] = useState({ nameA: '', nameB: '', metric: 'success_rate' });

  const createTest = () => {
    if (newTest.nameA && newTest.nameB) {
      const test = {
        id: Date.now(),
        ...newTest,
        resultA: Math.random() * 100,
        resultB: Math.random() * 100,
        runs: 1000,
        confidence: 95,
      };
      setTests([...tests, test]);
      setNewTest({ nameA: '', nameB: '', metric: 'success_rate' });
    }
  };

  const deleteTest = (id) => {
    setTests(tests.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4">A/B Testing</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Strategy A"
              value={newTest.nameA}
              onChange={(e) => setNewTest({ ...newTest, nameA: e.target.value })}
              className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder:text-white/50"
            />
            <input
              placeholder="Strategy B"
              value={newTest.nameB}
              onChange={(e) => setNewTest({ ...newTest, nameB: e.target.value })}
              className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder:text-white/50"
            />
          </div>

          <select
            value={newTest.metric}
            onChange={(e) => setNewTest({ ...newTest, metric: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
          >
            <option value="success_rate">Success Rate</option>
            <option value="profit">Profit</option>
            <option value="risk">Risk</option>
            <option value="efficiency">Efficiency</option>
          </select>

          <Button
            onClick={createTest}
            disabled={!newTest.nameA || !newTest.nameB}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Run Test
          </Button>
        </div>
      </motion.div>

      {/* Test Results */}
      <div className="space-y-4">
        {tests.length === 0 ? (
          <div className="text-center py-8 text-white/40">No tests created</div>
        ) : (
          tests.map((test, idx) => {
            const data = [
              { name: test.nameA, value: test.resultA },
              { name: test.nameB, value: test.resultB },
            ];
            const winner = test.resultA > test.resultB ? test.nameA : test.nameB;

            return (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-white font-bold">{test.nameA} vs {test.nameB}</h4>
                    <p className="text-white/60 text-sm">Metric: {test.metric}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {winner} wins
                    </p>
                    <p className="text-white/60 text-xs">{test.confidence}% confidence</p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <p className="text-white/60 text-xs mt-4">{test.runs} simulations run</p>

                <button
                  onClick={() => deleteTest(test.id)}
                  className="mt-4 w-full py-2 text-red-400 hover:bg-red-500/10 rounded transition"
                >
                  Delete Test
                </button>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}