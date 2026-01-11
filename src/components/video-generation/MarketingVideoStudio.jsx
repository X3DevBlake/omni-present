import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Download, Share2, Loader, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function MarketingVideoStudio() {
  const [videoType, setVideoType] = useState('sales');
  const [templateStyle, setTemplateStyle] = useState('professional');
  const [videoData, setVideoData] = useState({
    prospect: '',
    product: '',
    benefits: [],
    company: '',
  });
  const [generating, setGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const generateVideo = async () => {
    if (!videoData.prospect || !videoData.product) return;

    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate marketing video:
        
Type: ${videoType}
Prospect: ${videoData.prospect}
Product: ${videoData.product}
Benefits: ${videoData.benefits.join(', ')}
Company: ${videoData.company}
Template: ${templateStyle}
User: ${userEmail}

Create 45-second professional marketing video.`,
      });

      setGeneratedVideo(response);
    } catch (error) {
      console.error('Error generating video:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="create" className="space-y-4">
        <TabsList className="bg-white/10 border border-white/20 p-1 rounded-lg w-full justify-start">
          <TabsTrigger value="create">Create Video</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="library">Video Library</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          {/* Video Type Selection */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
            <p className="text-white font-bold text-sm">Video Type</p>
            <div className="grid grid-cols-2 gap-2">
              {['sales', 'training', 'testimonial', 'product'].map(type => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setVideoType(type)}
                  className={`px-3 py-2 rounded border text-sm font-semibold capitalize transition-all ${
                    videoType === type
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  {type}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Template Selection */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
            <p className="text-white font-bold text-sm">Template Style</p>
            <div className="grid grid-cols-2 gap-2">
              {['professional', 'casual', 'energetic', 'minimal'].map(style => (
                <motion.button
                  key={style}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setTemplateStyle(style)}
                  className={`px-3 py-2 rounded border text-sm font-semibold capitalize transition-all ${
                    templateStyle === style
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  {style}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Video Details */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
            <p className="text-white font-bold text-sm">Video Details</p>
            <input
              type="text"
              value={videoData.prospect}
              onChange={(e) => setVideoData({ ...videoData, prospect: e.target.value })}
              placeholder="Prospect/Client Name"
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/40 text-sm"
            />
            <input
              type="text"
              value={videoData.product}
              onChange={(e) => setVideoData({ ...videoData, product: e.target.value })}
              placeholder="Product/Service Name"
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/40 text-sm"
            />
            <input
              type="text"
              value={videoData.company}
              onChange={(e) => setVideoData({ ...videoData, company: e.target.value })}
              placeholder="Your Company"
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/40 text-sm"
            />
            <input
              type="text"
              value={videoData.benefits.join(', ')}
              onChange={(e) => setVideoData({ ...videoData, benefits: e.target.value.split(',').map(b => b.trim()) })}
              placeholder="Key benefits (comma-separated)"
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/40 text-sm"
            />
          </div>

          {/* Generate Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={generateVideo}
            disabled={generating || !videoData.prospect || !videoData.product}
            className="w-full px-4 py-3 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
          >
            {generating ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                Generate Marketing Video
              </>
            )}
          </motion.button>

          {/* Generated Video Preview */}
          {generatedVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-green-500/10 border border-green-400/30 rounded-lg p-4 space-y-3"
            >
              <p className="text-green-300 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Video Generated Successfully
              </p>
              <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                <Video className="w-12 h-12 text-white/40" />
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex-1 px-3 py-2 bg-cyan-500/20 border border-cyan-400 rounded text-cyan-300 hover:bg-cyan-500/30 flex items-center justify-center gap-2 text-sm font-semibold"
                >
                  <Download className="w-3 h-3" />
                  Download
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex-1 px-3 py-2 bg-purple-500/20 border border-purple-400 rounded text-purple-300 hover:bg-purple-500/30 flex items-center justify-center gap-2 text-sm font-semibold"
                >
                  <Share2 className="w-3 h-3" />
                  Share
                </motion.button>
              </div>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-3">
          <p className="text-white/60 text-sm">Choose from pre-built templates for faster video creation</p>
          {['Sales Pitch', 'Product Demo', 'Testimonial', 'Training'].map((template, idx) => (
            <motion.div
              key={template}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 cursor-pointer"
            >
              <p className="text-white font-semibold text-sm">{template}</p>
              <p className="text-white/60 text-xs mt-1">Pre-configured for quick use</p>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="library" className="space-y-3">
          <p className="text-white/60 text-sm">Your generated videos are stored here</p>
          <p className="text-white/40 text-sm text-center py-8">No videos yet. Create your first marketing video above.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}