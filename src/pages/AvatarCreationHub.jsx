import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { User, Palette, Sparkles, Save, Eye } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import { toast } from 'sonner';

function Avatar3DPreview({ config }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Sphere args={[1, 32, 32]}>
        <meshStandardMaterial color={config.skinColor} />
      </Sphere>
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}

export default function AvatarCreationHub() {
  const [avatarConfig, setAvatarConfig] = useState({
    name: '',
    skinColor: '#ffdbac',
    hairStyle: 'short',
    eyeColor: '#4a90e2',
    height: 1.0,
    bodyType: 'average',
    clothing: 'casual',
    accessories: []
  });

  const saveAvatar = () => {
    toast.success('Avatar saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <User className="w-10 h-10 text-purple-500" />
            Character Avatar Creation
          </h1>
          <p className="text-gray-600">
            Design and customize your AI agent's appearance and personality
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* 3D Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-6 h-6" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-100 to-blue-100">
                <Avatar3DPreview config={avatarConfig} />
              </div>
              <div className="mt-4 flex gap-2">
                <Button className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Avatar
                </Button>
                <Button variant="outline">Export</Button>
              </div>
            </CardContent>
          </Card>

          {/* Customization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-6 h-6" />
                Customize Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  <TabsTrigger value="personality">Personality</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Avatar Name</label>
                    <Input
                      value={avatarConfig.name}
                      onChange={(e) => setAvatarConfig({ ...avatarConfig, name: e.target.value })}
                      placeholder="Enter name"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">Skin Color</label>
                    <input
                      type="color"
                      value={avatarConfig.skinColor}
                      onChange={(e) => setAvatarConfig({ ...avatarConfig, skinColor: e.target.value })}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">Hair Style</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['short', 'long', 'curly', 'bald', 'spiky', 'wavy'].map((style) => (
                        <Button
                          key={style}
                          variant={avatarConfig.hairStyle === style ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setAvatarConfig({ ...avatarConfig, hairStyle: style })}
                        >
                          {style}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">Body Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['slim', 'average', 'athletic', 'heavy'].map((type) => (
                        <Button
                          key={type}
                          variant={avatarConfig.bodyType === type ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setAvatarConfig({ ...avatarConfig, bodyType: type })}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Height: {avatarConfig.height.toFixed(2)}m</label>
                    <Slider
                      value={[avatarConfig.height]}
                      onValueChange={([val]) => setAvatarConfig({ ...avatarConfig, height: val })}
                      min={0.5}
                      max={2.5}
                      step={0.01}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">Clothing Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['casual', 'formal', 'sporty', 'futuristic', 'fantasy', 'cyberpunk'].map((style) => (
                        <Button
                          key={style}
                          variant={avatarConfig.clothing === style ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setAvatarConfig({ ...avatarConfig, clothing: style })}
                        >
                          {style}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">Accessories</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['glasses', 'hat', 'watch', 'earrings', 'necklace', 'backpack'].map((acc) => (
                        <Badge
                          key={acc}
                          variant={avatarConfig.accessories?.includes(acc) ? 'default' : 'outline'}
                          className="cursor-pointer justify-center py-2"
                          onClick={() => {
                            const newAcc = avatarConfig.accessories?.includes(acc)
                              ? avatarConfig.accessories.filter(a => a !== acc)
                              : [...(avatarConfig.accessories || []), acc];
                            setAvatarConfig({ ...avatarConfig, accessories: newAcc });
                          }}
                        >
                          {acc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="personality" className="space-y-4">
                  <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                    <h4 className="font-semibold mb-3">Personality Traits</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm mb-1 block">Friendliness</label>
                        <Slider defaultValue={[50]} min={0} max={100} />
                      </div>
                      <div>
                        <label className="text-sm mb-1 block">Confidence</label>
                        <Slider defaultValue={[70]} min={0} max={100} />
                      </div>
                      <div>
                        <label className="text-sm mb-1 block">Creativity</label>
                        <Slider defaultValue={[60]} min={0} max={100} />
                      </div>
                      <div>
                        <label className="text-sm mb-1 block">Analytical</label>
                        <Slider defaultValue={[80]} min={0} max={100} />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}