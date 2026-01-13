import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import VideoCard3D from './VideoCard3D';
import { Upload, Palette, Layers, Sparkles, Video, Image as ImageIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function CardCustomizer({ userEmail }) {
  const [videoUrl, setVideoUrl] = useState('https://res.cloudinary.com/demo/video/upload/v1/dog.mp4'); // Default placeholder
  const [cardType, setCardType] = useState('video');
  const [customization, setCustomization] = useState({
    color: '#000000',
    material: 'metal',
    texture: 'smooth',
    elements: []
  });

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    },
    onSuccess: (url) => {
      setVideoUrl(url);
      toast.success('Media uploaded successfully!');
    }
  });

  const createCardMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.OmniCardExtended.create({
        user_email: userEmail,
        type: cardType,
        video_url: cardType === 'video' ? videoUrl : null,
        customization,
        status: 'active',
        spending_limit: 5000,
        expiry_date: new Date(Date.now() + 31536000000 * 3).toISOString() // 3 years
      });
    },
    onSuccess: () => {
      toast.success('Custom Omni Card created successfully!');
    }
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
      {/* 3D Preview */}
      <div className="bg-black/40 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-white/80 text-sm">
          Live 3D Preview
        </div>
        <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <VideoCard3D 
            videoUrl={cardType === 'video' ? videoUrl : null} 
            cardData={{ name: 'YOUR NAME', number: '•••• •••• •••• 4242' }}
          />
          <ContactShadows position={[0, -1.4, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
        </Canvas>
      </div>

      {/* Controls */}
      <Card className="bg-white/5 border-white/10 flex flex-col h-full">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-cyan-400" />
            Card Studio
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto pr-2">
          <Tabs defaultValue="type" className="w-full">
            <TabsList className="bg-white/5 border border-white/10 w-full grid grid-cols-4">
              <TabsTrigger value="type"><Layers className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="media"><Video className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="style"><Sparkles className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="components"><Palette className="w-4 h-4" /></TabsTrigger>
            </TabsList>

            <TabsContent value="type" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {['standard', 'premium', 'metal', 'video', 'holographic'].map(type => (
                  <Button
                    key={type}
                    onClick={() => setCardType(type)}
                    className={`capitalize ${cardType === type ? 'bg-cyan-500 hover:bg-cyan-600' : 'bg-white/5 hover:bg-white/10'}`}
                  >
                    {type} Card
                  </Button>
                ))}
              </div>
              <div className="bg-white/5 p-4 rounded-lg text-sm text-white/60">
                <p>The <strong>Video Card</strong> allows you to upload a loopable video that plays directly on the physical card's surface.</p>
              </div>
            </TabsContent>

            <TabsContent value="media" className="mt-4 space-y-4">
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-cyan-500/50 transition-colors">
                <Input 
                  type="file" 
                  accept="video/*,image/*" 
                  className="hidden" 
                  id="media-upload"
                  onChange={handleFileUpload}
                />
                <label htmlFor="media-upload" className="cursor-pointer block">
                  {uploadMutation.isPending ? (
                    <div className="text-cyan-400">Uploading...</div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-white/40 mx-auto mb-3" />
                      <p className="text-white/80 font-medium">Upload Card Face Video</p>
                      <p className="text-white/40 text-xs mt-1">MP4, WEBM (Max 50MB)</p>
                    </>
                  )}
                </label>
              </div>
            </TabsContent>

            <TabsContent value="style" className="mt-4 space-y-6">
              <div>
                <label className="text-white text-sm mb-2 block">Base Material</label>
                <div className="flex gap-2">
                  {['Matte', 'Glossy', 'Carbon', 'Brushed'].map(mat => (
                    <Button key={mat} size="sm" variant="outline" className="flex-1 text-xs">{mat}</Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">Accent Color</label>
                <div className="grid grid-cols-6 gap-2">
                  {['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6'].map(color => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full border border-white/20"
                      style={{ backgroundColor: color }}
                      onClick={() => setCustomization({ ...customization, color })}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="components" className="mt-4">
              <div className="text-center py-8 text-white/40">
                <p>1500+ Components Library loading...</p>
                <div className="grid grid-cols-3 gap-2 mt-4 opacity-50">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="h-12 bg-white/10 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button 
            className="w-full mt-8 bg-gradient-to-r from-cyan-500 to-purple-500 text-white h-12 text-lg font-bold"
            onClick={() => createCardMutation.mutate()}
            disabled={createCardMutation.isPending}
          >
            {createCardMutation.isPending ? 'Minting Card...' : 'Order Custom Card'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}