import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OnboardingSection({ userEmail }) {
  const [completedSteps, setCompletedSteps] = useState([0]);

  const steps = [
    {
      title: 'Complete Your Profile',
      description: 'Add your profile picture and bio',
      icon: '👤',
      action: 'Edit Profile'
    },
    {
      title: 'Connect Your Wallet',
      description: 'Link your crypto wallet to get started',
      icon: '💰',
      action: 'Connect Wallet'
    },
    {
      title: 'Create Your First Goal',
      description: 'Set a financial goal and start tracking',
      icon: '🎯',
      action: 'Create Goal'
    },
    {
      title: 'Deploy Your First Agent',
      description: 'Create and customize your AI agent',
      icon: '🤖',
      action: 'Deploy Agent'
    }
  ];

  const progress = (completedSteps.length / steps.length) * 100;

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">Get Started in 4 Steps</h2>
          <p className="text-white/60">Complete your onboarding journey</p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-semibold">Progress</span>
            <span className="text-cyan-400 font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ x: 5 }}
              className="p-6 rounded-xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:border-cyan-400/30 transition-all flex items-start gap-4"
            >
              <div className="flex-shrink-0">
                {completedSteps.includes(idx) ? (
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                ) : (
                  <Circle className="w-8 h-8 text-white/40" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">{step.title}</h3>
                <p className="text-white/60 text-sm mt-1">{step.description}</p>
              </div>
              <div className="text-3xl">{step.icon}</div>
              {!completedSteps.includes(idx) && (
                <Button
                  onClick={() => setCompletedSteps([...completedSteps, idx])}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold"
                  size="sm"
                >
                  {step.action}
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}