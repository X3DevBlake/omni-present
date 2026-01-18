import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Zap, Mail, Bell, Webhook, Edit2, Trash2, Power } from 'lucide-react';

export default function AlertRulesPanel({ rules }) {
  const getSeverityColor = (severity) => {
    const colors = {
      info: 'bg-blue-600',
      warning: 'bg-yellow-600',
      critical: 'bg-red-600'
    };
    return colors[severity] || 'bg-slate-600';
  };

  const getChannelIcon = (channel) => {
    const icons = {
      in_app: <Bell className="w-3 h-3" />,
      email: <Mail className="w-3 h-3" />,
      webhook: <Webhook className="w-3 h-3" />,
      sms: <Bell className="w-3 h-3" />
    };
    return icons[channel] || null;
  };

  return (
    <div className="space-y-4">
      {rules.length === 0 ? (
        <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
          <CardContent className="py-12 text-center">
            <Zap className="w-12 h-12 mx-auto text-slate-500 mb-4" />
            <p className="text-slate-400">No alert rules configured yet</p>
          </CardContent>
        </Card>
      ) : (
        rules.map((rule, idx) => (
          <motion.div key={rule.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
            <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl hover:border-slate-600 transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">{rule.rule_name}</h3>
                      <Badge className={getSeverityColor(rule.severity)}>
                        {rule.severity}
                      </Badge>
                      <Badge variant={rule.enabled ? 'default' : 'outline'} className={rule.enabled ? 'bg-green-600' : 'bg-slate-600'}>
                        {rule.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm">{rule.description}</p>
                  </div>
                </div>

                {/* Rule Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs">Type</p>
                    <p className="text-white font-semibold capitalize">{rule.rule_type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Hub</p>
                    <p className="text-white font-semibold capitalize">{rule.hub}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Metric</p>
                    <p className="text-white font-semibold">{rule.metric_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Cooldown</p>
                    <p className="text-white font-semibold">{rule.cooldown_minutes}m</p>
                  </div>
                </div>

                {/* Notification Channels */}
                <div className="mb-4">
                  <p className="text-slate-300 text-sm font-semibold mb-2">Notification Channels</p>
                  <div className="flex flex-wrap gap-2">
                    {rule.notification_channels?.map((channel) => (
                      <Badge key={channel} variant="outline" className="flex items-center gap-1">
                        {getChannelIcon(channel)}
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Recipients */}
                {rule.email_recipients?.length > 0 && (
                  <div className="mb-4 p-3 rounded bg-slate-800/50 text-sm">
                    <p className="text-slate-400 text-xs mb-2">Email Recipients</p>
                    <div className="space-y-1">
                      {rule.email_recipients.slice(0, 3).map((email) => (
                        <p key={email} className="text-white text-xs">{email}</p>
                      ))}
                      {rule.email_recipients.length > 3 && (
                        <p className="text-slate-400 text-xs">+{rule.email_recipients.length - 3} more</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-slate-700">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Power className="w-3 h-3 mr-1" />
                    {rule.enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-red-400 hover:text-red-300">
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );
}