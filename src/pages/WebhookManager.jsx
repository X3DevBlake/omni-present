import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Webhook, Plus, Trash2, Edit, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

export default function WebhookManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    webhook_name: '',
    event_type: 'entity_created',
    entity_name: '',
    target_url: '',
    http_method: 'POST',
    status: 'active'
  });

  const queryClient = useQueryClient();

  const { data: webhooks, isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => base44.entities.WebhookConfiguration.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.WebhookConfiguration.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setIsCreating(false);
      setFormData({
        webhook_name: '',
        event_type: 'entity_created',
        entity_name: '',
        target_url: '',
        http_method: 'POST',
        status: 'active'
      });
      toast.success('Webhook created successfully');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WebhookConfiguration.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Webhook updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WebhookConfiguration.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Webhook deleted');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const toggleWebhook = (webhook) => {
    const newStatus = webhook.status === 'active' ? 'paused' : 'active';
    updateMutation.mutate({
      id: webhook.id,
      data: { status: newStatus }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Webhook Manager</h1>
            <p className="text-gray-300">Configure and monitor webhook integrations</p>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                New Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 text-white">
              <DialogHeader>
                <DialogTitle>Create New Webhook</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300">Webhook Name</label>
                  <Input
                    value={formData.webhook_name}
                    onChange={(e) => setFormData({...formData, webhook_name: e.target.value})}
                    placeholder="My Webhook"
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300">Event Type</label>
                  <Select
                    value={formData.event_type}
                    onValueChange={(value) => setFormData({...formData, event_type: value})}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entity_created">Entity Created</SelectItem>
                      <SelectItem value="entity_updated">Entity Updated</SelectItem>
                      <SelectItem value="entity_deleted">Entity Deleted</SelectItem>
                      <SelectItem value="user_action">User Action</SelectItem>
                      <SelectItem value="system_event">System Event</SelectItem>
                      <SelectItem value="custom_trigger">Custom Trigger</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-300">Entity Name (optional)</label>
                  <Input
                    value={formData.entity_name}
                    onChange={(e) => setFormData({...formData, entity_name: e.target.value})}
                    placeholder="UserAvatar"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300">Target URL</label>
                  <Input
                    value={formData.target_url}
                    onChange={(e) => setFormData({...formData, target_url: e.target.value})}
                    placeholder="https://api.example.com/webhook"
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300">HTTP Method</label>
                  <Select
                    value={formData.http_method}
                    onValueChange={(value) => setFormData({...formData, http_method: value})}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={createMutation.isPending}
                >
                  Create Webhook
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">Total Webhooks</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-white">{webhooks?.length || 0}</span>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-green-400">
                {webhooks?.filter(w => w.status === 'active').length || 0}
              </span>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">Total Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-white">
                {webhooks?.reduce((sum, w) => sum + (w.success_count || 0), 0) || 0}
              </span>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-green-400">
                {webhooks?.length ? (
                  ((webhooks.reduce((sum, w) => sum + (w.success_count || 0), 0) /
                    Math.max(1, webhooks.reduce((sum, w) => sum + (w.success_count || 0) + (w.failure_count || 0), 0))) * 100).toFixed(1)
                ) : 0}%
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Webhooks List */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Configured Webhooks</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-gray-400">Loading webhooks...</p>
            ) : webhooks?.length === 0 ? (
              <p className="text-gray-400">No webhooks configured yet.</p>
            ) : (
              <div className="space-y-3">
                {webhooks?.map(webhook => (
                  <div key={webhook.id} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Webhook className="w-5 h-5 text-purple-400" />
                        <div>
                          <h3 className="text-white font-semibold">{webhook.webhook_name}</h3>
                          <p className="text-sm text-gray-400">{webhook.target_url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                          {webhook.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleWebhook(webhook)}
                          className="text-white hover:bg-white/10"
                        >
                          {webhook.status === 'active' ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(webhook.id)}
                          className="text-red-400 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Event Type</p>
                        <p className="text-white">{webhook.event_type}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Entity</p>
                        <p className="text-white">{webhook.entity_name || 'Any'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Successes</p>
                        <p className="text-green-400">{webhook.success_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Failures</p>
                        <p className="text-red-400">{webhook.failure_count || 0}</p>
                      </div>
                    </div>

                    {webhook.last_triggered && (
                      <p className="text-xs text-gray-400 mt-2">
                        Last triggered: {new Date(webhook.last_triggered).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}