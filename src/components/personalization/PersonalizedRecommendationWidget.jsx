import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ArrowRight, X } from 'lucide-react';
import { usePersonalization } from './PersonalizationContext';

export default function PersonalizedRecommendationWidget({ hubName, maxItems = 3 }) {
  const { getRecommendationsForHub, trackInteraction } = usePersonalization();
  const [visibleRecs, setVisibleRecs] = React.useState([]);
  const [dismissedRecs, setDismissedRecs] = React.useState([]);

  useEffect(() => {
    const recs = getRecommendationsForHub(hubName);
    setVisibleRecs(recs.filter(r => !dismissedRecs.includes(r.id)).slice(0, maxItems));
  }, [hubName, dismissedRecs]);

  const dismissRecommendation = (id) => {
    setDismissedRecs([...dismissedRecs, id]);
  };

  const handleAction = (rec) => {
    trackInteraction(rec.id, 'click');
  };

  return (
    <AnimatePresence>
      {visibleRecs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-cyan-400" />
            <h4 className="text-white font-semibold text-sm">Personalized for You</h4>
          </div>

          <div className="space-y-2">
            {visibleRecs.map((rec) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-white/5 hover:bg-white/10 rounded-lg p-3 flex items-start justify-between group cursor-pointer transition-all"
                onClick={() => handleAction(rec)}
              >
                <div className="flex-1">
                  <h5 className="text-white font-semibold text-xs mb-1">{rec.title}</h5>
                  <p className="text-white/60 text-xs">{rec.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <span className="text-cyan-400 text-xs font-semibold whitespace-nowrap">{rec.action}</span>
                  <ArrowRight className="w-3 h-3 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>

          <button
            onClick={() => setVisibleRecs([])}
            className="mt-3 text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            Hide recommendations
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}