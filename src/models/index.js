/**
 * Omni-Present Data Models & Schemas
 * Core entity definitions for the entire platform
 */

// ─── Agent Model ──────────────────────────────────────────
export const AgentSchema = {
  name: 'Agent',
  fields: {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true, maxLength: 100 },
    type: { type: 'enum', values: ['autonomous', 'assistant', 'specialist', 'swarm-node', 'sentinel'] },
    status: { type: 'enum', values: ['active', 'idle', 'training', 'offline', 'error'], default: 'idle' },
    intelligence_level: { type: 'number', min: 0, max: 100, default: 50 },
    capabilities: { type: 'array', items: 'string' },
    model_type: { type: 'string' },
    training_data_size: { type: 'number', default: 0 },
    performance_score: { type: 'number', min: 0, max: 100 },
    tasks_completed: { type: 'number', default: 0 },
    uptime_hours: { type: 'number', default: 0 },
    memory_usage_mb: { type: 'number', default: 0 },
    created_at: { type: 'datetime' },
    updated_at: { type: 'datetime' },
    owner_id: { type: 'string' },
    tags: { type: 'array', items: 'string' },
    config: { type: 'object' },
  },
};

// ─── Webhook Model ────────────────────────────────────────
export const WebhookSchema = {
  name: 'Webhook',
  fields: {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    endpoint_url: { type: 'string', required: true },
    method: { type: 'enum', values: ['POST', 'PUT', 'PATCH', 'DELETE'], default: 'POST' },
    event_triggers: { type: 'array', items: 'string', required: true },
    is_active: { type: 'boolean', default: true },
    secret_key: { type: 'string' },
    retry_config: {
      type: 'object',
      shape: {
        max_retries: { type: 'number', default: 3 },
        backoff_multiplier: { type: 'number', default: 2 },
        initial_delay_ms: { type: 'number', default: 1000 },
      },
    },
    headers: { type: 'object' },
    payload_template: { type: 'string' },
    last_triggered: { type: 'datetime' },
    success_count: { type: 'number', default: 0 },
    failure_count: { type: 'number', default: 0 },
    created_at: { type: 'datetime' },
    tags: { type: 'array', items: 'string' },
  },
};

// ─── Webhook Event Types ──────────────────────────────────
export const WebhookEventTypes = {
  agent: [
    'agent.created', 'agent.updated', 'agent.deleted',
    'agent.started', 'agent.stopped', 'agent.error',
    'agent.task_completed', 'agent.task_failed',
    'agent.evolved', 'agent.deployed',
  ],
  system: [
    'system.health_check', 'system.alert',
    'system.maintenance_start', 'system.maintenance_end',
    'system.resource_threshold',
  ],
  data: [
    'data.created', 'data.updated', 'data.deleted',
    'data.import_complete', 'data.export_complete',
    'data.anomaly_detected',
  ],
  workflow: [
    'workflow.started', 'workflow.completed', 'workflow.failed',
    'workflow.step_completed', 'workflow.paused', 'workflow.resumed',
  ],
  simulation: [
    'simulation.started', 'simulation.completed',
    'simulation.checkpoint', 'simulation.divergence_detected',
  ],
  defi: [
    'defi.trade_executed', 'defi.price_alert',
    'defi.liquidity_change', 'defi.governance_vote',
  ],
};

// ─── Visualization Model ──────────────────────────────────
export const VisualizationSchema = {
  name: 'Visualization',
  fields: {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    type: { type: 'enum', values: ['4d-graph', '4d-scatter', 'earth-globe', 'tesseract', 'neural-network', 'flow-diagram', 'time-series'] },
    dimensions: { type: 'number', min: 2, max: 4, default: 3 },
    data_source: { type: 'string' },
    config: {
      type: 'object',
      shape: {
        colorScheme: { type: 'string', default: 'cosmic' },
        autoRotate: { type: 'boolean', default: true },
        showAxes: { type: 'boolean', default: true },
        showGrid: { type: 'boolean', default: true },
        particleCount: { type: 'number', default: 500 },
        animationSpeed: { type: 'number', default: 1 },
      },
    },
    data_points: { type: 'array' },
    created_at: { type: 'datetime' },
  },
};

// ─── Hub Model ────────────────────────────────────────────
export const HubSchema = {
  name: 'Hub',
  fields: {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    category: { type: 'string', required: true },
    description: { type: 'string' },
    icon: { type: 'string' },
    status: { type: 'enum', values: ['active', 'maintenance', 'deprecated'], default: 'active' },
    agent_count: { type: 'number', default: 0 },
    user_count: { type: 'number', default: 0 },
    metrics: { type: 'object' },
    created_at: { type: 'datetime' },
  },
};

// ─── Data Source Model ────────────────────────────────────
export const DataSourceSchema = {
  name: 'DataSource',
  fields: {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    type: { type: 'enum', values: ['api', 'database', 'file', 'stream', 'webhook', 'open-data'] },
    url: { type: 'string' },
    format: { type: 'enum', values: ['json', 'csv', 'xml', 'graphql', 'websocket'] },
    refresh_interval_ms: { type: 'number', default: 60000 },
    is_active: { type: 'boolean', default: true },
    last_fetch: { type: 'datetime' },
    record_count: { type: 'number', default: 0 },
    schema: { type: 'object' },
    credentials: { type: 'object' },
  },
};

// ─── Simulation Model ─────────────────────────────────────
export const SimulationSchema = {
  name: 'Simulation',
  fields: {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    type: { type: 'enum', values: ['agent-behavior', 'market', 'physics', 'network', 'economic', 'weather', 'traffic'] },
    status: { type: 'enum', values: ['idle', 'running', 'paused', 'completed', 'failed'], default: 'idle' },
    dimensions: { type: 'number', min: 2, max: 4, default: 3 },
    time_steps: { type: 'number', default: 1000 },
    current_step: { type: 'number', default: 0 },
    parameters: { type: 'object' },
    results: { type: 'object' },
    started_at: { type: 'datetime' },
    completed_at: { type: 'datetime' },
  },
};

// ─── Model Registry (all models) ─────────────────────────
export const ModelRegistry = {
  Agent: AgentSchema,
  Webhook: WebhookSchema,
  Visualization: VisualizationSchema,
  Hub: HubSchema,
  DataSource: DataSourceSchema,
  Simulation: SimulationSchema,
};

// ─── Model Validation Utility ─────────────────────────────
export function validateEntity(schema, data) {
  const errors = [];
  for (const [field, rules] of Object.entries(schema.fields)) {
    const value = data[field];
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push({ field, message: `${field} is required` });
    }
    if (value !== undefined && rules.type === 'enum' && rules.values && !rules.values.includes(value)) {
      errors.push({ field, message: `${field} must be one of: ${rules.values.join(', ')}` });
    }
    if (value !== undefined && rules.type === 'number') {
      if (rules.min !== undefined && value < rules.min) errors.push({ field, message: `${field} must be >= ${rules.min}` });
      if (rules.max !== undefined && value > rules.max) errors.push({ field, message: `${field} must be <= ${rules.max}` });
    }
    if (value !== undefined && rules.type === 'string' && rules.maxLength && value.length > rules.maxLength) {
      errors.push({ field, message: `${field} must be <= ${rules.maxLength} characters` });
    }
  }
  return { valid: errors.length === 0, errors };
}

export default ModelRegistry;
