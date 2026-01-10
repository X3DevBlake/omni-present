/**
 * Media Gallery Manager
 * Manage user-uploaded media and stock images
 * Associate media with goals, agents, transactions
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, Trash2, Link as LinkIcon, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function MediaGalleryManager({ 
  mediaAssets = [], 
  onUpload = null, 
  onFetchStock = null,
  onDelete = null,
  selectedEntity = null 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fetchingMedia, setFetchingMedia] = useState(false);
  const [mediaFilter, setMediaFilter] = useState('all');

  const filteredMedia = mediaAssets.filter(m => {
    const matchesSearch = m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = mediaFilter === 'all' || m.media_type === mediaFilter;
    return matchesSearch && matchesFilter;
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await onUpload?.({
        file,
        title: file.name,
        mediaType: file.type.startsWith('image') ? 'image' : 'video'
      });
      toast.success('Media uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const handleFetchStockMedia = async () => {
    setFetchingMedia(true);
    try {
      await onFetchStock?.({
        query: searchQuery || 'finance market portfolio',
        count: 5
      });
      toast.success('Stock media fetched');
    } catch (err) {
      toast.error('Failed to fetch media');
    } finally {
      setFetchingMedia(false);
    }
  };

  const sourceColors = {
    upload: 'bg-blue-500/20 text-blue-400',
    unsplash: 'bg-purple-500/20 text-purple-400',
    pexels: 'bg-green-500/20 text-green-400',
    cloudinary: 'bg-cyan-500/20 text-cyan-400'
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Section */}
      <Card className="bg-black/40 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-cyan-400" />
            Media Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-cyan-500/30 rounded-lg p-8 hover:border-cyan-400 transition-colors">
            <input
              type="file"
              id="mediaUpload"
              className="hidden"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <label
              htmlFor="mediaUpload"
              className="flex flex-col items-center gap-2 cursor-pointer"
            >
              <ImageIcon className="w-8 h-8 text-cyan-400" />
              <span className="text-white font-medium">
                {uploading ? 'Uploading...' : 'Click to upload or drag media'}
              </span>
              <span className="text-sm text-gray-400">PNG, JPG, MP4 up to 50MB</span>
            </label>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search media..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <Button
              onClick={handleFetchStockMedia}
              disabled={fetchingMedia}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {fetchingMedia ? 'Fetching...' : 'Fetch Stock Images'}
            </Button>
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            {['all', 'image', 'video', 'document'].map((type) => (
              <Badge
                key={type}
                variant={mediaFilter === type ? 'default' : 'outline'}
                className={`cursor-pointer ${
                  mediaFilter === type
                    ? 'bg-cyan-600'
                    : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10'
                }`}
                onClick={() => setMediaFilter(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMedia.map((media, idx) => (
          <motion.div
            key={media.id || idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative overflow-hidden rounded-lg border border-white/10 hover:border-cyan-400/50 transition-colors"
          >
            {/* Media Thumbnail */}
            <div className="aspect-video bg-black/50 relative overflow-hidden">
              {media.media_type === 'image' && (
                <img
                  src={media.url}
                  alt={media.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              {media.media_type === 'video' && (
                <video
                  src={media.url}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              {(!media.url || media.media_type === 'document') && (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-900/30 to-purple-900/30">
                  <ImageIcon className="w-8 h-8 text-cyan-400" />
                </div>
              )}

              {/* Delete Button */}
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onDelete?.(media.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Media Info */}
            <div className="p-3 bg-black/60">
              <h4 className="text-sm font-semibold text-white truncate">{media.title}</h4>
              <p className="text-xs text-gray-400 truncate">{media.description}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge className={sourceColors[media.source] || 'bg-gray-500/20 text-gray-400'}>
                  {media.source}
                </Badge>
                {media.associated_entity_type && (
                  <Badge className="bg-blue-500/20 text-blue-400">
                    {media.associated_entity_type}
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredMedia.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No media found. Upload or fetch stock images.</p>
        </div>
      )}
    </div>
  );
}