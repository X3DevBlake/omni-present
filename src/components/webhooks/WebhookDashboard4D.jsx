import React, { useState, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Webhook, Plus, Play, Pause, Trash2, Edit, CheckCircle, XCircle,
  Clock, Zap, Globe, Activity, RefreshCw, Send, Filter, BarChart3,
  ArrowUpRight, ArrowDownRight, AlertTriangle, Eye
} from 'lucide-react';
import { WebhookEventTypes } from '@/models';
import { generateWebhookLogs } from '@/data/openSourceData';
import { FourDCanvas, Tesseract } from '@/components/4d/FourDEngine';
import { WebhookIcon } from '@/components/svg/OmniIcons';

// Webhook Flow Visualizer - shows data flowing through webhook pipeline
function WebhookFlowViz() {
  return (
    <FourDCanvas className="h-full w-full" cameraPosition={[0, 0, 4]}>
      <Tesseract size={0.6} color="#f97316" wireColor="#a855f7" speed={0.5} />
    </FourDCanvas>
  );
}

// Status badge component
function StatusBadge({ status }) {
  const config = {
    success: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle },
    failed: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
    retry: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: RefreshCw },
    active: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: Play },
    inactive: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: Pause },
  };
  const cfg = config[status] || config.active;
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={`${cfg.color} border text-xs gap-1`}>
      <Icon className="w-3 h-3" />
      {status}
    </Badge>
  );
}

// Webhook log entry
function LogEntry({ log }) {
  const time = new Date(log.timestamp);
  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors group"
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
        log.status === 'success' ? 'bg-emerald-400' : log.status === 'failed' ? 'bg-red-400' : 'bg-amber-400'
      }`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-purple-400 truncate">{log.event}</span>
          <StatusBadge status={log.status} />
        </div>
        <div className="text-[10px] text-white/30 truncate mt-0.5">{log.endpoint}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-[10px] text-white/40">{timeStr}</div>
        <div className="text-[10px] text-cyan-400/60">{log.latency_ms}ms</div>
      </div>
    </motion.div>
  );
}

// Mock webhooks
const MOCK_WEBHOOKS = [
  { id: 'wh-1', name: 'Agent Events Relay', endpoint: 'https://api.omni.io/hooks/agents', events: ['agent.task_completed', 'agent.evolved'], status: 'active', success: 1847, failed: 12 },
  { id: 'wh-2', name: 'Slack Notifications', endpoint: 'https://hooks.slack.com/omni-alerts', events: ['system.alert', 'data.anomaly_detected'], status: 'active', success: 923, failed: 3 },
  { id: 'wh-3', name: 'DataDog Metrics', endpoint: 'https://api.datadog.com/webhooks/omni', events: ['system.health_check'], status: 'active', success: 4521, failed: 0 },
  { id: 'wh-4', name: 'Workflow Orchestrator', endpoint: 'https://n8n.omni.cloud/webhook/flow', events: ['workflow.completed', 'workflow.failed'], status: 'inactive', success: 567, failed: 23 },
  { id: 'wh-5', name: 'DeFi Trade Logger', endpoint: 'https://api.omni.io/hooks/defi', events: ['defi.trade_executed', 'defi.price_alert'], status: 'active', success: 2103, failed: 7 },
];

export default function WebhookDashboard4D() {
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const logs = useMemo(() => generateWebhookLogs(50), []);
  const filteredLogs = useMemo(() => {
    if (filterStatus === 'all') return logs;
    return logs.filter(l => l.status === filterStatus);
  }, [logs, filterStatus]);

  const stats = useMemo(() => ({
    total: MOCK_WEBHOOKS.length,
    active: MOCK_WEBHOOKS.filter(w => w.status === 'active').length,
    totalSuccess: MOCK_WEBHOOKS.reduce((s, w) => s + w.success, 0),
    totalFailed: MOCK_WEBHOOKS.reduce((s, w) => s + w.failed, 0),
    avgLatency: Math.floor(logs.reduce((s, l) => s + l.latency_ms, 0) / logs.length),
  }), [logs]);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Webhooks', value: stats.total, icon: Webhook, color: 'text-purple-400' },
          { label: 'Active', value: stats.active, icon: Zap, color: 'text-emerald-400' },
          { label: 'Delivered', value: stats.totalSuccess.toLocaleString(), icon: CheckCircle, color: 'text-cyan-400' },
          { label: 'Failed', value: stats.totalFailed, icon: XCircle, color: 'text-red-400' },
          { label: 'Avg Latency', value: `${stats.avgLatency}ms`, icon: Clock, color: 'text-amber-400' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-black/40 border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">{stat.label}</p>
                    <p className={`text-xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
                  </div>
                  <stat.icon className={`w-5 h-5 ${stat.color} opacity-40`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Webhooks List */}
        <Card className="bg-black/40 border-white/10 lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                <WebhookIcon size={16} />
                Webhooks
              </CardTitle>
              <Button size="sm" className="h-7 bg-purple-600 hover:bg-purple-700 text-xs">
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              <div className="px-4 pb-4 space-y-2">
                {MOCK_WEBHOOKS.map((wh) => (
                  <motion.div
                    key={wh.id}
                    onClick={() => setSelectedWebhook(wh)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedWebhook?.id === wh.id
                        ? 'bg-purple-500/10 border-purple-500/30'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white truncate">{wh.name}</span>
                      <StatusBadge status={wh.status} />
                    </div>
                    <div className="text-[10px] text-white/30 font-mono truncate mb-2">{wh.endpoint}</div>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="text-emerald-400/70 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> {wh.success}
                      </span>
                      <span className="text-red-400/70 flex items-center gap-1">
                        <ArrowDownRight className="w-3 h-3" /> {wh.failed}
                      </span>
                      <span className="text-white/30">{wh.events.length} events</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 4D Visualization + Detail */}
        <Card className="bg-black/40 border-white/10 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white">4D Webhook Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 rounded-lg overflow-hidden border border-white/5 mb-4">
              <Suspense fallback={<div className="h-full bg-black/60 animate-pulse" />}>
                <WebhookFlowViz />
              </Suspense>
            </div>
            {selectedWebhook ? (
              <div className="space-y-3">
                <h4 className="text-white font-medium">{selectedWebhook.name}</h4>
                <div className="text-xs text-white/40 font-mono break-all">{selectedWebhook.endpoint}</div>
                <div className="flex flex-wrap gap-1">
                  {selectedWebhook.events.map(ev => (
                    <Badge key={ev} variant="outline" className="text-[10px] border-purple-500/30 text-purple-400">
                      {ev}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="text-xs border-white/10 text-white/60">
                    <Edit className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs border-cyan-500/20 text-cyan-400">
                    <Send className="w-3 h-3 mr-1" /> Test
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs border-red-500/20 text-red-400">
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-white/30 text-sm py-6">
                Select a webhook to view details
              </div>
            )}
          </CardContent>
        </Card>

        {/* Real-time Logs */}
        <Card className="bg-black/40 border-white/10 lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Live Logs
              </CardTitle>
              <div className="flex gap-1">
                {['all', 'success', 'failed', 'retry'].map(status => (
                  <Button
                    key={status}
                    size="sm"
                    variant={filterStatus === status ? 'default' : 'ghost'}
                    onClick={() => setFilterStatus(status)}
                    className={`h-6 text-[10px] px-2 ${
                      filterStatus === status
                        ? 'bg-white/10 text-white'
                        : 'text-white/30 hover:text-white/60'
                    }`}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <div className="px-2 pb-4">
                {filteredLogs.map((log) => (
                  <LogEntry key={log.id} log={log} />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Event Types Reference */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white">Supported Event Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(WebhookEventTypes).map(([category, events]) => (
              <div key={category}>
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">{category}</h4>
                <div className="space-y-1">
                  {events.map(event => (
                    <div key={event} className="text-[10px] text-white/40 font-mono truncate hover:text-white/70 transition-colors cursor-default" title={event}>
                      {event}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
