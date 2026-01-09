import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Settings, FileText, BarChart3, Lock, Briefcase, DollarSign } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function AdminHome() {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full">
            <span className="text-red-400 text-sm font-semibold">🛡️ Admin Hub</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Organization
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"> Administration</span>
          </h1>
          <p className="text-white/60 text-lg max-w-3xl mx-auto">
            Manage teams, permissions, compliance, and organizational settings
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Team Members', value: '48', icon: Users, color: 'blue' },
            { label: 'Active Roles', value: '12', icon: Shield, color: 'purple' },
            { label: 'Audit Events', value: '1.2K', icon: FileText, color: 'yellow' },
            { label: 'Compliance Score', value: '96%', icon: Lock, color: 'green' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <stat.icon className={`w-6 h-6 text-${stat.color}-400 mb-2`} />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Team Management',
              description: 'Manage users and team structure',
              icon: Users,
              page: 'Team',
              gradient: 'from-blue-500/20 to-cyan-500/20',
              border: 'border-blue-500/30'
            },
            {
              title: 'Roles & Permissions',
              description: 'Configure access control policies',
              icon: Shield,
              page: 'UserRolesPermissions',
              gradient: 'from-purple-500/20 to-pink-500/20',
              border: 'border-purple-500/30'
            },
            {
              title: 'Organization Settings',
              description: 'Company-wide configurations',
              icon: Settings,
              page: 'OrgSettings',
              gradient: 'from-indigo-500/20 to-purple-500/20',
              border: 'border-indigo-500/30'
            },
            {
              title: 'Audit Logs',
              description: 'Comprehensive activity tracking',
              icon: FileText,
              page: 'AuditLogs',
              gradient: 'from-yellow-500/20 to-orange-500/20',
              border: 'border-yellow-500/30'
            },
            {
              title: 'Compliance Dashboard',
              description: 'Monitor regulatory adherence',
              icon: Lock,
              page: 'ComplianceDashboard',
              gradient: 'from-green-500/20 to-emerald-500/20',
              border: 'border-green-500/30'
            },
            {
              title: 'Billing & Invoicing',
              description: 'Manage organizational finances',
              icon: DollarSign,
              page: 'BillingInvoicing',
              gradient: 'from-cyan-500/20 to-blue-500/20',
              border: 'border-cyan-500/30'
            },
            {
              title: 'Reporting & Analytics',
              description: 'Business intelligence dashboards',
              icon: BarChart3,
              page: 'ReportingAnalytics',
              gradient: 'from-pink-500/20 to-red-500/20',
              border: 'border-pink-500/30'
            },
            {
              title: 'License Management',
              description: 'Track software and device licenses',
              icon: Briefcase,
              page: 'LicenseManagement',
              gradient: 'from-orange-500/20 to-yellow-500/20',
              border: 'border-orange-500/30'
            }
          ].map((item, i) => (
            <Link key={i} to={createPageUrl(item.page)}>
              <motion.div
                className={`bg-gradient-to-br ${item.gradient} border ${item.border} rounded-2xl p-6 hover:scale-105 transition-all cursor-pointer group`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.description}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}