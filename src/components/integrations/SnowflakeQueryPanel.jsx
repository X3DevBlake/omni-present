import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function SnowflakeQueryPanel() {
  const [query, setQuery] = useState('SELECT * FROM your_table LIMIT 10');
  const [warehouse, setWarehouse] = useState('');
  const [database, setDatabase] = useState('');
  const [schema, setSchema] = useState('');

  const executeQuery = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/snowflake-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          warehouse: warehouse || undefined,
          database: database || undefined,
          schema: schema || undefined
        })
      });
      if (!response.ok) throw new Error('Query failed');
      return response.json();
    }
  });

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Database className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">Snowflake Query</h3>
          <p className="text-white/60 text-sm">Execute SQL queries on Snowflake</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Input
            placeholder="Warehouse (optional)"
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            className="bg-white/5 border-white/10 text-sm"
          />
          <Input
            placeholder="Database (optional)"
            value={database}
            onChange={(e) => setDatabase(e.target.value)}
            className="bg-white/5 border-white/10 text-sm"
          />
          <Input
            placeholder="Schema (optional)"
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            className="bg-white/5 border-white/10 text-sm"
          />
        </div>

        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-white/5 border-white/10 font-mono text-sm min-h-[120px]"
          placeholder="Enter SQL query..."
        />

        <Button
          onClick={() => executeQuery.mutate()}
          disabled={!query.trim() || executeQuery.isPending}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
        >
          {executeQuery.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Executing...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Execute Query
            </>
          )}
        </Button>

        {executeQuery.data?.success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-white font-bold text-sm">Query Successful</span>
            </div>
            <div className="space-y-2 text-sm mb-3">
              <div className="flex justify-between">
                <span className="text-white/60">Rows:</span>
                <span className="text-white">{executeQuery.data.metadata.rowCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Execution Time:</span>
                <span className="text-white">{executeQuery.data.metadata.executionTime}ms</span>
              </div>
            </div>
            <div className="bg-black/20 rounded p-3 max-h-64 overflow-auto">
              <pre className="text-xs text-white/80">
                {JSON.stringify(executeQuery.data.data, null, 2)}
              </pre>
            </div>
          </motion.div>
        )}

        {executeQuery.error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-white font-bold text-sm">Query Failed</span>
            </div>
            <p className="text-red-400 text-sm">{executeQuery.error.message}</p>
          </motion.div>
        )}
      </div>
    </Card>
  );
}