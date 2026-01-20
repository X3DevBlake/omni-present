import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, CheckCircle, Clock, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AutonomousActionDashboard({ actions, onApprove, onReject }) {
  const pendingActions = actions?.filter(a => a.approval_status === 'pending') || [];
  const activeActions = actions?.filter(a => a.execution_status === 'in_progress') || [];
  const completedActions = actions?.filter(a => a.execution_status === 'completed') || [];

  const statusIcons = {
    pending: <Clock className="w-5 h-5 text-yellow-400" />,
    in_progress: <Zap className="w-5 h-5 text-blue-400" />,
    completed: <CheckCircle className="w-5 h-5 text-green-400" />
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-sm">Pending Approval</p>
              <p className="text-white text-2xl font-bold">{pendingActions.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm">In Progress</p>
              <p className="text-white text-2xl font-bold">{activeActions.length}</p>
            </div>
            <Zap className="w-8 h-8 text-blue-400" />
          </CardContent>
        </Card>

        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm">Completed</p>
              <p className="text-white text-2xl font-bold">{completedActions.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Autonomous Actions</h3>
        
        {actions?.map((action, idx) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {statusIcons[action.execution_status]}
                    <div>
                      <CardTitle className="text-white text-lg">
                        {action.proposed_action}
                      </CardTitle>
                      <p className="text-slate-400 text-sm mt-1">
                        Agent: {action.agent_id?.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                  <Badge className={
                    action.approval_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    action.approval_status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    'bg-blue-500/20 text-blue-400'
                  }>
                    {action.approval_status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Type</p>
                    <Badge variant="outline">{action.action_type}</Badge>
                  </div>

                  <div>
                    <p className="text-slate-400 text-sm mb-1">Trigger Analysis</p>
                    <p className="text-white text-sm">
                      {action.trigger_analysis?.detected_pattern}
                    </p>
                    <p className="text-slate-400 text-xs">
                      Confidence: {((action.trigger_analysis?.confidence || 0) * 100).toFixed(0)}%
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400 text-sm mb-1">Execution Plan</p>
                    <ul className="text-white text-sm space-y-1">
                      {action.execution_plan?.steps?.slice(0, 3).map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-cyan-400">•</span>
                          {step.step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {action.approval_status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => onApprove(action.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => onReject(action.id)}
                        variant="outline"
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        <ThumbsDown className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {(!actions || actions.length === 0) && (
          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-8 text-center">
              <Zap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No autonomous actions yet</p>
              <p className="text-slate-500 text-sm mt-1">
                Agents will propose actions based on learned behaviors
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}