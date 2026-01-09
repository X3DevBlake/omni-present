import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export class WeatherEngine {
  constructor() {
    this.currentWeather = 'clear';
    this.temperature = 20;
    this.humidity = 50;
    this.windSpeed = 5;
    this.windDirection = new THREE.Vector3(1, 0, 0);
    this.time = 0;
  }

  update(delta) {
    this.time += delta;
    
    // Dynamic weather transitions
    if (Math.random() < 0.001) {
      const weathers = ['clear', 'rain', 'storm', 'fog', 'snow'];
      this.currentWeather = weathers[Math.floor(Math.random() * weathers.length)];
    }

    // Temperature varies with time and weather
    const baseTemp = 20 + Math.sin(this.time * 0.1) * 10;
    const weatherMod = this.currentWeather === 'storm' ? -5 : this.currentWeather === 'clear' ? 5 : 0;
    this.temperature = baseTemp + weatherMod;

    // Humidity
    this.humidity = this.currentWeather === 'rain' || this.currentWeather === 'storm' ? 80 + Math.random() * 20 : 40 + Math.random() * 30;

    // Wind
    this.windSpeed = this.currentWeather === 'storm' ? 20 + Math.random() * 15 : 5 + Math.random() * 10;
    this.windDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), delta * 0.1);
  }

  getState() {
    return {
      weather: this.currentWeather,
      temperature: this.temperature,
      humidity: this.humidity,
      windSpeed: this.windSpeed,
      windDirection: this.windDirection.clone()
    };
  }
}

function RainParticles({ intensity = 1 }) {
  const particlesRef = useRef();
  const count = 500 * intensity;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = Math.random() * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, [count]);

  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.2;
        if (positions[i + 1] < 0) {
          positions[i + 1] = 20;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#3b82f6" transparent opacity={0.6} />
    </points>
  );
}

export function WeatherSystemRenderer({ weatherEngine }) {
  const [weather, setWeather] = useState('clear');

  useFrame((state, delta) => {
    weatherEngine.update(delta);
    setWeather(weatherEngine.currentWeather);
  });

  return (
    <>
      {weather === 'rain' && <RainParticles intensity={1} />}
      {weather === 'storm' && <RainParticles intensity={2} />}
      {weather === 'fog' && (
        <fog attach="fog" args={['#888888', 5, 20]} />
      )}
    </>
  );
}

export function ResourceRegenerationSystem({ resources, onResourceUpdate }) {
  useFrame((state, delta) => {
    const updatedResources = resources.map(resource => {
      let amount = resource.amount || 100;
      
      // Regeneration
      if (amount < 100) {
        amount += delta * (resource.regenRate || 1);
      }
      
      // Depletion from harvesting
      if (resource.beingHarvested) {
        amount -= delta * 5;
      }
      
      return { ...resource, amount: Math.max(0, Math.min(100, amount)) };
    });

    onResourceUpdate?.(updatedResources);
  });

  return null;
}