import React from 'react';
import { Star, Award, TrendingUp, TrendingDown } from 'lucide-react';

export default function ReputationBadge({ reputation, size = 'normal', showTrend = false, trend = 0 }) {
  const getReputationTier = (rep) => {
    if (rep >= 80) return { label: 'Legendary', color: 'from-yellow-400 to-orange-400', icon: Award };
    if (rep >= 60) return { label: 'Respected', color: 'from-blue-400 to-cyan-400', icon: Star };
    if (rep >= 40) return { label: 'Average', color: 'from-gray-400 to-gray-500', icon: Star };
    return { label: 'Poor', color: 'from-red-400 to-orange-400', icon: TrendingDown };
  };

  const tier = getReputationTier(reputation);
  const Icon = tier.icon;

  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    normal: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-2'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${tier.color} ${sizeClasses[size]} font-medium text-white shadow-lg`}>
      <Icon className="w-3 h-3" />
      <span>{reputation.toFixed(0)}</span>
      {showTrend && (
        trend > 0 ? (
          <TrendingUp className="w-3 h-3 text-green-200" />
        ) : trend < 0 ? (
          <TrendingDown className="w-3 h-3 text-red-200" />
        ) : null
      )}
    </div>
  );
}