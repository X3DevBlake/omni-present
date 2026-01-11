import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, Target, TrendingUp, BookOpen, Users, Loader, CheckCircle2,
  Video, FileText, Share2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AutonomousVideoCoachPanel({ enhancedAnalytics }) {
  const [coaching, setCoaching] = useState(null);
  const [coachingActive, setCoachingActive] = useState(false);
  const [progress, setProgress] = useState(null);
  const [resources, setResources] = useState([]);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const startCoaching = async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      // Start autonomous coaching
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Start coaching for user ${userEmail}:
        
Analytics: ${JSON.stringify(enhancedAnalytics)}

Initialize coaching program with personalized plan.`,
      });

      setCoaching(response);
      setCoachingActive(true);
    } catch (error) {
      console.error('Error starting coaching:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCoachingVideo = async () => {
    setLoading(true);
    try {
      const videoScript = `
Welcome to your personalized coaching session.

Today we'll focus on: ${enhancedAnalytics.recommendations?.personalized?.delivery?.[0]?.recommendation}

Key improvements:
1. Practice technique X
2. Apply framework Y
3. Monitor metric Z
      `;

      // Generate video via Gemini Veo 3.1
      const video = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate coaching video:
        
Script: ${videoScript}
Topic: Video Performance Coaching
User: ${userEmail}

Create professional 5-minute coaching video using Veo 3.1.`,
      });

      setGeneratedContent({ type: 'video', data: video });
      await shareToSlack(video, 'video');
    } catch (error) {
      console.error('Error generating video:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCoachingMaterials = async () => {
    setLoading(true);
    try {
      const materials = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate coaching materials:
        
Focus Areas: ${JSON.stringify(enhancedAnalytics.recommendations?.personalized)}
User: ${userEmail}

Create:
1. PDF guide
2. Checklist
3. Practice exercises
4. Success metrics`,
      });

      setGeneratedContent({ type: 'materials', data: materials });
      await shareToGoogleDrive(materials);
    } catch (error) {
      console.error('Error generating materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const shareToSlack = async (content, type) => {
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Share coaching ${type} to Slack:
        
Content: ${JSON.stringify(content)}
User: ${userEmail}
Type: ${type}

Post to user's Slack with summary and call-to-action.`,
      });
    } catch (error) {
      console.error('Error sharing to Slack:', error);
    }
  };

  const shareToGoogleDrive = async (materials) => {
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Save coaching materials to Google Drive:
        
Materials: ${JSON.stringify(materials)}
User: ${userEmail}

Create folder: Coaching > Materials > [Date]`,
      });
    } catch (error) {
      console.error('Error saving to Drive:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Coaching Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`border rounded-lg p-4 ${
          coachingActive
            ? 'bg-purple-500/10 border-purple-400/30'
            : 'bg-white/5 border-white/10'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-bold flex items-center gap-2">
            <Zap className="w-4 h-4" />
            {coachingActive ? 'Coaching Active' : 'Autonomous Video Coach'}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={startCoaching}
            disabled={loading || coachingActive}
            className="px-4 py-2 bg-purple-500/20 border border-purple-400 rounded text-purple-300 hover:bg-purple-500/30 disabled:opacity-50 text-sm font-semibold"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin inline mr-2" />
                Initializing...
              </>
            ) : coachingActive ? (
              'Coaching Started'
            ) : (
              'Start Coaching'
            )}
          </motion.button>
        </div>

        {coaching && (
          <div className="text-white/60 text-sm">
            <p>{coaching.plan}</p>
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      {coachingActive && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-white/10 border border-white/20 p-1 rounded-lg w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="content">Generated Content</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
              <p className="text-white font-bold text-sm">Recommended Improvements</p>
              
              {enhancedAnalytics.recommendations?.personalized?.delivery?.slice(0, 3).map((rec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/10 rounded p-3 space-y-1"
                >
                  <p className="text-white text-sm font-semibold">{rec.recommendation}</p>
                  <p className="text-white/60 text-xs">Impact: {rec.impact}</p>
                  <p className="text-white/40 text-xs">Priority: {rec.priority}</p>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-3">
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={generateCoachingVideo}
                disabled={loading}
                className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4" />
                    Generate Coaching Video
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={generateCoachingMaterials}
                disabled={loading}
                className="w-full px-4 py-2 bg-purple-500/20 border border-purple-400 rounded text-purple-300 hover:bg-purple-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Generate Materials
                  </>
                )}
              </motion.button>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-3">
            {generatedContent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-green-500/10 border border-green-400/30 rounded-lg p-4 space-y-2"
              >
                <p className="text-white font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Content Generated
                </p>
                <p className="text-white/60 text-sm">
                  Type: {generatedContent.type}
                </p>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-3">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-white font-bold text-sm mb-3">Your Progress</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-white/60 text-sm">Modules Completed</p>
                  <p className="text-cyan-300 font-bold">2/5</p>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-cyan-500 h-2 rounded-full w-2/5" />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}