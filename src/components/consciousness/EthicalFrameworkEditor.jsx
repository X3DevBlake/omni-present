import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Shield, Plus, X, AlertTriangle, CheckCircle } from 'lucide-react';

export default function EthicalFrameworkEditor({ onSave }) {
  const [frameworkName, setFrameworkName] = useState('');
  const [principles, setPrinciples] = useState([
    { name: 'Human Safety First', priority: 1, nonNegotiable: true },
    { name: 'Privacy Protection', priority: 2, nonNegotiable: true }
  ]);
  const [newPrinciple, setNewPrinciple] = useState('');
  const [forbiddenActions, setForbiddenActions] = useState([
    'access_private_data_without_consent',
    'manipulate_financial_records'
  ]);
  const [newForbidden, setNewForbidden] = useState('');

  const addPrinciple = () => {
    if (newPrinciple.trim()) {
      setPrinciples([...principles, {
        name: newPrinciple,
        priority: principles.length + 1,
        nonNegotiable: false
      }]);
      setNewPrinciple('');
    }
  };

  const removePrinciple = (idx) => {
    setPrinciples(principles.filter((_, i) => i !== idx));
  };

  const addForbidden = () => {
    if (newForbidden.trim()) {
      setForbiddenActions([...forbiddenActions, newForbidden]);
      setNewForbidden('');
    }
  };

  const removeForbidden = (idx) => {
    setForbiddenActions(forbiddenActions.filter((_, i) => i !== idx));
  };

  const toggleNonNegotiable = (idx) => {
    const updated = [...principles];
    updated[idx].nonNegotiable = !updated[idx].nonNegotiable;
    setPrinciples(updated);
  };

  return (
    <Card className="bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20 border-green-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Shield className="w-8 h-8 text-green-400 animate-pulse" />
          Ethical Framework Editor
          <Badge className="bg-green-500/30 text-green-300">CUSTOM</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-white mb-2 block">Framework Name</label>
          <Input
            value={frameworkName}
            onChange={(e) => setFrameworkName(e.target.value)}
            placeholder="e.g., User Privacy-First Framework"
            className="bg-black/60 border-green-500/30 text-white"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-white font-bold">Core Ethical Principles</label>
            <Badge className="bg-green-500/30 text-green-300">{principles.length}</Badge>
          </div>

          <div className="space-y-2 mb-3">
            {principles.map((principle, idx) => (
              <div key={idx} className="bg-black/40 p-3 rounded-lg border border-green-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {principle.nonNegotiable ? (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                    <span className="text-white font-bold">{principle.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={principle.nonNegotiable}
                      onCheckedChange={() => toggleNonNegotiable(idx)}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removePrinciple(idx)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-white/60 text-xs">
                  Priority: {principle.priority} | {principle.nonNegotiable ? 'Non-negotiable' : 'Flexible'}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newPrinciple}
              onChange={(e) => setNewPrinciple(e.target.value)}
              placeholder="Add new principle..."
              className="bg-black/60 border-green-500/30 text-white"
              onKeyPress={(e) => e.key === 'Enter' && addPrinciple()}
            />
            <Button onClick={addPrinciple} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-white font-bold">Forbidden Actions</label>
            <Badge className="bg-red-500/30 text-red-300">{forbiddenActions.length}</Badge>
          </div>

          <div className="space-y-2 mb-3">
            {forbiddenActions.map((action, idx) => (
              <div key={idx} className="bg-black/40 p-3 rounded-lg border border-red-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-white text-sm">{action}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeForbidden(idx)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newForbidden}
              onChange={(e) => setNewForbidden(e.target.value)}
              placeholder="Add forbidden action..."
              className="bg-black/60 border-red-500/30 text-white"
              onKeyPress={(e) => e.key === 'Enter' && addForbidden()}
            />
            <Button onClick={addForbidden} className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Button
          onClick={() => onSave?.({ frameworkName, principles, forbiddenActions })}
          disabled={!frameworkName || principles.length === 0}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          <Shield className="w-4 h-4 mr-2" />
          Save Ethical Framework
        </Button>
      </CardContent>
    </Card>
  );
}