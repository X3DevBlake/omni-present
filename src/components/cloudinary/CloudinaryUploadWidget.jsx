import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Upload, Image, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function CloudinaryUploadWidget({ onUploadComplete, uploadPreset, cloudName }) {
  const [uploadedAssets, setUploadedAssets] = useState([]);
  const widgetRef = useRef(null);

  useEffect(() => {
    // Load Cloudinary widget script
    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const openWidget = () => {
    if (window.cloudinary) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: cloudName,
          uploadPreset: uploadPreset,
          sources: ['local', 'url', 'camera'],
          multiple: true,
          maxFiles: 10,
          cropping: true,
          croppingAspectRatio: 1,
          folder: 'base44_uploads',
          tags: ['base44', 'user_upload'],
          resourceType: 'auto'
        },
        (error, result) => {
          if (!error && result && result.event === 'success') {
            const asset = {
              public_id: result.info.public_id,
              secure_url: result.info.secure_url,
              format: result.info.format,
              resource_type: result.info.resource_type,
              width: result.info.width,
              height: result.info.height,
              created_at: result.info.created_at
            };
            setUploadedAssets(prev => [...prev, asset]);
            if (onUploadComplete) {
              onUploadComplete(asset);
            }
          }
        }
      );
      widgetRef.current.open();
    }
  };

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Upload className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">Cloudinary Upload</h3>
          <p className="text-white/60 text-sm">Upload images and videos</p>
        </div>
      </div>

      <Button onClick={openWidget} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 mb-4">
        <Upload className="w-4 h-4 mr-2" />
        Open Upload Widget
      </Button>

      {uploadedAssets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h4 className="text-white font-bold text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            Uploaded Assets ({uploadedAssets.length})
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {uploadedAssets.map((asset, idx) => (
              <div key={idx} className="relative aspect-video bg-black/40 rounded-lg overflow-hidden border border-white/10">
                {asset.resource_type === 'image' ? (
                  <img src={asset.secure_url} alt="Uploaded" className="w-full h-full object-cover" />
                ) : (
                  <video src={asset.secure_url} className="w-full h-full object-cover" controls />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </Card>
  );
}