import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Heart, MessageSquare, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SocialFinanceFeed() {
  const [posts, setPosts] = useState([
    {
      user: 'Alice.eth',
      type: 'challenge',
      title: '30-Day Savings Sprint',
      description: 'Save $1000 in 30 days',
      participants: 45,
      prize: 500,
      likes: 128,
      comments: 23
    },
    {
      user: 'Bob_DeFi',
      type: 'portfolio',
      title: 'My Conservative DeFi Portfolio',
      description: '15% APY with low risk',
      followers: 320,
      likes: 89,
      comments: 12
    },
    {
      user: 'CarolCrypto',
      type: 'achievement',
      title: 'Reached $10K Savings Goal! 🎉',
      description: 'Thanks to the community challenges',
      likes: 456,
      comments: 67
    }
  ]);

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Users className="w-6 h-6 text-cyan-400" />
        Social Finance Feed
      </h3>

      <div className="space-y-4">
        {posts.map((post, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {post.user[0]}
              </div>
              <div className="flex-1">
                <div className="text-white font-bold">{post.user}</div>
                <div className={`text-xs px-2 py-1 rounded inline-block ${
                  post.type === 'challenge' ? 'bg-yellow-500/20 text-yellow-400' :
                  post.type === 'portfolio' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {post.type}
                </div>
              </div>
            </div>

            <h4 className="text-white font-bold mb-2">{post.title}</h4>
            <p className="text-white/60 text-sm mb-3">{post.description}</p>

            {post.type === 'challenge' && (
              <div className="flex gap-3 mb-3">
                <div className="flex-1 bg-purple-500/10 border border-purple-500/30 rounded-lg p-2 text-center">
                  <div className="text-purple-400 font-bold">{post.participants}</div>
                  <div className="text-white/60 text-xs">Participants</div>
                </div>
                <div className="flex-1 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 text-center">
                  <div className="text-yellow-400 font-bold">{post.prize} OMNI</div>
                  <div className="text-white/60 text-xs">Prize Pool</div>
                </div>
              </div>
            )}

            {post.type === 'portfolio' && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-2 mb-3">
                <div className="text-cyan-400 font-bold text-sm">{post.followers} followers copied this strategy</div>
              </div>
            )}

            <div className="flex items-center gap-4 border-t border-white/10 pt-3">
              <button className="flex items-center gap-2 text-white/60 hover:text-pink-400 transition">
                <Heart className="w-4 h-4" />
                <span className="text-sm">{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-white/60 hover:text-cyan-400 transition">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">{post.comments}</span>
              </button>
              <button className="flex items-center gap-2 text-white/60 hover:text-purple-400 transition">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <Button className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-purple-500">
        Create Challenge or Share Portfolio
      </Button>
    </div>
  );
}