import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export class EnvironmentalCycle {
  constructor() {
    this.timeOfDay = 0.5; // 0 = midnight, 0.5 = noon, 1 = midnight
    this.season = 'spring'; // spring, summer, autumn, winter
    this.weatherPattern = 'clear';
    this.resourceCycle = { food: 1.0, water: 1.0 };
    this.dayCounter = 0;
  }

  update(deltaTime) {
    this.timeOfDay += deltaTime * 0.001; // Adjust speed
    if (this.timeOfDay >= 1) {
      this.timeOfDay = 0;
      this.dayCounter++;
      this.updateSeason();
      this.updateWeatherPattern();
    }

    this.updateResourceAvailability();
  }

  updateSeason() {
    const seasonCycle = Math.floor(this.dayCounter / 30) % 4;
    this.season = ['spring', 'summer', 'autumn', 'winter'][seasonCycle];
  }

  updateWeatherPattern() {
    const patterns = ['clear', 'rain', 'storm', 'fog', 'snow'];
    const seasonWeights = {
      spring: [0.5, 0.3, 0.1, 0.1, 0],
      summer: [0.7, 0.2, 0.1, 0, 0],
      autumn: [0.4, 0.3, 0.1, 0.2, 0],
      winter: [0.3, 0.1, 0.1, 0, 0.5]
    };

    const weights = seasonWeights[this.season];
    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < patterns.length; i++) {
      cumulative += weights[i];
      if (random < cumulative) {
        this.weatherPattern = patterns[i];
        break;
      }
    }
  }

  updateResourceAvailability() {
    const seasonModifiers = {
      spring: { food: 1.2, water: 1.1 },
      summer: { food: 1.5, water: 0.9 },
      autumn: { food: 1.3, water: 1.0 },
      winter: { food: 0.6, water: 0.8 }
    };

    const timeOfDayMod = Math.sin(this.timeOfDay * Math.PI) * 0.2 + 0.9;
    const seasonMod = seasonModifiers[this.season];

    this.resourceCycle.food = seasonMod.food * timeOfDayMod;
    this.resourceCycle.water = seasonMod.water;
  }

  getLightingConfig() {
    const intensity = Math.max(0.2, Math.sin(this.timeOfDay * Math.PI * 2));
    const colorTemp = this.timeOfDay < 0.25 || this.timeOfDay > 0.75 ? '#4466ff' : '#ffeeaa';

    return {
      ambientIntensity: intensity * 0.5,
      directionalIntensity: intensity,
      color: colorTemp,
      shadowIntensity: 1 - intensity
    };
  }

  shouldAgentsAdapt() {
    return {
      seekShelter: this.weatherPattern === 'storm' || this.weatherPattern === 'snow',
      reduceActivity: this.timeOfDay < 0.25 || this.timeOfDay > 0.75,
      gatherResources: this.season === 'summer' || this.season === 'autumn',
      conserveEnergy: this.season === 'winter'
    };
  }
}

export function DynamicSkybox({ environmentCycle }) {
  const skyRef = useRef();

  useFrame(() => {
    if (skyRef.current && skyRef.current.material && environmentCycle) {
      const lighting = environmentCycle.getLightingConfig();
      skyRef.current.material.color.set(lighting.color);
    }
  });

  return (
    <mesh ref={skyRef} scale={[500, 500, 500]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial side={THREE.BackSide} color="#87ceeb" />
    </mesh>
  );
}

export class AgentConstructionSystem {
  constructor() {
    this.structures = [];
    this.terraformingProjects = [];
    this.ecologicalFootprints = [];
  }

  buildStructure(agentId, type, position) {
    const structure = {
      id: `structure_${Date.now()}`,
      type, // shelter, tower, farm, workshop, monument
      position,
      builder: agentId,
      progress: 0,
      completed: false,
      resourceCost: this.getResourceCost(type),
      durability: 100,
      effects: this.getStructureEffects(type)
    };

    this.structures.push(structure);
    return structure;
  }

  getResourceCost(type) {
    const costs = {
      shelter: { wood: 10, stone: 5 },
      tower: { stone: 20, metal: 10 },
      farm: { wood: 5, water: 10 },
      workshop: { wood: 15, metal: 5 },
      monument: { stone: 50, metal: 20 }
    };
    return costs[type] || {};
  }

  getStructureEffects(type) {
    const effects = {
      shelter: { protection: 20, capacity: 5 },
      tower: { visibility: 50, defense: 30 },
      farm: { foodProduction: 15 },
      workshop: { toolEfficiency: 25 },
      monument: { morale: 30, culturalValue: 50 }
    };
    return effects[type] || {};
  }

  terraform(agentId, type, position, radius) {
    const project = {
      id: `terraform_${Date.now()}`,
      type, // flatten, dig, raise, irrigate
      position,
      radius,
      initiator: agentId,
      progress: 0,
      completed: false,
      permanentChange: true
    };

    this.terraformingProjects.push(project);
    this.addEcologicalFootprint(agentId, type, position);
    return project;
  }

  addEcologicalFootprint(agentId, type, position) {
    this.ecologicalFootprints.push({
      agent: agentId,
      type,
      position,
      timestamp: Date.now(),
      impact: this.calculateImpact(type),
      decayRate: type === 'dig' ? 0.001 : 0.01 // Some changes last longer
    });
  }

  calculateImpact(type) {
    const impacts = {
      flatten: { soil: -5, accessibility: 10 },
      dig: { soil: -15, resources: 5 },
      raise: { soil: 10, visibility: 5 },
      irrigate: { water: 10, fertility: 20 }
    };
    return impacts[type] || {};
  }

  updateStructures(deltaTime) {
    this.structures.forEach(structure => {
      if (!structure.completed && structure.progress < 100) {
        structure.progress += deltaTime * 0.1;
        if (structure.progress >= 100) {
          structure.completed = true;
        }
      }

      // Natural decay
      if (structure.completed) {
        structure.durability -= deltaTime * 0.001;
      }
    });

    // Remove destroyed structures
    this.structures = this.structures.filter(s => s.durability > 0);
  }

  updateTerraforming(deltaTime) {
    this.terraformingProjects.forEach(project => {
      if (!project.completed && project.progress < 100) {
        project.progress += deltaTime * 0.05;
        if (project.progress >= 100) {
          project.completed = true;
        }
      }
    });
  }

  decayFootprints(deltaTime) {
    this.ecologicalFootprints = this.ecologicalFootprints.map(footprint => {
      const age = Date.now() - footprint.timestamp;
      const decayed = { ...footprint };
      
      Object.keys(decayed.impact).forEach(key => {
        decayed.impact[key] *= (1 - footprint.decayRate * deltaTime);
      });

      return decayed;
    }).filter(f => Object.values(f.impact).some(v => Math.abs(v) > 0.1));
  }

  getEnvironmentalImpact() {
    const totalImpact = { soil: 0, water: 0, accessibility: 0, fertility: 0 };
    
    this.ecologicalFootprints.forEach(footprint => {
      Object.entries(footprint.impact).forEach(([key, value]) => {
        totalImpact[key] = (totalImpact[key] || 0) + value;
      });
    });

    return totalImpact;
  }
}

export function StructureRenderer({ structures }) {
  return (
    <group>
      {structures.map(structure => (
        <mesh key={structure.id} position={structure.position}>
          <boxGeometry args={structure.type === 'monument' ? [3, 5, 3] : [2, 2, 2]} />
          <meshStandardMaterial 
            color={structure.completed ? '#8b4513' : '#666666'} 
            opacity={structure.progress / 100}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}