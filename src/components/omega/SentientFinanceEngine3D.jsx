import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as THREE from 'three';
import { DollarSign, TrendingUp, Zap, Lock, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { RecursiveGrowthNode, RecursiveConnection } from './RecursiveGrowthVisualizer3D';

const WealthNode = ({ position, value, type }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.setScalar(0.5 + (value / 100000) + pulse);
    }
  });
  
  const typeColors = {
    trading: '#10b981',
    grid: '#8b5cf6',
    project: '#f59e0b',
    autonomous: '#3b82f6'
  };
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color={typeColors[type]}
          emissive={typeColors[type]}
          emissiveIntensity={0.8}
        />
      </Sphere>
      <Text position={[0, 0.5, 0]} fontSize={0.12} color="white" anchorX="center">
        ${(value / 1000).toFixed(0)}K
      </Text>
    </group>
  );
};

const ValueFlow = ({ from, to, amount }) => {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
    }
  });
  
  return (
    <Line
      ref={lineRef}
      points={[new THREE.Vector3(...from), new THREE.Vector3(...to)]}
      color="#fbbf24"
      lineWidth={2 + (amount / 50000)}
      transparent
      opacity={0.7}
    />
  );
};

export default function SentientFinanceEngine3D() {
  const [activeInference, setActiveInference] = useState(false);
  const [capitalManaged, setCapitalManaged] = useState(0);
  const [revenueStreams, setRevenueStreams] = useState([]);
  const [marketData, setMarketData] = useState(null);
  const [contractDrafts, setContractDrafts] = useState([]);
  const [omlTokenization, setOmlTokenization] = useState(null);
  const [recursiveGrowth, setRecursiveGrowth] = useState([]);
  const [geopoliticalRisk, setGeopoliticalRisk] = useState(null);
  const [recursiveLearning, setRecursiveLearning] = useState(null);

  const activateInference = async () => {
    setActiveInference(true);
    
    // Initialize real-time market data
    const markets = {
      forex: [
        { pair: 'EUR/USD', price: 1.0842, change: 0.0012, volume: 2400000 },
        { pair: 'GBP/USD', price: 1.2645, change: -0.0023, volume: 1800000 },
        { pair: 'USD/JPY', price: 148.52, change: 0.45, volume: 3200000 }
      ],
      crypto: [
        { symbol: 'BTC/USD', price: 42580, change: 285, volume: 28500000 },
        { symbol: 'ETH/USD', price: 2340, change: -15, volume: 15200000 },
        { symbol: 'SOL/USD', price: 98.5, change: 3.2, volume: 4800000 }
      ]
    };
    setMarketData(markets);
    
    // Generate OML tokenization data
    const oml = {
      token_contract: `0x${Math.random().toString(16).substr(2, 40)}`,
      model_fingerprint: `fp_${Math.random().toString(36).substr(2, 16)}`,
      on_chain_calls: 1547,
      total_revenue_distributed: 23400,
      loyalty_watermark_verified: true
    };
    setOmlTokenization(oml);
    
    // Simulate autonomous contract drafting
    const contracts = [
      { 
        project: 'Solar Farm Development',
        value: 2500000,
        status: 'drafted',
        clauses: 47,
        risk_score: 0.12
      },
      { 
        project: 'Satellite Launch Financing',
        value: 8900000,
        status: 'under_review',
        clauses: 89,
        risk_score: 0.34
      }
    ];
    setContractDrafts(contracts);
    
    // Simulate wealth generation with recursive growth
    const streams = [
      { type: 'trading', name: 'Algorithmic Trading', value: 45000, growth: 15, onchain_verified: true },
      { type: 'grid', name: 'GRID Emissions', value: 32000, growth: 25, onchain_verified: true },
      { type: 'project', name: 'Project Financing', value: 78000, growth: 8, onchain_verified: true },
      { type: 'autonomous', name: 'Autonomous Networks', value: 56000, growth: 18, onchain_verified: true }
    ];
    
    setRevenueStreams(streams);
    const total = streams.reduce((sum, s) => sum + s.value, 0);
    setCapitalManaged(total);
    
    // Simulate recursive value generation over time
    const growth = [];
    let capital = total;
    for (let i = 0; i < 12; i++) {
      capital *= 1.165; // 16.5% monthly growth
      growth.push({ month: i + 1, capital });
    }
    setRecursiveGrowth(growth);
    
    // Simulate geopolitical risk analysis
    const geoRisk = {
      risk_regions: [
        { region: 'Eastern Europe', risk_level: 0.65, partition: true },
        { region: 'Middle East', risk_level: 0.42, partition: false },
        { region: 'Asia Pacific', risk_level: 0.18, partition: false }
      ],
      portfolio_adjustments: [
        { asset: 'European Bonds', from: 25, to: 15, reason: 'High regional risk' },
        { asset: 'Asian Equities', from: 15, to: 20, reason: 'Low risk, growth opportunity' },
        { asset: 'Crypto Assets', from: 20, to: 30, reason: 'Decentralized hedge' }
      ]
    };
    setGeopoliticalRisk(geoRisk);
    
    // Simulate recursive learning
    const learning = {
      iteration: 5,
      patterns_learned: [
        'EUR/USD momentum reversal at 1.08 resistance',
        'BTC volatility clusters correlate with equity VIX',
        'Optimal Kelly criterion: 0.25 for current regime'
      ],
      performance_delta: 0.032
    };
    setRecursiveLearning(learning);
  };

  const wealthNodes = [
    { position: [-2, 1, 0], value: 45000, type: 'trading' },
    { position: [2, 1, 0], value: 32000, type: 'grid' },
    { position: [-2, -1, 0], value: 78000, type: 'project' },
    { position: [2, -1, 0], value: 56000, type: 'autonomous' }
  ];

  return (
    <Card className="bg-gradient-to-br from-emerald-950/90 via-green-950/90 to-teal-950/90 backdrop-blur-xl border-emerald-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <DollarSign className="w-7 h-7 text-emerald-400" />
          Sentient Financial Infrastructure
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          OML framework with Active Inference for unlimited capital generation
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="mb-4">
          <TabsList className="grid w-full grid-cols-3 bg-black/60">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="h-[400px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-emerald-500/20">
              <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.8} color="#10b981" />

            {/* Central OML core */}
            <group position={[0, 0, 0]}>
              <Sphere args={[0.4, 32, 32]}>
                <meshStandardMaterial
                  color="#fbbf24"
                  emissive="#fbbf24"
                  emissiveIntensity={activeInference ? 1.2 : 0.5}
                />
              </Sphere>
              <Text position={[0, 0.7, 0]} fontSize={0.15} color="#fbbf24" anchorX="center">
                OML Core
              </Text>
            </group>

            {/* Wealth generation nodes */}
            {activeInference && wealthNodes.map((node, idx) => (
              <React.Fragment key={idx}>
                <WealthNode
                  position={node.position}
                  value={node.value}
                  type={node.type}
                />
                <ValueFlow
                  from={[0, 0, 0]}
                  to={node.position}
                  amount={node.value}
                />
              </React.Fragment>
            ))}

            {/* Recursive growth trajectory */}
            {recursiveGrowth.length > 0 && recursiveGrowth.slice(0, 6).map((point, idx) => {
              const angle = (idx / 6) * Math.PI * 2;
              const radius = 3 + (idx * 0.2);
              const pos = [Math.cos(angle) * radius, Math.sin(angle) * radius, 0];
              return (
                <React.Fragment key={`growth_${idx}`}>
                  <RecursiveGrowthNode
                    position={pos}
                    capital={point.capital}
                    month={point.month}
                    isActive={activeInference}
                  />
                  {idx > 0 && (
                    <RecursiveConnection
                      from={[
                        Math.cos((idx - 1) / 6 * Math.PI * 2) * (3 + ((idx - 1) * 0.2)),
                        Math.sin((idx - 1) / 6 * Math.PI * 2) * (3 + ((idx - 1) * 0.2)),
                        0
                      ]}
                      to={pos}
                      strength={idx / 6}
                    />
                  )}
                </React.Fragment>
              );
            })}

            <OrbitControls enableZoom />
              </Canvas>
            </div>
          </TabsContent>
          
          <TabsContent value="markets">
            {marketData && (
              <div className="bg-black/40 rounded-xl p-4 border border-blue-500/20">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-blue-400 text-sm font-bold mb-3">Forex Markets</h4>
                    {marketData.forex.map((fx, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-black/60 rounded-lg p-3 mb-2 border border-blue-500/20"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-white font-bold">{fx.pair}</span>
                          <Badge className={fx.change >= 0 ? 'bg-green-600' : 'bg-red-600'}>
                            {fx.change >= 0 ? '+' : ''}{fx.change.toFixed(4)}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Price:</span>
                          <span className="text-white font-mono">{fx.price.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Volume:</span>
                          <span className="text-gray-300">${(fx.volume / 1000000).toFixed(1)}M</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div>
                    <h4 className="text-purple-400 text-sm font-bold mb-3">Crypto Markets</h4>
                    {marketData.crypto.map((crypto, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-black/60 rounded-lg p-3 mb-2 border border-purple-500/20"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-white font-bold">{crypto.symbol}</span>
                          <Badge className={crypto.change >= 0 ? 'bg-green-600' : 'bg-red-600'}>
                            {crypto.change >= 0 ? '+' : ''}{crypto.change}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Price:</span>
                          <span className="text-white font-mono">${crypto.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Volume:</span>
                          <span className="text-gray-300">${(crypto.volume / 1000000).toFixed(1)}M</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="contracts">
            <div className="bg-black/40 rounded-xl p-4 border border-amber-500/20 max-h-[400px] overflow-y-auto">
              <h4 className="text-amber-400 text-sm font-bold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Autonomous Contract Drafts
              </h4>
              {contractDrafts.length > 0 ? (
                <div className="space-y-3">
                  {contractDrafts.map((contract, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.15 }}
                      className="bg-black/60 rounded-lg p-4 border border-amber-500/30"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-white font-bold text-sm">{contract.project}</div>
                          <div className="text-gray-400 text-xs mt-1">
                            {contract.clauses} clauses • AI-generated
                          </div>
                        </div>
                        <Badge className={contract.status === 'drafted' ? 'bg-green-600' : 'bg-blue-600'}>
                          {contract.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/40 rounded p-2">
                          <div className="text-gray-400 text-[10px]">Project Value</div>
                          <div className="text-emerald-400 font-bold">${(contract.value / 1000000).toFixed(2)}M</div>
                        </div>
                        <div className="bg-black/40 rounded p-2">
                          <div className="text-gray-400 text-[10px]">Risk Assessment</div>
                          <div className={`font-bold ${contract.risk_score < 0.2 ? 'text-green-400' : contract.risk_score < 0.4 ? 'text-amber-400' : 'text-red-400'}`}>
                            {(contract.risk_score * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Activate inference to generate autonomous contracts
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-black/60 rounded-lg p-3 border border-emerald-500/30">
            <div className="text-emerald-400 text-xs mb-1">Total Capital</div>
            <div className="text-white text-xl font-bold">
              ${(capitalManaged / 1000).toFixed(0)}K
            </div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-purple-500/30">
            <div className="text-purple-400 text-xs mb-1">Revenue Streams</div>
            <div className="text-white text-xl font-bold">{revenueStreams.length}</div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-blue-500/30">
            <div className="text-blue-400 text-xs mb-1">Growth Rate</div>
            <div className="text-white text-xl font-bold">
              {activeInference ? '16.5%' : '0%'}
            </div>
          </div>
        </div>

        {activeInference && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 mb-4"
          >
            {marketData && (
              <div className="bg-black/60 rounded-lg p-4 border border-blue-500/30">
                <div className="text-blue-400 text-sm font-bold mb-3">Real-Time Market Data</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-400 text-xs mb-2">Forex</div>
                    {marketData.forex.map((fx, idx) => (
                      <div key={idx} className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">{fx.pair}</span>
                        <span className={fx.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {fx.price.toFixed(4)} ({fx.change >= 0 ? '+' : ''}{fx.change.toFixed(4)})
                        </span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-2">Crypto</div>
                    {marketData.crypto.map((crypto, idx) => (
                      <div key={idx} className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">{crypto.symbol}</span>
                        <span className={crypto.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                          ${crypto.price.toLocaleString()} ({crypto.change >= 0 ? '+' : ''}{crypto.change})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-black/60 rounded-lg p-4 border border-green-500/30">
              <div className="text-green-400 text-sm font-bold mb-3">Active Revenue Streams</div>
              <div className="space-y-2">
                {revenueStreams.map((stream, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${stream.type === 'trading' ? 'bg-green-500' : stream.type === 'grid' ? 'bg-purple-500' : stream.type === 'project' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                      <span className="text-gray-300 text-xs">{stream.name}</span>
                      {stream.onchain_verified && (
                        <Badge className="bg-emerald-600/50 text-[9px] h-3 px-1">⛓️ On-chain</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-mono">${(stream.value / 1000).toFixed(0)}K</span>
                      <Badge className="bg-green-600/50 text-[10px] h-4">+{stream.growth}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {omlTokenization && (
              <div className="bg-black/60 rounded-lg p-4 border border-purple-500/30">
                <div className="text-purple-400 text-sm font-bold mb-2">OML Tokenization</div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Contract:</span>
                    <span className="text-white font-mono">{omlTokenization.token_contract.substr(0, 12)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">On-chain Calls:</span>
                    <span className="text-white">{omlTokenization.on_chain_calls.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Revenue Distributed:</span>
                    <span className="text-emerald-400">${omlTokenization.total_revenue_distributed.toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-gray-300">Open</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-gray-300">Monetizable</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-green-500" />
                      <span className="text-gray-300">Loyal</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {contractDrafts.length > 0 && (
              <div className="bg-black/60 rounded-lg p-4 border border-amber-500/30">
                <div className="text-amber-400 text-sm font-bold mb-3">Autonomous Contract Drafting</div>
                <div className="space-y-2">
                  {contractDrafts.map((contract, idx) => (
                    <div key={idx} className="bg-black/40 rounded-lg p-3 border border-amber-500/20">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-white text-xs font-semibold">{contract.project}</span>
                        <Badge className={contract.status === 'drafted' ? 'bg-green-600' : 'bg-blue-600'}>
                          {contract.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        <div>
                          <span className="text-gray-400">Value: </span>
                          <span className="text-white">${(contract.value / 1000000).toFixed(1)}M</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Clauses: </span>
                          <span className="text-white">{contract.clauses}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Risk: </span>
                          <span className={contract.risk_score < 0.2 ? 'text-green-400' : 'text-amber-400'}>
                            {(contract.risk_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recursiveGrowth.length > 0 && (
              <div className="bg-black/60 rounded-lg p-4 border border-cyan-500/30">
                <div className="text-cyan-400 text-sm font-bold mb-3">Recursive Value Generation (12 Months)</div>
                <div className="h-24 flex items-end gap-1">
                  {recursiveGrowth.map((point, idx) => {
                    const maxCapital = Math.max(...recursiveGrowth.map(p => p.capital));
                    const height = (point.capital / maxCapital) * 100;
                    return (
                      <div
                        key={idx}
                        className="flex-1 bg-gradient-to-t from-cyan-600 to-emerald-500 rounded-t hover:opacity-80 transition-opacity"
                        style={{ height: `${height}%` }}
                        title={`Month ${point.month}: $${(point.capital / 1000).toFixed(0)}K`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                  <span>M1</span>
                  <span>M6</span>
                  <span>M12: ${(recursiveGrowth[11].capital / 1000000).toFixed(2)}M</span>
                </div>
              </div>
            )}

            {geopoliticalRisk && (
              <div className="bg-black/60 rounded-lg p-4 border border-red-500/30">
                <div className="text-red-400 text-sm font-bold mb-3">Geopolitical Risk Analysis (RedComm XG)</div>
                <div className="space-y-2 mb-3">
                  {geopoliticalRisk.risk_regions.map((region, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-gray-300 text-xs">{region.region}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-800 rounded-full h-1.5">
                          <div
                            className={`h-full ${region.risk_level > 0.5 ? 'bg-red-500' : 'bg-amber-500'}`}
                            style={{ width: `${region.risk_level * 100}%` }}
                          />
                        </div>
                        {region.partition && <Badge className="bg-red-600 text-[9px] h-3">⚠️ Partition</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-gray-400 text-[10px] mb-1">Portfolio Adjustments:</div>
                {geopoliticalRisk.portfolio_adjustments.map((adj, idx) => (
                  <div key={idx} className="text-xs text-white mb-1">
                    {adj.asset}: {adj.from}% → {adj.to}%
                  </div>
                ))}
              </div>
            )}

            {recursiveLearning && (
              <div className="bg-black/60 rounded-lg p-4 border border-indigo-500/30">
                <div className="text-indigo-400 text-sm font-bold mb-3">Recursive Learning Loop</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Iteration:</span>
                    <span className="text-white">#{recursiveLearning.iteration}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Performance Δ:</span>
                    <span className="text-green-400">+{(recursiveLearning.performance_delta * 100).toFixed(2)}%</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-gray-400 text-[10px] mb-1">Learned Patterns:</div>
                    {recursiveLearning.patterns_learned.map((pattern, idx) => (
                      <div key={idx} className="text-white text-[10px] mb-1">• {pattern}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        <Button
          onClick={activateInference}
          disabled={activeInference}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          {activeInference ? 'Active Inference Running' : 'Activate Financial Agent'}
        </Button>
      </CardContent>
    </Card>
  );
}