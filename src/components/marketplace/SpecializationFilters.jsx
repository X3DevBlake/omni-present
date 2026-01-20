import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, Search, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export default function SpecializationFilters({ onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const [minProficiency, setMinProficiency] = useState([0]);
  const [minAvailability, setMinAvailability] = useState([0]);
  const [minSuccessRate, setMinSuccessRate] = useState([0]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const commonSpecializations = [
    'Machine Learning',
    'Natural Language Processing',
    'Computer Vision',
    'Data Analysis',
    'Reinforcement Learning',
    'Blockchain Development',
    'DeFi Strategy',
    'Risk Management',
    'Predictive Analytics',
    'Autonomous Systems',
    'Multi-Agent Coordination',
    'Cybersecurity',
    'Smart Contract Auditing',
    'Portfolio Optimization',
    'Market Prediction',
    'Sentiment Analysis'
  ];

  const toggleSpecialization = (spec) => {
    setSelectedSpecializations(prev => 
      prev.includes(spec) 
        ? prev.filter(s => s !== spec)
        : [...prev, spec]
    );
  };

  const applyFilters = () => {
    onFilterChange({
      search: searchTerm,
      specializations: selectedSpecializations,
      min_proficiency: minProficiency[0],
      min_availability: minAvailability[0],
      min_success_rate: minSuccessRate[0],
      verified_only: verifiedOnly
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecializations([]);
    setMinProficiency([0]);
    setMinAvailability([0]);
    setMinSuccessRate([0]);
    setVerifiedOnly(false);
    onFilterChange({});
  };

  return (
    <Card className="bg-black/40 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Advanced Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <label className="text-white text-sm mb-2 block">Search Skills</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for specific skills..."
              className="bg-white/5 border-white/10 text-white pl-10"
            />
          </div>
        </div>

        {/* Specializations */}
        <div>
          <label className="text-white text-sm mb-2 block">Specializations</label>
          <div className="flex flex-wrap gap-2">
            {commonSpecializations.map((spec) => (
              <button
                key={spec}
                onClick={() => toggleSpecialization(spec)}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  selectedSpecializations.includes(spec)
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
          {selectedSpecializations.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedSpecializations.map((spec) => (
                <Badge key={spec} className="bg-purple-500">
                  {spec}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => toggleSpecialization(spec)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Proficiency Slider */}
        <div>
          <label className="text-white text-sm mb-2 block">
            Min Proficiency: {minProficiency[0]}%
          </label>
          <Slider
            value={minProficiency}
            onValueChange={setMinProficiency}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Availability Slider */}
        <div>
          <label className="text-white text-sm mb-2 block">
            Min Availability: {minAvailability[0]}%
          </label>
          <Slider
            value={minAvailability}
            onValueChange={setMinAvailability}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Success Rate Slider */}
        <div>
          <label className="text-white text-sm mb-2 block">
            Min Success Rate: {minSuccessRate[0]}%
          </label>
          <Slider
            value={minSuccessRate}
            onValueChange={setMinSuccessRate}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Verified Only Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-white text-sm">Verified Skills Only</label>
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-4 py-2 rounded-lg transition-all ${
              verifiedOnly
                ? 'bg-green-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {verifiedOnly ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={applyFilters}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
          >
            Apply Filters
          </Button>
          <Button
            onClick={clearFilters}
            variant="outline"
            className="flex-1"
          >
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}