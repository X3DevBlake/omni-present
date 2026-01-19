import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, X, Search } from 'lucide-react';

export default function AdvancedAgentFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    searchQuery: '',
    minRating: 0,
    minSuccessRate: 0,
    availability: 'all',
    skills: [],
    priceRange: [0, 500],
    specializations: []
  });

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  const availableSkills = [
    'Data Analysis', 'Machine Learning', 'Natural Language Processing',
    'Web Development', 'Cloud Architecture', 'DevOps',
    'Product Management', 'UX Design', 'Content Writing'
  ];

  const specializations = [
    'AI/ML', 'Backend', 'Frontend', 'Full Stack', 'Mobile',
    'Data Science', 'Security', 'Cloud', 'Blockchain'
  ];

  const handleFilterUpdate = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const addSkill = (skill) => {
    if (!selectedSkills.includes(skill)) {
      const newSkills = [...selectedSkills, skill];
      setSelectedSkills(newSkills);
      handleFilterUpdate('skills', newSkills);
    }
  };

  const removeSkill = (skill) => {
    const newSkills = selectedSkills.filter(s => s !== skill);
    setSelectedSkills(newSkills);
    handleFilterUpdate('skills', newSkills);
  };

  const clearFilters = () => {
    const resetFilters = {
      searchQuery: '',
      minRating: 0,
      minSuccessRate: 0,
      availability: 'all',
      skills: [],
      priceRange: [0, 500],
      specializations: []
    };
    setFilters(resetFilters);
    setSelectedSkills([]);
    onFilterChange(resetFilters);
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Advanced Filters
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <label className="text-white text-sm mb-2 block">Search Agents</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={filters.searchQuery}
              onChange={(e) => handleFilterUpdate('searchQuery', e.target.value)}
              placeholder="Search by name, skills, or description..."
              className="bg-slate-800 border-slate-600 text-white pl-10"
            />
          </div>
        </div>

        {/* Minimum Rating */}
        <div>
          <label className="text-white text-sm mb-2 block">
            Minimum Rating: {filters.minRating.toFixed(1)} ⭐
          </label>
          <Slider
            value={[filters.minRating]}
            onValueChange={([value]) => handleFilterUpdate('minRating', value)}
            min={0}
            max={5}
            step={0.5}
            className="w-full"
          />
        </div>

        {/* Success Rate */}
        <div>
          <label className="text-white text-sm mb-2 block">
            Minimum Success Rate: {filters.minSuccessRate}%
          </label>
          <Slider
            value={[filters.minSuccessRate]}
            onValueChange={([value]) => handleFilterUpdate('minSuccessRate', value)}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="text-white text-sm mb-2 block">
            Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}/hr
          </label>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => handleFilterUpdate('priceRange', value)}
            min={0}
            max={500}
            step={10}
            className="w-full"
          />
        </div>

        {/* Availability */}
        <div>
          <label className="text-white text-sm mb-2 block">Availability</label>
          <div className="flex gap-2">
            {['all', 'available', 'busy'].map((status) => (
              <Button
                key={status}
                variant={filters.availability === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterUpdate('availability', status)}
                className={
                  filters.availability === status
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'border-slate-600 text-gray-300 hover:bg-slate-700'
                }
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Required Skills */}
        <div>
          <label className="text-white text-sm mb-2 block">Required Skills</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedSkills.map((skill) => (
              <Badge
                key={skill}
                className="bg-blue-900/50 text-blue-300 cursor-pointer hover:bg-blue-900"
                onClick={() => removeSkill(skill)}
              >
                {skill}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {availableSkills
              .filter(skill => !selectedSkills.includes(skill))
              .map((skill) => (
                <Button
                  key={skill}
                  variant="outline"
                  size="sm"
                  onClick={() => addSkill(skill)}
                  className="border-slate-600 text-gray-300 hover:bg-slate-700 text-xs"
                >
                  + {skill}
                </Button>
              ))}
          </div>
        </div>

        {/* Specializations */}
        <div>
          <label className="text-white text-sm mb-2 block">Specializations</label>
          <div className="flex flex-wrap gap-2">
            {specializations.map((spec) => (
              <Badge
                key={spec}
                className={`cursor-pointer transition-all ${
                  filters.specializations.includes(spec)
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
                onClick={() => {
                  const newSpecs = filters.specializations.includes(spec)
                    ? filters.specializations.filter(s => s !== spec)
                    : [...filters.specializations, spec];
                  handleFilterUpdate('specializations', newSpecs);
                }}
              >
                {spec}
              </Badge>
            ))}
          </div>
        </div>

        {/* Active Filter Count */}
        {(selectedSkills.length > 0 || filters.specializations.length > 0 || filters.minRating > 0) && (
          <div className="pt-4 border-t border-slate-700">
            <p className="text-sm text-gray-400">
              {selectedSkills.length + filters.specializations.length + (filters.minRating > 0 ? 1 : 0)} active filters
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}