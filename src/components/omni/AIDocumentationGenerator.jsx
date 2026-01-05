import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function AIDocumentationGenerator({ blueprint, telemetry }) {
  const [documentation, setDocumentation] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const generateDocs = async () => {
    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Generate comprehensive documentation for this blueprint.
          
          Blueprint: ${JSON.stringify(blueprint)}
          Telemetry: ${JSON.stringify(telemetry)}
          
          Create:
          1. OVERVIEW: Architecture description, purpose, components
          2. API SPECS: Endpoints, parameters, responses
          3. USAGE EXAMPLES: Code snippets for common operations
          4. BEST PRACTICES: Performance tips, security guidelines
          5. DEPLOYMENT: Setup instructions, configuration
          6. MONITORING: Key metrics, alert thresholds
          
          Format as markdown with clear sections.
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            overview: { type: 'string' },
            apiSpecs: { type: 'string' },
            usageExamples: { type: 'string' },
            bestPractices: { type: 'string' },
            deployment: { type: 'string' },
            monitoring: { type: 'string' }
          }
        }
      });

      setDocumentation(result);
      toast.success('Documentation generated');
    } catch (error) {
      console.error('Documentation generation failed:', error);
      toast.error('Failed to generate documentation');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadDocs = () => {
    const fullDoc = Object.entries(documentation || {})
      .map(([key, value]) => `# ${key}\n\n${value}\n\n`)
      .join('---\n\n');
    
    const blob = new Blob([fullDoc], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blueprint-documentation.md';
    a.click();
  };

  return (
    <>
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!documentation && !isOpen) generateDocs();
        }}
        className="fixed bottom-48 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-green-500/20 to-cyan-500/20 border-2 border-green-500/40"
        whileHover={{ scale: 1.05 }}
      >
        <FileText className="w-6 h-6 text-green-400" />
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed right-6 top-24 bottom-24 z-40 w-[500px] bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden flex flex-col"
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-400" />
              <span className="text-white font-semibold">Documentation</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={generateDocs}
                disabled={isGenerating}
                className="p-2 rounded bg-green-500/20 hover:bg-green-500/30 text-green-400"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              </button>
              {documentation && (
                <button
                  onClick={downloadDocs}
                  className="p-2 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isGenerating ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <div className="text-white/70 text-sm">Generating documentation...</div>
              </div>
            ) : documentation ? (
              <div className="prose prose-sm prose-invert max-w-none">
                {Object.entries(documentation).map(([key, value]) => (
                  <div key={key} className="mb-6">
                    <h2 className="text-lg font-bold text-white capitalize mb-2">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </h2>
                    <ReactMarkdown className="text-white/80 text-sm">
                      {value}
                    </ReactMarkdown>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </motion.div>
      )}
    </>
  );
}