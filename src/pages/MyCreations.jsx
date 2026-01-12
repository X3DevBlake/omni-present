import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Folder, Trash2, Edit, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

export default function MyCreations() {
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me().then(user => setUserEmail(user?.email)).catch(() => {});
  }, []);

  const { data: avatars = [], refetch: refetchAvatars } = useQuery({
    queryKey: ['myAvatars', userEmail],
    queryFn: () => base44.entities.UserAvatar.list({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const { data: objects = [], refetch: refetchObjects } = useQuery({
    queryKey: ['myObjects', userEmail],
    queryFn: () => base44.entities.UserObject.list({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const handleDelete = async (type, id) => {
    if (type === 'avatar') {
      await base44.entities.UserAvatar.delete(id);
      refetchAvatars();
    } else {
      await base44.entities.UserObject.delete(id);
      refetchObjects();
    }
  };

  const CreationCard = ({ creation, type }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 border border-white/10 rounded-lg p-4"
    >
      <div className="w-full h-40 bg-white/10 rounded mb-3 flex items-center justify-center">
        <Folder className="w-12 h-12 text-white/40" />
      </div>
      
      <h3 className="text-white font-semibold mb-2">
        {type === 'avatar' ? creation.avatar_name : creation.object_name}
      </h3>
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-white/60 text-xs">
          {creation.selected_components?.length || 0} components
        </span>
        {creation.public && <Eye className="w-4 h-4 text-green-400" />}
      </div>
      
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1">
          <Edit className="w-3 h-3 mr-1" />
          Edit
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => handleDelete(type, creation.id)}
          className="text-red-400 hover:text-red-300"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D1A] via-[#1a1a2e] to-[#0D0D1A] p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Creations</h1>
          <p className="text-white/60">Manage your custom avatars and objects</p>
        </motion.div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Avatars ({avatars.length})</h2>
            <Link to={createPageUrl('CharacterCustomizer')}>
              <Button className="bg-cyan-500 hover:bg-cyan-600">Create New Avatar</Button>
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {avatars.map(avatar => (
              <CreationCard key={avatar.id} creation={avatar} type="avatar" />
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Objects ({objects.length})</h2>
            <Link to={createPageUrl('ObjectCustomizer')}>
              <Button className="bg-purple-500 hover:bg-purple-600">Create New Object</Button>
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {objects.map(obj => (
              <CreationCard key={obj.id} creation={obj} type="object" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}