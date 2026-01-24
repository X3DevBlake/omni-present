import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

export default function EthicalAuditTrail() {
  const [searchFilter, setSearchFilter] = useState('');

  const { data: decisions } = useQuery({
    queryKey: ['ethical_decisions'],
    queryFn: () => base44.entities.EthicalDecisionLog.list('-created_date', 50),
    initialData: []
  });

  const filteredDecisions = searchFilter ?
    decisions.filter(d => 
      d.decision_context?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      d.agent_id?.toLowerCase().includes(searchFilter.toLowerCase())
    ) : decisions;

  const getDilemmaColor = (type) => {
    const colors = {
      resource_allocation: 'bg-blue-600',
      privacy_vs_utility: 'bg-purple-600',
      autonomy_vs_safety: 'bg-amber-600',
      fairness_vs_efficiency: 'bg-green-600',
      transparency_vs_security: 'bg-red-600'
    };
    return colors[type] || 'bg-gray-600';
  };

  return (
    <Card className="bg-gradient-to-br from-slate-950/90 via-zinc-950/90 to-gray-950/90 backdrop-blur-xl border-slate-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <FileText className="w-7 h-7 text-slate-400" />
          Ethical Audit Trail
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Comprehensive log of all AI ethical decisions
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search decisions..."
            className="bg-black/60 border-slate-500/30 text-white"
          />
          <Badge className="bg-slate-600">{filteredDecisions.length} records</Badge>
        </div>

        <ScrollArea className="h-[450px] bg-black/40 rounded-lg p-3 border border-slate-500/20">
          <div className="space-y-3">
            {filteredDecisions.map((decision, idx) => (
              <motion.div
                key={decision.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-black/80 rounded-lg p-3 border border-slate-500/30 hover:border-blue-500/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-white text-sm font-bold mb-1">
                      {decision.decision_context}
                    </div>
                    <div className="text-gray-400 text-xs">
                      Agent: {decision.agent_id}
                    </div>
                  </div>
                  <Badge className={getDilemmaColor(decision.dilemma_type)}>
                    {decision.dilemma_type?.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="bg-blue-950/40 rounded p-2 mb-2 border border-blue-500/20">
                  <div className="text-blue-400 text-xs font-bold mb-1">Chosen Action</div>
                  <div className="text-gray-300 text-xs">{decision.chosen_action}</div>
                </div>

                <div className="bg-green-950/40 rounded p-2 mb-2 border border-green-500/20">
                  <div className="text-green-400 text-xs font-bold mb-1">Reasoning</div>
                  <div className="text-gray-300 text-xs">{decision.reasoning}</div>
                </div>

                {decision.ethical_framework_applied && (
                  <div className="flex gap-1 flex-wrap mb-2">
                    {decision.ethical_framework_applied.map((fw, idx) => (
                      <Badge key={idx} className="bg-purple-600 text-[10px]">
                        {fw}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">
                    {decision.created_date && format(new Date(decision.created_date), 'MMM d, HH:mm')}
                  </span>
                  {decision.human_intervention_requested && (
                    <Badge className="bg-amber-600 text-[10px]">Human Review</Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}