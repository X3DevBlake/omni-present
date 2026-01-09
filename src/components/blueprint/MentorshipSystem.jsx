import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, TrendingUp, Award, MessageCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export class MentorshipRelationship {
  constructor(mentorId, menteeId) {
    this.mentorId = mentorId;
    this.menteeId = menteeId;
    this.establishedAt = Date.now();
    this.skillsTransferred = [];
    this.sessionsCompleted = 0;
    this.effectiveness = 0.5;
    this.currentFocus = null;
  }

  transferSkill(skill, mentorLevel, menteeLevel) {
    const transferAmount = (mentorLevel - menteeLevel) * 0.2 * this.effectiveness;
    
    if (transferAmount > 0) {
      this.skillsTransferred.push({
        skill,
        amount: transferAmount,
        timestamp: Date.now()
      });
      this.sessionsCompleted++;
      this.effectiveness = Math.min(1.0, this.effectiveness + 0.05);
      return transferAmount;
    }
    return 0;
  }

  provideFeedback(challenge, mentorExpertise) {
    const advice = this.generateAdvice(challenge, mentorExpertise);
    return {
      advice,
      confidence: this.effectiveness,
      applicability: mentorExpertise > 50 ? 0.8 : 0.5
    };
  }

  generateAdvice(challenge, mentorExpertise) {
    const adviceTemplates = {
      resource_scarcity: [
        'Focus on efficient gathering techniques',
        'Form alliances to pool resources',
        'Develop storage and preservation skills'
      ],
      ethical_dilemma: [
        'Consider long-term consequences',
        'Consult with community values',
        'Balance individual needs with collective good'
      ],
      skill_development: [
        'Practice consistently in low-risk situations',
        'Observe and learn from failures',
        'Seek diverse experiences'
      ],
      social_conflict: [
        'Mediate with empathy and patience',
        'Find common ground',
        'Build trust through consistent actions'
      ]
    };

    const template = adviceTemplates[challenge.type] || ['Stay focused and adapt'];
    return template[Math.floor(Math.random() * template.length)];
  }
}

export class MentorshipNetwork {
  constructor() {
    this.relationships = new Map();
    this.mentorPool = new Map();
    this.feedback = [];
  }

  evaluateMentorPotential(agent, specialization) {
    let score = 0;
    
    if (specialization?.level > 5) score += 30;
    if (specialization?.profession) score += 20;
    if (agent.experience > 500) score += 25;
    
    const topSkills = Array.from(specialization?.skills?.entries() || [])
      .filter(([_, level]) => level > 50);
    score += topSkills.length * 10;

    return score;
  }

  createMentorship(mentor, mentee) {
    const relationshipId = `${mentor.id}_${mentee.id}`;
    
    if (!this.relationships.has(relationshipId)) {
      const relationship = new MentorshipRelationship(mentor.id, mentee.id);
      this.relationships.set(relationshipId, relationship);
      
      this.mentorPool.set(mentor.id, [
        ...(this.mentorPool.get(mentor.id) || []),
        mentee.id
      ]);

      return relationship;
    }
    
    return this.relationships.get(relationshipId);
  }

  processMentorship(mentorSpec, menteeSpec) {
    const relationshipId = `${mentorSpec.agentId}_${menteeSpec.agentId}`;
    const relationship = this.relationships.get(relationshipId);
    
    if (!relationship) return;

    mentorSpec.skills.forEach((mentorLevel, skill) => {
      const menteeLevel = menteeSpec.skills.get(skill) || 0;
      if (mentorLevel > menteeLevel + 10) {
        const transferred = relationship.transferSkill(skill, mentorLevel, menteeLevel);
        if (transferred > 0) {
          menteeSpec.skills.set(skill, menteeLevel + transferred);
        }
      }
    });
  }

  requestAdvice(menteeId, challenge) {
    const mentorIds = Array.from(this.relationships.values())
      .filter(r => r.menteeId === menteeId)
      .map(r => r.mentorId);

    if (mentorIds.length === 0) return null;

    const randomMentorId = mentorIds[Math.floor(Math.random() * mentorIds.length)];
    const relationship = Array.from(this.relationships.values()).find(
      r => r.mentorId === randomMentorId && r.menteeId === menteeId
    );

    if (relationship) {
      const mentorExpertise = Math.random() * 100;
      const feedback = relationship.provideFeedback(challenge, mentorExpertise);
      
      this.feedback.push({
        mentorId: randomMentorId,
        menteeId,
        challenge: challenge.type,
        advice: feedback.advice,
        timestamp: Date.now()
      });

      return feedback;
    }

    return null;
  }

  getStats() {
    return {
      totalMentorships: this.relationships.size,
      activeMentors: this.mentorPool.size,
      totalSkillsTransferred: Array.from(this.relationships.values())
        .reduce((sum, r) => sum + r.skillsTransferred.length, 0),
      avgEffectiveness: Array.from(this.relationships.values())
        .reduce((sum, r) => sum + r.effectiveness, 0) / Math.max(1, this.relationships.size)
    };
  }
}

export default function MentorshipSystem({ show, onClose, agents, specializations, onSkillTransfer }) {
  const [network] = useState(new MentorshipNetwork());
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [mentorshipStats, setMentorshipStats] = useState(null);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [skillTransferViz, setSkillTransferViz] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Process active mentorships
      network.relationships.forEach((relationship) => {
        const mentorSpec = specializations?.get(relationship.mentorId);
        const menteeSpec = specializations?.get(relationship.menteeId);
        
        if (mentorSpec && menteeSpec) {
          network.processMentorship(mentorSpec, menteeSpec);
        }
      });

      // Simulate mentees requesting advice
      if (Math.random() > 0.8) {
        const menteeIds = Array.from(network.relationships.values()).map(r => r.menteeId);
        if (menteeIds.length > 0) {
          const randomMentee = menteeIds[Math.floor(Math.random() * menteeIds.length)];
          const challenges = ['resource_scarcity', 'ethical_dilemma', 'skill_development', 'social_conflict'];
          const challenge = { type: challenges[Math.floor(Math.random() * challenges.length)] };
          
          const feedback = network.requestAdvice(randomMentee, challenge);
          if (feedback) {
            const mentee = agents.find(a => a.id === randomMentee);
            toast.info(`${mentee?.name} received mentorship advice`);
          }
        }
      }

      setMentorshipStats(network.getStats());
      setRecentFeedback(network.feedback.slice(-5).reverse());
      updateSkillTransferViz();
    }, 2000);

    return () => clearInterval(interval);
  }, [network, agents, specializations]);

  const updateSkillTransferViz = () => {
    const transfers = [];
    network.relationships.forEach(relationship => {
      const mentor = agents.find(a => a.id === relationship.mentorId);
      const mentee = agents.find(a => a.id === relationship.menteeId);
      
      relationship.skillsTransferred.slice(-3).forEach(transfer => {
        transfers.push({
          from: mentor?.name,
          to: mentee?.name,
          skill: transfer.skill,
          amount: transfer.amount
        });
      });
    });
    setSkillTransferViz(transfers.slice(-10));
  };

  const createMentorship = () => {
    if (!selectedMentor || !selectedMentee) {
      toast.error('Select both mentor and mentee');
      return;
    }

    if (selectedMentor.id === selectedMentee.id) {
      toast.error('Cannot mentor self');
      return;
    }

    const relationship = network.createMentorship(selectedMentor, selectedMentee);
    toast.success(`${selectedMentor.name} is now mentoring ${selectedMentee.name}`);
    setSelectedMentor(null);
    setSelectedMentee(null);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI Mentorship System</h3>
                <p className="text-white/60 text-sm">Experience-based guidance and skill transfer</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {mentorshipStats && Object.entries({
                  'Total Mentorships': mentorshipStats.totalMentorships,
                  'Active Mentors': mentorshipStats.activeMentors,
                  'Skills Transferred': mentorshipStats.totalSkillsTransferred,
                  'Avg Effectiveness': `${(mentorshipStats.avgEffectiveness * 100).toFixed(0)}%`
                }).map(([label, value]) => (
                  <div key={label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-white/60 text-xs mb-1">{label}</div>
                    <div className="text-white text-2xl font-bold">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">Create Mentorship</h4>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="text-white/70 text-xs mb-2 block">Select Mentor</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {agents.map(agent => {
                        const spec = specializations?.get(agent.id);
                        const potential = network.evaluateMentorPotential(agent, spec);
                        
                        return (
                          <button
                            key={agent.id}
                            onClick={() => setSelectedMentor(agent)}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                              selectedMentor?.id === agent.id
                                ? 'bg-cyan-500/20 border border-cyan-500/40'
                                : 'bg-white/5 hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: agent.color }} />
                              <span className="text-white text-sm">{agent.name}</span>
                            </div>
                            <div className="text-xs text-cyan-400">Potential: {potential}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-white/70 text-xs mb-2 block">Select Mentee</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {agents.map(agent => (
                        <button
                          key={agent.id}
                          onClick={() => setSelectedMentee(agent)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedMentee?.id === agent.id
                              ? 'bg-blue-500/20 border border-blue-500/40'
                              : 'bg-white/5 hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: agent.color }} />
                            <span className="text-white text-sm">{agent.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={createMentorship}
                  disabled={!selectedMentor || !selectedMentee}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50"
                >
                  Establish Mentorship
                </button>
              </div>

              {skillTransferViz.length > 0 && (
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
                  <h4 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Recent Skill Transfers
                  </h4>
                  <div className="space-y-2">
                    {skillTransferViz.map((transfer, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-cyan-400">{transfer.from}</span>
                          <ArrowRight className="w-4 h-4 text-white/40" />
                          <span className="text-blue-400">{transfer.to}</span>
                        </div>
                        <div className="text-white/60 text-xs mt-1">
                          Skill: {transfer.skill} (+{transfer.amount.toFixed(1)})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-white font-semibold mb-3">Active Mentorships</h4>
                {network.relationships.size === 0 ? (
                  <p className="text-white/60 text-center py-8">No mentorships established yet</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from(network.relationships.values()).map((rel, i) => {
                      const mentor = agents.find(a => a.id === rel.mentorId);
                      const mentee = agents.find(a => a.id === rel.menteeId);
                      
                      return (
                        <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mentor?.color }} />
                              <span className="text-white text-sm font-medium">{mentor?.name}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-white/40" />
                            <div className="flex items-center gap-2">
                              <span className="text-white text-sm">{mentee?.name}</span>
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mentee?.color }} />
                            </div>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-white/60">Sessions</span>
                              <span className="text-white">{rel.sessionsCompleted}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">Effectiveness</span>
                              <span className="text-green-400">{(rel.effectiveness * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">Skills Transferred</span>
                              <span className="text-cyan-400">{rel.skillsTransferred.length}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="w-80 border-l border-white/10 p-4 overflow-y-auto">
              <h4 className="text-white font-semibold mb-3 text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                Recent Advice
              </h4>
              {recentFeedback.length === 0 ? (
                <p className="text-white/60 text-sm text-center py-4">No feedback yet</p>
              ) : (
                <div className="space-y-3">
                  {recentFeedback.map((fb, i) => {
                    const mentor = agents.find(a => a.id === fb.mentorId);
                    const mentee = agents.find(a => a.id === fb.menteeId);
                    
                    return (
                      <div key={i} className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="w-4 h-4 text-yellow-400" />
                          <span className="text-white text-xs font-medium">{mentor?.name}</span>
                          <ArrowRight className="w-3 h-3 text-white/40" />
                          <span className="text-white text-xs">{mentee?.name}</span>
                        </div>
                        <div className="text-white/60 text-xs mb-1">Challenge: {fb.challenge}</div>
                        <div className="text-yellow-400 text-xs italic">"{fb.advice}"</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}