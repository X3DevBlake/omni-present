import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Webhook, Code, Play, Bug, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AdvancedWebhookManager() {
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [testPayload, setTestPayload] = useState('{}');
  const [testResult, setTestResult] = useState(null);
  const queryClient = useQueryClient();

  const { data: webhooks } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => base44.entities.WebhookConfiguration.list()
  });

  const { data: templates } = useQuery({
    queryKey: ['webhook-templates'],
    queryFn: () => base44.entities.WebhookTemplate.list()
  });

  const testWebhook = async (webhook) => {
    try {
      const payload = JSON.parse(testPayload);
      
      // Simulate webhook call
      const response = await fetch(webhook.endpoint_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...webhook.headers
        },
        body: JSON.stringify(payload)
      });

      setTestResult({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        data: await response.text()
      });
      
      toast.success(`Webhook test ${response.ok ? 'succeeded' : 'failed'}`);
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      });
      toast.error('Webhook test failed');
    }
  };

  const createTemplate = useMutation({
    mutationFn: (data) => base44.entities.WebhookTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-templates'] });
      toast.success('Template created');
    }
  });

  return (
    <div className="space-y-4">
      <Tabs defaultValue="webhooks">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="debugger">Debugger</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="w-6 h-6" />
                Active Webhooks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {webhooks?.map((webhook) => (
                <motion.div
                  key={webhook.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{webhook.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{webhook.endpoint_url}</p>
                      <div className="flex gap-2 flex-wrap">
                        {webhook.event_triggers?.map((event, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{event}</Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setSelectedWebhook(webhook)}
                    >
                      <Bug className="w-4 h-4 mr-2" />
                      Test
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-6 h-6" />
                Dynamic Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TemplateBuilder onSave={(data) => createTemplate.mutate(data)} />
              
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold">Available Templates</h3>
                {templates?.map((template) => (
                  <div key={template.id} className="p-4 rounded border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                      <Badge variant="outline">{template.integration_type}</Badge>
                    </div>
                    <pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-auto">
                      {template.template_code}
                    </pre>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debugger">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="w-6 h-6" />
                Webhook Debugger
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Select Webhook</label>
                <Select onValueChange={(id) => setSelectedWebhook(webhooks?.find(w => w.id === id))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose webhook to test" />
                  </SelectTrigger>
                  <SelectContent>
                    {webhooks?.map((webhook) => (
                      <SelectItem key={webhook.id} value={webhook.id}>
                        {webhook.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedWebhook && (
                <>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Test Payload (JSON)</label>
                    <Textarea
                      value={testPayload}
                      onChange={(e) => setTestPayload(e.target.value)}
                      rows={8}
                      className="font-mono text-xs"
                      placeholder='{"event": "test", "data": {...}}'
                    />
                  </div>

                  <Button
                    onClick={() => testWebhook(selectedWebhook)}
                    className="w-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Send Test Request
                  </Button>

                  {testResult && (
                    <div className={`p-4 rounded-lg border ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <h4 className="font-semibold mb-2">
                        {testResult.success ? '✓ Success' : '✗ Failed'}
                      </h4>
                      {testResult.status && (
                        <p className="text-sm mb-2">
                          Status: {testResult.status} {testResult.statusText}
                        </p>
                      )}
                      <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
                        {testResult.data || testResult.error}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TemplateBuilder({ onSave }) {
  const [template, setTemplate] = useState({
    name: '',
    description: '',
    template_code: '',
    integration_type: 'zapier',
    variables: [],
    workflow_steps: []
  });

  const handleSave = () => {
    if (!template.name || !template.template_code) {
      toast.error('Name and template code required');
      return;
    }
    onSave(template);
    setTemplate({
      name: '',
      description: '',
      template_code: '',
      integration_type: 'zapier',
      variables: [],
      workflow_steps: []
    });
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border bg-gradient-to-br from-purple-50 to-blue-50">
      <h3 className="font-semibold">Create New Template</h3>
      
      <Input
        value={template.name}
        onChange={(e) => setTemplate({ ...template, name: e.target.value })}
        placeholder="Template name"
      />

      <Textarea
        value={template.description}
        onChange={(e) => setTemplate({ ...template, description: e.target.value })}
        placeholder="Description"
        rows={2}
      />

      <Select value={template.integration_type} onValueChange={(val) => setTemplate({ ...template, integration_type: val })}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="zapier"><Zap className="w-4 h-4 inline mr-2" />Zapier</SelectItem>
          <SelectItem value="make">Make.com</SelectItem>
          <SelectItem value="n8n">n8n</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>

      <Textarea
        value={template.template_code}
        onChange={(e) => setTemplate({ ...template, template_code: e.target.value })}
        placeholder={'{\n  "event": "{{event_type}}",\n  "agent": "{{agent_id}}",\n  "timestamp": "{{timestamp}}"\n}'}
        rows={8}
        className="font-mono text-xs"
      />

      <Button onClick={handleSave} className="w-full">
        Save Template
      </Button>
    </div>
  );
}