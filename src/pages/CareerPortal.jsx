import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, Send } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import Career3DCard from '../components/3d/Career3DCard';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CareerPortal() {
  const navigate = useNavigate();
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', resume: '', coverLetter: '' });
  const [submitting, setSubmitting] = useState(false);

  const positions = [
    {
      title: '3D Developer',
      department: 'Engineering',
      description: 'Build immersive 3D experiences with Three.js and React Three Fiber',
      color: '#00f5ff',
      details: 'We are looking for an experienced 3D developer to create stunning visualizations. Requirements: 5+ years experience, Three.js expertise, React knowledge.'
    },
    {
      title: 'AI/ML Engineer',
      department: 'AI Research',
      description: 'Develop advanced AI agents and machine learning models',
      color: '#a855f7',
      details: 'Join our AI research team. Requirements: Strong ML background, Python proficiency, research publication experience.'
    },
    {
      title: 'DeFi Protocol Engineer',
      department: 'Finance',
      description: 'Design and implement DeFi protocols and smart contracts',
      color: '#ec4899',
      details: 'Build the future of decentralized finance. Requirements: Solidity expertise, DeFi protocol knowledge, security auditing experience.'
    },
    {
      title: 'Community Manager',
      department: 'Operations',
      description: 'Lead and grow our vibrant community',
      color: '#3b82f6',
      details: 'Foster community engagement and build relationships. Requirements: Community management experience, excellent communication skills.'
    },
    {
      title: 'Product Manager',
      department: 'Product',
      description: 'Shape the future of the platform',
      color: '#10b981',
      details: 'Define product strategy and roadmap. Requirements: 3+ years product management, technical background, strategic thinking.'
    },
    {
      title: 'DevOps Engineer',
      department: 'Infrastructure',
      description: 'Manage and scale our cloud infrastructure',
      color: '#f59e0b',
      details: 'Build robust infrastructure. Requirements: Kubernetes, Docker, CI/CD pipelines, AWS/GCP experience.'
    }
  ];

  const handleApply = async () => {
    if (!formData.name || !formData.email || !formData.resume) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // In a real app, this would create an application record
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Application submitted! We\'ll review it soon.');
      setShowApplicationForm(false);
      setFormData({ name: '', email: '', resume: '', coverLetter: '' });
      setSelectedPosition(null);
    } catch (err) {
      toast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Join <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Omni-Present</span>
            </h1>
            <p className="text-white/60">Build the future of AI and DeFi with us</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </motion.div>

        {/* Positions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {positions.map((position, i) => (
            <Career3DCard
              key={i}
              title={position.title}
              description={position.description}
              color={position.color}
              onClick={() => {
                setSelectedPosition(position);
                setShowApplicationForm(false);
              }}
            />
          ))}
        </div>

        {/* Position Details Modal */}
        <AnimatePresence>
          {selectedPosition && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedPosition(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-black/80 to-black/60 border border-white/20 rounded-2xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedPosition.title}</h2>
                    <p className="text-cyan-400">{selectedPosition.department}</p>
                  </div>
                  <button
                    onClick={() => setSelectedPosition(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                <p className="text-white/70 mb-8">{selectedPosition.details}</p>

                {!showApplicationForm ? (
                  <button
                    onClick={() => setShowApplicationForm(true)}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 transition-all"
                  >
                    Apply Now
                  </button>
                ) : (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40"
                    />
                    <input
                      type="email"
                      placeholder="Email *"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40"
                    />
                    <textarea
                      placeholder="Resume / Experience *"
                      value={formData.resume}
                      onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 h-24"
                    />
                    <textarea
                      placeholder="Cover Letter"
                      value={formData.coverLetter}
                      onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 h-24"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowApplicationForm(false)}
                        className="flex-1 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleApply}
                        disabled={submitting}
                        className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {submitting ? 'Submitting...' : <><Send className="w-4 h-4" /> Submit</>}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuroraBackground>
  );
}