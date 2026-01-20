import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

export default function CollaborativeUserPresence({ currentPage }) {
  const [activeUsers, setActiveUsers] = useState([
    { id: '1', name: 'Alex Chen', initials: 'AC', color: '#00f5ff', page: currentPage },
    { id: '2', name: 'Sarah Johnson', initials: 'SJ', color: '#a855f7', page: currentPage },
    { id: '3', name: 'Mike Rodriguez', initials: 'MR', color: '#44ff44', page: currentPage }
  ]);

  return (
    <TooltipProvider>
      <div className="fixed top-4 right-20 z-40 flex items-center gap-2">
        <Users className="w-4 h-4 text-white/60" />
        <div className="flex -space-x-2">
          {activeUsers.slice(0, 5).map((user, index) => (
            <Tooltip key={user.id}>
              <TooltipTrigger>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Avatar className="w-8 h-8 border-2 border-black cursor-pointer hover:z-10 relative">
                    <AvatarFallback
                      style={{ backgroundColor: user.color }}
                      className="text-white text-xs font-semibold"
                    >
                      {user.initials}
                    </AvatarFallback>
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-black"
                    />
                  </Avatar>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent className="bg-black/90 border-white/20">
                <p className="text-white text-xs">{user.name}</p>
                <p className="text-white/60 text-xs">Viewing this page</p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {activeUsers.length > 5 && (
            <Avatar className="w-8 h-8 border-2 border-black bg-white/20">
              <AvatarFallback className="text-white text-xs">
                +{activeUsers.length - 5}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        <Badge className="bg-green-600 text-xs">
          {activeUsers.length} online
        </Badge>
      </div>
    </TooltipProvider>
  );
}