import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Code, Sparkles, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AICodeGenerationStudio() {
  const [request, setRequest] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [generationType, setGenerationType] = useState('function');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('aiCodeGenerator', {
        natural_language_request: request,
        target_language: language,
        generation_type: generationType,
        code_context: {}
      });
      return response.data;
    },
    onSuccess: (data) => {
      setGeneratedCode(data);
      toast.success('Code generated successfully!');
    },
    onError: (error) => {
      toast.error(`Generation failed: ${error.message}`);
    }
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode?.code || '');
    setCopied(true);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-950 to-purple-950 border-indigo-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            AI Code Generation Studio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              What do you want to build?
            </label>
            <Textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder="e.g., Create a 3D spatial navigator that avoids obstacles using AI predictions..."
              className="bg-slate-900 text-white border-slate-700 min-h-32"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-slate-900 text-white border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="jsx">JSX (React)</SelectItem>
                  <SelectItem value="json">JSON Schema</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">Type</label>
              <Select value={generationType} onValueChange={setGenerationType}>
                <SelectTrigger className="bg-slate-900 text-white border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="function">Backend Function</SelectItem>
                  <SelectItem value="component">React Component</SelectItem>
                  <SelectItem value="entity_schema">Entity Schema</SelectItem>
                  <SelectItem value="spatial_controller">Spatial Controller</SelectItem>
                  <SelectItem value="ai_agent_behavior">AI Agent Behavior</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => generateMutation.mutate()}
            disabled={!request || generateMutation.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {generateMutation.isPending ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Code className="w-4 h-4 mr-2" />
                Generate Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedCode && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Code className="w-5 h-5" />
                Generated Code
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-900 text-green-200">
                  {(generatedCode.confidence || 0.85) * 100}% Confident
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-green-400">
                <code>{generatedCode.code}</code>
              </pre>
            </div>

            {generatedCode.explanation && (
              <div className="space-y-2">
                <h4 className="text-white font-semibold">Explanation</h4>
                <p className="text-slate-300 text-sm">{generatedCode.explanation}</p>
              </div>
            )}

            {generatedCode.dependencies?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-white font-semibold">Dependencies</h4>
                <div className="flex flex-wrap gap-2">
                  {generatedCode.dependencies.map((dep, idx) => (
                    <Badge key={idx} variant="secondary">
                      {dep}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {generatedCode.usage_example && (
              <div className="space-y-2">
                <h4 className="text-white font-semibold">Usage Example</h4>
                <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-blue-400">
                    <code>{generatedCode.usage_example}</code>
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}