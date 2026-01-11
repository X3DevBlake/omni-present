import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Image } from 'lucide-react';

export default function CloudinaryImageOptimizer({ cloudName }) {
  const [publicId, setPublicId] = useState('');
  const [format, setFormat] = useState('auto');
  const [quality, setQuality] = useState('auto');
  const [width, setWidth] = useState('');
  const [optimizedUrl, setOptimizedUrl] = useState('');

  const generateOptimizedUrl = () => {
    if (!publicId) return;

    let url = `https://res.cloudinary.com/${cloudName}/image/upload/`;
    
    const transformations = [];
    if (format) transformations.push(`f_${format}`);
    if (quality) transformations.push(`q_${quality}`);
    if (width) transformations.push(`w_${width}`);
    transformations.push('c_limit');

    url += transformations.join(',') + '/' + publicId;
    setOptimizedUrl(url);
  };

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <Zap className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">Image Optimizer</h3>
          <p className="text-white/60 text-sm">Optimize images with transformations</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-white/80 text-sm mb-2 block">Public ID</label>
          <Input
            value={publicId}
            onChange={(e) => setPublicId(e.target.value)}
            placeholder="e.g., samples/animals/cat"
            className="bg-white/5 border-white/10"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-white/80 text-sm mb-2 block">Format</label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
                <SelectItem value="avif">AVIF</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-white/80 text-sm mb-2 block">Quality</label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="auto:best">Auto Best</SelectItem>
                <SelectItem value="auto:good">Auto Good</SelectItem>
                <SelectItem value="auto:eco">Auto Eco</SelectItem>
                <SelectItem value="auto:low">Auto Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-white/80 text-sm mb-2 block">Width (optional)</label>
          <Input
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            placeholder="e.g., 800"
            className="bg-white/5 border-white/10"
          />
        </div>

        <Button onClick={generateOptimizedUrl} className="w-full bg-gradient-to-r from-green-500 to-emerald-500">
          <Zap className="w-4 h-4 mr-2" />
          Generate Optimized URL
        </Button>

        {optimizedUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="aspect-video bg-black/40 rounded-lg overflow-hidden border border-white/10">
              <img src={optimizedUrl} alt="Optimized" className="w-full h-full object-contain" />
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-white/60 text-xs break-all">{optimizedUrl}</p>
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
}