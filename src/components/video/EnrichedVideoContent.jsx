import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock, Tag, CheckCircle2, MessageSquare, Lightbulb, AlertCircle, Loader, Link2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function EnrichedVideoContent({ videoId, enrichedData }) {
  const [activeTab, setActiveTab] = useState('moments');
  const [linking, setLinking] = useState(false);

  const linkToTasks = async () => {
    setLinking(true);
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Link action items to task management:
        
ActionItems: ${JSON.stringify(enrichedData?.actionItems?.actionItems)}
VideoID: ${videoId}

Create tasks for all action items with video reference.`,
      });
    } catch (error) {
      console.error('Error linking tasks:', error);
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white/10 border border-white/20 p-1 rounded-lg w-full justify-start overflow-x-auto">
          <TabsTrigger value="moments" className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Moments
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> Summary
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-1">
            <Tag className="w-3 h-3" /> Tags
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Actions
          </TabsTrigger>
          <TabsTrigger value="decisions" className="flex items-center gap-1">
            <Lightbulb className="w-3 h-3" /> Decisions
          </TabsTrigger>
        </TabsList>

        {/* Key Moments */}
        <TabsContent value="moments" className="space-y-3">
          <div className="space-y-2">
            {enrichedData?.moments?.map((moment, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-cyan-300 font-bold text-sm">{moment.title}</p>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        moment.category === 'decision' ? 'bg-purple-500/20 text-purple-300' :
                        moment.category === 'action' ? 'bg-green-500/20 text-green-300' :
                        moment.category === 'insight' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {moment.category}
                      </span>
                    </div>
                    <p className="text-white/60 text-xs">{moment.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-white/40" />
                      <p className="text-white/40 text-xs">{Math.floor(moment.timestamp / 60)}:{String(moment.timestamp % 60).padStart(2, '0')}</p>
                      <div className="flex-1" />
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500" style={{ width: `${moment.relevance}%` }} />
                      </div>
                      <p className="text-white/40 text-xs">{moment.relevance}%</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Summary */}
        <TabsContent value="summary" className="space-y-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {/* One-liner */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-white/60 text-xs font-semibold mb-1">ONE-LINER</p>
              <p className="text-white text-sm">{enrichedData?.summary?.oneLine}</p>
            </div>

            {/* Short */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-white/60 text-xs font-semibold mb-1">SHORT (50 words)</p>
              <p className="text-white/80 text-xs leading-relaxed">{enrichedData?.summary?.short}</p>
            </div>

            {/* Takeaways */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-white/60 text-xs font-semibold mb-2">KEY TAKEAWAYS</p>
              <div className="space-y-1">
                {enrichedData?.summary?.takeaways?.map((takeaway, idx) => (
                  <p key={idx} className="text-white/70 text-xs">• {takeaway}</p>
                ))}
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* Tags & Keywords */}
        <TabsContent value="tags" className="space-y-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {enrichedData?.tags && Object.entries(enrichedData.tags).map(([category, items]) => (
              <div key={category} className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-white/60 text-xs font-semibold mb-2 capitalize">{category}</p>
                <div className="flex flex-wrap gap-1">
                  {items?.map((item, idx) => (
                    <span key={idx} className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-xs">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </TabsContent>

        {/* Action Items */}
        <TabsContent value="actions" className="space-y-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {enrichedData?.actionItems?.actionItems?.map((item, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{item.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-white/60 text-xs">Owner: {item.owner}</p>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        item.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                        item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-white/40 mt-1" />
                </div>
              </div>
            ))}

            {/* Link to Tasks Button */}
            {enrichedData?.actionItems?.actionItems?.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={linkToTasks}
                disabled={linking}
                className="w-full px-4 py-2 bg-green-500/20 border border-green-400 rounded text-green-300 hover:bg-green-500/30 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-semibold"
              >
                {linking ? (
                  <>
                    <Loader className="w-3 h-3 animate-spin" />
                    Linking to Tasks...
                  </>
                ) : (
                  <>
                    <Link2 className="w-3 h-3" />
                    Link to Task Management
                  </>
                )}
              </motion.button>
            )}
          </motion.div>
        </TabsContent>

        {/* Decisions */}
        <TabsContent value="decisions" className="space-y-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {enrichedData?.actionItems?.decisions?.map((decision, idx) => (
              <div key={idx} className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-3">
                <p className="text-purple-300 font-semibold text-sm">{decision.decision}</p>
                <p className="text-white/60 text-xs mt-1">{decision.rationale}</p>
                <p className="text-white/40 text-xs mt-2">Owner: {decision.owner}</p>
              </div>
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}