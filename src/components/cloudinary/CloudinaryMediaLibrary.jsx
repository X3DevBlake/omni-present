import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FolderOpen, Image } from 'lucide-react';

export default function CloudinaryMediaLibrary({ onAssetSelect, cloudName, apiKey }) {
  const [selectedAssets, setSelectedAssets] = useState([]);
  const mlRef = useRef(null);

  useEffect(() => {
    // Load Media Library script
    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://media-library.cloudinary.com/global/all.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const openMediaLibrary = () => {
    if (window.cloudinary) {
      mlRef.current = window.cloudinary.createMediaLibrary(
        {
          cloud_name: cloudName,
          api_key: apiKey,
          multiple: true,
          max_files: 10,
          insert_caption: 'Select'
        },
        {
          insertHandler: (data) => {
            const assets = data.assets.map(asset => ({
              public_id: asset.public_id,
              secure_url: asset.secure_url,
              format: asset.format,
              resource_type: asset.resource_type,
              width: asset.width,
              height: asset.height
            }));
            setSelectedAssets(assets);
            if (onAssetSelect) {
              onAssetSelect(assets);
            }
          }
        }
      );
      mlRef.current.show();
    }
  };

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <FolderOpen className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">Media Library</h3>
          <p className="text-white/60 text-sm">Browse and select assets</p>
        </div>
      </div>

      <Button onClick={openMediaLibrary} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
        <FolderOpen className="w-4 h-4 mr-2" />
        Open Media Library
      </Button>

      {selectedAssets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h4 className="text-white font-bold text-sm">Selected Assets ({selectedAssets.length})</h4>
          <div className="grid grid-cols-2 gap-3">
            {selectedAssets.map((asset, idx) => (
              <div key={idx} className="relative aspect-video bg-black/40 rounded-lg overflow-hidden border border-white/10">
                <img src={asset.secure_url} alt={asset.public_id} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </Card>
  );
}