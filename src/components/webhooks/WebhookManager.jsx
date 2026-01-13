import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Webhook, Plus, Edit, Trash, CheckCircle, XCircle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function WebhookManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState(null);
  const queryClient = useQueryClient();

  const { data: webhooks, isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => base44.entities.WebhookConfiguration.list()
  });

  const createWebhook = useMutation({
    mutationFn: (data) => base44.entities.WebhookConfiguration.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setIsCreating(false);
      toast.success('Webhook created successfully');
    }
  });

  const updateWebhook = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WebhookConfiguration.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setEditingWebhook(null);
      toast.success('Webhook updated successfully');
    }
  });

  const deleteWebhook = useMutation({
    mutationFn: (id) => base44.entities.WebhookConfiguration.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Webhook deleted');
    }
  });

  const toggleWebhook = async (webhook) => {
    await updateWebhook.mutateAsync({
      id: webhook.id,
      data: { ...webhook, is_active: !webhook.is_active }
    });
  };

  const availableEvents = [
    'agent.created',
    'agent.updated',
    'agent.deleted',
    'agent.task_completed',
    'agent.task_failed',
    'workflow.started',
    'workflow.completed',
    'workflow.failed',
    'anomaly.detected',
    'threshold.exceeded',
    'integration.connected',
    'integration.failed',
    'user.action'
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Webhook className="w-6 h-6 text-purple-500" />
              Webhook Management
            </div>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Webhook
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>Create Webhook</DialogTitle>
                </DialogHeader>
                <WebhookForm
                  onSubmit={(data) => createWebhook.mutate(data)}
                  onCancel={() => setIsCreating(false)}
                  availableEvents={availableEvents}
                />
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {webhooks?.map((webhook, idx) => (
              <motion.div
                key={webhook.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 rounded-lg border bg-gradient-to-r from-purple-50 to-blue-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{webhook.name}</h3>
                      <Badge variant={webhook.is_active ? 'default' : 'secondary'}>
                        {webhook.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{webhook.endpoint_url}</p>
                    <div className="flex gap-2 flex-wrap">
                      {webhook.event_triggers?.map((event, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={webhook.is_active}
                      onCheckedChange={() => toggleWebhook(webhook)}
                    />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost" onClick={() => setEditingWebhook(webhook)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Webhook</DialogTitle>
                        </DialogHeader>
                        <WebhookForm
                          webhook={webhook}
                          onSubmit={(data) => updateWebhook.mutate({ id: webhook.id, data })}
                          onCancel={() => setEditingWebhook(null)}
                          availableEvents={availableEvents}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteWebhook.mutate(webhook.id)}
                    >
                      <Trash className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-600">Success</p>
                      <p className="text-sm font-semibold">{webhook.success_count || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="text-xs text-gray-600">Failed</p>
                      <p className="text-sm font-semibold">{webhook.failure_count || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-600">Last Trigger</p>
                      <p className="text-sm font-semibold">
                        {webhook.last_triggered ? 'Recently' : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {webhooks?.length === 0 && (
              <div className="text-center py-12">
                <Webhook className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No webhooks configured yet</p>
                <p className="text-sm text-gray-500">Create your first webhook to start receiving events</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WebhookForm({ webhook, onSubmit, onCancel, availableEvents }) {
  const [formData, setFormData] = useState(webhook || {
    name: '',
    endpoint_url: '',
    event_triggers: [],
    conditional_logic: {},
    payload_template: {},
    headers: {},
    authentication: {},
    retry_config: { max_retries: 3, backoff_multiplier: 2 },
    is_active: true
  });

  const [selectedEvents, setSelectedEvents] = useState(webhook?.event_triggers || []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, event_triggers: selectedEvents });
  };

  const toggleEvent = (event) => {
    setSelectedEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-semibold mb-2 block">Webhook Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="My Webhook"
          required
        />
      </div>

      <div>
        <label className="text-sm font-semibold mb-2 block">Endpoint URL</label>
        <Input
          value={formData.endpoint_url}
          onChange={(e) => setFormData({ ...formData, endpoint_url: e.target.value })}
          placeholder="https://api.example.com/webhook"
          required
        />
      </div>

      <div>
        <label className="text-sm font-semibold mb-2 block">Event Triggers</label>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto p-2 border rounded">
          {availableEvents.map(event => (
            <label key={event} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedEvents.includes(event)}
                onChange={() => toggleEvent(event)}
                className="rounded"
              />
              <span className="text-sm">{event}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold mb-2 block">Conditional Logic (JSON)</label>
        <Textarea
          value={JSON.stringify(formData.conditional_logic, null, 2)}
          onChange={(e) => {
            try {
              setFormData({ ...formData, conditional_logic: JSON.parse(e.target.value) });
            } catch (err) {}
          }}
          placeholder='{"field": "value", "operator": "equals"}'
          rows={3}
        />
      </div>

      <div>
        <label className="text-sm font-semibold mb-2 block">Custom Payload Template (JSON)</label>
        <Textarea
          value={JSON.stringify(formData.payload_template, null, 2)}
          onChange={(e) => {
            try {
              setFormData({ ...formData, payload_template: JSON.parse(e.target.value) });
            } catch (err) {}
          }}
          placeholder='{"event": "{{event}}", "data": "{{data}}"}'
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold mb-2 block">Max Retries</label>
          <Input
            type="number"
            value={formData.retry_config.max_retries}
            onChange={(e) => setFormData({
              ...formData,
              retry_config: { ...formData.retry_config, max_retries: parseInt(e.target.value) }
            })}
            min={0}
            max={10}
          />
        </div>
        <div>
          <label className="text-sm font-semibold mb-2 block">Backoff Multiplier</label>
          <Input
            type="number"
            step="0.1"
            value={formData.retry_config.backoff_multiplier}
            onChange={(e) => setFormData({
              ...formData,
              retry_config: { ...formData.retry_config, backoff_multiplier: parseFloat(e.target.value) }
            })}
            min={1}
            max={5}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {webhook ? 'Update' : 'Create'} Webhook
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}