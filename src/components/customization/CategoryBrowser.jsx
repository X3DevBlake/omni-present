import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Grid3x3 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function CategoryBrowser({ components, onSelectComponent, selectedType }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredComponents = components.filter(comp => 
    comp.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!selectedType || comp.component_type === selectedType)
  );
  
  const categories = [...new Set(filteredComponents.map(c => c.category))];
  
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 h-full overflow-hidden flex flex-col">
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search components..."
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4">
        {categories.map(category => {
          const catComponents = filteredComponents.filter(c => c.category === category);
          return (
            <div key={category}>
              <h4 className="text-white/60 text-xs font-bold mb-2 uppercase">{category}</h4>
              <div className="grid grid-cols-3 gap-2">
                {catComponents.map(comp => (
                  <motion.div
                    key={comp.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => onSelectComponent(comp)}
                    className="bg-white/5 border border-white/10 rounded cursor-pointer hover:border-cyan-400/50 transition-all p-2"
                  >
                    {comp.thumbnail_url ? (
                      <img src={comp.thumbnail_url} alt={comp.name} className="w-full h-20 object-cover rounded mb-1" />
                    ) : (
                      <div className="w-full h-20 bg-white/10 rounded flex items-center justify-center mb-1">
                        <Grid3x3 className="w-6 h-6 text-white/40" />
                      </div>
                    )}
                    <p className="text-white text-xs truncate">{comp.name}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}