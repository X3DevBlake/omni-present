// Comprehensive AI Hardware Component Library
export const COMPONENT_LIBRARY = {
  processors: {
    'nvidia-h100': {
      name: 'NVIDIA H100 GPU',
      type: 'GPU',
      performance: { tflops: 2000, memory: 80, bandwidth: 3200 },
      power: { tdp: 700, idle: 100 },
      thermal: { maxTemp: 89, optimalTemp: 75 },
      cost: 30000,
      aiWorkloads: ['training', 'inference'],
      interconnects: ['nvlink', 'pcie5'],
      model3d: 'gpu-high-end',
      color: '#a855f7'
    },
    'nvidia-a100': {
      name: 'NVIDIA A100 GPU',
      type: 'GPU',
      performance: { tflops: 1248, memory: 80, bandwidth: 2039 },
      power: { tdp: 400, idle: 70 },
      thermal: { maxTemp: 85, optimalTemp: 72 },
      cost: 15000,
      aiWorkloads: ['training', 'inference'],
      interconnects: ['nvlink', 'pcie4'],
      model3d: 'gpu-mid-end',
      color: '#8b5cf6'
    },
    'google-tpu-v4': {
      name: 'Google TPU v4',
      type: 'TPU',
      performance: { tflops: 275, memory: 32, bandwidth: 1200 },
      power: { tdp: 300, idle: 50 },
      thermal: { maxTemp: 80, optimalTemp: 68 },
      cost: 20000,
      aiWorkloads: ['training', 'inference'],
      interconnects: ['custom-interconnect'],
      model3d: 'tpu',
      color: '#ec4899'
    },
    'amd-mi300x': {
      name: 'AMD MI300X',
      type: 'GPU',
      performance: { tflops: 1300, memory: 192, bandwidth: 5300 },
      power: { tdp: 750, idle: 110 },
      thermal: { maxTemp: 95, optimalTemp: 80 },
      cost: 25000,
      aiWorkloads: ['training', 'inference'],
      interconnects: ['infinity-fabric', 'pcie5'],
      model3d: 'gpu-high-end',
      color: '#f59e0b'
    },
    'cerebras-cs2': {
      name: 'Cerebras CS-2',
      type: 'Wafer-Scale',
      performance: { tflops: 350000, memory: 40, bandwidth: 20000 },
      power: { tdp: 20000, idle: 2000 },
      thermal: { maxTemp: 70, optimalTemp: 60 },
      cost: 2000000,
      aiWorkloads: ['training'],
      interconnects: ['custom'],
      model3d: 'wafer',
      color: '#06b6d4'
    },
    'intel-gaudi2': {
      name: 'Intel Gaudi2',
      type: 'AI Accelerator',
      performance: { tflops: 1200, memory: 96, bandwidth: 2450 },
      power: { tdp: 600, idle: 90 },
      thermal: { maxTemp: 85, optimalTemp: 70 },
      cost: 18000,
      aiWorkloads: ['training', 'inference'],
      interconnects: ['gaudi-scale', 'pcie5'],
      model3d: 'accelerator',
      color: '#3b82f6'
    }
  },
  
  memory: {
    'hbm3-128gb': {
      name: 'HBM3 128GB Module',
      type: 'Memory',
      performance: { bandwidth: 3200, capacity: 128, latency: 2 },
      power: { tdp: 30, idle: 5 },
      thermal: { maxTemp: 85, optimalTemp: 65 },
      cost: 5000,
      compatibility: ['nvidia-h100', 'amd-mi300x'],
      model3d: 'memory-high',
      color: '#10b981'
    },
    'ddr5-512gb': {
      name: 'DDR5 512GB Kit',
      type: 'System Memory',
      performance: { bandwidth: 800, capacity: 512, latency: 13 },
      power: { tdp: 50, idle: 10 },
      thermal: { maxTemp: 85, optimalTemp: 60 },
      cost: 2000,
      compatibility: ['all'],
      model3d: 'memory-standard',
      color: '#22c55e'
    }
  },
  
  networking: {
    'mellanox-cx7': {
      name: 'NVIDIA Mellanox CX-7',
      type: 'Network Adapter',
      performance: { bandwidth: 400, latency: 0.6, ports: 2 },
      power: { tdp: 75, idle: 15 },
      thermal: { maxTemp: 80, optimalTemp: 60 },
      cost: 3000,
      protocols: ['rdma', 'roce', 'infiniband'],
      model3d: 'network-card',
      color: '#06b6d4'
    },
    'infiniband-hdr': {
      name: 'InfiniBand HDR Switch',
      type: 'Network Switch',
      performance: { bandwidth: 16800, latency: 0.1, ports: 40 },
      power: { tdp: 500, idle: 100 },
      thermal: { maxTemp: 75, optimalTemp: 55 },
      cost: 25000,
      protocols: ['infiniband'],
      model3d: 'switch',
      color: '#0ea5e9'
    }
  },
  
  storage: {
    'nvme-gen5-30tb': {
      name: 'NVMe Gen5 30TB',
      type: 'Storage',
      performance: { readSpeed: 14000, writeSpeed: 12000, capacity: 30000 },
      power: { tdp: 25, idle: 5 },
      thermal: { maxTemp: 70, optimalTemp: 50 },
      cost: 8000,
      interface: 'pcie5',
      model3d: 'storage',
      color: '#f59e0b'
    }
  },
  
  cooling: {
    'liquid-cooling-480w': {
      name: 'Liquid Cooling 480W',
      type: 'Cooling',
      performance: { coolingCapacity: 480, airflow: 200 },
      power: { tdp: 40, idle: 10 },
      cost: 800,
      compatibility: ['nvidia-h100', 'amd-mi300x'],
      model3d: 'cooling',
      color: '#06b6d4'
    }
  }
};

export function getOptimalConfiguration(constraints) {
  const { budget, workload, scale, priority } = constraints;
  const config = { components: [], estimatedCost: 0, estimatedPerformance: 0 };
  
  // Budget mapping
  const budgetLimits = {
    low: 50000,
    medium: 200000,
    high: 1000000,
    unlimited: Infinity
  };
  
  const maxBudget = budgetLimits[budget] || 200000;
  
  // Workload requirements
  const workloadRequirements = {
    'ai-training': { gpuCount: 8, memoryPerGpu: 80, networking: 'high', priority: 'compute' },
    'ai-inference': { gpuCount: 4, memoryPerGpu: 40, networking: 'medium', priority: 'latency' },
    'mixed': { gpuCount: 6, memoryPerGpu: 60, networking: 'high', priority: 'balanced' },
    'research': { gpuCount: 4, memoryPerGpu: 80, networking: 'medium', priority: 'memory' }
  };
  
  const requirements = workloadRequirements[workload] || workloadRequirements['mixed'];
  
  // Scale multiplier
  const scaleMultiplier = { small: 0.5, medium: 1, large: 2 }[scale] || 1;
  const targetGpuCount = Math.ceil(requirements.gpuCount * scaleMultiplier);
  
  // Select GPU based on budget and requirements
  let selectedGpu = null;
  if (maxBudget > 500000 && workload === 'ai-training') {
    selectedGpu = COMPONENT_LIBRARY.processors['nvidia-h100'];
  } else if (maxBudget > 200000) {
    selectedGpu = COMPONENT_LIBRARY.processors['nvidia-a100'];
  } else if (maxBudget > 100000) {
    selectedGpu = COMPONENT_LIBRARY.processors['intel-gaudi2'];
  } else {
    selectedGpu = COMPONENT_LIBRARY.processors['nvidia-a100'];
  }
  
  // Add GPUs
  const affordableGpuCount = Math.min(targetGpuCount, Math.floor(maxBudget * 0.6 / selectedGpu.cost));
  for (let i = 0; i < affordableGpuCount; i++) {
    config.components.push({
      ...selectedGpu,
      id: `gpu-${i}`,
      position: [i % 2 === 0 ? 1.2 : -1.2, 0, (i % 4) * 0.5]
    });
    config.estimatedCost += selectedGpu.cost;
    config.estimatedPerformance += selectedGpu.performance.tflops;
  }
  
  // Add memory
  const memoryModule = COMPONENT_LIBRARY.memory['hbm3-128gb'];
  config.components.push({
    ...memoryModule,
    id: 'memory-pool',
    position: [0, -0.8, 0]
  });
  config.estimatedCost += memoryModule.cost;
  
  // Add networking
  if (requirements.networking === 'high' && config.estimatedCost + 25000 < maxBudget) {
    const networkSwitch = COMPONENT_LIBRARY.networking['infiniband-hdr'];
    config.components.push({
      ...networkSwitch,
      id: 'network-hub',
      position: [0, 0, -1.5]
    });
    config.estimatedCost += networkSwitch.cost;
  } else {
    const networkCard = COMPONENT_LIBRARY.networking['mellanox-cx7'];
    config.components.push({
      ...networkCard,
      id: 'network-adapter',
      position: [0, 0, -1.2]
    });
    config.estimatedCost += networkCard.cost;
  }
  
  // Add storage
  const storage = COMPONENT_LIBRARY.storage['nvme-gen5-30tb'];
  config.components.push({
    ...storage,
    id: 'storage',
    position: [0, -0.5, -0.8]
  });
  config.estimatedCost += storage.cost;
  
  // Add cooling
  const cooling = COMPONENT_LIBRARY.cooling['liquid-cooling-480w'];
  config.components.push({
    ...cooling,
    id: 'cooling-system',
    position: [0, 0.8, 0]
  });
  config.estimatedCost += cooling.cost * affordableGpuCount;
  
  return config;
}

export default COMPONENT_LIBRARY;