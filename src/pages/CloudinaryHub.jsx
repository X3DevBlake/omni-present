import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import AuroraBackground from '../components/omni/AuroraBackground';
import CloudinaryUploadWidget from '../components/cloudinary/CloudinaryUploadWidget';
import CloudinaryMediaLibrary from '../components/cloudinary/CloudinaryMediaLibrary';
import CloudinaryVideoPlayer from '../components/cloudinary/CloudinaryVideoPlayer';
import CloudinaryImageOptimizer from '../components/cloudinary/CloudinaryImageOptimizer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Cloud, Upload, FolderOpen, Video, Zap, Image, Tag } from 'lucide-react';

export default function CloudinaryHub() {
  const [cloudName, setCloudName] = useState('demo');
  const [apiKey, setApiKey] = useState('');
  const [uploadPreset, setUploadPreset] = useState('ml_default');
  const [videoPublicId, setVideoPublicId] = useState('samples/sea-turtle');
  const [searchTag, setSearchTag] = useState('shoes');
  const [taggedAssets, setTaggedAssets] = useState([]);

  const fetchTagged = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/fetch-tagged-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: searchTag })
      });

      if (!response.ok) throw new Error('Failed to fetch assets');
      return response.json();
    },
    onSuccess: (data) => {
      setTaggedAssets(data.resources || []);
    }
  });

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl">
              <Cloud className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Cloudinary Hub</h1>
              <p className="text-white/60">Media management & optimization platform</p>
            </div>
          </div>
        </motion.div>

        {/* Configuration */}
        <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6 mb-6">
          <h3 className="text-white font-bold mb-4">Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-white/80 text-sm mb-2 block">Cloud Name</label>
              <Input
                value={cloudName}
                onChange={(e) => setCloudName(e.target.value)}
                placeholder="demo"
                className="bg-white/5 border-white/10"
              />
            </div>
            <div>
              <label className="text-white/80 text-sm mb-2 block">API Key (optional)</label>
              <Input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Your API key"
                className="bg-white/5 border-white/10"
              />
            </div>
            <div>
              <label className="text-white/80 text-sm mb-2 block">Upload Preset</label>
              <Input
                value={uploadPreset}
                onChange={(e) => setUploadPreset(e.target.value)}
                placeholder="ml_default"
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>
        </Card>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white/5 border border-white/10">
            <TabsTrigger value="upload" className="data-[state=active]:bg-blue-500/20">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="library" className="data-[state=active]:bg-purple-500/20">
              <FolderOpen className="w-4 h-4 mr-2" />
              Library
            </TabsTrigger>
            <TabsTrigger value="video" className="data-[state=active]:bg-cyan-500/20">
              <Video className="w-4 h-4 mr-2" />
              Video
            </TabsTrigger>
            <TabsTrigger value="optimize" className="data-[state=active]:bg-green-500/20">
              <Zap className="w-4 h-4 mr-2" />
              Optimize
            </TabsTrigger>
            <TabsTrigger value="tagged" className="data-[state=active]:bg-pink-500/20">
              <Tag className="w-4 h-4 mr-2" />
              Tagged
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6 mt-6">
            <CloudinaryUploadWidget
              cloudName={cloudName}
              uploadPreset={uploadPreset}
              onUploadComplete={(asset) => console.log('Uploaded:', asset)}
            />
          </TabsContent>

          <TabsContent value="library" className="space-y-6 mt-6">
            <CloudinaryMediaLibrary
              cloudName={cloudName}
              apiKey={apiKey}
              onAssetSelect={(assets) => console.log('Selected:', assets)}
            />
          </TabsContent>

          <TabsContent value="video" className="space-y-6 mt-6">
            <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6 mb-4">
              <label className="text-white/80 text-sm mb-2 block">Video Public ID</label>
              <Input
                value={videoPublicId}
                onChange={(e) => setVideoPublicId(e.target.value)}
                placeholder="samples/sea-turtle"
                className="bg-white/5 border-white/10"
              />
            </Card>
            <CloudinaryVideoPlayer
              cloudName={cloudName}
              publicId={videoPublicId}
              transformations={{ quality: 'auto' }}
            />
          </TabsContent>

          <TabsContent value="optimize" className="space-y-6 mt-6">
            <CloudinaryImageOptimizer cloudName={cloudName} />
          </TabsContent>

          <TabsContent value="tagged" className="space-y-6 mt-6">
            <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-pink-500/20 rounded-lg">
                  <Tag className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Tagged Assets</h3>
                  <p className="text-white/60 text-sm">Search assets by tag</p>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <Input
                  value={searchTag}
                  onChange={(e) => setSearchTag(e.target.value)}
                  placeholder="Enter tag (e.g., shoes)"
                  className="bg-white/5 border-white/10"
                />
                <Button
                  onClick={() => fetchTagged.mutate()}
                  disabled={fetchTagged.isPending}
                  className="bg-gradient-to-r from-pink-500 to-rose-500"
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>

              {fetchTagged.isPending && (
                <p className="text-white/60 text-center py-4">Loading...</p>
              )}

              {taggedAssets.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4"
                >
                  {taggedAssets.map((asset, idx) => (
                    <div key={idx} className="aspect-square bg-black/40 rounded-lg overflow-hidden border border-white/10">
                      <img src={asset.secure_url} alt={asset.public_id} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </motion.div>
              )}

              {!fetchTagged.isPending && taggedAssets.length === 0 && searchTag && (
                <p className="text-white/40 text-center py-8">No assets found with tag "{searchTag}"</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}