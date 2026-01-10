import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FileUp, Upload, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DataExtractor() {
  const [file, setFile] = useState(null);
  const [schema, setSchema] = useState('{\n  "type": "object",\n  "properties": {\n    "name": { "type": "string" },\n    "email": { "type": "string" }\n  }\n}');
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState('');

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setUploading(true);
    
    try {
      const result = await base44.integrations.Core.UploadFile({
        file: selectedFile,
      });
      setFileUrl(result.file_url);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleExtract = async () => {
    if (!fileUrl || !schema.trim()) return;
    
    setLoading(true);
    setExtractedData(null);
    
    try {
      const parsedSchema = JSON.parse(schema);
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: fileUrl,
        json_schema: parsedSchema,
      });
      
      setExtractedData(result);
    } catch (error) {
      setExtractedData({ status: 'error', details: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div>
        <label className="text-white font-medium mb-2 block flex items-center gap-2">
          <FileUp className="w-5 h-5 text-pink-400" />
          Upload a file (CSV, PDF, Image)
        </label>
        <div className="relative">
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            accept=".csv,.pdf,.png,.jpg,.jpeg"
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className="flex items-center justify-center gap-2 p-8 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 transition-colors bg-white/5"
          >
            {uploading ? (
              <>
                <Loader2 className="w-6 h-6 text-white animate-spin" />
                <span className="text-white/70">Uploading...</span>
              </>
            ) : file ? (
              <>
                <Check className="w-6 h-6 text-green-400" />
                <span className="text-white">{file.name}</span>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-white/40" />
                <span className="text-white/70">Click to upload or drag and drop</span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Schema Definition */}
      <div>
        <label className="text-white font-medium mb-2 block">
          Define JSON Schema for Extraction
        </label>
        <Textarea
          value={schema}
          onChange={(e) => setSchema(e.target.value)}
          placeholder="Enter JSON schema..."
          className="min-h-[150px] bg-white/5 border-white/10 text-white placeholder:text-white/40 font-mono text-sm"
          disabled={loading}
        />
      </div>

      <Button
        onClick={handleExtract}
        disabled={loading || !fileUrl || !schema.trim()}
        className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Extracting Data...
          </>
        ) : (
          <>
            <FileUp className="w-5 h-5 mr-2" />
            Extract Data
          </>
        )}
      </Button>

      {extractedData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label className="text-white font-medium mb-2 block">Extracted Data</label>
          <div className="bg-black/40 border border-pink-500/30 rounded-lg p-6">
            <pre className="text-white/90 text-sm overflow-auto">
              {JSON.stringify(extractedData, null, 2)}
            </pre>
          </div>
        </motion.div>
      )}
    </div>
  );
}