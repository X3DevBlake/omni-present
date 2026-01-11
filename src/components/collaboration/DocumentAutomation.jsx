import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileText, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DocumentAutomation({ collaborationId, userEmail }) {
  const [result, setResult] = useState(null);

  const generateReport = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `Draft AI facilitator report for collaboration ${collaborationId}`,
        response_json_schema: {
          type: 'object',
          properties: {
            doc_id: { type: 'string' },
            url: { type: 'string' }
          }
        }
      });
    },
    onSuccess: setResult
  });

  const generateSummary = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `Generate collaboration summary for ${collaborationId}`,
        response_json_schema: {
          type: 'object',
          properties: {
            doc_id: { type: 'string' },
            title: { type: 'string' }
          }
        }
      });
    },
    onSuccess: setResult
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/30 rounded-xl p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-5 h-5 text-blue-400" />
        <h4 className="text-white font-bold text-sm">Document Automation</h4>
      </div>

      <div className="space-y-2">
        <Button
          onClick={() => generateReport.mutate()}
          disabled={generateReport.isPending}
          size="sm"
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          <Sparkles className="w-3 h-3 mr-2" />
          Generate Facilitator Report
        </Button>

        <Button
          onClick={() => generateSummary.mutate()}
          disabled={generateSummary.isPending}
          size="sm"
          className="w-full bg-indigo-500 hover:bg-indigo-600"
        >
          <FileText className="w-3 h-3 mr-2" />
          Create Summary Doc
        </Button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 bg-green-500/10 border border-green-500/30 rounded p-2"
        >
          <p className="text-green-400 text-xs mb-1">✓ Document created</p>
          {result.url && (
            <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 text-xs flex items-center gap-1">
              Open <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}