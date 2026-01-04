import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Video, Image, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import GlassCard from './GlassCard';

export default function MediaUploader({ onBlueprintGenerated, onClose }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    // Validate files
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isUnder60Min = file.size < 3600 * 1024 * 1024; // ~60 min at reasonable quality
      
      if (!isImage && !isVideo) {
        toast.error(`${file.name}: Only images and videos are supported`);
        return false;
      }
      
      if (isVideo && !isUnder60Min) {
        toast.error(`${file.name}: Video must be under 60 minutes`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      const uploadedUrls = [];
      
      for (const file of validFiles) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push({
          url: file_url,
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          size: file.size
        });
      }
      
      setUploadedFiles(prev => [...prev, ...uploadedUrls]);
      toast.success(`${validFiles.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const analyzeAndGenerateBlueprint = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    setIsAnalyzing(true);

    try {
      const fileUrls = uploadedFiles.map(f => f.url);
      const hasVideo = uploadedFiles.some(f => f.type === 'video');
      
      // Call AI to analyze media and extract blueprint requirements
      const prompt = `
        Analyze the provided ${hasVideo ? 'video and/or ' : ''}images to understand the AI infrastructure requirements being visualized or described.
        
        Extract the following information:
        1. Type of AI workload (training, inference, mixed, research)
        2. Required compute resources (number and type of GPUs/TPUs)
        3. Memory requirements
        4. Network/interconnect needs
        5. Storage capacity
        6. Performance targets
        7. Budget constraints if mentioned
        8. Any specific hardware components visible or described
        
        Return a structured blueprint configuration that matches what is shown in the media.
      `;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: fileUrls,
        response_json_schema: {
          type: 'object',
          properties: {
            workload_type: { type: 'string' },
            gpu_count: { type: 'number' },
            gpu_model: { type: 'string' },
            memory_gb: { type: 'number' },
            storage_tb: { type: 'number' },
            network_speed_gbps: { type: 'number' },
            budget_tier: { type: 'string' },
            performance_target: { type: 'string' },
            components: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  name: { type: 'string' },
                  specs: { type: 'string' }
                }
              }
            },
            confidence: { type: 'number' },
            notes: { type: 'string' }
          }
        }
      });

      setAnalysisResult(response);
      
      // Generate blueprint from analysis
      const blueprintConfig = {
        name: `AI-Generated from Media`,
        workload: response.workload_type || 'ai-training',
        budget: response.budget_tier || 'medium',
        scale: response.gpu_count > 8 ? 'large' : response.gpu_count > 4 ? 'medium' : 'small',
        priority: response.performance_target || 'balanced',
        mediaAnalysis: {
          sourceFiles: uploadedFiles.map(f => f.name),
          confidence: response.confidence,
          notes: response.notes
        }
      };

      onBlueprintGenerated?.(blueprintConfig);
      toast.success('Blueprint generated from media analysis');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to analyze media');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Upload className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">AI Blueprint from Media</h2>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Upload Area */}
          <label className="block mb-6">
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-500/40 transition-colors">
              <Upload className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <div className="text-white mb-2">
                Drag & drop or click to upload
              </div>
              <div className="text-white/50 text-sm">
                Images (PNG, JPG) or Videos (MP4, up to 60 minutes)
              </div>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </div>
          </label>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Uploaded Files</h3>
              <div className="space-y-2">
                {uploadedFiles.map((file, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    {file.type === 'video' ? (
                      <Video className="w-5 h-5 text-purple-400" />
                    ) : (
                      <Image className="w-5 h-5 text-cyan-400" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm truncate">{file.name}</div>
                      <div className="text-white/40 text-xs">{formatFileSize(file.size)}</div>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="text-white/40 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Result */}
          <AnimatePresence>
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30"
              >
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white font-semibold">Analysis Complete</span>
                  <span className="ml-auto text-cyan-400 text-sm">
                    {Math.round(analysisResult.confidence * 100)}% confidence
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-white/50">Workload:</span>
                    <span className="text-white ml-2">{analysisResult.workload_type}</span>
                  </div>
                  <div>
                    <span className="text-white/50">GPUs:</span>
                    <span className="text-white ml-2">{analysisResult.gpu_count}x {analysisResult.gpu_model}</span>
                  </div>
                  <div>
                    <span className="text-white/50">Memory:</span>
                    <span className="text-white ml-2">{analysisResult.memory_gb}GB</span>
                  </div>
                  <div>
                    <span className="text-white/50">Storage:</span>
                    <span className="text-white ml-2">{analysisResult.storage_tb}TB</span>
                  </div>
                </div>
                {analysisResult.notes && (
                  <div className="mt-3 pt-3 border-t border-white/10 text-white/70 text-xs">
                    {analysisResult.notes}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={analyzeAndGenerateBlueprint}
              disabled={uploadedFiles.length === 0 || isAnalyzing}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Blueprint from Media
                </>
              )}
            </button>
          </div>

          {isUploading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-cyan-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Uploading files...</span>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}