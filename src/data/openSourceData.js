/**
 * Open Source Data Integration Layer
 * Mock datasets + real open data source configurations
 */

// ─── Global Network Nodes (Open Data) ────────────────────
export const globalNetworkNodes = [
  { id: 'us-east', lat: 40.7128, lon: -74.006, label: 'US East', value: 'NYC Hub', color: '#a855f7', size: 0.03 },
  { id: 'us-west', lat: 37.7749, lon: -122.4194, label: 'US West', value: 'SF Hub', color: '#a855f7', size: 0.025 },
  { id: 'eu-west', lat: 51.5074, lon: -0.1278, label: 'EU West', value: 'London Hub', color: '#22d3ee', size: 0.03 },
  { id: 'eu-central', lat: 52.52, lon: 13.405, label: 'EU Central', value: 'Berlin Hub', color: '#22d3ee', size: 0.02 },
  { id: 'asia-east', lat: 35.6762, lon: 139.6503, label: 'Asia East', value: 'Tokyo Hub', color: '#ec4899', size: 0.03 },
  { id: 'asia-south', lat: 1.3521, lon: 103.8198, label: 'Asia South', value: 'Singapore Hub', color: '#ec4899', size: 0.025 },
  { id: 'oceania', lat: -33.8688, lon: 151.2093, label: 'Oceania', value: 'Sydney Hub', color: '#f97316', size: 0.02 },
  { id: 'sa', lat: -23.5505, lon: -46.6333, label: 'South America', value: 'São Paulo Hub', color: '#22c55e', size: 0.02 },
  { id: 'africa', lat: -1.2921, lon: 36.8219, label: 'Africa', value: 'Nairobi Hub', color: '#eab308', size: 0.02 },
  { id: 'india', lat: 19.076, lon: 72.8777, label: 'India', value: 'Mumbai Hub', color: '#ec4899', size: 0.025 },
  { id: 'canada', lat: 45.5017, lon: -73.5673, label: 'Canada', value: 'Montreal Hub', color: '#a855f7', size: 0.02 },
  { id: 'nordic', lat: 59.3293, lon: 18.0686, label: 'Nordic', value: 'Stockholm Hub', color: '#22d3ee', size: 0.02 },
];

export const globalConnections = [
  { from: [40.7128, -74.006], to: [51.5074, -0.1278], color: '#a855f7' },
  { from: [40.7128, -74.006], to: [37.7749, -122.4194], color: '#a855f7' },
  { from: [51.5074, -0.1278], to: [52.52, 13.405], color: '#22d3ee' },
  { from: [51.5074, -0.1278], to: [35.6762, 139.6503], color: '#ec4899' },
  { from: [35.6762, 139.6503], to: [1.3521, 103.8198], color: '#ec4899' },
  { from: [1.3521, 103.8198], to: [-33.8688, 151.2093], color: '#f97316' },
  { from: [37.7749, -122.4194], to: [35.6762, 139.6503], color: '#ec4899' },
  { from: [52.52, 13.405], to: [19.076, 72.8777], color: '#22d3ee' },
  { from: [-23.5505, -46.6333], to: [40.7128, -74.006], color: '#22c55e' },
  { from: [-1.2921, 36.8219], to: [51.5074, -0.1278], color: '#eab308' },
  { from: [45.5017, -73.5673], to: [40.7128, -74.006], color: '#a855f7' },
  { from: [59.3293, 18.0686], to: [52.52, 13.405], color: '#22d3ee' },
  { from: [19.076, 72.8777], to: [1.3521, 103.8198], color: '#ec4899' },
  { from: [-33.8688, 151.2093], to: [35.6762, 139.6503], color: '#f97316' },
];

// ─── Mock Agent Fleet Data ────────────────────────────────
export const mockAgentFleet = [
  { id: 'agent-001', name: 'Sentinel Alpha', type: 'autonomous', status: 'active', intelligence: 92, tasks: 1847, performance: 97, location: 'us-east' },
  { id: 'agent-002', name: 'Oracle Prime', type: 'specialist', status: 'active', intelligence: 88, tasks: 1203, performance: 94, location: 'eu-west' },
  { id: 'agent-003', name: 'Nexus Core', type: 'swarm-node', status: 'training', intelligence: 76, tasks: 890, performance: 89, location: 'asia-east' },
  { id: 'agent-004', name: 'Cipher Ghost', type: 'sentinel', status: 'active', intelligence: 95, tasks: 2103, performance: 99, location: 'us-west' },
  { id: 'agent-005', name: 'Quantum Weaver', type: 'specialist', status: 'active', intelligence: 84, tasks: 756, performance: 91, location: 'eu-central' },
  { id: 'agent-006', name: 'Echo Fragment', type: 'assistant', status: 'idle', intelligence: 71, tasks: 432, performance: 86, location: 'asia-south' },
  { id: 'agent-007', name: 'Void Walker', type: 'autonomous', status: 'active', intelligence: 90, tasks: 1567, performance: 96, location: 'oceania' },
  { id: 'agent-008', name: 'Data Sphinx', type: 'specialist', status: 'active', intelligence: 87, tasks: 1034, performance: 93, location: 'india' },
];

// ─── Mock System Metrics (Time Series) ───────────────────
export function generateTimeSeriesData(hours = 24, interval = 15) {
  const data = [];
  const now = Date.now();
  const points = (hours * 60) / interval;
  for (let i = 0; i < points; i++) {
    const t = i / points;
    data.push({
      timestamp: new Date(now - (points - i) * interval * 60000).toISOString(),
      cpu: 30 + Math.sin(t * Math.PI * 4) * 20 + Math.random() * 10,
      memory: 45 + Math.sin(t * Math.PI * 2) * 15 + Math.random() * 5,
      network: 100 + Math.sin(t * Math.PI * 6) * 50 + Math.random() * 20,
      agents_active: Math.floor(5 + Math.sin(t * Math.PI * 3) * 3 + Math.random() * 2),
      requests_per_sec: Math.floor(200 + Math.sin(t * Math.PI * 8) * 100 + Math.random() * 50),
      latency_ms: 20 + Math.sin(t * Math.PI * 5) * 10 + Math.random() * 5,
    });
  }
  return data;
}

// ─── Mock 4D Dataset ─────────────────────────────────────
export function generate4DDataset(count = 200, type = 'market') {
  const data = [];
  for (let i = 0; i < count; i++) {
    const t = i / count;
    switch (type) {
      case 'market':
        data.push({
          x: Math.sin(t * Math.PI * 4) * 2 + (Math.random() - 0.5) * 0.3,
          y: Math.cos(t * Math.PI * 3) * 1.5 + t * 0.5,
          z: Math.sin(t * Math.PI * 2 + 1) * 1.8,
          w: Math.cos(t * Math.PI * 5) * 1.2,
          label: `Trade ${i}`,
          value: `$${(Math.random() * 10000).toFixed(2)}`,
          category: t < 0.25 ? 'low' : t < 0.5 ? 'mid' : t < 0.75 ? 'high' : 'alpha',
        });
        break;
      case 'neural':
        const layer = Math.floor(t * 5);
        data.push({
          x: (layer - 2) * 1.2,
          y: (Math.random() - 0.5) * 3,
          z: (Math.random() - 0.5) * 3,
          w: Math.sin(layer + t) * 1.5,
          label: `Neuron L${layer}-${i}`,
          value: `Act: ${(Math.random()).toFixed(3)}`,
          category: ['alpha', 'beta', 'gamma', 'delta', 'alpha'][layer],
        });
        break;
      case 'simulation':
        data.push({
          x: Math.cos(t * Math.PI * 8) * (1 + t * 2),
          y: Math.sin(t * Math.PI * 8) * (1 + t * 2),
          z: t * 4 - 2,
          w: Math.sin(t * Math.PI * 12) * 2,
          label: `Step ${i}`,
          value: `E: ${(Math.random() * 100).toFixed(1)}`,
          category: t < 0.33 ? 'low' : t < 0.66 ? 'mid' : 'high',
        });
        break;
      default:
        data.push({
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 4,
          z: (Math.random() - 0.5) * 4,
          w: (Math.random() - 0.5) * 4,
          label: `Point ${i}`,
          value: Math.round(Math.random() * 100),
          category: Math.random() > 0.5 ? 'A' : 'B',
        });
    }
  }
  return data;
}

// ─── Mock Webhook Activity Log ───────────────────────────
export function generateWebhookLogs(count = 50) {
  const events = ['agent.task_completed', 'data.updated', 'system.health_check', 'workflow.completed', 'agent.evolved', 'simulation.completed', 'defi.trade_executed', 'data.anomaly_detected'];
  const statuses = ['success', 'success', 'success', 'success', 'failed', 'retry'];
  const endpoints = ['https://api.omni.io/hooks/alpha', 'https://hooks.slack.com/omni', 'https://api.datadog.com/webhooks', 'https://n8n.omni.cloud/webhook/proc'];
  const logs = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    logs.push({
      id: `wh-log-${i}`,
      event: events[Math.floor(Math.random() * events.length)],
      endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
      status,
      response_code: status === 'success' ? 200 : status === 'failed' ? 500 : 429,
      latency_ms: Math.floor(Math.random() * 500 + 50),
      timestamp: new Date(now - i * 120000).toISOString(),
      payload_size: Math.floor(Math.random() * 5000 + 200),
      retry_count: status === 'retry' ? Math.floor(Math.random() * 3 + 1) : 0,
    });
  }
  return logs;
}

// ─── Open Data Sources Configuration ─────────────────────
export const openDataSources = [
  {
    id: 'world-bank',
    name: 'World Bank Open Data',
    url: 'https://api.worldbank.org/v2',
    type: 'api',
    format: 'json',
    description: 'Global development indicators and statistics',
    categories: ['economics', 'population', 'health', 'education'],
  },
  {
    id: 'noaa-weather',
    name: 'NOAA Weather Data',
    url: 'https://api.weather.gov',
    type: 'api',
    format: 'json',
    description: 'National weather service forecasts and observations',
    categories: ['weather', 'climate', 'alerts'],
  },
  {
    id: 'github-events',
    name: 'GitHub Public Events',
    url: 'https://api.github.com/events',
    type: 'stream',
    format: 'json',
    description: 'Real-time public event stream from GitHub',
    categories: ['development', 'open-source', 'activity'],
  },
  {
    id: 'earthquake-usgs',
    name: 'USGS Earthquake Data',
    url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
    type: 'api',
    format: 'json',
    description: 'Real-time earthquake data worldwide',
    categories: ['geology', 'natural-disasters', 'seismology'],
  },
  {
    id: 'crypto-prices',
    name: 'CoinGecko Market Data',
    url: 'https://api.coingecko.com/api/v3',
    type: 'api',
    format: 'json',
    description: 'Cryptocurrency market data and pricing',
    categories: ['crypto', 'finance', 'markets'],
  },
  {
    id: 'nasa-neo',
    name: 'NASA Near Earth Objects',
    url: 'https://api.nasa.gov/neo/rest/v1',
    type: 'api',
    format: 'json',
    description: 'Near-Earth asteroid tracking data',
    categories: ['space', 'astronomy', 'tracking'],
  },
  {
    id: 'open-meteo',
    name: 'Open-Meteo Weather API',
    url: 'https://api.open-meteo.com/v1',
    type: 'api',
    format: 'json',
    description: 'Free weather forecast API with historical data',
    categories: ['weather', 'forecast', 'climate'],
  },
  {
    id: 'restcountries',
    name: 'REST Countries',
    url: 'https://restcountries.com/v3.1',
    type: 'api',
    format: 'json',
    description: 'Country data including demographics and geography',
    categories: ['geography', 'demographics', 'countries'],
  },
];

// ─── System Activity Feed ────────────────────────────────
export function generateActivityFeed(count = 20) {
  const activities = [
    { type: 'agent', action: 'completed task', icon: 'bot', color: '#a855f7' },
    { type: 'webhook', action: 'triggered successfully', icon: 'webhook', color: '#f97316' },
    { type: 'data', action: 'pipeline processed', icon: 'database', color: '#22d3ee' },
    { type: 'simulation', action: 'reached checkpoint', icon: 'play', color: '#22c55e' },
    { type: 'system', action: 'health check passed', icon: 'heart', color: '#ec4899' },
    { type: 'defi', action: 'trade executed', icon: 'trending-up', color: '#eab308' },
    { type: 'model', action: 'training epoch completed', icon: 'brain', color: '#8b5cf6' },
    { type: 'alert', action: 'anomaly detected', icon: 'alert-triangle', color: '#ef4444' },
  ];
  const feed = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const activity = activities[Math.floor(Math.random() * activities.length)];
    feed.push({
      id: `act-${i}`,
      ...activity,
      detail: `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} ${activity.action}`,
      timestamp: new Date(now - i * Math.floor(Math.random() * 300000 + 30000)).toISOString(),
      metadata: {
        agent: mockAgentFleet[Math.floor(Math.random() * mockAgentFleet.length)]?.name,
        duration: `${Math.floor(Math.random() * 5000)}ms`,
      },
    });
  }
  return feed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export default {
  globalNetworkNodes,
  globalConnections,
  mockAgentFleet,
  generateTimeSeriesData,
  generate4DDataset,
  generateWebhookLogs,
  openDataSources,
  generateActivityFeed,
};
