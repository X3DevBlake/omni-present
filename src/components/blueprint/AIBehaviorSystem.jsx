// AI Behavior System inspired by Sima 2
// Enables autonomous exploration, task execution, and environmental interaction

export const BehaviorStates = {
  IDLE: 'idle',
  EXPLORING: 'exploring',
  MOVING: 'moving',
  INTERACTING: 'interacting',
  OBSERVING: 'observing'
};

export const PersonalityTraits = {
  CURIOUS: { explorationRate: 0.8, interactionRange: 3, speed: 1.2 },
  CAUTIOUS: { explorationRate: 0.3, interactionRange: 2, speed: 0.8 },
  ENERGETIC: { explorationRate: 0.9, interactionRange: 4, speed: 1.5 },
  ANALYTICAL: { explorationRate: 0.5, interactionRange: 2.5, speed: 1.0 }
};

export class AgentBehaviorController {
  constructor(agent, environment) {
    this.agent = agent;
    this.environment = environment;
    this.state = BehaviorStates.IDLE;
    this.currentTarget = null;
    this.exploredPositions = [];
    this.interactionPoints = [];
    this.obstacleMap = [];
    this.personality = PersonalityTraits[agent.personality] || PersonalityTraits.CURIOUS;
    this.stateTimer = 0;
    this.taskQueue = [];
  }

  update(delta) {
    this.stateTimer += delta;

    switch (this.state) {
      case BehaviorStates.IDLE:
        if (this.stateTimer > 2 / this.personality.explorationRate) {
          this.startExploring();
        }
        break;

      case BehaviorStates.EXPLORING:
        if (this.shouldInteract()) {
          this.startInteracting();
        } else if (!this.currentTarget) {
          this.findExplorationTarget();
        }
        break;

      case BehaviorStates.INTERACTING:
        if (this.stateTimer > 3) {
          this.state = BehaviorStates.IDLE;
          this.stateTimer = 0;
        }
        break;

      case BehaviorStates.MOVING:
        if (this.hasReachedTarget()) {
          this.state = BehaviorStates.OBSERVING;
          this.stateTimer = 0;
        }
        break;

      case BehaviorStates.OBSERVING:
        if (this.stateTimer > 1.5) {
          this.state = BehaviorStates.IDLE;
          this.stateTimer = 0;
        }
        break;
    }
  }

  startExploring() {
    this.state = BehaviorStates.EXPLORING;
    this.stateTimer = 0;
    this.findExplorationTarget();
  }

  findExplorationTarget() {
    const bounds = this.getEnvironmentBounds();
    const randomPos = [
      bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
      0,
      bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ)
    ];

    // Check if position is not too close to explored areas
    const isFreshArea = !this.exploredPositions.some(pos => 
      this.distance(pos, randomPos) < 3
    );

    if (isFreshArea) {
      this.currentTarget = randomPos;
      this.exploredPositions.push(randomPos);
      this.state = BehaviorStates.MOVING;
    }
  }

  shouldInteract() {
    // Find nearby interaction points
    const nearby = this.findNearbyInteractionPoints();
    return nearby.length > 0 && Math.random() < this.personality.explorationRate;
  }

  startInteracting() {
    this.state = BehaviorStates.INTERACTING;
    this.stateTimer = 0;
    const nearby = this.findNearbyInteractionPoints();
    if (nearby.length > 0) {
      this.currentTarget = nearby[0];
    }
  }

  findNearbyInteractionPoints() {
    const points = this.getInteractionPoints();
    return points.filter(point => 
      this.distance(this.agent.position, point.position) < this.personality.interactionRange
    );
  }

  getInteractionPoints() {
    // Define interaction points based on environment
    const envPoints = {
      office: [
        { position: [3, 0, 2], type: 'desk', name: 'Work Desk' },
        { position: [-7, 0, -9], type: 'shelf', name: 'Bookshelf' }
      ],
      nature: [
        { position: [5, 0, 5], type: 'lake', name: 'Lake' },
        { position: [8, 0, 0], type: 'tree', name: 'Tree' }
      ],
      house: [
        { position: [-2, 0, 2], type: 'couch', name: 'Couch' },
        { position: [2, 0, 0], type: 'table', name: 'Table' }
      ],
      street: [
        { position: [0, 0, 0], type: 'road', name: 'Street' },
        { position: [5, 0, 0], type: 'sidewalk', name: 'Sidewalk' }
      ],
      mountain: [
        { position: [0, 0, -15], type: 'mountain', name: 'Peak' },
        { position: [0, 0, 0], type: 'path', name: 'Trail' }
      ]
    };

    return envPoints[this.environment] || [];
  }

  getEnvironmentBounds() {
    const bounds = {
      office: { minX: -8, maxX: 8, minZ: -8, maxZ: 4 },
      nature: { minX: -12, maxX: 12, minZ: -12, maxZ: 12 },
      house: { minX: -4, maxX: 4, minZ: -4, maxZ: 4 },
      street: { minX: -3, maxX: 3, minZ: -12, maxZ: 12 },
      mountain: { minX: -15, maxX: 15, minZ: -15, maxZ: 15 }
    };

    return bounds[this.environment] || { minX: -10, maxX: 10, minZ: -10, maxZ: 10 };
  }

  hasReachedTarget() {
    if (!this.currentTarget) return false;
    return this.distance(this.agent.position, this.currentTarget) < 0.5;
  }

  distance(pos1, pos2) {
    const dx = pos1[0] - pos2[0];
    const dz = pos1[2] - pos2[2];
    return Math.sqrt(dx * dx + dz * dz);
  }

  performTask(task) {
    this.taskQueue.push(task);
  }

  getMovementSpeed() {
    return this.personality.speed;
  }
}