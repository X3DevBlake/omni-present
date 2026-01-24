import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, AlertCircle, Sparkles, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function AcademicPublishingAssistant({ projectId }) {
  const [draftStage, setDraftStage] = useState('proposal');
  const [generatedContent, setGeneratedContent] = useState('');

  const draftProposalMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('aiResearchAssistantAgent', {
        action: 'draft_research_proposal',
        project_id: projectId
      });
      return response.data;
    },
    onSuccess: (data) => {
      setGeneratedContent(data.proposal);
      toast.success('Research proposal drafted!');
    }
  });

  const checkComplianceMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('peerReviewOrchestrator', {
        action: 'ai_preliminary_review',
        project_id: projectId
      });
      return response.data;
    }
  });

  const complianceResult = checkComplianceMutation.data?.ai_review;

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-400" />
          AI Publishing Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Draft Generation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Draft Stage</span>
              <Button
                size="sm"
                onClick={() => draftProposalMutation.mutate()}
                disabled={draftProposalMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {draftProposalMutation.isPending ? 'Drafting...' : 'Generate Draft'}
              </Button>
            </div>
            
            {generatedContent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 rounded-lg p-4 max-h-64 overflow-y-auto"
              >
                <Textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="bg-transparent border-none text-white min-h-[200px]"
                />
              </motion.div>
            )}
          </div>

          {/* Compliance Check */}
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => checkComplianceMutation.mutate()}
              disabled={checkComplianceMutation.isPending}
              className="border-white/20 text-white mb-3"
            >
              {checkComplianceMutation.isPending ? 'Checking...' : 'AI Compliance Review'}
            </Button>

            {complianceResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Originality</div>
                    <div className="flex items-center gap-2">
                      <Progress value={complianceResult.originality_score * 10} className="flex-1" />
                      <span className="text-white text-sm">{complianceResult.originality_score}/10</span>
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Methodology</div>
                    <div className="flex items-center gap-2">
                      <Progress value={complianceResult.methodology_score * 10} className="flex-1" />
                      <span className="text-white text-sm">{complianceResult.methodology_score}/10</span>
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Clarity</div>
                    <div className="flex items-center gap-2">
                      <Progress value={complianceResult.clarity_score * 10} className="flex-1" />
                      <span className="text-white text-sm">{complianceResult.clarity_score}/10</span>
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Significance</div>
                    <div className="flex items-center gap-2">
                      <Progress value={complianceResult.significance_score * 10} className="flex-1" />
                      <span className="text-white text-sm">{complianceResult.significance_score}/10</span>
                    </div>
                  </div>
                </div>

                {complianceResult.strengths && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-semibold text-white">Strengths</span>
                    </div>
                    <ul className="space-y-1">
                      {complianceResult.strengths.map((strength, i) => (
                        <li key={i} className="text-xs text-gray-300">• {strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {complianceResult.concerns && complianceResult.concerns.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-semibold text-white">Concerns</span>
                    </div>
                    <ul className="space-y-1">
                      {complianceResult.concerns.map((concern, i) => (
                        <li key={i} className="text-xs text-gray-300">• {concern}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Export */}
          <div className="flex gap-2">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Download className="w-4 h-4 mr-2" />
              Export to PDF
            </Button>
            <Button size="sm" variant="outline" className="border-white/20 text-white">
              <Download className="w-4 h-4 mr-2" />
              Export to LaTeX
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}