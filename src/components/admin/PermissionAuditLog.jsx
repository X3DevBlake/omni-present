import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, Search, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function PermissionAuditLog() {
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => base44.entities.PermissionAuditLog?.list?.('-created_date', 500) || [],
    initialData: []
  });

  const getAuditTypeColor = (type) => {
    const colors = {
      role_created: 'bg-green-500/20 text-green-300',
      role_modified: 'bg-blue-500/20 text-blue-300',
      role_deleted: 'bg-red-500/20 text-red-300',
      permission_granted: 'bg-green-500/20 text-green-300',
      permission_revoked: 'bg-red-500/20 text-red-300',
      role_assigned: 'bg-purple-500/20 text-purple-300',
      role_unassigned: 'bg-orange-500/20 text-orange-300',
      access_elevated: 'bg-yellow-500/20 text-yellow-300',
      access_revoked: 'bg-red-500/20 text-red-300'
    };
    return colors[type] || 'bg-slate-500/20 text-slate-300';
  };

  const getAuditTypeIcon = (type) => {
    const icons = {
      role_created: '✨',
      role_modified: '📝',
      role_deleted: '🗑️',
      permission_granted: '✅',
      permission_revoked: '❌',
      role_assigned: '👤',
      role_unassigned: '👤',
      access_elevated: '⬆️',
      access_revoked: '⬇️'
    };
    return icons[type] || '📋';
  };

  const filteredLogs = auditLogs.filter(log =>
    log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.affected_user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.role_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.audit_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const csv = [
      ['Date', 'Audit Type', 'User', 'Affected User', 'Role', 'Permission', 'Status'],
      ...filteredLogs.map(log => [
        format(new Date(log.created_date), 'yyyy-MM-dd HH:mm:ss'),
        log.audit_type,
        log.user_email,
        log.affected_user_email || '-',
        log.role_name || '-',
        log.permission_changed || '-',
        log.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Permission Audit Log</CardTitle>
        <Button onClick={handleExport} size="sm" variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search by user, role, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-800/50 border-slate-700"
          />
        </div>

        {/* Audit Log List */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No audit logs found</p>
          ) : (
            filteredLogs.map((log, idx) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <button
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  className="w-full p-3 bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700 rounded-lg transition text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getAuditTypeIcon(log.audit_type)}</span>
                        <Badge className={getAuditTypeColor(log.audit_type)}>
                          {log.audit_type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(log.created_date), 'MMM dd, HH:mm')}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-300">
                        <span className="font-medium">{log.user_email}</span>
                        {log.affected_user_email && (
                          <>
                            <span className="text-slate-500"> → </span>
                            <span className="font-medium">{log.affected_user_email}</span>
                          </>
                        )}
                      </p>
                      {log.role_name && (
                        <p className="text-xs text-slate-400 mt-1">Role: {log.role_name}</p>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition ${
                        expandedId === log.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedId === log.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-slate-800/30 border border-slate-700 border-t-0 rounded-b-lg space-y-2 text-sm"
                  >
                    {log.permission_changed && (
                      <div>
                        <p className="text-slate-400">Permission Changed</p>
                        <p className="text-white font-medium">{log.permission_changed}</p>
                      </div>
                    )}
                    {log.reason && (
                      <div>
                        <p className="text-slate-400">Reason</p>
                        <p className="text-white">{log.reason}</p>
                      </div>
                    )}
                    {log.ip_address && (
                      <div>
                        <p className="text-slate-400">IP Address</p>
                        <p className="text-white font-mono text-xs">{log.ip_address}</p>
                      </div>
                    )}
                    {log.old_value && (
                      <div>
                        <p className="text-slate-400">Previous Value</p>
                        <pre className="bg-slate-900/50 p-2 rounded text-xs text-slate-300 overflow-auto">
                          {JSON.stringify(log.old_value, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.new_value && (
                      <div>
                        <p className="text-slate-400">New Value</p>
                        <pre className="bg-slate-900/50 p-2 rounded text-xs text-slate-300 overflow-auto">
                          {JSON.stringify(log.new_value, null, 2)}
                        </pre>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-700">
          <div className="p-2 bg-slate-800/30 rounded text-center">
            <p className="text-xs text-slate-400">Total Changes</p>
            <p className="text-lg font-bold text-white">{filteredLogs.length}</p>
          </div>
          <div className="p-2 bg-slate-800/30 rounded text-center">
            <p className="text-xs text-slate-400">Today</p>
            <p className="text-lg font-bold text-white">
              {filteredLogs.filter(l => {
                const logDate = new Date(l.created_date);
                const today = new Date();
                return logDate.toDateString() === today.toDateString();
              }).length}
            </p>
          </div>
          <div className="p-2 bg-slate-800/30 rounded text-center">
            <p className="text-xs text-slate-400">This Week</p>
            <p className="text-lg font-bold text-white">
              {filteredLogs.filter(l => {
                const logDate = new Date(l.created_date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return logDate >= weekAgo;
              }).length}
            </p>
          </div>
          <div className="p-2 bg-slate-800/30 rounded text-center">
            <p className="text-xs text-slate-400">Users</p>
            <p className="text-lg font-bold text-white">
              {new Set(filteredLogs.map(l => l.user_email)).size}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}