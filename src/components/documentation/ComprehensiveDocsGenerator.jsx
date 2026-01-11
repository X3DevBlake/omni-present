import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileText, Download, Sparkles, Book, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ComprehensiveDocsGenerator({ userEmail }) {
  const [docType, setDocType] = useState('training');
  const [generatedDoc, setGeneratedDoc] = useState(null);

  const generateDoc = useMutation({
    mutationFn: async () => {
      const docId = `${docType}_${Date.now()}`;
      
      let content = {};
      if (docType === 'training') {
        content = {
          title: 'Training Data Documentation',
          overview: 'Comprehensive guide to agent training datasets',
          sections: ['Data Structure', 'Usage Examples', 'Best Practices']
        };
      } else if (docType === 'simulation') {
        content = {
          title: 'Simulation Results Report',
          metrics: { roi: 15.5, win_rate: 67 },
          recommendations: ['Optimize risk management', 'Enhance decision speed']
        };
      } else if (docType === 'agent_config') {
        content = {
          title: 'Agent Configuration Guide',
          setup_steps: ['Initialize agent', 'Configure parameters', 'Deploy'],
          monitoring: 'Real-time performance tracking enabled'
        };
      } else if (docType === 'api') {
        content = {
          title: 'API Documentation',
          endpoints: [
            { method: 'POST', path: '/api/agents/train', description: 'Train agent with custom data' }
          ],
          examples: { javascript: 'await trainAgent(data);' }
        };
      }

      const report = await base44.entities.AIFacilitatorReport.create({
        collaboration_id: 'docs',
        user_email: userEmail,
        report_type: 'summary',
        google_doc_id: docId,
        google_doc_url: `https://docs.google.com/document/d/${docId}`,
        content,
        status: 'completed'
      });

      return report;
    },
    onSuccess: setGeneratedDoc
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <Book className="w-5 h-5 text-blue-400" />
        <h4 className="text-white font-bold">Documentation Generator</h4>
      </div>

      <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/30 rounded-lg p-4 space-y-3">
        <Select value={docType} onValueChange={setDocType}>
          <SelectTrigger className="bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="training">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Training Data Docs
              </div>
            </SelectItem>
            <SelectItem value="simulation">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Simulation Results
              </div>
            </SelectItem>
            <SelectItem value="agent_config">
              <div className="flex items-center gap-2">
                <Book className="w-4 h-4" />
                Agent Config Guide
              </div>
            </SelectItem>
            <SelectItem value="api">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                API Documentation
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Button 
          onClick={() => generateDoc.mutate()} 
          disabled={generateDoc.isPending}
          className="w-full bg-blue-500"
        >
          {generateDoc.isPending ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Generate Documentation
            </>
          )}
        </Button>
      </div>

      {generatedDoc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-green-400" />
            <p className="text-green-400 font-bold text-sm">Document Generated!</p>
          </div>
          <p className="text-white/70 text-xs mb-3">
            ID: {generatedDoc.google_doc_id}
          </p>
          <div className="flex gap-2">
            <Button size="sm" className="bg-green-500" asChild>
              <a href={generatedDoc.google_doc_url} target="_blank" rel="noopener noreferrer">
                <Download className="w-3 h-3 mr-2" />
                Download
              </a>
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}