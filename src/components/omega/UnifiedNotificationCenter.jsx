import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function UnifiedNotificationCenter({ compact = false }) {
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserNotification.filter({ user_email: user.email, dismissed: false }, '-created_date', 20);
    },
    initialData: []
  });

  const dismissMutation = useMutation({
    mutationFn: (notifId) => base44.entities.UserNotification.update(notifId, { dismissed: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const markReadMutation = useMutation({
    mutationFn: (notifId) => base44.entities.UserNotification.update(notifId, { read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical').length;

  const priorityColors = {
    critical: 'border-red-500/50 bg-red-950/50',
    high: 'border-amber-500/50 bg-amber-950/50',
    medium: 'border-blue-500/50 bg-blue-950/50',
    low: 'border-gray-500/50 bg-gray-950/50'
  };

  const typeIcons = {
    anomaly_alert: '⚠️',
    market_opportunity: '📈',
    system_update: '🔄',
    collaboration_request: '🤝',
    learning_milestone: '🎓',
    geopolitical_warning: '🌍'
  };

  if (compact) {
    return (
      <div className="relative">
        <Button variant="ghost" className="relative">
          <Bell className="w-5 h-5 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-gray-950/90 to-slate-950/90 backdrop-blur-xl border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-blue-400" />
            Unified Notifications
          </div>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge className="bg-red-600">{criticalCount} Critical</Badge>
            )}
            <Badge className="bg-blue-600">{unreadCount} Unread</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No notifications
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`rounded-lg p-3 border ${priorityColors[notif.priority]} ${notif.read ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{typeIcons[notif.notification_type]}</span>
                      <div>
                        <div className="text-white font-semibold text-sm">{notif.title}</div>
                        <div className="text-gray-400 text-xs">{notif.source_module}</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!notif.read && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => markReadMutation.mutate(notif.id)}
                          className="h-6 w-6"
                        >
                          <Check className="w-3 h-3 text-green-400" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => dismissMutation.mutate(notif.id)}
                        className="h-6 w-6"
                      >
                        <X className="w-3 h-3 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-300 text-xs mb-2">{notif.message}</p>
                  <div className="text-gray-500 text-[10px]">
                    {new Date(notif.created_date).toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}