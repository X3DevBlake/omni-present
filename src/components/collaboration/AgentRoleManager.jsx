import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Edit, Trash2, Users } from 'lucide-react';

export default function AgentRoleManager({ agents, onAssignRole, onUpdateRole, onRemoveRole }) {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [role, setRole] = useState('');
  const [skills, setSkills] = useState('');

  const handleAssign = () => {
    if (selectedAgent && role) {
      onAssignRole?.({ agent_id: selectedAgent, role, skills: skills.split(',').map(s => s.trim()) });
      setSelectedAgent('');
      setRole('');
      setSkills('');
    }
  };

  const roleColors = {
    'coordinator': 'bg-purple-500/30 text-purple-300',
    'executor': 'bg-blue-500/30 text-blue-300',
    'analyzer': 'bg-cyan-500/30 text-cyan-300',
    'optimizer': 'bg-green-500/30 text-green-300',
    'validator': 'bg-orange-500/30 text-orange-300'
  };

  return (
    <Card className="bg-black/40 border-purple-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Agent Role Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="bg-black/60 border-purple-500/30 text-white">
              <SelectValue placeholder="Select Agent" />
            </SelectTrigger>
            <SelectContent>
              {agents.map(agent => (
                <SelectItem key={agent.id} value={agent.id}>{agent.name || 'Agent'}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="bg-black/60 border-purple-500/30 text-white">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coordinator">Coordinator</SelectItem>
              <SelectItem value="executor">Executor</SelectItem>
              <SelectItem value="analyzer">Analyzer</SelectItem>
              <SelectItem value="optimizer">Optimizer</SelectItem>
              <SelectItem value="validator">Validator</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Skills (comma-separated)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="bg-black/60 border-purple-500/30 text-white"
          />
        </div>

        <Button onClick={handleAssign} className="w-full bg-purple-600 hover:bg-purple-700 mb-4">
          <UserPlus className="w-4 h-4 mr-2" />
          Assign Role
        </Button>

        <div className="space-y-2">
          {agents.slice(0, 8).map((agent) => (
            <div key={agent.id} className="bg-black/60 p-3 rounded-lg border border-purple-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-bold text-sm mb-1">{agent.name || 'Agent'}</div>
                  <div className="flex gap-2">
                    <Badge className={roleColors[agent.collaboration_role] || 'bg-gray-500/30 text-gray-300'}>
                      {agent.collaboration_role || 'unassigned'}
                    </Badge>
                    {agent.skill_contribution?.slice(0, 2).map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs text-white/60">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onUpdateRole?.(agent)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onRemoveRole?.(agent.id)}>
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}