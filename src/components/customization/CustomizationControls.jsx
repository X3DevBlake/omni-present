import React, { useState } from 'react';
import { Save, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export default function CustomizationControls({ 
  onSave, 
  onClear, 
  avatarName, 
  setAvatarName,
  isPublic,
  setIsPublic,
  saving 
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <div className="space-y-4">
        <div>
          <label className="text-white/60 text-xs mb-2 block">Creation Name</label>
          <Input
            value={avatarName}
            onChange={(e) => setAvatarName(e.target.value)}
            placeholder="My Awesome Avatar"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-white/60 text-xs">Make Public</label>
          <div className="flex items-center gap-2">
            {isPublic ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4 text-white/40" />}
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={onClear} variant="outline" className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button onClick={onSave} disabled={saving} className="flex-1 bg-cyan-500 hover:bg-cyan-600">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}