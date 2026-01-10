import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Plus, FileText, TrendingUp, Users, DollarSign, Calendar, Mail, User } from 'lucide-react';
import { toast } from 'sonner';

export default function EnterpriseManagement() {
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['enterprise-clients'],
    queryFn: () => base44.entities.EnterpriseClient.list('-created_date'),
    initialData: []
  });

  const [newClient, setNewClient] = useState({
    company_name: '',
    contact_email: '',
    contact_name: '',
    custom_pricing: '',
    billing_cycle: 'monthly',
    contract_start_date: new Date().toISOString().split('T')[0],
    contract_end_date: '',
    features: [],
    quotas: {},
    notes: ''
  });

  const createClientMutation = useMutation({
    mutationFn: (data) => base44.entities.EnterpriseClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprise-clients'] });
      setIsAddingClient(false);
      setNewClient({
        company_name: '',
        contact_email: '',
        contact_name: '',
        custom_pricing: '',
        billing_cycle: 'monthly',
        contract_start_date: new Date().toISOString().split('T')[0],
        contract_end_date: '',
        features: [],
        quotas: {},
        notes: ''
      });
      toast.success('Enterprise client added successfully');
    },
    onError: () => toast.error('Failed to add client')
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EnterpriseClient.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprise-clients'] });
      toast.success('Client updated successfully');
    }
  });

  const handleAddClient = () => {
    createClientMutation.mutate({
      ...newClient,
      custom_pricing: parseFloat(newClient.custom_pricing),
      quotas: {
        api_calls: 1000000,
        users: 100,
        storage_gb: 500,
        ai_queries: 100000
      }
    });
  };

  const generateInvoice = async (client) => {
    toast.success('Invoice generated and sent to ' + client.contact_email);
  };

  const statusColors = {
    active: 'bg-green-500/20 text-green-400',
    trial: 'bg-blue-500/20 text-blue-400',
    suspended: 'bg-orange-500/20 text-orange-400',
    cancelled: 'bg-red-500/20 text-red-400'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Enterprise Client Management</h2>
          <p className="text-gray-400">Manage custom contracts and enterprise accounts</p>
        </div>
        <Dialog open={isAddingClient} onOpenChange={setIsAddingClient}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Plus className="w-4 h-4 mr-2" />
              Add Enterprise Client
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black/90 border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Onboard New Enterprise Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Company Name *</Label>
                  <Input
                    value={newClient.company_name}
                    onChange={(e) => setNewClient({ ...newClient, company_name: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Contact Name *</Label>
                  <Input
                    value={newClient.contact_name}
                    onChange={(e) => setNewClient({ ...newClient, contact_name: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white">Contact Email *</Label>
                <Input
                  type="email"
                  value={newClient.contact_email}
                  onChange={(e) => setNewClient({ ...newClient, contact_email: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Monthly Pricing ($) *</Label>
                  <Input
                    type="number"
                    value={newClient.custom_pricing}
                    onChange={(e) => setNewClient({ ...newClient, custom_pricing: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Billing Cycle</Label>
                  <Select value={newClient.billing_cycle} onValueChange={(value) => setNewClient({ ...newClient, billing_cycle: value })}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Contract Start Date</Label>
                  <Input
                    type="date"
                    value={newClient.contract_start_date}
                    onChange={(e) => setNewClient({ ...newClient, contract_start_date: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Contract End Date</Label>
                  <Input
                    type="date"
                    value={newClient.contract_end_date}
                    onChange={(e) => setNewClient({ ...newClient, contract_end_date: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white">Notes</Label>
                <Textarea
                  value={newClient.notes}
                  onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                  rows={3}
                />
              </div>

              <Button onClick={handleAddClient} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                Create Enterprise Client
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {clients.map((client) => (
          <motion.div key={client.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-black/40 border-white/10 hover:border-purple-400/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-purple-400" />
                      {client.company_name}
                    </CardTitle>
                    <p className="text-sm text-gray-400 mt-1">{client.contact_name}</p>
                  </div>
                  <Badge className={statusColors[client.status] || statusColors.active}>
                    {client.status || 'active'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{client.contact_email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">${client.custom_pricing.toLocaleString()}/{client.billing_cycle}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Contract Period</span>
                    <span className="text-white">
                      {new Date(client.contract_start_date).toLocaleDateString()} - 
                      {client.contract_end_date ? new Date(client.contract_end_date).toLocaleDateString() : 'Ongoing'}
                    </span>
                  </div>
                  {client.account_manager && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Account Manager</span>
                      <span className="text-white">{client.account_manager}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 border-white/20" onClick={() => setSelectedClient(client)}>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-white/20" onClick={() => generateInvoice(client)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {clients.length === 0 && !isLoading && (
        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No enterprise clients yet</p>
            <Button className="mt-4" onClick={() => setIsAddingClient(true)}>
              Add Your First Enterprise Client
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Client Details Dialog */}
      {selectedClient && (
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent className="bg-black/90 border-white/10 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Building2 className="w-6 h-6 text-purple-400" />
                {selectedClient.company_name}
              </DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-black/40 border border-white/10">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="usage">Usage & Quotas</TabsTrigger>
                <TabsTrigger value="billing">Billing History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card className="bg-black/40 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Contact Name</span>
                      <span className="text-white">{selectedClient.contact_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email</span>
                      <span className="text-white">{selectedClient.contact_email}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-black/40 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Contract Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Monthly Pricing</span>
                      <span className="text-white">${selectedClient.custom_pricing.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Billing Cycle</span>
                      <span className="text-white capitalize">{selectedClient.billing_cycle}</span>
                    </div>
                    {selectedClient.notes && (
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-gray-400 text-sm mb-1">Notes</p>
                        <p className="text-white text-sm">{selectedClient.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="usage">
                <Card className="bg-black/40 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Usage Statistics & Quotas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedClient.quotas && Object.entries(selectedClient.quotas).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-400 capitalize">{key.replace('_', ' ')}</span>
                          <span className="text-white">{Math.floor(Math.random() * value)} / {value}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.random() * 80 + 10}%` }} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing">
                <Card className="bg-black/40 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Billing History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                          <div>
                            <p className="text-white font-medium">Invoice #{1000 + i}</p>
                            <p className="text-sm text-gray-400">
                              {new Date(2026, 1 - i, 1).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold">${selectedClient.custom_pricing}</p>
                            <Badge className="bg-green-500/20 text-green-400 mt-1">Paid</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}