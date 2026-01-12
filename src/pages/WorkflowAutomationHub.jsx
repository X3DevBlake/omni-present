import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Plus, List, TrendingUp, Loader } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import GeminiWorkflowSuggester from '../components/orchestration/GeminiWorkflowSuggester';
import WorkflowExecutor from '../components/orchestration/WorkflowExecutor';

export default function WorkflowAutomationHub() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [showCreator, setShowCreator] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const user = await base44.auth.me();
        setUserEmail(user.email);
        loadWorkflows(user.email);
      } catch (error) {
        console.error('Error initializing:', error);
      }
    }
    init();
  }, []);

  const loadWorkflows = async (email) => {
    setLoading(true);
    try {
      const data = await base44.entities.Workflow.list(
        { user_email: email },
        '-created_date',
        100
      );
      setWorkflows(data);
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowCreated = async (workflow) => {
    setWorkflows([workflow, ...workflows]);
    setShowCreator(false);
  };

  const handleRefresh = () => {
    if (userEmail) loadWorkflows(userEmail);
  };

  const enabledCount = workflows.filter(w => w.enabled).length;
  const totalExecutions = workflows.reduce((sum, w) => sum + (w.execution_count || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <Zap className="w-8 h-8 text-cyan-400" />
                Workflow Automation Hub
              </h1>
              <p className="text-white/60 mt-2">
                Orchestrate intelligent workflows with Gemini & Zapier
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4"
            >
              <p className="text-white/60 text-sm">Active Workflows</p>
              <p className="text-3xl font-bold text-cyan-400">{enabledCount}</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4"
            >
              <p className="text-white/60 text-sm">Total Workflows</p>
              <p className="text-3xl font-bold text-blue-400">{workflows.length}</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4"
            >
              <p className="text-white/60 text-sm">Total Executions</p>
              <p className="text-3xl font-bold text-green-400">{totalExecutions}</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="workflows" className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20 p-1 rounded-lg w-full justify-start">
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              My Workflows
            </TabsTrigger>
            <TabsTrigger value="ai-suggest" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI Suggestions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* My Workflows Tab */}
          <TabsContent value="workflows" className="space-y-4">
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowCreator(!showCreator)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                New Workflow
              </motion.button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-cyan-400" />
              </div>
            ) : workflows.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/60 mb-4">No workflows yet. Create one or get AI suggestions!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {workflows.map((workflow, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-6"
                  >
                    <WorkflowExecutor
                      workflow={workflow}
                      onUpdate={handleRefresh}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* AI Suggestions Tab */}
          <TabsContent value="ai-suggest" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <GeminiWorkflowSuggester
                context={{
                  user_email: userEmail,
                  active_workflows: workflows.length,
                  recent_activity: 'workflow_creation'
                }}
                onWorkflowCreate={handleWorkflowCreated}
              />
            </motion.div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 border border-white/10 rounded-lg p-6"
              >
                <h3 className="text-white font-bold mb-4">Success Rate by Service</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Zapier</span>
                    <span className="text-green-400 font-semibold">98.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Gemini</span>
                    <span className="text-green-400 font-semibold">99.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Email</span>
                    <span className="text-green-400 font-semibold">100%</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 border border-white/10 rounded-lg p-6"
              >
                <h3 className="text-white font-bold mb-4">Avg Execution Time</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Fastest</span>
                    <span className="text-cyan-400 font-semibold">45ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Average</span>
                    <span className="text-cyan-400 font-semibold">280ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Slowest</span>
                    <span className="text-yellow-400 font-semibold">2.1s</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}