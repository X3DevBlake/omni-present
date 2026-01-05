import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function RoleBasedDashboard({ userRole, children }) {
  const [customizedView, setCustomizedView] = useState(null);

  useEffect(() => {
    if (userRole) {
      customizeInterface();
    }
  }, [userRole]);

  const customizeInterface = async () => {
    if (!userRole) return;
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Customize platform interface for user role: ${userRole}
          
          Role-specific customization:
          
          DEVELOPER:
          - Focus: Code quality, deployment pipelines, debugging
          - Features: CI/CD, code reviews, testing frameworks
          - Hide: Budget details, executive summaries
          
          DEVOPS_ENGINEER:
          - Focus: Infrastructure, monitoring, deployment
          - Features: Multi-cloud, observability, cost optimization
          - Hide: Model training details, executive reports
          
          DATA_SCIENTIST:
          - Focus: Model training, marketplace, lifecycle
          - Features: Training platform, model governance, performance metrics
          - Hide: Infrastructure details, CI/CD pipelines
          
          EXECUTIVE:
          - Focus: High-level metrics, costs, strategic insights
          - Features: Executive summaries, budget forecasts, ROI
          - Hide: Technical details, debugging tools
          
          Provide:
          - Primary features to show
          - Secondary features to minimize
          - Features to hide completely
          - Dashboard layout preference
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            primaryFeatures: { type: 'array', items: { type: 'string' } },
            secondaryFeatures: { type: 'array', items: { type: 'string' } },
            hiddenFeatures: { type: 'array', items: { type: 'string' } },
            dashboardLayout: { type: 'string' },
            recommendations: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setCustomizedView(result);
    } catch (error) {
      console.error('Interface customization failed:', error);
    }
  };

  const shouldShowFeature = (featureName) => {
    if (!customizedView) return true;
    return !customizedView.hiddenFeatures?.includes(featureName);
  };

  const getFeaturePriority = (featureName) => {
    if (!customizedView) return 'primary';
    if (customizedView.primaryFeatures?.includes(featureName)) return 'primary';
    if (customizedView.secondaryFeatures?.includes(featureName)) return 'secondary';
    return 'hidden';
  };

  return (
    <>
      {children}
      {customizedView && userRole && (
        <div className="fixed top-6 right-80 z-30 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40">
          <span className="text-purple-400 text-xs">
            View: {userRole.replace('_', ' ')}
          </span>
        </div>
      )}
    </>
  );
}