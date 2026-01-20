import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function RealTimeNotificationFeed() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const insights = await base44.entities.ProactiveInsight.filter(
          { acknowledged: false },
          '-created_date',
          5
        );
        
        const threats = await base44.entities.ThreatIntelligence.filter(
          { threat_status: { $ne: 'resolved' } },
          '-created_date',
          3
        );

        const anomalies = await base44.entities.AnomalyDetector.list('-created_date', 3);
        
        const notifs = [
          ...insights.map(i => ({
            id: i.id,
            type: i.urgency === 'critical' ? 'critical' : i.insight_type,
            title: i.title,
            message: i.message,
            timestamp: i.created_date
          })),
          ...threats.map(t => ({
            id: t.id,
            type: 'critical',
            title: `Security: ${t.threat_name}`,
            message: `${t.severity_level} threat detected`,
            timestamp: t.created_date
          }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setNotifications(notifs);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'celebration': return <CheckCircle className="w-4 h-4" />;
      case 'trend': return <Zap className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'critical': return 'from-red-600 to-red-800';
      case 'warning': return 'from-orange-600 to-yellow-600';
      case 'celebration': return 'from-green-600 to-emerald-600';
      case 'trend': return 'from-blue-600 to-cyan-600';
      default: return 'from-gray-600 to-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5 text-white" />
        <h3 className="text-xl font-bold text-white">Live Notifications</h3>
        {notifications.length > 0 && (
          <Badge className="bg-red-600">{notifications.length}</Badge>
        )}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {notifications.map((notif, index) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`bg-gradient-to-r ${getColor(notif.type)} border-0`}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="text-white/90 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm">{notif.title}</h4>
                      <p className="text-white/70 text-xs mt-1">{notif.message}</p>
                      <p className="text-white/40 text-xs mt-2">
                        {new Date(notif.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}