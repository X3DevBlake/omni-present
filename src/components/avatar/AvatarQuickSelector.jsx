import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAvatar } from './AvatarContext';
import { motion } from 'framer-motion';
import { User, Bot, Eye, EyeOff } from 'lucide-react';

// Quick selector component for switching between avatars
export default function AvatarQuickSelector() {
  const [userAvatars, setUserAvatars] = useState([]);
  const [agentAvatars, setAgentAvatars] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { setActiveAvatar, loadAgentAppearance, isVisible, toggleVisibility } = useAvatar();

  useEffect(() => {
    loadAvatars();
  }, []);

  const loadAvatars = async () => {
    try {
      const user = await base44.auth.me();
      const [avatars, appearances] = await Promise.all([
        base44.entities.UserAvatar.filter({ user_email: user.email }),
        base44.entities.AgentAppearance.list()
      ]);
      setUserAvatars(avatars);
      setAgentAvatars(appearances.slice(0, 5));
    } catch (error) {
      console.error('Error loading avatars:', error);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9998]">
      <motion.div
        initial={false}
        animate={{ width: isOpen ? 320 : 60, height: isOpen ? 400 : 60 }}
        className="bg-black/90 backdrop-blur-xl rounded-2xl border border-cyan-500/30 shadow-2xl overflow-hidden"
      >
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="w-full h-full flex items-center justify-center text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <User className="w-6 h-6" />
          </button>
        ) : (
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-sm">Avatar Selector</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleVisibility}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors text-xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-cyan-400 text-xs font-bold mb-2 flex items-center gap-2">
                  <User className="w-3 h-3" /> Your Avatars
                </h4>
                <div className="space-y-2">
                  {userAvatars.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => {
                        setActiveAvatar(avatar.id);
                        setIsOpen(false);
                      }}
                      className="w-full p-2 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors"
                    >
                      <p className="text-white text-sm font-semibold">{avatar.avatar_name || 'Unnamed'}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-purple-400 text-xs font-bold mb-2 flex items-center gap-2">
                  <Bot className="w-3 h-3" /> AI Agents
                </h4>
                <div className="space-y-2">
                  {agentAvatars.map((appearance) => (
                    <button
                      key={appearance.id}
                      onClick={() => {
                        loadAgentAppearance(appearance.agent_id);
                        setIsOpen(false);
                      }}
                      className="w-full p-2 bg-purple-500/5 hover:bg-purple-500/10 rounded-lg text-left transition-colors"
                    >
                      <p className="text-white text-sm font-semibold">Agent {appearance.agent_id.slice(0, 8)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}