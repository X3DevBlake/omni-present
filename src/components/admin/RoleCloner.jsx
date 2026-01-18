import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Loader2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RoleCloner() {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [showCloneForm, setShowCloneForm] = useState(false);

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.UserRole?.list?.() || [],
    initialData: []
  });

  const cloneMutation = useMutation({
    mutationFn: async (data) => {
      if (!selectedRole || !newRoleName) return;

      const clonedRole = {
        role_name: newRoleName,
        role_type: 'custom',
        description: `Cloned from ${selectedRole.role_name}`,
        hub_permissions: selectedRole.hub_permissions,
        system_permissions: selectedRole.system_permissions,
        is_active: true
      };

      return base44.entities.UserRole?.create?.(clonedRole);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setSelectedRole(null);
      setNewRoleName('');
      setShowCloneForm(false);
    }
  });

  const handleClone = async (e) => {
    e.preventDefault();
    cloneMutation.mutate();
  };

  return (
    <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Copy className="w-5 h-5" />
          Clone Existing Roles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Role Selection */}
        <div>
          <label className="text-sm text-slate-300 mb-2 block">Select Role to Clone</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
            {roles.map(role => (
              <motion.button
                key={role.id}
                onClick={() => {
                  setSelectedRole(role);
                  setShowCloneForm(true);
                }}
                whileHover={{ scale: 1.02 }}
                className={`p-3 rounded-lg border-2 transition text-left ${
                  selectedRole?.id === role.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <p className="font-medium text-white text-sm">{role.role_name}</p>
                <p className="text-xs text-slate-400 mt-1">{role.description}</p>
                <div className="flex gap-1 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {role.role_type}
                  </Badge>
                  {role.is_active && (
                    <Badge className="bg-green-500/20 text-green-300 text-xs">
                      Active
                    </Badge>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Clone Form */}
        {showCloneForm && selectedRole && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            onSubmit={handleClone}
            className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-3"
          >
            <div>
              <p className="text-sm text-slate-300 mb-2">
                Cloning from: <span className="font-medium text-blue-300">{selectedRole.role_name}</span>
              </p>
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-1 block">New Role Name</label>
              <Input
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="e.g., Custom Analyst"
                className="bg-slate-700 border-slate-600"
              />
            </div>

            {/* Preview of Permissions */}
            <div className="p-3 bg-slate-900/50 rounded border border-slate-700">
              <p className="text-xs text-slate-400 mb-2">Will clone these permissions:</p>
              <div className="space-y-2">
                {selectedRole.hub_permissions && (
                  <div>
                    <p className="text-xs text-slate-300 font-medium">Hub Permissions:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(selectedRole.hub_permissions).map(([hub, perms]) => (
                        <Badge key={hub} variant="outline" className="text-xs">
                          {hub}: {Array.isArray(perms) ? perms.join(', ') : 'N/A'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedRole.system_permissions?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-300 font-medium">System Permissions:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedRole.system_permissions.map(perm => (
                        <Badge key={perm} variant="outline" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={cloneMutation.isPending || !newRoleName}
                className="bg-blue-600 hover:bg-blue-700 flex-1"
              >
                {cloneMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Clone Role
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowCloneForm(false);
                  setNewRoleName('');
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </motion.form>
        )}

        {/* Success Message */}
        {cloneMutation.isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2"
          >
            <Check className="w-5 h-5 text-green-300" />
            <p className="text-sm text-green-300">Role cloned successfully!</p>
          </motion.div>
        )}

        {/* Info */}
        <p className="text-xs text-slate-400 p-3 bg-slate-800/30 rounded border border-slate-700">
          💡 Cloning is the fastest way to create custom roles. Start with a similar role and customize it as needed.
        </p>
      </CardContent>
    </Card>
  );
}