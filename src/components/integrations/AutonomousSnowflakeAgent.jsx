import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Brain, Loader2, Sparkles } from 'lucide-react';

export default function AutonomousSnowflakeAgent({ userEmail }) {
  const [objective, setObjective] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');

  const { data: agents } = useQuery({
    queryKey: ['agents', userEmail],
    queryFn: () => base44.entities.Agent.filter({ user_email: userEmail }),
    initialData: []
  });

  const runAutonomousQuery = useMutation({
    mutationFn: async () => {
      // First, use Gemini to generate the SQL query
      const response = await fetch('/api/functions/gemini-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are a SQL expert. Generate a Snowflake SQL query for this objective: "${objective}". 
          
Output ONLY the SQL query, no explanation. Use standard Snowflake syntax.`,
          response_json_schema: {
            type: "object",
            properties: {
              query: { type: "string" },
              reasoning: { type: "string" }
            }
          }
        })
      });

      const geminiData = await response.json();
      const sqlQuery = geminiData.query || geminiData.response;

      // Execute the generated query
      const queryResponse = await fetch('/api/functions/snowflake-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sqlQuery })
      });

      const queryResult = await queryResponse.json();

      return {
        objective,
        generatedQuery: sqlQuery,
        queryResult,
        reasoning: geminiData.reasoning
      };
    }
  });

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Bot className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">Autonomous Data Agent</h3>
          <p className="text-white/60 text-sm">AI-powered query generation</p>
        </div>
      </div>

      <div className="space-y-4">
        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
          <SelectTrigger className="bg-white/5 border-white/10">
            <SelectValue placeholder="Select agent (optional)" />
          </SelectTrigger>
          <SelectContent>
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Textarea
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          placeholder="Describe what data you need (e.g., 'Show me top 10 customers by revenue this month')"
          className="bg-white/5 border-white/10 min-h-[100px]"
        />

        <Button
          onClick={() => runAutonomousQuery.mutate()}
          disabled={!objective.trim() || runAutonomousQuery.isPending}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
        >
          {runAutonomousQuery.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <Brain className="w-4 h-4 mr-2 animate-pulse" />
              AI Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate & Execute Query
            </>
          )}
        </Button>

        {runAutonomousQuery.data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
              <p className="text-cyan-400 text-xs font-bold mb-1">Generated Query:</p>
              <pre className="text-white text-xs font-mono overflow-x-auto">
                {runAutonomousQuery.data.generatedQuery}
              </pre>
            </div>

            {runAutonomousQuery.data.reasoning && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                <p className="text-purple-400 text-xs font-bold mb-1">AI Reasoning:</p>
                <p className="text-white/80 text-xs">{runAutonomousQuery.data.reasoning}</p>
              </div>
            )}

            {runAutonomousQuery.data.queryResult?.success && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <p className="text-green-400 text-xs font-bold mb-2">
                  Results ({runAutonomousQuery.data.queryResult.metadata.rowCount} rows)
                </p>
                <div className="bg-black/20 rounded p-2 max-h-48 overflow-auto">
                  <pre className="text-xs text-white/80">
                    {JSON.stringify(runAutonomousQuery.data.queryResult.data.slice(0, 5), null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Card>
  );
}