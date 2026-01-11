import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, Clock, AlertCircle, Zap, Loader } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function WorkflowApprovalCenter() {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvedWorkflows, setApprovedWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [customizations, setCustomizations] = useState({});
  const [processing, setProcessing] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));

    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      // Load pending approvals from database
      const approvals = await base44.integrations.Core.InvokeLLM({
        prompt: `Load pending workflow approvals:
        
Retrieve pending approval requests and display.`,
      });

      setPendingApprovals(approvals?.pending || []);
      setApprovedWorkflows(approvals?.approved || []);
    } catch (error) {
      console.error('Error loading approvals:', error);
    }
  };

  const approveWorkflow = async (approval) => {
    setProcessing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Approve and activate workflow:
        
ApprovalID: ${approval.id}
Workflow: ${approval.workflow.name}
Customizations: ${JSON.stringify(customizations[approval.id] || {})}

Activate workflow and send confirmation.`,
      });

      setApprovedWorkflows(prev => [...prev, approval]);
      setPendingApprovals(prev => prev.filter(a => a.id !== approval.id));
      setSelectedWorkflow(null);
    } catch (error) {
      console.error('Error approving workflow:', error);
    } finally {
      setProcessing(false);
    }
  };

  const rejectWorkflow = async (approval) => {
    setProcessing(true);
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Reject workflow:
        
ApprovalID: ${approval.id}
Workflow: ${approval.workflow.name}

Archive and send rejection notification.`,
      });

      setPendingApprovals(prev => prev.filter(a => a.id !== approval.id));
      setSelectedWorkflow(null);
    } catch (error) {
      console.error('Error rejecting workflow:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="bg-white/10 border border-white/20 p-1 rounded-lg w-full justify-start">
          <TabsTrigger value="pending">Pending Approval ({pendingApprovals.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved Workflows ({approvedWorkflows.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3">
          {pendingApprovals.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-4">No pending approvals</p>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map(approval => (
                <motion.div
                  key={approval.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3 cursor-pointer hover:bg-white/10"
                  onClick={() => setSelectedWorkflow(approval)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-bold flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        {approval.workflow.name}
                      </p>
                      <p className="text-white/60 text-sm mt-1">{approval.workflow.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-300 text-sm font-bold">{approval.workflow.setupTime}</p>
                      <p className="text-white/40 text-xs">setup time</p>
                    </div>
                  </div>

                  {/* Benefit highlight */}
                  <div className="bg-cyan-500/10 border border-cyan-400/20 rounded p-2">
                    <p className="text-cyan-300 text-xs font-semibold">Benefit</p>
                    <p className="text-white/70 text-xs mt-1">{approval.workflow.benefit}</p>
                  </div>

                  {/* Quick actions */}
                  {selectedWorkflow?.id === approval.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="border-t border-white/10 pt-3 space-y-2"
                    >
                      <div className="space-y-2">
                        <label className="text-white text-xs font-semibold block">Customizations (optional)</label>
                        <textarea
                          value={customizations[approval.id] || ''}
                          onChange={(e) => setCustomizations({
                            ...customizations,
                            [approval.id]: e.target.value,
                          })}
                          placeholder="Add any customizations or modifications..."
                          className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white placeholder-white/40 text-xs h-20 resize-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => approveWorkflow(approval)}
                          disabled={processing}
                          className="flex-1 px-3 py-2 bg-green-500/20 border border-green-400 rounded text-green-300 hover:bg-green-500/30 disabled:opacity-50 text-sm font-semibold flex items-center justify-center gap-2"
                        >
                          {processing ? (
                            <>
                              <Loader className="w-3 h-3 animate-spin" />
                              Activating...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Approve & Activate
                            </>
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => rejectWorkflow(approval)}
                          disabled={processing}
                          className="flex-1 px-3 py-2 bg-red-500/20 border border-red-400 rounded text-red-300 hover:bg-red-500/30 disabled:opacity-50 text-sm font-semibold flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-3 h-3" />
                          Reject
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-3">
          {approvedWorkflows.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-4">No approved workflows yet</p>
          ) : (
            <div className="space-y-3">
              {approvedWorkflows.map(workflow => (
                <motion.div
                  key={workflow.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-500/10 border border-green-400/30 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        {workflow.workflow.name}
                      </p>
                      <p className="text-white/60 text-sm mt-1">Active and running</p>
                    </div>
                    <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <p className="text-green-300 text-xs font-semibold">Active</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}