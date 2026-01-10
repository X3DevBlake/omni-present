import { base44 } from '@/api/base44Client';

export async function generateProceduralEnvironment(userEmail, params = {}) {
  const seed = params.seed || Math.floor(Math.random() * 1000000);

  const environment = {
    user_email: userEmail,
    name: params.name || `Procedural Environment ${seed}`,
    seed,
    scale: params.scale || 100,
    generation_params: {
      octaves: params.octaves || 4,
      persistence: params.persistence || 0.5,
      lacunarity: params.lacunarity || 2.0,
      offset: params.offset || { x: 0, y: 0 }
    },
    terrain_config: generateTerrainConfig(seed, params),
    weather_system: generateWeatherSystem(seed),
    physics_engine: {
      gravity: params.gravity || 9.81,
      friction: params.friction || 0.1,
      restitution: params.restitution || 0.5
    },
    interactive_elements: generateInteractiveElements(seed),
    complexity_level: params.complexity || 5,
    render_quality: params.quality || 'high'
  };

  return await base44.entities.ProceduralEnvironment.create(environment);
}

export async function getProceduralEnvironment(environmentId) {
  const env = await base44.entities.ProceduralEnvironment.filter({ id: environmentId });
  return env.length > 0 ? env[0] : null;
}

export async function regenerateEnvironment(environmentId, newSeed) {
  const env = await getProceduralEnvironment(environmentId);
  if (!env) return null;

  const updated = {
    ...env,
    seed: newSeed,
    terrain_config: generateTerrainConfig(newSeed, env.generation_params),
    weather_system: generateWeatherSystem(newSeed),
    interactive_elements: generateInteractiveElements(newSeed)
  };

  return await base44.entities.ProceduralEnvironment.update(environmentId, updated);
}

function generateTerrainConfig(seed, params = {}) {
  const rng = seededRandom(seed);

  return {
    height_map_resolution: 256,
    base_height: 0,
    peak_height: params.peak || 100,
    water_level: params.waterLevel || 30,
    terrain_type: ['mountains', 'plains', 'forest', 'desert'][Math.floor(rng() * 4)],
    biome_distribution: {
      forest: rng() * 0.3,
      desert: rng() * 0.2,
      mountains: rng() * 0.4,
      water: rng() * 0.1
    }
  };
}

function generateWeatherSystem(seed) {
  const rng = seededRandom(seed);

  return {
    temperature_base: 15 + rng() * 20,
    humidity: rng() * 100,
    wind_speed: rng() * 50,
    wind_direction: rng() * 360,
    weather_patterns: [
      {
        type: rng() > 0.5 ? 'clear' : 'rainy',
        intensity: rng() * 100,
        duration: 1000 + rng() * 5000
      },
      {
        type: rng() > 0.7 ? 'stormy' : 'clear',
        intensity: rng() * 100,
        duration: 500 + rng() * 3000
      }
    ],
    day_night_cycle: true,
    day_length: 1000
  };
}

function generateInteractiveElements(seed) {
  const rng = seededRandom(seed);
  const elements = [];

  for (let i = 0; i < 10 + Math.floor(rng() * 20); i++) {
    elements.push({
      id: `element_${i}`,
      type: ['obstacle', 'resource', 'trap', 'platform'][Math.floor(rng() * 4)],
      position: [
        rng() * 100 - 50,
        rng() * 50,
        rng() * 100 - 50
      ],
      size: [1, 5][Math.floor(rng())],
      properties: {
        interactable: rng() > 0.5,
        movable: rng() > 0.7,
        destructible: rng() > 0.6
      }
    });
  }

  return elements;
}

function seededRandom(seed) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export async function optimizeEnvironmentForSimulation(environmentId, agentCount) {
  const env = await getProceduralEnvironment(environmentId);
  if (!env) return null;

  // Adjust complexity based on agent count
  const scaleFactor = Math.log(agentCount + 1);
  const newComplexity = Math.min(10, env.complexity_level * scaleFactor);

  // Adjust render quality if needed
  const newQuality = agentCount > 100 ? 'medium' : env.render_quality;

  return await base44.entities.ProceduralEnvironment.update(environmentId, {
    complexity_level: newComplexity,
    render_quality: newQuality
  });
}