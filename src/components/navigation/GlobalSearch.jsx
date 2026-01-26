import React, { useState, useEffect } from 'react';
import { Search, Command, Star, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [recent, setRecent] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all hubs for client-side search (for speed on small-ish dataset of ~400)
    // In production with thousands, use server-side search.
    const loadHubs = async () => {
      try {
        const allHubs = await base44.entities.Hub.list({ limit: 1000 });
        setHubs(allHubs);
        
        // Mock recent for now, replace with Entity fetch later
        setRecent(allHubs.slice(0, 3)); 
      } catch (e) {
        console.error("Failed to load hubs", e);
      }
    };
    if (isOpen) loadHubs();
  }, [isOpen]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const lower = query.toLowerCase();
    const filtered = hubs.filter(h => 
      h.name.toLowerCase().includes(lower) || 
      h.category?.toLowerCase().includes(lower) ||
      h.tags?.some(t => t.toLowerCase().includes(lower))
    );
    setResults(filtered.slice(0, 10));
  }, [query, hubs]);

  const handleSelect = (hub) => {
    setIsOpen(false);
    navigate(createPageUrl(hub.path || hub.name));
    // TODO: Add to UserHubData.recently_visited
  };

  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <Button 
        variant="outline" 
        className="relative h-10 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64 bg-white/5 border-white/10 hover:bg-white/10"
        onClick={() => setIsOpen(true)}
      >
        <span className="hidden lg:inline-flex">Search hubs...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="p-0 gap-0 bg-black/90 border-white/20 text-white max-w-2xl overflow-hidden">
          <div className="flex items-center border-b border-white/10 px-3">
            <Search className="mr-2 h-5 w-5 shrink-0 opacity-50" />
            <Input
              placeholder="Type a command or search..."
              className="flex h-14 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none focus-visible:ring-0"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {!query && (
              <div className="px-2 py-4 text-xs text-muted-foreground">
                <div className="mb-2 font-semibold flex items-center">
                  <Clock className="w-3 h-3 mr-2" />
                  Recently Visited
                </div>
                {recent.map(hub => (
                  <div 
                    key={hub.id} 
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                    onClick={() => handleSelect(hub)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-indigo-500/20 flex items-center justify-center text-xs">
                        {hub.name[0]}
                      </div>
                      <span>{hub.name}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 opacity-50" />
                  </div>
                ))}
              </div>
            )}

            {results.map(hub => (
              <div
                key={hub.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                onClick={() => handleSelect(hub)}
              >
                <div className="flex items-center gap-3">
                  <Command className="w-4 h-4 opacity-50" />
                  <div>
                    <div className="font-medium">{hub.name}</div>
                    <div className="text-xs text-gray-400">{hub.category}</div>
                  </div>
                </div>
                {hub.featured && <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />}
              </div>
            ))}
            
            {query && results.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500">
                No results found.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}