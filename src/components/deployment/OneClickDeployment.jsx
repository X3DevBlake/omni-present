import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Cloud, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OneClickDeployment() {
  const [deploying, setDeploying] = useState(false);
  const [deployments, setDeployments] = useState([]);

  const deploy = (platform) => {
    setDeploying(true);
    const newDeploy = {
      id: Date.now(),
      platform,
      status: 'deploying',
      url: ''
    };
    setDeployments([newDeploy, ...deployments]);

    setTimeout(() => {
      setDeployments(prev => prev.map(d => 
        d.id === newDeploy.id 
          ? { ...d, status: 'deployed', url: `https://${platform.toLowerCase()}-${Date.now()}.ai` }
          : d
      ));
      setDeploying(false);
    }, 3000);
  };

  const platforms = ['AWS', 'Azure', 'GCP', 'Vercel'];

  return (
    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Rocket className="w-6 h-6 text-green-400" />
        One-Click Deployment
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {platforms.map(platform => (
          <Button
            key={platform}
            onClick={() => deploy(platform)}
            disabled={deploying}
            className="bg-green-500/20 hover:bg-green-500/30"
          >
            <Cloud className="w-4 h-4 mr-2" />
            {platform}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {deployments.map(dep => (
          <motion.div
            key={dep.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/20 rounded-lg p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${dep.status === 'deployed' ? 'text-green-400' : 'text-yellow-400'}`} />
                <span className="text-white font-medium">{dep.platform}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                dep.status === 'deployed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {dep.status}
              </span>
            </div>
            {dep.url && (
              <div className="text-cyan-400 text-xs mt-2 font-mono">{dep.url}</div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}