import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, Eye, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function AgentInteractionLogger() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSuccess, setFilterSuccess] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);

  const { data: logs, isLoading } = useQuery({
    queryKey: ['interaction-logs', filterType, filterSuccess],
    queryFn: async () => {
      let query = {};
      if (filterType !== 'all') query.interaction_type = filterType;
      if (filterSuccess === 'success') query.success = true;
      if (filterSuccess === 'failed') query.success = false;
      
      return await base44.entities.AgentInteractionLog.list('-created_date', 100, query);
    },
    refetchInterval: 5000
  });

  const filteredLogs = logs?.filter(log => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      log.agent_id?.toLowerCase().includes(searchLower) ||
      log.interaction_type?.toLowerCase().includes(searchLower) ||
      log.decision_reasoning?.toLowerCase().includes(searchLower) ||
      log.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agent-logs-${Date.now()}.json`;
    link.click();
  };

  const getTypeColor = (type) => {
    const colors = {
      task_execution: 'bg-blue-100 text-blue-800',
      communication: 'bg-purple-100 text-purple-800',
      decision: 'bg-yellow-100 text-yellow-800',
      learning: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      collaboration: 'bg-indigo-100 text-indigo-800',
      api_call: 'bg-cyan-100 text-cyan-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Agent Interaction Logs</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={exportLogs}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="task_execution">Task Execution</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="decision">Decision</SelectItem>
                <SelectItem value="learning">Learning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="collaboration">Collaboration</SelectItem>
                <SelectItem value="api_call">API Call</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSuccess} onValueChange={setFilterSuccess}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-2xl font-bold text-blue-600">{filteredLogs?.length || 0}</p>
              <p className="text-xs text-blue-600">Total Logs</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <p className="text-2xl font-bold text-green-600">
                {filteredLogs?.filter(l => l.success).length || 0}
              </p>
              <p className="text-xs text-green-600">Successful</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-2xl font-bold text-red-600">
                {filteredLogs?.filter(l => !l.success).length || 0}
              </p>
              <p className="text-xs text-red-600">Failed</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(filteredLogs?.reduce((sum, l) => sum + (l.execution_time_ms || 0), 0) / (filteredLogs?.length || 1))}ms
              </p>
              <p className="text-xs text-purple-600">Avg Time</p>
            </div>
          </div>

          {/* Logs Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Time</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Agent</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Duration</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredLogs?.map((log, idx) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {format(new Date(log.created_date), 'HH:mm:ss')}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{log.agent_id?.substring(0, 8)}...</td>
                        <td className="px-4 py-3">
                          <Badge className={getTypeColor(log.interaction_type)}>
                            {log.interaction_type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {log.success ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {log.execution_time_ms || 0}ms
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Detail Modal */}
      {selectedLog && (
        <Card className="fixed inset-4 z-50 overflow-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Interaction Details</span>
              <Button size="sm" variant="ghost" onClick={() => setSelectedLog(null)}>✕</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-600">Agent ID</p>
                <p className="text-sm">{selectedLog.agent_id}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Type</p>
                <Badge className={getTypeColor(selectedLog.interaction_type)}>
                  {selectedLog.interaction_type}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Time</p>
                <p className="text-sm">{format(new Date(selectedLog.created_date), 'PPpp')}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Duration</p>
                <p className="text-sm">{selectedLog.execution_time_ms}ms</p>
              </div>
            </div>

            {selectedLog.decision_reasoning && (
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Decision Reasoning</p>
                <p className="text-sm bg-blue-50 p-3 rounded border">{selectedLog.decision_reasoning}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Input Data</p>
              <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto max-h-40">
                {JSON.stringify(selectedLog.input_data, null, 2)}
              </pre>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Output Data</p>
              <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto max-h-40">
                {JSON.stringify(selectedLog.output_data, null, 2)}
              </pre>
            </div>

            {selectedLog.error_details && (
              <div>
                <p className="text-sm font-semibold text-red-600 mb-2">Error Details</p>
                <pre className="text-xs bg-red-50 p-3 rounded border overflow-auto max-h-40">
                  {JSON.stringify(selectedLog.error_details, null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.tags?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Tags</p>
                <div className="flex gap-2 flex-wrap">
                  {selectedLog.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}