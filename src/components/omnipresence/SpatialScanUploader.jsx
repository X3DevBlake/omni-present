import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, Scan, FileType, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SpatialScanUploader({ spatialMapId, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [scanName, setScanName] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const supportedFormats = ['.obj', '.glb', '.gltf', '.ply', '.fbx', '.stl'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!supportedFormats.includes(fileExtension)) {
      toast.error('Unsupported file format. Use .obj, .glb, .gltf, .ply, .fbx, or .stl');
      return;
    }

    try {
      setUploading(true);
      
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      setUploading(false);
      setProcessing(true);

      // Process with AI
      const response = await base44.functions.invoke('process-3d-scan-upload', {
        scan_name: scanName || file.name,
        file_url,
        file_format: fileExtension.replace('.', ''),
        spatial_map_id: spatialMapId
      });

      setProcessing(false);
      
      if (response.data.success) {
        toast.success(`Scan processed: ${response.data.features_detected} features detected`);
        onUploadComplete?.(response.data.scan);
      }
    } catch (error) {
      setUploading(false);
      setProcessing(false);
      toast.error('Upload failed: ' + error.message);
    }
  };

  return (
    <Card className="bg-slate-900/60 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Upload className="w-5 h-5 text-cyan-400" />
          Upload 3D Spatial Scan
        </CardTitle>
        <p className="text-slate-400 text-sm">
          Upload .obj, .glb, .gltf, .ply, .fbx, or .stl files for precise environment mapping
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Scan name (e.g., Living Room Scan)"
          value={scanName}
          onChange={(e) => setScanName(e.target.value)}
          className="bg-slate-800 border-slate-700 text-white"
        />

        <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-cyan-500 transition-colors">
          <input
            type="file"
            id="scan-upload"
            className="hidden"
            accept=".obj,.glb,.gltf,.ply,.fbx,.stl"
            onChange={handleFileUpload}
            disabled={uploading || processing}
          />
          <label htmlFor="scan-upload" className="cursor-pointer">
            {uploading ? (
              <Loader2 className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-spin" />
            ) : processing ? (
              <Scan className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-pulse" />
            ) : (
              <Upload className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            )}
            <p className="text-white font-medium mb-2">
              {uploading ? 'Uploading...' : processing ? 'Processing with AI...' : 'Click to upload 3D scan'}
            </p>
            <p className="text-slate-400 text-sm">
              Supports: .obj, .glb, .gltf, .ply, .fbx, .stl
            </p>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="bg-cyan-500/20 text-cyan-400">
            <FileType className="w-3 h-3 mr-1" />
            AI Feature Detection
          </Badge>
          <Badge className="bg-purple-500/20 text-purple-400">
            <Scan className="w-3 h-3 mr-1" />
            Auto Zone Generation
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}