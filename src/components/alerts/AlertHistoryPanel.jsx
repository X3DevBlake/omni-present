import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, AlertTriangle, MessageSquare } from 'lucide-react';

export default function AlertHistoryPanel({ history }) {
  const [expandedId, setExpandedId] = useState(null);

  const getSeverityColor = (severity) => {
    const colors = {
      info: 'bg-blue-600',
      warning: 'bg-yellow-600',
      critical: 'bg-red-600'
    };
    return colors[severity] || 'bg-slate-600';
  };

  const getStatusIcon = (status) => {
    const icons = {
      new: <AlertTriangle className="w-4 h-4" />,
      acknowledged: <Clock className="w-4 h-4" />,
      resolved: <CheckCircle2 className="w-4 h-4" />,
      escalated: <AlertTriangle className="w-4 h-4" />
    };
    return icons[status] || null;
  };

  return (
    <div className="space-y-3">
      {history.length === 0 ? (
        <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
          <CardContent className="py-12 text-center">
            <Clock className="w-12 h-12 mx-auto text-slate-500 mb-4" />
            <p className="text-slate-400">No alert history</p>
          </CardContent>
        </Card>
      ) : (
        history.slice(0, 50).map((alert, idx) => (
          <motion.div key={alert.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }}>
            <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl hover:border-slate-600 transition-all">
              <CardContent className="p-4">
                <div className="flex justify-between items-start cursor-pointer" onClick={() => setExpandedId(expandedId === alert.id ? null : alert.id)}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(alert.status)}
                      <h4 className="font-semibold text-white">{alert.rule_name}</h4>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <Badge variant="outline">{alert.status}</Badge>
                    </div>
                    <p className="text-slate-400 text-sm">{alert.message}</p>
                  </div>
                  <p className="text-slate-500 text-xs whitespace-nowrap ml-4">
                    {new Date(alert.created_date).toLocaleDateString()}
                  </p>
                </div>

                {/* Expanded Details */}
                {expandedId === alert.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-400">Hub</p>
                        <p className="text-white font-semibold capitalize">{alert.hub}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Triggered Value</p>
                        <p className="text-white font-semibold">{alert.triggered_value}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Triggered At</p>
                        <p className="text-white font-semibold text-xs">{new Date(alert.created_date).toLocaleString()}</p>
                      </div>
                      {alert.acknowledged_by && (
                        <div>
                          <p className="text-slate-400">Acknowledged By</p>
                          <p className="text-white font-semibold text-xs">{alert.acknowledged_by}</p>
                        </div>
                      )}
                    </div>

                    {alert.resolution_notes && (
                      <div className="p-3 rounded bg-slate-800/50">
                        <p className="text-slate-400 text-xs mb-2">Resolution Notes</p>
                        <p className="text-white text-sm">{alert.resolution_notes}</p>
                      </div>
                    )}

                    {alert.status === 'new' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Acknowledge
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Escalate
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );
}