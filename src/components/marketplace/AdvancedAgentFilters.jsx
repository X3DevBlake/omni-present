import React from 'react';
import { Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function AdvancedAgentFilters({ filters, setFilters }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Filter className="w-5 h-5 text-cyan-400" />
        Advanced Filters
      </h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-white/60 text-xs mb-1 block">Performance Tier</label>
          <Select value={filters.tier} onValueChange={(v) => setFilters({...filters, tier: v})}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="diamond">Diamond</SelectItem>
              <SelectItem value="platinum">Platinum</SelectItem>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
              <SelectItem value="bronze">Bronze</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-white/60 text-xs mb-1 block">Personality Trait</label>
          <Select value={filters.personality} onValueChange={(v) => setFilters({...filters, personality: v})}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Traits</SelectItem>
              <SelectItem value="adaptable">Adaptable</SelectItem>
              <SelectItem value="risk-averse">Risk-Averse</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
              <SelectItem value="analytical">Analytical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-white/60 text-xs mb-1 block">Max Price (Omni)</label>
          <Input 
            type="number"
            value={filters.maxPrice}
            onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
            placeholder="1000"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div>
          <label className="text-white/60 text-xs mb-1 block">Gemini Score</label>
          <Select value={filters.geminiScore} onValueChange={(v) => setFilters({...filters, geminiScore: v})}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scores</SelectItem>
              <SelectItem value="90+">90+ (Elite)</SelectItem>
              <SelectItem value="80+">80+ (Excellent)</SelectItem>
              <SelectItem value="70+">70+ (Good)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-white/60 text-xs mb-1 block">Skill Category</label>
          <Select value={filters.skillCategory} onValueChange={(v) => setFilters({...filters, skillCategory: v})}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Skills</SelectItem>
              <SelectItem value="trading">Trading</SelectItem>
              <SelectItem value="analysis">Analysis</SelectItem>
              <SelectItem value="communication">Communication</SelectItem>
              <SelectItem value="collaboration">Collaboration</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-white/60 text-xs mb-1 block">Trial Available</label>
          <Select value={filters.trialAvailable} onValueChange={(v) => setFilters({...filters, trialAvailable: v})}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}