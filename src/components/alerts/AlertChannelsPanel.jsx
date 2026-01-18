import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Mail, Bell, Webhook, Smartphone, Check, AlertCircle } from 'lucide-react';

export default function AlertChannelsPanel() {
  const channels = [
    {
      id: 'in_app',
      name: 'In-App Notifications',
      icon: <Bell className="w-6 h-6" />,
      status: 'connected',
      description: 'Real-time notifications within the platform',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'email',
      name: 'Email Alerts',
      icon: <Mail className="w-6 h-6" />,
      status: 'configured',
      description: 'Receive alerts via email',
      config: 'SMTP configured'
    },
    {
      id: 'webhook',
      name: 'Webhook Integration',
      icon: <Webhook className="w-6 h-6" />,
      status: 'testing',
      description: 'Send alerts to external webhooks',
      config: 'Endpoint: https://...'
    },
    {
      id: 'sms',
      name: 'SMS Alerts',
      icon: <Smartphone className="w-6 h-6" />,
      status: 'unconfigured',
      description: 'Critical alerts via SMS',
      action: 'Configure'
    }
  ];

  const getStatusIcon = (status) => {
    return status === 'connected' || status === 'configured' ? (
      <Check className="w-4 h-4 text-green-400" />
    ) : (
      <AlertCircle className="w-4 h-4 text-yellow-400" />
    );
  };

  const getStatusBadge = (status) => {
    const colors = {
      connected: 'bg-green-600',
      configured: 'bg-green-600',
      testing: 'bg-yellow-600',
      unconfigured: 'bg-red-600'
    };
    return colors[status] || 'bg-slate-600';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map((channel, idx) => (
          <motion.div key={channel.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl h-full">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${channel.color || 'from-slate-600 to-slate-700'} text-white`}>
                    {channel.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(channel.status)}
                    <Badge className={getStatusBadge(channel.status)}>
                      {channel.status}
                    </Badge>
                  </div>
                </div>

                <h3 className="font-semibold text-white mb-2">{channel.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{channel.description}</p>

                {channel.config && (
                  <div className="mb-4 p-3 rounded bg-slate-800/50">
                    <p className="text-slate-300 text-xs">{channel.config}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {channel.action ? (
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">{channel.action}</Button>
                  ) : (
                    <>
                      <Button variant="outline" className="flex-1">Test</Button>
                      <Button variant="outline" className="flex-1">Edit</Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Test Results */}
      <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Recent Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 rounded bg-slate-800/50 border border-green-500/30">
              <p className="text-white text-sm">In-App Notification</p>
              <Badge className="bg-green-600">Success</Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded bg-slate-800/50 border border-green-500/30">
              <p className="text-white text-sm">Email Alert</p>
              <Badge className="bg-green-600">Success</Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded bg-slate-800/50 border border-yellow-500/30">
              <p className="text-white text-sm">Webhook Integration</p>
              <Badge className="bg-yellow-600">Testing</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}