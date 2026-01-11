import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Video } from 'lucide-react';

export default function CloudinaryVideoPlayer({ publicId, cloudName, transformations = {} }) {
  const playerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    // Load Cloudinary video player script and styles
    if (!document.getElementById('cloudinary-player-styles')) {
      const link = document.createElement('link');
      link.id = 'cloudinary-player-styles';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/cloudinary-video-player@1.10.4/dist/cld-video-player.min.css';
      document.head.appendChild(link);
    }

    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/cloudinary-video-player@1.10.4/dist/cld-video-player.min.js';
      script.async = true;
      script.onload = initializePlayer;
      document.body.appendChild(script);
    } else {
      initializePlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [publicId, cloudName]);

  const initializePlayer = () => {
    if (window.cloudinary && videoRef.current && publicId) {
      playerRef.current = window.cloudinary.videoPlayer(videoRef.current, {
        cloud_name: cloudName,
        controls: true,
        fluid: true,
        autoplay: false,
        muted: false,
        transformation: transformations,
        colors: {
          accent: '#00f5ff',
          base: '#000000',
          text: '#ffffff'
        }
      });
      
      playerRef.current.source(publicId);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-cyan-500/20 rounded-lg">
          <Video className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">Cloudinary Video Player</h3>
          <p className="text-white/60 text-sm">Optimized video playback</p>
        </div>
      </div>

      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="cld-video-player w-full h-full"
        />
      </div>
    </Card>
  );
}