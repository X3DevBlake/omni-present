import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveVideoPlayer from '../media/InteractiveVideoPlayer';
import Interactive3DModel from '../media/Interactive3DModel';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Box, Image } from 'lucide-react';

export default function MediaShowcase3D() {
  const [selectedMedia, setSelectedMedia] = useState('video');

  const videoSamples = [
    { id: 1, title: 'Agent Collaboration Demo', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', poster: '' },
    { id: 2, title: 'Trading Simulation', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', poster: '' },
    { id: 3, title: 'AI Training Process', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', poster: '' }
  ];

  const model3DSamples = [
    { id: 1, title: 'Neural Network', geometry: 'sphere', color: '#a855f7' },
    { id: 2, title: 'Data Flow', geometry: 'torus', color: '#00f5ff' },
    { id: 3, title: 'Agent Structure', geometry: 'box', color: '#10b981' },
    { id: 4, title: 'Market Signal', geometry: 'cone', color: '#f59e0b' }
  ];

  return (
    <div className="space-y-6">
      <Tabs value={selectedMedia} onValueChange={setSelectedMedia} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
          <TabsTrigger value="video" className="data-[state=active]:bg-cyan-500/20">
            <Video className="w-4 h-4 mr-2" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="3d" className="data-[state=active]:bg-purple-500/20">
            <Box className="w-4 h-4 mr-2" />
            3D Models
          </TabsTrigger>
          <TabsTrigger value="images" className="data-[state=active]:bg-green-500/20">
            <Image className="w-4 h-4 mr-2" />
            Images
          </TabsTrigger>
        </TabsList>

        {/* Videos Tab */}
        <TabsContent value="video" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoSamples.map((video) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: video.id * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-4">
                  <h4 className="text-white font-bold mb-3">{video.title}</h4>
                  <InteractiveVideoPlayer
                    src={video.src}
                    poster={video.poster}
                    className="h-48"
                  />
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* 3D Models Tab */}
        <TabsContent value="3d" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {model3DSamples.map((model) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: model.id * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-4">
                  <h4 className="text-white font-bold mb-3">{model.title}</h4>
                  <Interactive3DModel
                    geometry={model.geometry}
                    color={model.color}
                    className="h-64"
                  />
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer"
              >
                <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-4">
                  <div className="aspect-video bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                    <Image className="w-12 h-12 text-white/40" />
                  </div>
                  <p className="text-white text-sm mt-2">Interactive Image {idx}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}