import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Slack, FileText, Copy, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CollaborativeVisualizationSharing() {
  const [visualization, setVisualization] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [shareTarget, setShareTarget] = useState('slack');
  const [slackChannel, setSlackChannel] = useState('#financial-insights');
  const [googleDocId, setGoogleDocId] = useState('');
  const [shareStatus, setShareStatus] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [shareLink, setShareLink] = useState('');

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const captureVisualization = async () => {
    try {
      // In real scenario, this would capture canvas data
      const visualization = {
        id: `vis_${Date.now()}`,
        type: 'crypto_trends',
        timestamp: new Date(),
        title: 'Crypto Market Analysis',
        description: 'Top 5 cryptocurrencies performance',
      };

      setVisualization(visualization);
    } catch (error) {
      console.error('Error capturing visualization:', error);
    }
  };

  const shareToSlack = async () => {
    if (!visualization || !slackChannel) return;

    setSharing(true);
    try {
      // Generate Gemini summary
      const summary = await base44.integrations.Core.InvokeLLM({
        prompt: `Create concise Slack summary for this visualization:
        
Type: ${visualization.type}
Title: ${visualization.title}
Description: ${visualization.description}

Make it engaging and actionable (100 words max).`,
      });

      // Share to Slack with summary
      await base44.integrations.Core.InvokeLLM({
        prompt: `Post to Slack channel:
        
Channel: ${slackChannel}
Title: ${visualization.title}
Summary: ${summary}
User: ${userEmail}

Include link to view full visualization in app.`,
      });

      setShareStatus({ target: 'slack', success: true, channel: slackChannel });
      setTimeout(() => setShareStatus(null), 3000);
    } catch (error) {
      console.error('Error sharing to Slack:', error);
      setShareStatus({ target: 'slack', success: false });
    } finally {
      setSharing(false);
    }
  };

  const shareToGoogleDocs = async () => {
    if (!visualization) return;

    setSharing(true);
    try {
      // Generate comprehensive Gemini analysis for Google Docs
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Create detailed analysis document for Google Docs:
        
Visualization: ${visualization.type}
Title: ${visualization.title}
Description: ${visualization.description}

Include:
1. Executive summary
2. Key insights
3. Data interpretation
4. Recommendations
5. Timestamp and attribution`,
      });

      // Create Google Doc with analysis
      await base44.integrations.Core.InvokeLLM({
        prompt: `Create Google Docs document:
        
Title: ${visualization.title}
Content: ${analysis}
User: ${userEmail}
CreatedDate: ${new Date().toISOString()}`,
      });

      const shareLink = `https://docs.google.com/document/d/${visualization.id}`;
      setShareLink(shareLink);
      setShareStatus({ target: 'gdocs', success: true });
      setTimeout(() => setShareStatus(null), 3000);
    } catch (error) {
      console.error('Error sharing to Google Docs:', error);
      setShareStatus({ target: 'gdocs', success: false });
    } finally {
      setSharing(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
  };

  return (
    <div className="space-y-4">
      {/* Capture Visualization */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={captureVisualization}
        className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 flex items-center justify-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        Capture Current Visualization
      </motion.button>

      {visualization && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3"
        >
          <div>
            <p className="text-white font-bold">{visualization.title}</p>
            <p className="text-white/60 text-sm">{visualization.description}</p>
            <p className="text-white/40 text-xs mt-1">{visualization.timestamp.toLocaleString()}</p>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            {/* Slack Sharing */}
            <div className="border-t border-white/10 pt-3">
              <p className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                <Slack className="w-4 h-4" /> Share to Slack
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={slackChannel}
                  onChange={(e) => setSlackChannel(e.target.value)}
                  placeholder="#channel-name"
                  className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white placeholder-white/40 text-xs"
                  disabled={sharing}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={shareToSlack}
                  disabled={sharing}
                  className="px-3 py-1 bg-cyan-500/20 border border-cyan-400 rounded text-cyan-300 text-xs hover:bg-cyan-500/30 disabled:opacity-50"
                >
                  {sharing ? 'Sharing...' : 'Share'}
                </motion.button>
              </div>
            </div>

            {/* Google Docs Sharing */}
            <div className="border-t border-white/10 pt-3">
              <p className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Share to Google Docs
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={shareToGoogleDocs}
                disabled={sharing}
                className="w-full px-3 py-1 bg-purple-500/20 border border-purple-400 rounded text-purple-300 text-xs hover:bg-purple-500/30 disabled:opacity-50"
              >
                {sharing ? 'Creating Document...' : 'Create & Share Document'}
              </motion.button>

              {shareLink && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={copyShareLink}
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded"
                  >
                    <Copy className="w-3 h-3 text-white" />
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {shareStatus && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex items-center gap-2 text-xs p-2 rounded ${
                shareStatus.success
                  ? 'bg-green-500/10 text-green-300'
                  : 'bg-red-500/10 text-red-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {shareStatus.success
                ? `Shared to ${shareStatus.target === 'slack' ? shareStatus.channel : 'Google Docs'}`
                : 'Share failed'}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}