import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

export default function CommunityCreations() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: avatars = [] } = useQuery({
    queryKey: ['publicAvatars'],
    queryFn: () => base44.entities.UserAvatar.list({ public: true })
  });

  const { data: objects = [] } = useQuery({
    queryKey: ['publicObjects'],
    queryFn: () => base44.entities.UserObject.list({ public: true })
  });

  const handleLike = async (type, id, currentLikes) => {
    if (type === 'avatar') {
      await base44.entities.UserAvatar.update(id, { likes: currentLikes + 1 });
    } else {
      await base44.entities.UserObject.update(id, { likes: currentLikes + 1 });
    }
  };

  const CreationCard = ({ creation, type }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 border border-white/10 rounded-lg p-4"
    >
      <div className="w-full h-48 bg-white/10 rounded mb-3 flex items-center justify-center">
        <Eye className="w-12 h-12 text-white/40" />
      </div>
      
      <h3 className="text-white font-semibold mb-1">
        {type === 'avatar' ? creation.avatar_name : creation.object_name}
      </h3>
      
      <p className="text-white/60 text-xs mb-3">by {creation.user_email?.split('@')[0]}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-white/60 text-xs">
          <span>{creation.selected_components?.length || 0} parts</span>
        </div>
        <button
          onClick={() => handleLike(type, creation.id, creation.likes || 0)}
          className="flex items-center gap-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400"
        >
          <Heart className="w-3 h-3" />
          <span className="text-xs">{creation.likes || 0}</span>
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D1A] via-[#1a1a2e] to-[#0D0D1A] p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-cyan-400" />
            Community Creations
          </h1>
          <p className="text-white/60">Discover amazing creations from the community</p>
        </motion.div>

        <div className="mb-6">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search creations..."
            className="bg-white/5 border-white/10 text-white max-w-md"
          />
        </div>

        <Tabs defaultValue="avatars">
          <TabsList className="mb-6">
            <TabsTrigger value="avatars">Avatars ({avatars.length})</TabsTrigger>
            <TabsTrigger value="objects">Objects ({objects.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="avatars">
            <div className="grid grid-cols-4 gap-4">
              {avatars.map(avatar => (
                <CreationCard key={avatar.id} creation={avatar} type="avatar" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="objects">
            <div className="grid grid-cols-4 gap-4">
              {objects.map(obj => (
                <CreationCard key={obj.id} creation={obj} type="object" />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}