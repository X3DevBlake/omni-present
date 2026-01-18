import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Mail, Shield, Edit2, Trash2, Plus } from 'lucide-react';

export default function UserPermissionsPanel({ users, roles }) {
  const [expandedUser, setExpandedUser] = useState(null);

  const getUserRole = (email) => {
    return roles.find(r => r.users_assigned?.includes(email));
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end mb-4">
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Assign User to Role
        </Button>
      </div>

      {users.length === 0 ? (
        <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
          <CardContent className="py-12 text-center">
            <Shield className="w-12 h-12 mx-auto text-slate-500 mb-4" />
            <p className="text-slate-400">No users found</p>
          </CardContent>
        </Card>
      ) : (
        users.map((user, idx) => {
          const userRole = getUserRole(user.email);
          return (
            <motion.div key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
              <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl hover:border-slate-600 transition-all">
                <CardContent className="p-4">
                  <div
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                          {user.full_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user.full_name}</p>
                          <p className="text-slate-400 text-xs flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {userRole ? (
                        <Badge className={userRole.role_type === 'admin' ? 'bg-red-600' : 'bg-blue-600'}>
                          {userRole.role_name}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
                          No Role
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedUser === user.id && userRole && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 pt-3 border-t border-slate-700 space-y-2 text-xs">
                      <div>
                        <p className="text-slate-400 mb-1">Hub Access</p>
                        <div className="flex flex-wrap gap-1">
                          {['communications', 'devices', 'banking', 'ailab', 'simulation'].map((hub) => {
                            const hasAccess = userRole.hub_permissions?.[hub]?.length > 0;
                            return (
                              <Badge key={hub} variant={hasAccess ? 'default' : 'outline'} className={!hasAccess ? 'opacity-50' : ''}>
                                {hub}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit2 className="w-3 h-3 mr-1" />
                          Change Role
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 text-red-400">
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })
      )}
    </div>
  );
}