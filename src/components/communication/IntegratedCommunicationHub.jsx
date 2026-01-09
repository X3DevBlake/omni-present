import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Calendar, Users, Grid, MessageSquare, Plus } from 'lucide-react';

export default function IntegratedCommunicationHub() {
  const [activeTab, setActiveTab] = useState('contacts');

  const integrations = [
    { id: 'gmail', name: 'Gmail', icon: Mail, color: 'from-red-500/20 to-orange-500/20', border: 'border-red-500/30', status: 'Connected' },
    { id: 'calendar', name: 'Google Calendar', icon: Calendar, color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', status: 'Connected' },
    { id: 'contacts', name: 'Google Contacts', icon: Users, color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30', status: 'Connected' },
    { id: 'workspace', name: 'Google Workspace', icon: Grid, color: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/30', status: 'Connected' }
  ];

  const sampleData = {
    contacts: [
      { name: 'Alice Johnson', email: 'alice@example.com', lastMsg: '2 hours ago' },
      { name: 'Bob Smith', email: 'bob@example.com', lastMsg: '5 hours ago' },
      { name: 'Carol Davis', email: 'carol@example.com', lastMsg: '1 day ago' }
    ],
    calendar: [
      { title: 'Team Meeting', time: '2:00 PM Today', attendees: 4 },
      { title: 'Agent Training Session', time: '3:30 PM Today', attendees: 8 },
      { title: 'Q1 Planning', time: '10:00 AM Tomorrow', attendees: 12 }
    ],
    emails: [
      { from: 'Alice Johnson', subject: 'Update on AI Lab Results', unread: true },
      { from: 'Bob Smith', subject: 'Meeting Notes - Agent Simulation', unread: false },
      { from: 'Carol Davis', subject: 'New Integration Available', unread: true }
    ],
    workspace: [
      { type: 'Document', name: 'Agent Capabilities Summary', shared: true },
      { type: 'Sheet', name: 'Simulation Performance Metrics', shared: true },
      { type: 'Presentation', name: 'Q1 AI Platform Roadmap', shared: false }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Integration Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {integrations.map((service) => {
          const Icon = service.icon;
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gradient-to-br ${service.color} border ${service.border} rounded-xl p-4 cursor-pointer hover:scale-105 transition-all`}
            >
              <Icon className="w-6 h-6 text-white mb-2" />
              <p className="text-white font-bold text-sm">{service.name}</p>
              <p className="text-green-400 text-xs">✓ {service.status}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
          {['contacts', 'calendar', 'emails', 'workspace'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all capitalize ${
                activeTab === tab
                  ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-100'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab === 'emails' ? '📧 Emails' : tab === 'workspace' ? '📁 Workspace' : tab === 'calendar' ? '📅 Calendar' : '👥 Contacts'}
            </button>
          ))}
        </div>

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {sampleData.contacts.map((contact, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold">{contact.name}</p>
                    <p className="text-white/60 text-sm">{contact.email}</p>
                  </div>
                  <div className="text-right">
                    <button className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded text-xs font-medium">
                      Message
                    </button>
                    <p className="text-white/40 text-xs mt-1">{contact.lastMsg}</p>
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full py-2 border border-dashed border-white/20 text-white/60 rounded-lg hover:text-white transition-all flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Add Contact
            </button>
          </motion.div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {sampleData.calendar.map((event, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold">{event.title}</p>
                    <p className="text-white/60 text-sm">{event.time} • {event.attendees} attendees</p>
                  </div>
                  <button className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded text-xs font-medium">
                    Join
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Emails Tab */}
        {activeTab === 'emails' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {sampleData.emails.map((email, i) => (
              <div key={i} className={`rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer ${email.unread ? 'bg-white/10 border border-cyan-500/30' : 'bg-white/5 border border-white/10'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`font-bold ${email.unread ? 'text-white' : 'text-white/80'}`}>{email.from}</p>
                    <p className="text-white/60 text-sm">{email.subject}</p>
                  </div>
                  {email.unread && <div className="w-2 h-2 bg-cyan-400 rounded-full" />}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Workspace Tab */}
        {activeTab === 'workspace' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {sampleData.workspace.map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-xs font-bold uppercase">{item.type}</p>
                    <p className="text-white font-bold">{item.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/60 text-xs">{item.shared ? 'Shared' : 'Private'}</p>
                    <button className="px-3 py-1 bg-orange-500/20 border border-orange-500/40 text-orange-300 rounded text-xs font-medium mt-1">
                      Open
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}