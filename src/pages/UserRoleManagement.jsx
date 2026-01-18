import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Shield, Users, Lock, Settings, Plus, Edit2, Trash2 } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import RoleDefinitionPanel from '../components/admin/RoleDefinitionPanel';
import UserPermissionsPanel from '../components/admin/UserPermissionsPanel';
import PermissionVisualization from '../components/admin/PermissionVisualization';
import PermissionAuditLog from '../components/admin/PermissionAuditLog';
import TemporaryAccessElevation from '../components/admin/TemporaryAccessElevation';
import RoleCloner from '../components/admin/RoleCloner';
import PermissionConsentManager from '../components/admin/PermissionConsentManager';

export default function UserRoleManagement() {
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const { data: userRoles = [] } = useQuery({
    queryKey: ['userRoles'],
    queryFn: () => base44.entities.UserRole.list('-created_date', 100),
    initialData: []
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    initialData: []
  });

  const adminRole = userRoles.find(r => r.role_type === 'admin');
  const customRoles = userRoles.filter(r => r.role_type === 'custom');
  const totalUsersWithRoles = users.filter(u => userRoles.some(r => r.users_assigned?.includes(u.email))).length;

  const stats = [
    { label: 'Total Roles', value: userRoles.length, icon: <Shield className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Users', value: totalUsersWithRoles, icon: <Users className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' },
    { label: 'Custom Roles', value: customRoles.length, icon: <Edit2 className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' },
    { label: 'System Permissions', value: '18+', icon: <Lock className="w-5 h-5" />, color: 'from-orange-500 to-red-500' }
  ];

  return (
    <AuroraBackground className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-12 h-12 text-purple-400" />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Role & Permissions
            </span>
          </h1>
          <p className="text-white/60 text-lg">Manage user roles, define permissions, and control access across all hubs</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="roles" className="space-y-6">
          <TabsList className="bg-black/40 border border-white/10 flex flex-wrap">
            <TabsTrigger value="roles">Role Definitions</TabsTrigger>
            <TabsTrigger value="permissions">Permissions Matrix</TabsTrigger>
            <TabsTrigger value="users">User Assignments</TabsTrigger>
            <TabsTrigger value="visualization">Access Map</TabsTrigger>
            <TabsTrigger value="clone">Clone Roles</TabsTrigger>
            <TabsTrigger value="elevation">Temporary Access</TabsTrigger>
            <TabsTrigger value="consent">Permission Consent</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowCreateRole(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Role
              </Button>
            </div>
            <RoleDefinitionPanel roles={userRoles} selectedRole={selectedRole} onSelectRole={setSelectedRole} />
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions">
            <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Hub & System Permissions Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Role</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Communications</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Devices</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Banking</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">AI Lab</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Simulation</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">System</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userRoles.slice(0, 5).map((role) => (
                        <tr key={role.id} className="border-b border-slate-700 hover:bg-slate-800/30">
                          <td className="py-3 px-4 font-medium text-white">{role.role_name}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-xs">{role.hub_permissions?.communications?.length || 0} perms</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-xs">{role.hub_permissions?.devices?.length || 0} perms</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-xs">{role.hub_permissions?.banking?.length || 0} perms</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-xs">{role.hub_permissions?.ailab?.length || 0} perms</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-xs">{role.hub_permissions?.simulation?.length || 0} perms</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-xs">{role.system_permissions?.length || 0} perms</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <UserPermissionsPanel users={users} roles={userRoles} />
          </TabsContent>

          {/* Visualization Tab */}
          <TabsContent value="visualization">
            <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Access Control Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] rounded-lg overflow-hidden">
                  <PermissionVisualization roles={userRoles} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clone Roles Tab */}
          <TabsContent value="clone">
            <RoleCloner />
          </TabsContent>

          {/* Temporary Access Tab */}
          <TabsContent value="elevation">
            <TemporaryAccessElevation />
          </TabsContent>

          {/* Permission Consent Tab */}
          <TabsContent value="consent">
            <PermissionConsentManager />
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit">
            <PermissionAuditLog />
          </TabsContent>
          </Tabs>
      </div>
    </AuroraBackground>
  );
}