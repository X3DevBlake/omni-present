import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Box, Globe } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AssetImportPanel({ userEmail, simulationId }) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      await base44.entities.UserGeneratedAsset.create({
        user_email: userEmail,
        asset_name: file.name,
        asset_type: '3d_model',
        file_url,
        format: file.name.split('.').pop(),
        compatible_simulations: [simulationId],
        public: false
      });
      
      alert('Asset uploaded successfully!');
      setFile(null);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/5 border border-white/10 rounded-lg p-4">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Box className="w-5 h-5 text-purple-400" />
        Import Custom Assets
      </h3>
      
      <div className="space-y-3">
        <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 text-white/40 mx-auto mb-2" />
          <input type="file" accept=".glb,.gltf,.obj,.fbx" onChange={(e) => setFile(e.target.files[0])} className="hidden" id="asset-upload" />
          <label htmlFor="asset-upload" className="text-cyan-400 cursor-pointer hover:text-cyan-300">
            {file ? file.name : 'Click to upload 3D model'}
          </label>
          <p className="text-white/40 text-xs mt-1">GLB, GLTF, OBJ, FBX</p>
        </div>

        <button onClick={handleUpload} disabled={!file || uploading} className="w-full px-4 py-2 bg-purple-500/20 border border-purple-400 text-purple-300 rounded hover:bg-purple-500/30 disabled:opacity-50">
          {uploading ? 'Uploading...' : 'Import to Simulation'}
        </button>
      </div>
    </motion.div>
  );
}