import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { TrendingUp, AlertCircle, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AdvancedFinancialHealthDashboard() {
  const containerRef = useRef(null);
  const [userEmail, setUserEmail] = useState(null);
  const [healthMetrics, setHealthMetrics] = useState(null);
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
    
    loadFinancialData();
    initalize3DVisualization();
  }, []);

  const loadFinancialData = async () => {
    if (!userEmail) return;

    try {
      const [health, goals, accounts] = await Promise.all([
        base44.entities.FinancialHealthScore.filter({ user_email: userEmail }, '-updated_date', 1),
        base44.entities.FinancialGoal.filter({ user_email: userEmail }),
        base44.entities.SmartBankAccount.filter({ user_email: userEmail }),
      ]);

      const netWorth = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;

      setHealthMetrics({
        overall: health?.[0]?.overall_score || 650,
        netWorth,
        accounts: accounts || [],
        goals: goals || [],
        creditScore: health?.[0]?.credit_score || 750,
        debtRatio: health?.[0]?.debt_ratio || 0.25,
      });

      // Generate predictions
      await generatePredictions(netWorth, goals);
    } catch (error) {
      console.error('Error loading financial data:', error);
    }
  };

  const generatePredictions = async (currentNetWorth, goals) => {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Predict financial health trajectory:
        
Current Net Worth: $${currentNetWorth.toLocaleString()}
Current Score: ${healthMetrics?.overall || 650}
Goals: ${goals?.map(g => `${g.title} ($${g.target_amount})`).join(', ')}

Predict 1, 5, and 10 year outcomes including:
1. Projected net worth growth
2. Financial health score trajectory
3. Goal achievement probability
4. Key risk factors
5. Optimization opportunities`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            projections: {
              type: 'object',
              properties: {
                oneYear: { type: 'object' },
                fiveYear: { type: 'object' },
                tenYear: { type: 'object' },
              },
            },
            risks: { type: 'array', items: { type: 'string' } },
            opportunities: { type: 'array', items: { type: 'string' } },
          },
        },
      });

      setPredictions(response);
    } catch (error) {
      console.error('Error generating predictions:', error);
    }
  };

  const initalize3DVisualization = () => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / 400, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    camera.position.set(0, 5, 15);
    renderer.setSize(containerRef.current.clientWidth, 400);
    renderer.setClearColor(0x0a0e27, 0.1);
    containerRef.current.appendChild(renderer.domElement);

    // Create visualization elements
    const netWorthGeometry = new THREE.BoxGeometry(4, healthMetrics?.netWorth / 50000 || 2, 4);
    const netWorthMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x00aa44,
    });
    const netWorthMesh = new THREE.Mesh(netWorthGeometry, netWorthMaterial);
    scene.add(netWorthMesh);

    // Lighting
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      netWorthMesh.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      containerRef.current?.removeChild(renderer.domElement);
    };
  };

  return (
    <div className="space-y-6">
      {/* 3D Visualization */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/5 border border-white/10 rounded-lg overflow-hidden"
      >
        <div ref={containerRef} className="w-full h-96 bg-gradient-to-br from-slate-900 to-purple-900" />
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Net Worth', value: `$${(healthMetrics?.netWorth || 0).toLocaleString()}`, color: 'cyan' },
          { label: 'Financial Health', value: `${healthMetrics?.overall || 650}/850`, color: 'green' },
          { label: 'Credit Score', value: healthMetrics?.creditScore || 750, color: 'blue' },
          { label: 'Debt Ratio', value: `${((healthMetrics?.debtRatio || 0) * 100).toFixed(1)}%`, color: 'orange' },
        ].map((metric, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-${metric.color}-500/10 border border-${metric.color}-400/30 rounded-lg p-4`}
          >
            <p className={`text-${metric.color}-300 text-sm`}>{metric.label}</p>
            <p className={`text-${metric.color}-400 text-2xl font-bold mt-2`}>{metric.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Predictions */}
      {predictions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 border border-white/10 rounded-lg p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Financial Projections
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { period: '1 Year', data: predictions.projections?.oneYear },
              { period: '5 Years', data: predictions.projections?.fiveYear },
              { period: '10 Years', data: predictions.projections?.tenYear },
            ].map((projection, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 border border-white/10 rounded p-4"
              >
                <p className="text-white/60 text-sm font-bold mb-2">{projection.period}</p>
                <div className="space-y-2">
                  {Object.entries(projection.data || {}).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="text-white/80 text-sm">
                      <span className="capitalize">{key}:</span> {value}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Risk & Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {predictions && predictions.risks && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-400/30 rounded-lg p-4"
          >
            <h4 className="text-red-300 font-bold mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Risk Factors
            </h4>
            <ul className="space-y-2">
              {predictions.risks.map((risk, idx) => (
                <li key={idx} className="text-red-200/80 text-sm">• {risk}</li>
              ))}
            </ul>
          </motion.div>
        )}

        {predictions && predictions.opportunities && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-500/10 border border-green-400/30 rounded-lg p-4"
          >
            <h4 className="text-green-300 font-bold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Opportunities
            </h4>
            <ul className="space-y-2">
              {predictions.opportunities.map((opp, idx) => (
                <li key={idx} className="text-green-200/80 text-sm">• {opp}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
}