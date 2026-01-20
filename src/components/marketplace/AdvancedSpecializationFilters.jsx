import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Filter, X } from 'lucide-react';

export default function AdvancedSpecializationFilters({ onFilterChange, availableSkills }) {
  const [filters, setFilters] = useState({
    skills: [],
    minProficiency: 0,
    minVerified: 0,
    minReputation: 0,
    maxPrice: 1000,
    availability: 0,
    searchTerm: ''
  });

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const addSkillFilter = (skill) => {
    if (!filters.skills.includes(skill)) {
      updateFilter('skills', [...filters.skills, skill]);
    }
  };

  const removeSkillFilter = (skill) => {
    updateFilter('skills', filters.skills.filter(s => s !== skill));
  };

  const clearFilters = () => {
    const resetFilters = {
      skills: [],
      minProficiency: 0,
      minVerified: 0,
      minReputation: 0,
      maxPrice: 1000,
      availability: 0,
      searchTerm: ''
    };
    setFilters(resetFilters);
    onFilterChange?.(resetFilters);
  };

  const popularSkills = [
    'Machine Learning', 'Data Analysis', 'NLP', 'Computer Vision', 
    'Risk Assessment', 'Trading Strategy', 'Smart Contracts', 'DeFi',
    'Simulation', 'Collaboration', 'Decision Making', 'Optimization'
  ];

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Advanced Filters
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-white/60 hover:text-white"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <label className="text-white text-sm mb-2 block">Search Specializations</label>
          <Input
            placeholder="e.g., Machine Learning, Trading..."
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        {/* Selected Skills */}
        {filters.skills.length > 0 && (
          <div>
            <label className="text-white text-sm mb-2 block">Selected Skills</label>
            <div className="flex flex-wrap gap-2">
              {filters.skills.map(skill => (
                <Badge key={skill} className="bg-purple-500 cursor-pointer" onClick={() => removeSkillFilter(skill)}>
                  {skill} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Popular Skills */}
        <div>
          <label className="text-white text-sm mb-2 block">Add Skill Filter</label>
          <div className="flex flex-wrap gap-2">
            {popularSkills.filter(s => !filters.skills.includes(s)).map(skill => (
              <Badge
                key={skill}
                className="bg-white/10 hover:bg-purple-500 cursor-pointer transition-colors"
                onClick={() => addSkillFilter(skill)}
              >
                + {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Min Proficiency */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-white text-sm">Min Proficiency</label>
            <span className="text-purple-400 text-sm font-bold">{filters.minProficiency}%</span>
          </div>
          <Slider
            value={[filters.minProficiency]}
            onValueChange={([value]) => updateFilter('minProficiency', value)}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Min Verified Skills */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-white text-sm">Min Verified Skills</label>
            <span className="text-green-400 text-sm font-bold">{filters.minVerified}</span>
          </div>
          <Slider
            value={[filters.minVerified]}
            onValueChange={([value]) => updateFilter('minVerified', value)}
            max={20}
            step={1}
            className="w-full"
          />
        </div>

        {/* Min Reputation */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-white text-sm">Min Reputation Score</label>
            <span className="text-cyan-400 text-sm font-bold">{filters.minReputation}</span>
          </div>
          <Slider
            value={[filters.minReputation]}
            onValueChange={([value]) => updateFilter('minReputation', value)}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Max Price */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-white text-sm">Max Price</label>
            <span className="text-green-400 text-sm font-bold">${filters.maxPrice}</span>
          </div>
          <Slider
            value={[filters.maxPrice]}
            onValueChange={([value]) => updateFilter('maxPrice', value)}
            max={5000}
            step={50}
            className="w-full"
          />
        </div>

        {/* Min Availability */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-white text-sm">Min Availability</label>
            <span className="text-orange-400 text-sm font-bold">{filters.availability}%</span>
          </div>
          <Slider
            value={[filters.availability]}
            onValueChange={([value]) => updateFilter('availability', value)}
            max={100}
            step={10}
            className="w-full"
          />
        </div>

        <div className="pt-4 border-t border-white/10">
          <div className="text-white/60 text-xs">
            {Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v > 0) 
              ? 'Active filters applied' 
              : 'No filters active'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}