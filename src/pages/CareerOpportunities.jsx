import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function CareerOpportunities() {
  const jobs = [
    { id: 1, title: 'Senior AI Engineer', location: 'Remote', type: 'Full-time', department: 'Engineering' },
    { id: 2, title: 'Product Designer', location: 'San Francisco, CA', type: 'Full-time', department: 'Design' },
    { id: 3, title: 'DevRel Engineer', location: 'Remote', type: 'Full-time', department: 'Developer Relations' },
    { id: 4, title: 'Technical Writer', location: 'Remote', type: 'Contract', department: 'Documentation' }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Career Opportunities</h1>
          <p className="text-white/60">Join our mission to build the future of AI</p>
        </motion.div>

        <div className="space-y-4">
          {jobs.map((job, i) => (
            <motion.div key={job.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:scale-102 transition-all cursor-pointer" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-bold text-xl mb-2">{job.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{job.type}</span>
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">{job.department}</span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:opacity-90">Apply</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}