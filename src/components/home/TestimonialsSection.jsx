import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      title: 'Investor & Trader',
      content: 'The AI agents saved me hours on portfolio management. Incredible platform.',
      rating: 5,
      avatar: '👩‍💼',
      company: 'Tech Ventures'
    },
    {
      name: 'Marcus Johnson',
      title: 'DeFi Strategist',
      content: 'Real-time market insights powered by AI changed my investment strategy completely.',
      rating: 5,
      avatar: '👨‍💼',
      company: 'DeFi Labs'
    },
    {
      name: 'Elena Rodriguez',
      title: 'Financial Planner',
      content: 'My clients love the visual 3D dashboard. It makes financial planning engaging.',
      rating: 5,
      avatar: '👩‍🎓',
      company: 'Wealth Advisors'
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Loved by <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">thousands</span>
          </h2>
          <p className="text-white/60">Real feedback from our users</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-cyan-400/30 transition-all"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-white/80 mb-6 italic">"{testimonial.content}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="text-3xl">{testimonial.avatar}</div>
                <div>
                  <div className="text-white font-bold">{testimonial.name}</div>
                  <div className="text-white/60 text-sm">{testimonial.title}</div>
                  <div className="text-white/40 text-xs">{testimonial.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}