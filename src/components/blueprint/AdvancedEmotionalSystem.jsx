// Advanced Emotional State System for AI Agents
export class EmotionalState {
  constructor(agentId) {
    this.agentId = agentId;
    this.emotions = {
      joy: 50,
      sadness: 20,
      anger: 10,
      fear: 15,
      trust: 60,
      anticipation: 40,
      surprise: 30,
      disgust: 10
    };
    this.mood = 'neutral'; // calm, excited, stressed, content, melancholic
    this.socialBonds = new Map(); // agentId -> bond strength
    this.traumaticEvents = [];
    this.peakExperiences = [];
    this.personalityDrift = { openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 };
  }

  processEvent(event) {
    const { type, intensity = 1, source } = event;
    
    const emotionalImpacts = {
      success: { joy: 15, anticipation: 10, trust: 5 },
      failure: { sadness: 10, anger: 8, fear: 5 },
      betrayal: { anger: 20, sadness: 15, trust: -25, disgust: 10 },
      friendship: { joy: 12, trust: 15, anticipation: 8 },
      conflict: { anger: 15, fear: 10, trust: -10 },
      discovery: { surprise: 20, joy: 15, anticipation: 12 },
      loss: { sadness: 25, fear: 10, anger: 8 },
      threat: { fear: 20, anger: 15, anticipation: 10 },
      celebration: { joy: 20, trust: 10, anticipation: 5 },
      isolation: { sadness: 12, fear: 8, trust: -5 }
    };

    const impact = emotionalImpacts[type] || {};
    
    Object.entries(impact).forEach(([emotion, change]) => {
      if (this.emotions[emotion] !== undefined) {
        this.emotions[emotion] = Math.max(0, Math.min(100, this.emotions[emotion] + (change * intensity)));
      }
    });

    // Update social bonds
    if (source && type === 'betrayal') {
      this.socialBonds.set(source, Math.max(0, (this.socialBonds.get(source) || 50) - 30));
    } else if (source && type === 'friendship') {
      this.socialBonds.set(source, Math.min(100, (this.socialBonds.get(source) || 50) + 20));
    }

    // Track extreme events
    if (intensity >= 1.5) {
      if (change < 0 || type === 'loss' || type === 'betrayal') {
        this.traumaticEvents.push({ type, timestamp: Date.now(), healed: false });
      } else {
        this.peakExperiences.push({ type, timestamp: Date.now() });
      }
    }

    this.updateMood();
    this.updatePersonality();
  }

  updateMood() {
    const avgPositive = (this.emotions.joy + this.emotions.trust + this.emotions.anticipation) / 3;
    const avgNegative = (this.emotions.sadness + this.emotions.anger + this.emotions.fear) / 3;
    const arousal = this.emotions.surprise + this.emotions.anticipation;

    if (avgPositive > 70 && arousal > 50) {
      this.mood = 'excited';
    } else if (avgPositive > 60) {
      this.mood = 'content';
    } else if (avgNegative > 60) {
      this.mood = 'stressed';
    } else if (this.emotions.sadness > 50) {
      this.mood = 'melancholic';
    } else {
      this.mood = 'calm';
    }
  }

  updatePersonality() {
    // Personality drifts based on repeated emotional patterns
    const unhealed = this.traumaticEvents.filter(e => !e.healed).length;
    if (unhealed > 3) {
      this.personalityDrift.neuroticism += 0.1;
      this.personalityDrift.openness -= 0.05;
    }

    if (this.peakExperiences.length > 5) {
      this.personalityDrift.openness += 0.1;
      this.personalityDrift.extraversion += 0.05;
    }

    if (this.emotions.trust > 70) {
      this.personalityDrift.agreeableness += 0.05;
    } else if (this.emotions.trust < 30) {
      this.personalityDrift.agreeableness -= 0.05;
    }
  }

  healTrauma(therapyIntensity = 1) {
    this.traumaticEvents.forEach(event => {
      if (!event.healed && Math.random() < 0.2 * therapyIntensity) {
        event.healed = true;
        this.personalityDrift.neuroticism = Math.max(0, this.personalityDrift.neuroticism - 0.2);
      }
    });
  }

  getEmotionalProfile() {
    return {
      primaryEmotion: Object.entries(this.emotions).sort((a, b) => b[1] - a[1])[0][0],
      mood: this.mood,
      stability: 100 - this.personalityDrift.neuroticism * 10,
      socialCapacity: this.emotions.trust,
      resilience: Math.max(0, 100 - this.traumaticEvents.filter(e => !e.healed).length * 10)
    };
  }

  getSocialRecommendation(targetAgentId) {
    const bond = this.socialBonds.get(targetAgentId) || 50;
    if (bond > 70) return 'strengthen_alliance';
    if (bond < 30) return 'avoid_interaction';
    if (this.emotions.trust > 60 && bond > 40) return 'build_friendship';
    return 'neutral';
  }
}

export class AdvancedLearningSystem {
  constructor(agentId) {
    this.agentId = agentId;
    this.skillLevels = new Map();
    this.learningHistory = [];
    this.mentors = new Map();
    this.apprentices = [];
    this.adaptationRate = 1.0;
    this.specializations = [];
  }

  learnFromExperience(skill, success, context = {}) {
    const currentLevel = this.skillLevels.get(skill) || 0;
    const environmentalFactor = context.difficulty || 1;
    const socialFactor = context.hadSupport ? 1.3 : 1.0;
    
    let learningGain = 0;
    if (success) {
      learningGain = (5 / (1 + currentLevel * 0.1)) * this.adaptationRate * socialFactor;
    } else {
      learningGain = 2 * environmentalFactor; // Learn from failure
    }

    this.skillLevels.set(skill, Math.min(100, currentLevel + learningGain));
    
    this.learningHistory.push({
      skill,
      success,
      gain: learningGain,
      timestamp: Date.now(),
      level: this.skillLevels.get(skill)
    });

    // Check for specialization
    if (this.skillLevels.get(skill) > 80 && !this.specializations.includes(skill)) {
      this.specializations.push(skill);
    }

    // Increase adaptation rate with experience
    this.adaptationRate = Math.min(2.0, 1.0 + (this.learningHistory.length / 1000));
  }

  learnFromMentor(mentorId, skill, mentorLevel) {
    const currentLevel = this.skillLevels.get(skill) || 0;
    const knowledgeGap = mentorLevel - currentLevel;
    
    if (knowledgeGap > 10) {
      const transferAmount = Math.min(knowledgeGap * 0.2, 10);
      this.skillLevels.set(skill, currentLevel + transferAmount);
      this.mentors.set(mentorId, { skill, sessions: (this.mentors.get(mentorId)?.sessions || 0) + 1 });
      return transferAmount;
    }
    return 0;
  }

  teachApprentice(apprenticeId, skill) {
    const level = this.skillLevels.get(skill) || 0;
    if (level > 50) {
      this.apprentices.push({ id: apprenticeId, skill, startedAt: Date.now() });
      // Teaching reinforces knowledge
      this.skillLevels.set(skill, Math.min(100, level + 1));
      return true;
    }
    return false;
  }

  getSkillRecommendations() {
    const topSkills = Array.from(this.skillLevels.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([skill]) => skill);

    return {
      focusOn: topSkills,
      shouldTeach: this.specializations,
      needsMentor: Array.from(this.skillLevels.entries())
        .filter(([_, level]) => level < 30)
        .map(([skill]) => skill)
    };
  }

  getLearningVelocity() {
    const recentHistory = this.learningHistory.slice(-20);
    if (recentHistory.length < 5) return 0;
    
    const totalGain = recentHistory.reduce((sum, h) => sum + h.gain, 0);
    return totalGain / recentHistory.length;
  }
}