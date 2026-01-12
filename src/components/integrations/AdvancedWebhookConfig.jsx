import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tantml:react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Webhook, Plus, Code, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function AdvancedWebhookConfig({ webhooks }) {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    webhook_name: '',
    event_type: 'entity_created',
    target_url: '',
    payload_template: '{}',
    conditional_logic: '',
    transform_script: ''
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        webhook_name: data.webhook_name,
        event_type: data.event_type,
        target_url: data.target_url,
        http_method: 'POST',
        status: 'active'
      };

      // Parse and add payload template
      if (data.payload_template) {
        try {
          payload.payload_template = JSON.parse(data.payload_template);
        } catch (e) {
          throw new Error('Invalid JSON in payload template');
        }
      }

      // Add conditional logic and transform script to headers/metadata
      if (data.conditional_logic || data.transform_script) {
        payload.headers = {
          'X-Conditional-Logic': data.conditional_logic,
          'X-Transform-Script': data.transform_script
        };
      }

      return await base44.entities.WebhookConfiguration.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setIsCreating(false);
      toast.success('Advanced webhook created');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-white">Advanced Webhook Configuration</CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              Configure webhooks with payload transformations and conditional logic
            </p>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Advanced Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Advanced Webhook</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300">Webhook Name</label>
                  <Input
                    value={formData.webhook_name}
                    onChange={(e) => setFormData({...formData, webhook_name: e.target.value})}
                    placeholder="Customer Created Notification"
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
                      <SelectItem value="custom_trigger">Custom Trigger</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <label className="text-sm text-gray-300 flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Payload Template (JSON)
                  </label>
                  <Textarea
                    value={formData.payload_template}
                    onChange={(e) => setFormData({...formData, payload_template: e.target.value})}
                    placeholder='{"event": "{{eventType}}", "data": "{{data}}"}'
                    className="bg-gray-800 border-gray-700 text-white font-mono text-sm"
                    rows={6}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Use &#123;&#123;variableName&#125;&#125; for dynamic values
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-300 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Conditional Logic (Optional)
                  </label>
                  <Textarea
                    value={formData.conditional_logic}
                    onChange={(e) => setFormData({...formData, conditional_logic: e.target.value})}
                    placeholder="data.amount > 100 && data.status === 'approved'"
                    className="bg-gray-800 border-gray-700 text-white font-mono text-sm"
                    rows={3}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    JavaScript expression that must evaluate to true to trigger webhook
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-300">Transform Script (Optional)</label>
                  <Textarea
                    value={formData.transform_script}
                    onChange={(e) => setFormData({...formData, transform_script: e.target.value})}
                    placeholder="return { ...data, processedAt: new Date() }"
                    className="bg-gray-800 border-gray-700 text-white font-mono text-sm"
                    rows={4}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    JavaScript code to transform the payload before sending
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={createMutation.isPending}
                >
                  Create Advanced Webhook
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {webhooks?.map(webhook => (
            <div key={webhook.id} className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Webhook className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-white font-semibold">{webhook.webhook_name}</h3>
                    <p className="text-sm text-gray-400">{webhook.target_url}</p>
                  </div>
                </div>
                <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                  {webhook.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                <div>
                  <p className="text-gray-400">Event Type</p>
                  <p className="text-white">{webhook.event_type}</p>
                </div>
                <div>
                  <p className="text-gray-400">Success Rate</p>
                  <p className="text-green-400">
                    {webhook.success_count || 0} / {(webhook.success_count || 0) + (webhook.failure_count || 0)}
                  </p>
                </div>
              </div>

              {webhook.headers?.['X-Conditional-Logic'] && (
                <div className="mt-3 p-2 bg-purple-500/10 border border-purple-500/20 rounded">
                  <p className="text-xs text-purple-200">Has conditional logic</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button 
          onClick={() => window.location.href = '/webhook-manager'} 
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
        >
          Manage All Webhooks
        </Button>
      </CardContent>
    </Card>
  );
}