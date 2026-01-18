import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, BarChart3, Trash2 } from 'lucide-react';

export default function DatasetExplorer() {
  const [datasets, setDatasets] = useState([
    {
      id: 1,
      name: 'Market Behavior Dataset',
      size: '256 MB',
      samples: 50000,
      type: 'CSV',
      uploadedAt: '2 weeks ago',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Agent Decision Logs',
      size: '512 MB',
      samples: 100000,
      type: 'JSON',
      uploadedAt: '1 week ago',
      status: 'Processing',
    },
    {
      id: 3,
      name: 'Trading Signals Dataset',
      size: '128 MB',
      samples: 25000,
      type: 'CSV',
      uploadedAt: '3 days ago',
      status: 'Active',
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-8">
        <div className="text-center">
          <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">Upload New Dataset</h3>
          <p className="text-white/60 mb-6">Support CSV, JSON, JSONL formats. Max 1GB per file.</p>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Upload className="w-4 h-4 mr-2" /> Choose Files
          </Button>
        </div>
      </Card>

      {/* Datasets List */}
      <div className="space-y-3">
        {datasets.map((dataset, idx) => (
          <motion.div
            key={dataset.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-black/40 border-white/10 p-4 hover:border-white/30 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <FileText className="w-8 h-8 text-cyan-400 mt-1" />
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{dataset.name}</h4>
                    <div className="flex gap-4 text-white/60 text-sm mt-2">
                      <span>{dataset.samples.toLocaleString()} samples</span>
                      <span>•</span>
                      <span>{dataset.size}</span>
                      <span>•</span>
                      <span>{dataset.uploadedAt}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    dataset.status === 'Active' ? 'bg-green-500/30 text-green-300' : 'bg-yellow-500/30 text-yellow-300'
                  }`}>
                    {dataset.status}
                  </span>
                  <Button variant="ghost" size="sm">
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}