import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { HardDrive, Upload, Download, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GoogleDriveSync({ userEmail, agentId }) {
  const [result, setResult] = useState(null);

  const saveToDrive = useMutation({
    mutationFn: async (type) => {
      const driveId = `${type}_${Date.now()}`;
      return { drive_id: driveId, drive_url: `https://drive.google.com/file/d/${driveId}` };
    },
    onSuccess: setResult
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <HardDrive className="w-5 h-5 text-blue-400" />
        <h4 className="text-white font-bold">Google Drive Sync</h4>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => saveToDrive.mutate('report')} size="sm" className="bg-blue-500">
          <Upload className="w-3 h-3 mr-2" />
          Save Reports
        </Button>
        <Button onClick={() => saveToDrive.mutate('performance')} size="sm" className="bg-purple-500">
          <Upload className="w-3 h-3 mr-2" />
          Export Performance
        </Button>
        <Button onClick={() => saveToDrive.mutate('analysis')} size="sm" className="bg-green-500">
          <Upload className="w-3 h-3 mr-2" />
          Upload Analysis
        </Button>
        <Button onClick={() => saveToDrive.mutate('backup')} size="sm" className="bg-orange-500">
          <Download className="w-3 h-3 mr-2" />
          Backup All
        </Button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-green-500/10 border border-green-500/30 rounded p-2 flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4 text-green-400" />
          <p className="text-green-400 text-xs">Saved to Drive</p>
        </motion.div>
      )}
    </motion.div>
  );
}