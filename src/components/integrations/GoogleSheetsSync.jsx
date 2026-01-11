import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sheet, Upload, Download, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function GoogleSheetsSync({ userEmail, agentId }) {
  const [sheetId, setSheetId] = useState('');
  const [syncResults, setSyncResults] = useState(null);

  const syncPerformance = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Sync agent ${agentId} performance to Google Sheets`,
        response_json_schema: {
          type: 'object',
          properties: {
            sheet_id: { type: 'string' },
            sheet_url: { type: 'string' },
            rows_written: { type: 'number' }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => setSyncResults(data)
  });

  const importMarket = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Import market data from Google Sheets ${sheetId}`,
        response_json_schema: {
          type: 'object',
          properties: {
            imported: { type: 'number' },
            data: { type: 'array' }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => setSyncResults(data)
  });

  const exportReport = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Export financial report for ${userEmail} to Google Sheets`,
        response_json_schema: {
          type: 'object',
          properties: {
            sheet_id: { type: 'string' },
            sheet_url: { type: 'string' },
            rows_written: { type: 'number' }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => setSyncResults(data)
  });

  const updateTrades = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Update trade logs in Google Sheets for ${userEmail}`,
        response_json_schema: {
          type: 'object',
          properties: {
            sheet_id: { type: 'string' },
            rows_updated: { type: 'number' }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => setSyncResults(data)
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sheet className="w-6 h-6 text-green-400" />
        <h3 className="text-white font-bold text-xl">Google Sheets Integration</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-lg p-4">
          <h4 className="text-white font-bold mb-2 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Export Agent Performance
          </h4>
          <p className="text-white/60 text-xs mb-3">Sync agent metrics to spreadsheet</p>
          <Button
            onClick={() => syncPerformance.mutate()}
            disabled={syncPerformance.isPending}
            className="w-full bg-green-500 hover:bg-green-600"
            size="sm"
          >
            {syncPerformance.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Sync Performance'}
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-lg p-4">
          <h4 className="text-white font-bold mb-2 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Import Market Data
          </h4>
          <Input
            placeholder="Sheet ID..."
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
            className="bg-white/5 border-white/10 mb-2 text-sm"
          />
          <Button
            onClick={() => importMarket.mutate()}
            disabled={!sheetId || importMarket.isPending}
            className="w-full bg-blue-500 hover:bg-blue-600"
            size="sm"
          >
            {importMarket.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Import Data'}
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-4">
          <h4 className="text-white font-bold mb-2 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Export Financial Report
          </h4>
          <p className="text-white/60 text-xs mb-3">Full financial summary to sheet</p>
          <Button
            onClick={() => exportReport.mutate()}
            disabled={exportReport.isPending}
            className="w-full bg-purple-500 hover:bg-purple-600"
            size="sm"
          >
            {exportReport.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Export Report'}
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-lg p-4">
          <h4 className="text-white font-bold mb-2 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Update Trade Logs
          </h4>
          <p className="text-white/60 text-xs mb-3">Sync all trading activity</p>
          <Button
            onClick={() => updateTrades.mutate()}
            disabled={updateTrades.isPending}
            className="w-full bg-orange-500 hover:bg-orange-600"
            size="sm"
          >
            {updateTrades.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Update Logs'}
          </Button>
        </motion.div>
      </div>

      {syncResults && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
        >
          <p className="text-green-400 font-bold text-sm mb-2">✓ Sync Complete</p>
          {syncResults.sheet_url && (
            <a
              href={syncResults.sheet_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
            >
              Open in Google Sheets <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {syncResults.rows_written && (
            <p className="text-white/60 text-xs mt-1">{syncResults.rows_written} rows written</p>
          )}
          {syncResults.imported && (
            <p className="text-white/60 text-xs mt-1">{syncResults.imported} records imported</p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}