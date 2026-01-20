import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Server, Radio, Database, Shield, Zap, Store } from 'lucide-react';
import EventBus3D from '../components/infrastructure/EventBus3D';
import Microservices3D from '../components/infrastructure/Microservices3D';
import DecentralizedStorage3D from '../components/infrastructure/DecentralizedStorage3D';
import BlockchainAudit3D from '../components/infrastructure/BlockchainAudit3D';
import ResourceOptimization3D from '../components/infrastructure/ResourceOptimization3D';
import SecurityScan3D from '../components/infrastructure/SecurityScan3D';
import IntegrationMarketplace3D from '../components/infrastructure/IntegrationMarketplace3D';
import AuroraBackground from '../components/omni/AuroraBackground';
import { toast } from 'sonner';

export default function BackendInfrastructureHub() {
  const queryClient = useQueryClient();

  const { data: events } = useQuery({
    queryKey: ['event-bus'],
    queryFn: () => base44.entities.EventBusMessage.list('-created_date', 50),
    refetchInterval: 2000
  });

  const { data: microservices } = useQuery({
    queryKey: ['microservices'],
    queryFn: () => base44.entities.MicroserviceEndpoint.list('-created_date', 20)
  });

  const { data: storages } = useQuery({
    queryKey: ['decentralized-storage'],
    queryFn: () => base44.entities.DecentralizedStorage.list('-created_date', 50)
  });

  const { data: audits } = useQuery({
    queryKey: ['blockchain-audits'],
    queryFn: () => base44.entities.BlockchainAuditLog.list('-block_number', 20),
    refetchInterval: 5000
  });

  const { data: optimizations } = useQuery({
    queryKey: ['resource-optimizations'],
    queryFn: () => base44.entities.ResourceOptimization.list('-created_date', 10)
  });

  const { data: scans } = useQuery({
    queryKey: ['security-scans'],
    queryFn: () => base44.entities.SecurityScan.list('-created_date', 10),
    refetchInterval: 5000
  });

  const { data: integrations } = useQuery({
    queryKey: ['integrations-marketplace'],
    queryFn: () => base44.entities.IntegrationMarketplace.list('-rating', 50)
  });

  const dispatchEvent = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('eventBusDispatcher', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-bus'] });
      toast.success('Event dispatched!');
    }
  });

  const registerService = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('microserviceRouter', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['microservices'] });
      toast.success('Microservice registered!');
    }
  });

  const storeIPFS = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('storeOnIPFS', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decentralized-storage'] });
      toast.success('Stored on IPFS!');
    }
  });

  const recordAudit = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('blockchainAudit', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockchain-audits'] });
      toast.success('Audit recorded on blockchain!');
    }
  });

  const optimizeResources = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('optimizeResources', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource-optimizations'] });
      toast.success('Resource optimization completed!');
    }
  });

  const runSecurityScan = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('autoSecurityScan', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-scans'] });
      toast.success('Security scan started!');
    }
  });

  const installIntegration = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('installIntegration', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations-marketplace'] });
      toast.success('Integration installed!');
    }
  });

  const [eventForm, setEventForm] = useState({
    event_type: 'workflow_triggered',
    source_service: 'ai_lab',
    payload: {},
    target_services: ['analytics', 'monitoring'],
    priority: 'normal'
  });

  const [serviceForm, setServiceForm] = useState({
    service_name: '',
    endpoint_path: '/api/v1/',
    http_method: 'POST',
    function_name: '',
    category: 'data_processing'
  });

  const [storageForm, setStorageForm] = useState({
    storage_name: '',
    content_type: 'model_weights',
    file_data: 'sample_data',
    encryption_enabled: true
  });

  const [auditForm, setAuditForm] = useState({
    action_type: 'model_deployment',
    action_data: {},
    blockchain: 'polygon'
  });

  const [optimizationForm, setOptimizationForm] = useState({
    optimization_name: '',
    resource_type: 'compute',
    algorithm: 'reinforcement_learning',
    current_allocation: { cpu_cores: 4, memory_gb: 16, gpu_count: 1, storage_gb: 100 }
  });

  const [scanForm, setScanForm] = useState({
    scan_name: '',
    scan_type: 'vulnerability',
    target_type: 'full_system',
    target_id: 'system_001',
    auto_remediate: true
  });

  const [integrationForm, setIntegrationForm] = useState({
    integration_name: '',
    category: 'ai_ml',
    provider: '',
    endpoints: [],
    auth_type: 'api_key'
  });

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-3">
            <Server className="w-12 h-12 text-cyan-400" />
            Backend Infrastructure Hub
          </h1>
          <p className="text-xl text-white/70">
            Event Bus, Microservices, Decentralized Storage, Blockchain, Resource Optimization & Security
          </p>
        </div>

        <Tabs defaultValue="eventbus" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8 bg-black/30 p-1">
            <TabsTrigger value="eventbus" className="data-[state=active]:bg-cyan-600">
              <Radio className="w-4 h-4 mr-2" />
              Event Bus
            </TabsTrigger>
            <TabsTrigger value="microservices" className="data-[state=active]:bg-purple-600">
              <Server className="w-4 h-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="storage" className="data-[state=active]:bg-blue-600">
              <Database className="w-4 h-4 mr-2" />
              Storage
            </TabsTrigger>
            <TabsTrigger value="blockchain" className="data-[state=active]:bg-green-600">
              <Database className="w-4 h-4 mr-2" />
              Blockchain
            </TabsTrigger>
            <TabsTrigger value="optimization" className="data-[state=active]:bg-orange-600">
              <Zap className="w-4 h-4 mr-2" />
              Optimize
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-red-600">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="data-[state=active]:bg-pink-600">
              <Store className="w-4 h-4 mr-2" />
              Marketplace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="eventbus" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Dispatch Event</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={eventForm.event_type} onValueChange={(v) => setEventForm({...eventForm, event_type: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entity_created">Entity Created</SelectItem>
                    <SelectItem value="workflow_triggered">Workflow Triggered</SelectItem>
                    <SelectItem value="model_deployed">Model Deployed</SelectItem>
                    <SelectItem value="alert_fired">Alert Fired</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Source service"
                  value={eventForm.source_service}
                  onChange={(e) => setEventForm({...eventForm, source_service: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Button
                  onClick={() => dispatchEvent.mutate(eventForm)}
                  disabled={dispatchEvent.isPending}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
                >
                  Dispatch Event
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardContent className="p-6">
                <EventBus3D events={events} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="microservices" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Register Microservice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Service name"
                  value={serviceForm.service_name}
                  onChange={(e) => setServiceForm({...serviceForm, service_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Input
                  placeholder="Endpoint path"
                  value={serviceForm.endpoint_path}
                  onChange={(e) => setServiceForm({...serviceForm, endpoint_path: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Input
                  placeholder="Function name"
                  value={serviceForm.function_name}
                  onChange={(e) => setServiceForm({...serviceForm, function_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Button
                  onClick={() => registerService.mutate(serviceForm)}
                  disabled={registerService.isPending || !serviceForm.service_name}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Register Service
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardContent className="p-6">
                <Microservices3D services={microservices} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="storage" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Store on IPFS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Storage name"
                  value={storageForm.storage_name}
                  onChange={(e) => setStorageForm({...storageForm, storage_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={storageForm.content_type} onValueChange={(v) => setStorageForm({...storageForm, content_type: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="model_weights">Model Weights</SelectItem>
                    <SelectItem value="dataset">Dataset</SelectItem>
                    <SelectItem value="agent_memory">Agent Memory</SelectItem>
                    <SelectItem value="audit_log">Audit Log</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => storeIPFS.mutate(storageForm)}
                  disabled={storeIPFS.isPending || !storageForm.storage_name}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  Store on IPFS
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardContent className="p-6">
                <DecentralizedStorage3D storages={storages} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blockchain" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Record Blockchain Audit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={auditForm.action_type} onValueChange={(v) => setAuditForm({...auditForm, action_type: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="model_deployment">Model Deployment</SelectItem>
                    <SelectItem value="agent_certification">Agent Certification</SelectItem>
                    <SelectItem value="credential_verification">Credential Verification</SelectItem>
                    <SelectItem value="governance_vote">Governance Vote</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={auditForm.blockchain} onValueChange={(v) => setAuditForm({...auditForm, blockchain: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="polygon">Polygon</SelectItem>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="avalanche">Avalanche</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => recordAudit.mutate(auditForm)}
                  disabled={recordAudit.isPending}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  Record on Blockchain
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardContent className="p-6">
                <BlockchainAudit3D audits={audits} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">AI Resource Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Optimization name"
                  value={optimizationForm.optimization_name}
                  onChange={(e) => setOptimizationForm({...optimizationForm, optimization_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={optimizationForm.algorithm} onValueChange={(v) => setOptimizationForm({...optimizationForm, algorithm: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reinforcement_learning">Reinforcement Learning</SelectItem>
                    <SelectItem value="genetic_algorithm">Genetic Algorithm</SelectItem>
                    <SelectItem value="bayesian_optimization">Bayesian Optimization</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => optimizeResources.mutate(optimizationForm)}
                  disabled={optimizeResources.isPending || !optimizationForm.optimization_name}
                  className="w-full bg-gradient-to-r from-orange-600 to-yellow-600"
                >
                  Optimize Resources
                </Button>
              </CardContent>
            </Card>

            {optimizations?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <ResourceOptimization3D optimization={optimizations[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Automated Security Scan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Scan name"
                  value={scanForm.scan_name}
                  onChange={(e) => setScanForm({...scanForm, scan_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={scanForm.scan_type} onValueChange={(v) => setScanForm({...scanForm, scan_type: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vulnerability">Vulnerability Scan</SelectItem>
                    <SelectItem value="penetration">Penetration Test</SelectItem>
                    <SelectItem value="code_analysis">Code Analysis</SelectItem>
                    <SelectItem value="ai_model_security">AI Model Security</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => runSecurityScan.mutate(scanForm)}
                  disabled={runSecurityScan.isPending || !scanForm.scan_name}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600"
                >
                  Run Security Scan
                </Button>
              </CardContent>
            </Card>

            {scans?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <SecurityScan3D scan={scans[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Install Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Integration name"
                  value={integrationForm.integration_name}
                  onChange={(e) => setIntegrationForm({...integrationForm, integration_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Input
                  placeholder="Provider"
                  value={integrationForm.provider}
                  onChange={(e) => setIntegrationForm({...integrationForm, provider: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={integrationForm.category} onValueChange={(v) => setIntegrationForm({...integrationForm, category: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai_ml">AI/ML</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="crm">CRM</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => installIntegration.mutate(integrationForm)}
                  disabled={installIntegration.isPending || !integrationForm.integration_name}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600"
                >
                  Install Integration
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardContent className="p-6">
                <IntegrationMarketplace3D
                  integrations={integrations}
                  onSelect={(int) => toast.info(`${int.integration_name} - ${int.rating.toFixed(1)}⭐`)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}