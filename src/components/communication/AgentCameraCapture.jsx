import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Video, Send, Loader, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AgentCameraCapture({ onObjectDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturedMedia, setCapturedMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    } catch (err) {
      toast.error('Camera access denied');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 1280, 720);
        canvasRef.current.toBlob(blob => {
          if (blob) setCapturedMedia({ type: 'photo', blob });
        });
      }
    }
  };

  const startRecording = () => {
    if (videoRef.current && stream) {
      chunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = e => chunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setCapturedMedia({ type: 'video', blob });
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeMedia = async () => {
    if (!capturedMedia) return;

    setLoading(true);
    try {
      // Upload media
      const { file_url } = await base44.integrations.Core.UploadFile({
        file: capturedMedia.blob
      });

      // Analyze with vision
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this ${capturedMedia.type} and identify all objects present. For each object, describe:
1. Object name
2. Location in image (left/center/right, top/middle/bottom)
3. Size (small/medium/large)
4. Color/appearance
5. What actions or states it's in

Format as JSON array with objects like: {name, location, size, color, state}`,
        file_urls: [file_url],
        response_json_schema: {
          type: 'object',
          properties: {
            objects: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  location: { type: 'string' },
                  size: { type: 'string' },
                  color: { type: 'string' },
                  state: { type: 'string' }
                }
              }
            },
            description: { type: 'string' }
          }
        }
      });

      setDetectedObjects(response);
      onObjectDetected?.(response);
      toast.success('Objects detected and analyzed!');
    } catch (err) {
      toast.error('Failed to analyze media');
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCapturedMedia(null);
      setDetectedObjects(null);
    }
  };

  return (
    <div className="space-y-4">
      {!capturedMedia ? (
        <div className="bg-black/40 border border-cyan-500/30 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">📸 Capture & Recognize Objects</h3>
          
          {!stream ? (
            <motion.button
              onClick={startCamera}
              whileHover={{ scale: 1.05 }}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Start Camera
            </motion.button>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-80 bg-black rounded-xl mb-4 object-cover"
              />
              <canvas ref={canvasRef} className="hidden" width={1280} height={720} />
              
              <div className="flex gap-2 flex-wrap">
                <motion.button
                  onClick={capturePhoto}
                  whileHover={{ scale: 1.05 }}
                  className="flex-1 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Photo
                </motion.button>
                
                <motion.button
                  onClick={isRecording ? stopRecording : startRecording}
                  whileHover={{ scale: 1.05 }}
                  className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
                    isRecording
                      ? 'bg-red-500/20 border border-red-500/40 text-red-300'
                      : 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  {isRecording ? 'Stop' : 'Record'}
                </motion.button>

                <motion.button
                  onClick={stopCamera}
                  whileHover={{ scale: 1.05 }}
                  className="flex-1 py-2 bg-red-500/20 border border-red-500/40 text-red-300 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Close
                </motion.button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">📊 Analyzing Media...</h3>
          
          {capturedMedia.type === 'photo' ? (
            <img
              src={URL.createObjectURL(capturedMedia.blob)}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          ) : (
            <video
              src={URL.createObjectURL(capturedMedia.blob)}
              controls
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}

          <div className="flex gap-2">
            <motion.button
              onClick={analyzeMedia}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Analyzing...' : 'Analyze & Add to Simulation'}
            </motion.button>
            
            <motion.button
              onClick={() => setCapturedMedia(null)}
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg"
            >
              Retake
            </motion.button>
          </div>

          {detectedObjects && (
            <div className="mt-4 bg-black/60 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-400 text-sm mb-2 font-bold">✓ Objects Detected:</p>
              <div className="space-y-2">
                {detectedObjects.objects?.map((obj, i) => (
                  <div key={i} className="text-white/70 text-xs">
                    <span className="text-cyan-400">{obj.name}</span> - {obj.location}, {obj.size}
                  </div>
                ))}
              </div>
              <p className="text-white/60 text-xs mt-3 italic">{detectedObjects.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}