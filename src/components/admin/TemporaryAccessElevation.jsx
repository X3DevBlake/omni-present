import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';

export default function TemporaryAccessElevation() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    user_email: '',
    elevated_role_id: '',
    reason: '',
    duration: 1
  });

  const { data: elevations = [] } = useQuery({
    queryKey: ['temporaryElevations'],
    queryFn: () => base44.entities.TemporaryAccessElevation?.list?.('-created_date', 100) || [],
    initialData: []
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.UserRole?.list?.() || [],
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TemporaryAccessElevation?.create?.(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['temporaryElevations'] });
      setNewRequest({ user_email: '', elevated_role_id: '', reason: '', duration: 1 });
      setShowForm(false);
    }
  });

  const revokeMutation = useMutation({
    mutationFn: (id) => base44.entities.TemporaryAccessElevation?.update?.(id, { status: 'revoked' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['temporaryElevations'] })
  });

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    const now = new Date();
    const endTime = new Date(now.getTime() + newRequest.duration * 60 * 60 * 1000);

    createMutation.mutate({
      user_email: newRequest.user_email,
      elevated_role_id: newRequest.elevated_role_id,
      reason: newRequest.reason,
      start_time: now.toISOString(),
      end_time: endTime.toISOString(),
      status: 'pending',
      required_approvers: ['admin@example.com']
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-300',
      approved: 'bg-green-500/20 text-green-300',
      rejected: 'bg-red-500/20 text-red-300',
      expired: 'bg-slate-500/20 text-slate-300',
      revoked: 'bg-red-500/20 text-red-300'
    };
    return colors[status] || 'bg-slate-500/20 text-slate-300';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      approved: <CheckCircle2 className="w-4 h-4" />,
      rejected: <AlertCircle className="w-4 h-4" />,
      expired: <AlertCircle className="w-4 h-4" />,
      revoked: <AlertCircle className="w-4 h-4" />
    };
    return icons[status];
  };

  const activeElevations = elevations.filter(e => e.status === 'approved' && new Date(e.end_time) > new Date());

  return (
    <div className="space-y-6">
      {/* Active Elevations Summary */}
      <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Active Temporary Access</CardTitle>
            <p className="text-sm text-slate-400 mt-1">{activeElevations.length} active elevations</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
            Request Elevation
          </Button>
        </CardHeader>

        {showForm && (
          <CardContent className="p-6 border-t border-slate-700">
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-1 block">User Email</label>
                <Input
                  type="email"
                  value={newRequest.user_email}
                  onChange={(e) => setNewRequest({ ...newRequest, user_email: e.target.value })}
                  placeholder="user@example.com"
                  className="bg-slate-800 border-slate-700"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-1 block">Elevated Role</label>
                <select
                  value={newRequest.elevated_role_id}
                  onChange={(e) => setNewRequest({ ...newRequest, elevated_role_id: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded"
                >
                  <option value="">Select a role...</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.role_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-1 block">Duration (hours)</label>
                <Input
                  type="number"
                  min="1"
                  max="24"
                  value={newRequest.duration}
                  onChange={(e) => setNewRequest({ ...newRequest, duration: parseInt(e.target.value) })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-1 block">Reason</label>
                <textarea
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                  placeholder="Why do you need this elevation?"
                  className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded text-sm"
                  rows="3"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending} className="bg-green-600 hover:bg-green-700">
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Request Elevation
                </Button>
                <Button type="button" onClick={() => setShowForm(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Active Elevations List */}
      {activeElevations.length > 0 && (
        <div className="space-y-3">
          {activeElevations.map((elevation, idx) => (
            <motion.div
              key={elevation.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-medium text-white">{elevation.user_email}</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Elevated to: <span className="text-green-300">{elevation.elevated_role_id}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Expires: {format(new Date(elevation.end_time), 'PPpp')}
                    <span className="text-green-300 ml-2">({formatDistanceToNow(new Date(elevation.end_time), { addSuffix: true })})</span>
                  </p>
                </div>
                <Button
                  onClick={() => revokeMutation.mutate(elevation.id)}
                  disabled={revokeMutation.isPending}
                  size="sm"
                  variant="outline"
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* All Requests */}
      <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">All Elevation Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {elevations.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No elevation requests</p>
            ) : (
              elevations.map(elevation => (
                <div key={elevation.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium text-sm">{elevation.user_email}</span>
                        <Badge className={getStatusColor(elevation.status)}>
                          {elevation.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{elevation.reason}</p>
                    </div>
                    {getStatusIcon(elevation.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}