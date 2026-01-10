import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Image as ImageIcon, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setImageUrl('');
    
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: prompt,
      });
      setImageUrl(result.url);
    } catch (error) {
      console.error('Image generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-white font-medium mb-2 block flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-purple-400" />
          Describe the image you want to create
        </label>
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="E.g., A futuristic city with flying cars at sunset..."
          className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
          disabled={loading}
          onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
        />
      </div>

      <Button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating Image... (5-10 seconds)
          </>
        ) : (
          <>
            <ImageIcon className="w-5 h-5 mr-2" />
            Generate Image
          </>
        )}
      </Button>

      {imageUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="relative rounded-lg overflow-hidden border border-purple-500/30">
            <img src={imageUrl} alt="Generated" className="w-full h-auto" />
          </div>
          <Button
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
            onClick={() => window.open(imageUrl, '_blank')}
          >
            <Download className="w-5 h-5 mr-2" />
            Download Image
          </Button>
        </motion.div>
      )}
    </div>
  );
}