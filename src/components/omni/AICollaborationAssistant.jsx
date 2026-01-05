import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Code, MessageSquare, Sparkles, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AICollaborationAssistant({ 
  blueprintChanges, 
  activeTasks,
  monitoringAlerts,
  onInviteMember 
}) {
  const [codeReview, setCodeReview] = useState(null);
  const [teamSuggestions, setTeamSuggestions] = useState(null);
  const [alertSummary, setAlertSummary] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (blueprintChanges?.length > 0) {
      performCodeReview();
    }
  }, [blueprintChanges]);

  useEffect(() => {
    if (activeTasks?.length > 0) {
      suggestTeamMembers();
    }
  }, [activeTasks]);

  useEffect(() => {
    if (monitoringAlerts?.length > 0) {
      summarizeAlerts();
    }
  }, [monitoringAlerts]);

  const performCodeReview = async () => {
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Perform AI-assisted code review for blueprint changes integrated with CI/CD.
          
          Changes: ${JSON.stringify(blueprintChanges)}
          
          Analyze:
          1. CODE QUALITY: Best practices, patterns, maintainability
          2. PERFORMANCE IMPACT: Potential bottlenecks, optimization opportunities
          3. SECURITY CONCERNS: Vulnerabilities, exposed endpoints, misconfigurations
          4. COST IMPLICATIONS: Resource usage changes, unexpected costs
          5. CI/CD COMPATIBILITY: Deployment risks, breaking changes
          6. SUGGESTIONS: Specific improvements with code examples
          
          Provide actionable feedback with priority levels.
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            overallScore: { type: 'number' },
            issues: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  severity: { type: 'string' },
                  category: { type: 'string' },
                  description: { type: 'string' },
                  suggestion: { type: 'string' },
                  lineNumber: { type: 'number' }
                }
              }
            },
            improvements: { type: 'array', items: { type: 'string' } },
            cicdRecommendations: { type: 'string' }
          }
        }
      });

      setCodeReview(result);
      if (result.issues?.length > 0) {
        toast.info(`Code review: ${result.issues.length} suggestions`);
      }
    } catch (error) {
      console.error('Code review failed:', error);
    }
  };

  const suggestTeamMembers = async () => {
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Suggest team members to involve based on blueprint complexity and tasks.
          
          Active Tasks: ${JSON.stringify(activeTasks)}
          
          Analyze tasks and suggest:
          1. EXPERTISE NEEDED: Required skills for each task
          2. TEAM MEMBERS: Who should be involved (roles, not names)
          3. COLLABORATION STRATEGY: How to structure the work
          4. PRIORITY ASSIGNMENTS: Critical path tasks
          
          Consider blueprint complexity and task dependencies.
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  role: { type: 'string' },
                  expertise: { type: 'string' },
                  tasksToAssign: { type: 'array', items: { type: 'string' } },
                  reasoning: { type: 'string' }
                }
              }
            },
            collaborationStrategy: { type: 'string' }
          }
        }
      });

      setTeamSuggestions(result);
    } catch (error) {
      console.error('Team suggestion failed:', error);
    }
  };

  const summarizeAlerts = async () => {
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Summarize complex monitoring alerts for faster comprehension.
          
          Alerts: ${JSON.stringify(monitoringAlerts)}
          
          Create concise summary:
          1. KEY ISSUES: Most critical alerts
          2. ROOT CAUSES: Common patterns across alerts
          3. IMPACT ASSESSMENT: What's affected
          4. RECOMMENDED ACTIONS: Priority order
          5. AUTOMATED FIXES: What can be auto-resolved
          
          Make it digestible for quick decision-making.
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            criticalAlerts: { type: 'number' },
            mainIssues: { type: 'array', items: { type: 'string' } },
            recommendedActions: { type: 'array', items: { type: 'string' } },
            automatedFixes: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setAlertSummary(result);
      toast.info(`${result.criticalAlerts} critical alerts summarized`);
    } catch (error) {
      console.error('Alert summarization failed:', error);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed top-24 right-6 z-40 p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/40 hover:border-purple-500/60"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Users className="w-5 h-5 text-purple-400" />
        {(codeReview?.issues?.length > 0 || teamSuggestions || alertSummary) && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
            {(codeReview?.issues?.length || 0) + (teamSuggestions ? 1 : 0) + (alertSummary ? 1 : 0)}
          </span>
        )}
      </motion.button>

      {showPanel && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed top-24 right-6 z-40 w-96 max-h-[600px] bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden"
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">AI Collaboration</span>
            </div>
            <button onClick={() => setShowPanel(false)} className="text-white/60 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 max-h-[540px] overflow-y-auto space-y-4">
            {/* Code Review */}
            {codeReview && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Code className="w-4 h-4 text-blue-400" />
                  <span className="text-white font-semibold">Code Review</span>
                  <span className={`ml-auto px-2 py-0.5 rounded text-xs ${
                    codeReview.overallScore >= 80 ? 'bg-green-500/20 text-green-400' :
                    codeReview.overallScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    Score: {codeReview.overallScore}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  {codeReview.issues?.slice(0, 3).map((issue, idx) => (
                    <div key={idx} className="p-2 rounded bg-black/30">
                      <div className="flex items-start gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                          issue.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          issue.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {issue.severity}
                        </span>
                        <span className="text-white/70 text-xs">{issue.category}</span>
                      </div>
                      <div className="text-white/80 text-xs mb-1">{issue.description}</div>
                      <div className="text-cyan-400 text-xs">{issue.suggestion}</div>
                    </div>
                  ))}
                </div>

                {codeReview.cicdRecommendations && (
                  <div className="text-white/60 text-xs">
                    CI/CD: {codeReview.cicdRecommendations}
                  </div>
                )}
              </div>
            )}

            {/* Team Suggestions */}
            {teamSuggestions && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-semibold">Team Suggestions</span>
                </div>

                <div className="space-y-3">
                  {teamSuggestions.suggestions?.map((suggestion, idx) => (
                    <div key={idx} className="p-3 rounded bg-black/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm">{suggestion.role}</span>
                        <button
                          onClick={() => onInviteMember?.(suggestion.role)}
                          className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                        >
                          Invite
                        </button>
                      </div>
                      <div className="text-white/60 text-xs mb-2">{suggestion.expertise}</div>
                      <div className="text-white/50 text-xs">{suggestion.reasoning}</div>
                    </div>
                  ))}
                </div>

                {teamSuggestions.collaborationStrategy && (
                  <div className="mt-3 text-cyan-400 text-xs">
                    Strategy: {teamSuggestions.collaborationStrategy}
                  </div>
                )}
              </div>
            )}

            {/* Alert Summary */}
            {alertSummary && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-orange-400" />
                  <span className="text-white font-semibold">Alert Summary</span>
                  {alertSummary.criticalAlerts > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs">
                      {alertSummary.criticalAlerts} critical
                    </span>
                  )}
                </div>

                <div className="text-white/70 text-sm mb-3">{alertSummary.summary}</div>

                {alertSummary.mainIssues?.length > 0 && (
                  <div className="mb-3">
                    <div className="text-white/50 text-xs mb-1">Main Issues:</div>
                    {alertSummary.mainIssues.map((issue, idx) => (
                      <div key={idx} className="text-white/80 text-xs mb-1">• {issue}</div>
                    ))}
                  </div>
                )}

                {alertSummary.automatedFixes?.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-green-400 text-xs font-medium">Auto-fix available:</div>
                    {alertSummary.automatedFixes.map((fix, idx) => (
                      <button
                        key={idx}
                        className="w-full text-left px-2 py-1 rounded bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs"
                      >
                        {fix}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
}