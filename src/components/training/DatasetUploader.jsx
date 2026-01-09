import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

export default function DatasetUploader({ onDatasetUpload }) {
  const [datasets, setDatasets] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    Array.from(files).forEach(file => addDataset(file));
  };

  const addDataset = (file) => {
    const dataset = {
      id: Math.random(),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2),
      type: file.type,
      uploadDate: new Date().toLocaleDateString(),
      samples: Math.floor(Math.random() * 10000) + 1000,
      status: 'ready'
    };
    setDatasets(prev => [...prev, dataset]);
    onDatasetUpload?.(dataset);
  };

  const removeDataset = (id) => {
    setDatasets(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-cyan-400" />
        Dataset Upload
      </h3>

      <motion.div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        animate={{ scale: dragActive ? 1.02 : 1 }}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-cyan-400 bg-cyan-500/10'
            : 'border-white/20 bg-white/5 hover:bg-white/10'
        }`}
      >
        <Upload className="w-8 h-8 text-white/60 mx-auto mb-3" />
        <p className="text-white font-semibold mb-1">Drop datasets here</p>
        <p className="text-white/60 text-sm">CSV, JSON, or Parquet formats supported</p>
      </motion.div>

      {datasets.length > 0 && (
        <div className="mt-6 space-y-2">
          <h4 className="text-white/70 text-sm font-semibold">Uploaded Datasets ({datasets.length})</h4>
          {datasets.map((dataset, idx) => (
            <motion.div
              key={dataset.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between group hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <File className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium truncate">{dataset.name}</p>
                  <p className="text-white/50 text-xs">{dataset.size} MB • {dataset.samples} samples</p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <button
                onClick={() => removeDataset(dataset.id)}
                className="ml-3 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded transition-all"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}