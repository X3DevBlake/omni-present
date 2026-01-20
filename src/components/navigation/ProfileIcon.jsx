import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProfileIcon() {
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me()
      .then(userData => {
        setUser(userData);
        if (userData.profile_image_url) {
          setProfileImage(userData.profile_image_url);
        }
      })
      .catch(() => {});
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ profile_image_url: file_url });
      setProfileImage(file_url);
    } catch (error) {
      console.error('Failed to upload profile image:', error);
    }
  };

  if (!user) return null;

  const initials = user.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full blur-md opacity-0 group-hover:opacity-75 transition-opacity" />
          <Avatar className="w-10 h-10 border-2 border-white/20 relative">
            <AvatarImage src={profileImage} alt={user.full_name} />
            <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-purple-600 text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-black/95 border-white/20 text-white">
        <div className="px-2 py-3 border-b border-white/10">
          <p className="font-semibold">{user.full_name}</p>
          <p className="text-xs text-white/60">{user.email}</p>
        </div>
        
        <DropdownMenuItem
          onClick={() => navigate(createPageUrl('Profile'))}
          className="cursor-pointer hover:bg-white/10"
        >
          <User className="w-4 h-4 mr-2" />
          View Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => navigate(createPageUrl('Settings'))}
          className="cursor-pointer hover:bg-white/10"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer hover:bg-white/10">
          <label className="flex items-center cursor-pointer w-full">
            <Upload className="w-4 h-4 mr-2" />
            Upload Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-white/10" />
        
        <DropdownMenuItem
          onClick={() => base44.auth.logout()}
          className="cursor-pointer hover:bg-white/10 text-red-400"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}