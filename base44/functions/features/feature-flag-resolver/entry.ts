import { base44 } from '@base44/sdk';

/**
 * Feature Flag Resolver
 * Determines if a feature is enabled for a given user
 */
export default async function featureFlagResolver(event) {
  const { featureKey, userEmail, userRole } = event;

  try {
    // Fetch feature flag
    const flags = await base44.asServiceRole.entities.FeatureFlag.filter({
      feature_key: featureKey,
      environment: 'production' // In real scenario, detect environment
    });

    if (!flags || flags.length === 0) {
      return { enabled: false, reason: 'Feature flag not found' };
    }

    const flag = flags[0];

    // Check if globally disabled
    if (!flag.enabled) {
      return { enabled: false, reason: 'Feature globally disabled' };
    }

    // Check if user is specifically targeted
    if (flag.target_users && flag.target_users.includes(userEmail)) {
      return { enabled: true, reason: 'User specifically targeted' };
    }

    // Check if user role is targeted
    if (flag.target_roles && flag.target_roles.includes(userRole)) {
      return { enabled: true, reason: 'User role targeted' };
    }

    // Check rollout percentage
    if (flag.rollout_percentage > 0) {
      const hash = hashString(userEmail);
      const userPercentile = (hash % 100);
      
      if (userPercentile < flag.rollout_percentage) {
        return { 
          enabled: true, 
          reason: `User in rollout percentage (${flag.rollout_percentage}%)` 
        };
      }
    }

    return { enabled: false, reason: 'User not in rollout' };

  } catch (error) {
    console.error('Feature flag resolver error:', error);
    return { enabled: false, reason: 'Error resolving feature flag', error: error.message };
  }
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}