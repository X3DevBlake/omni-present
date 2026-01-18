import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Shield, Users, Lock, Edit2, Trash2 } from 'lucide-react';

export default function RoleDefinitionPanel({ roles, selectedRole, onSelectRole }) {
  const getRoleTypeColor = (type) => {
    const colors = {
      admin: 'bg-red-600',
      operator: 'bg-blue-600',
      analyst: 'bg-purple-600',
      viewer: 'bg-slate-600',
      custom: 'bg-green-600'
    };
    return colors[type] || 'bg-slate-600';
  };

  return (
    <div className="space-y-4">
      {roles.length === 0 ? (
        <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
          <CardContent className="py-12 text-center">
            <Shield className="w-12 h-12 mx-auto text-slate-500 mb-4" />
            <p className="text-slate-400">No roles configured yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {roles.map((role, idx) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card
                className={`bg-slate-900/60 border-slate-700 backdrop-blur-xl cursor-pointer transition-all ${
                  selectedRole?.id === role.id ? 'ring-2 ring-purple-400 border-purple-500' : ''
                }`}
                onClick={() => onSelectRole(role)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <CardTitle className="text-white">{role.role_name}</CardTitle>
                      <p className="text-slate-400 text-sm mt-1">{role.description}</p>
                    </div>
                    <Badge className={getRoleTypeColor(role.role_type)}>
                      {role.role_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Users Count */}
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">{role.users_assigned?.length || 0} users assigned</span>
                  </div>

                  {/* Hub Permissions Summary */}
                  <div>
                    <p className="text-slate-300 text-sm font-semibold mb-2">Hub Permissions</p>
                    <div className="space-y-1">
                      {['communications', 'devices', 'banking', 'ailab', 'simulation'].map((hub) => {
                        const count = role.hub_permissions?.[hub]?.length || 0;
                        return (
                          <div key={hub} className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-800/50">
                            <span className="text-slate-300 capitalize">{hub}</span>
                            <span className={`font-semibold ${count > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                              {count > 0 ? `${count} perms` : 'None'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* System Permissions */}
                  {role.system_permissions?.length > 0 && (
                    <div>
                      <p className="text-slate-300 text-sm font-semibold mb-2 flex items-center gap-1">
                        <Lock className="w-4 h-4" />
                        System Permissions
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {role.system_permissions.slice(0, 3).map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs capitalize">
                            {perm.replace('_', ' ')}
                          </Badge>
                        ))}
                        {role.system_permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.system_permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div>
                    <Badge className={role.is_active ? 'bg-green-600' : 'bg-red-600'}>
                      {role.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-slate-700">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    {role.role_type === 'custom' && (
                      <Button size="sm" variant="outline" className="flex-1 text-red-400">
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}