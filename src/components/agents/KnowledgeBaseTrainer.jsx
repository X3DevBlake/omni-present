import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Database, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function KnowledgeBaseTrainer({ show, onClose, agent, onTrainingComplete }) {
  const [trainingText, setTrainingText] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [training, setTraining] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({ name: file.name, url: file_url });
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload file');
    }
  };

  const trainAgent = async () => {
    setTraining(true);
    
    try {
      const trainingData = {
        knowledge: trainingText,
        source: uploadedFile?.name || 'manual_input',
        timestamp: new Date().toISOString(),
      };

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onTrainingComplete?.({
        ...agent,
        knowledgeBase: [...(agent.knowledgeBase || []), trainingData],
        trainedAt: new Date(),
      });
      
      toast.success('Agent trained successfully!');
      onClose();
    } catch (error) {
      toast.error('Training failed');
    } finally {
      setTraining(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 max-w-2xl w-full"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg">
          <X className="w-5 h-5 text-white" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Brain className="w-6 h-6 text-cyan-400" />
          Knowledge Base Trainer
        </h2>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Upload className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">Upload Training Data</h3>
            </div>
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".txt,.pdf,.csv,.json"
              className="w-full text-white/60 text-sm"
            />
            {uploadedFile && (
              <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm">
                ✓ {uploadedFile.name}
              </div>
            )}
          </div>

          <div>
            <label className="text-white text-sm mb-2 block flex items-center gap-2">
              <Database className="w-4 h-4" />
              Or Enter Knowledge Manually
            </label>
            <Textarea
              value={trainingText}
              onChange={(e) => setTrainingText(e.target.value)}
              placeholder="Enter knowledge, facts, or instructions for the agent..."
              className="bg-white/5 border-white/10 text-white min-h-[200px]"
            />
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
            <h4 className="text-cyan-400 font-semibold mb-2">Training Tips</h4>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• Provide clear, factual information</li>
              <li>• Include examples and use cases</li>
              <li>• Structure data with headers and categories</li>
              <li>• Supported formats: TXT, PDF, CSV, JSON</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={onClose} variant="outline" className="border-white/20 text-white">
            Cancel
          </Button>
          <Button 
            onClick={trainAgent} 
            disabled={training || (!trainingText && !uploadedFile)}
            className="bg-gradient-to-r from-cyan-500 to-purple-500"
          >
            <Brain className="w-4 h-4 mr-2" />
            {training ? 'Training...' : 'Train Agent'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}