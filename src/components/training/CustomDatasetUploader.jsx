import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Upload, Database, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CustomDatasetUploader({ agentId, userEmail }) {
  const [datasetName, setDatasetName] = useState('');
  const [dataType, setDataType] = useState('behavior');
  const [rawData, setRawData] = useState('');
  const queryClient = useQueryClient();

  const uploadDataset = useMutation({
    mutationFn: async () => {
      const samples = rawData.split('\n').filter(line => line.trim()).map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return { text: line };
        }
      });

      return await base44.entities.TrainingDataset.create({
        user_email: userEmail,
        dataset_name: datasetName,
        data_type: dataType,
        samples,
        labels: samples.map((_, i) => ({ index: i, label: 'default' })),
        validation_split: 0.2,
        preprocessed: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      setDatasetName('');
      setRawData('');
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-xl p-6 space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-5 h-5 text-indigo-400" />
        <h4 className="text-white font-bold">Custom Training Dataset</h4>
      </div>

      <Input
        placeholder="Dataset name..."
        value={datasetName}
        onChange={(e) => setDatasetName(e.target.value)}
        className="bg-white/5 border-white/10"
      />

      <Select value={dataType} onValueChange={setDataType}>
        <SelectTrigger className="bg-white/5 border-white/10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="behavior">Behavior Patterns</SelectItem>
          <SelectItem value="decision">Decision Making</SelectItem>
          <SelectItem value="communication">Communication Style</SelectItem>
          <SelectItem value="trading">Trading Strategies</SelectItem>
        </SelectContent>
      </Select>

      <Textarea
        placeholder="Training data (JSON per line or plain text)..."
        value={rawData}
        onChange={(e) => setRawData(e.target.value)}
        className="bg-white/5 border-white/10 min-h-[150px] font-mono text-xs"
      />

      <Button
        onClick={() => uploadDataset.mutate()}
        disabled={!datasetName || !rawData || uploadDataset.isPending}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500"
      >
        {uploadDataset.isPending ? (
          <>
            <Zap className="w-4 h-4 mr-2 animate-pulse" />
            Processing...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload Dataset
          </>
        )}
      </Button>
    </motion.div>
  );
}