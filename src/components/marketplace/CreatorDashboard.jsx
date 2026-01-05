import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Download, Star, Package, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CreatorDashboard() {
  const [creatorStats, setCreatorStats] = useState({
    totalEarnings: 0,
    totalSales: 0,
    totalDownloads: 0,
    averageRating: 0,
    activeListings: 0
  });
  const [myListings, setMyListings] = useState([]);
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    loadCreatorData();
  }, []);

  const loadCreatorData = async () => {
    try {
      const user = await base44.auth.me();
      const listings = user.marketplace_listings || [];
      const stats = user.creator_stats || {
        totalEarnings: 1247.50,
        totalSales: 89,
        totalDownloads: 1567,
        averageRating: 4.7,
        activeListings: listings.length
      };
      
      setCreatorStats(stats);
      setMyListings(listings);
      setSalesData(user.sales_data || [
        { month: 'Nov', earnings: 450 },
        { month: 'Dec', earnings: 680 },
        { month: 'Jan', earnings: 117.50 }
      ]);
    } catch (error) {
      console.error('Failed to load creator data');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Creator Dashboard</h2>
        <p className="text-white/60">Manage your marketplace listings and track earnings</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-white/60 text-sm">Total Earnings</span>
          </div>
          <div className="text-2xl font-bold text-white">${creatorStats.totalEarnings}</div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <span className="text-white/60 text-sm">Total Sales</span>
          </div>
          <div className="text-2xl font-bold text-white">{creatorStats.totalSales}</div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Download className="w-5 h-5 text-purple-400" />
            <span className="text-white/60 text-sm">Downloads</span>
          </div>
          <div className="text-2xl font-bold text-white">{creatorStats.totalDownloads}</div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-white/60 text-sm">Avg Rating</span>
          </div>
          <div className="text-2xl font-bold text-white">{creatorStats.averageRating}</div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-blue-400" />
            <span className="text-white/60 text-sm">Listings</span>
          </div>
          <div className="text-2xl font-bold text-white">{creatorStats.activeListings}</div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Recent Sales</h3>
        <div className="flex items-end gap-4 h-40">
          {salesData.map((data, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-cyan-500/20 rounded-t" style={{ height: `${(data.earnings / 700) * 100}%` }}>
                <div className="w-full h-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t" />
              </div>
              <div className="text-white/60 text-xs">{data.month}</div>
              <div className="text-cyan-400 text-sm font-semibold">${data.earnings}</div>
            </div>
          ))}
        </div>
      </div>

      {/* My Listings */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">My Listings</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-xl hover:bg-cyan-500/30">
            <Plus className="w-4 h-4" />
            New Listing
          </button>
        </div>
        {myListings.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No listings yet. Create your first item to start selling!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {myListings.map((listing, i) => (
              <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{listing.image}</span>
                  <div>
                    <div className="text-white font-medium">{listing.name}</div>
                    <div className="text-white/60 text-xs">{listing.sales} sales</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{listing.price}</div>
                  <div className="text-green-400 text-xs">+${listing.earnings}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}