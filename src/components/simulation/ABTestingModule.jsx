import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Play, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ABTestingModule({ show, onClose, agents, onTestRun }) {
  const [testName, setTestName] = useState('');
  const [variantA, setVariantA] = useState({ name: 'Variant A', config: {} });
  const [variantB, setVariantB] = useState({ name: 'Variant B', config: {} });
  const [results, setResults] = useState(null);
  const [testing, setTesting] = useState(false);

  const runTest = async () => {
    setTesting(true);
    
    // Simulate A/B test
    setTimeout(() => {
      const resultsData = {
        variantA: {
          successRate: 65 + Math.random() * 20,
          avgTime: 45 + Math.random() * 20,
          efficiency: 70 + Math.random() * 15,
        },
        variantB: {
          successRate: 70 + Math.random() * 20,
          avgTime: 40 + Math.random() * 20,
          efficiency: 75 + Math.random() * 15,
        },
      };
      setResults(resultsData);
      setTesting(false);
      onTestRun?.(resultsData);
    }, 3000);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg">
          <X className="w-5 h-5 text-white" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">A/B Testing Module</h2>

        <div className="mb-6">
          <Input
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="Test Name"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white/5 border border-cyan-500/30 rounded-xl p-4">
            <h3 className="text-cyan-400 font-semibold mb-4">Variant A</h3>
            <Input
              value={variantA.name}
              onChange={(e) => setVariantA({...variantA, name: e.target.value})}
              placeholder="Variant Name"
              className="bg-white/5 border-white/10 text-white mb-3"
            />
            <Textarea
              placeholder="Configuration (JSON)"
              className="bg-white/5 border-white/10 text-white min-h-[120px]"
            />
          </div>

          <div className="bg-white/5 border border-purple-500/30 rounded-xl p-4">
            <h3 className="text-purple-400 font-semibold mb-4">Variant B</h3>
            <Input
              value={variantB.name}
              onChange={(e) => setVariantB({...variantB, name: e.target.value})}
              placeholder="Variant Name"
              className="bg-white/5 border-white/10 text-white mb-3"
            />
            <Textarea
              placeholder="Configuration (JSON)"
              className="bg-white/5 border-white/10 text-white min-h-[120px]"
            />
          </div>
        </div>

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Test Results
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-white/60 text-sm mb-2">Success Rate</div>
                <div className="flex gap-4">
                  <div className="text-cyan-400 font-bold">{results.variantA.successRate.toFixed(1)}%</div>
                  <div className="text-purple-400 font-bold">{results.variantB.successRate.toFixed(1)}%</div>
                </div>
              </div>
              <div>
                <div className="text-white/60 text-sm mb-2">Avg Time (s)</div>
                <div className="flex gap-4">
                  <div className="text-cyan-400 font-bold">{results.variantA.avgTime.toFixed(1)}</div>
                  <div className="text-purple-400 font-bold">{results.variantB.avgTime.toFixed(1)}</div>
                </div>
              </div>
              <div>
                <div className="text-white/60 text-sm mb-2">Efficiency</div>
                <div className="flex gap-4">
                  <div className="text-cyan-400 font-bold">{results.variantA.efficiency.toFixed(1)}%</div>
                  <div className="text-purple-400 font-bold">{results.variantB.efficiency.toFixed(1)}%</div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="text-green-400 font-semibold">
                Winner: {results.variantB.successRate > results.variantA.successRate ? 'Variant B' : 'Variant A'}
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex justify-end gap-3">
          <Button onClick={onClose} variant="outline" className="border-white/20 text-white">
            Cancel
          </Button>
          <Button onClick={runTest} disabled={testing} className="bg-gradient-to-r from-cyan-500 to-purple-500">
            <Play className="w-4 h-4 mr-2" />
            {testing ? 'Testing...' : 'Run A/B Test'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}