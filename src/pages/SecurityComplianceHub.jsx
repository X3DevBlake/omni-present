import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertTriangle, Lock, Scale, FileText, Eye } from 'lucide-react';
import ThreatIntelligence3D from '../components/security/ThreatIntelligence3D';
import CompliancePolicy3D from '../components/compliance/CompliancePolicy3D';
import AccessControl3D from '../components/security/AccessControl3D';
import PrivacyManagement3D from '../components/privacy/PrivacyManagement3D';
import EncryptionManagement3D from '../components/encryption/EncryptionManagement3D';
import GovernanceFramework3D from '../components/governance/GovernanceFramework3D';
import AuditTrail3D from '../components/audit/AuditTrail3D';
import VulnerabilityAssessment3D from '../components/security/VulnerabilityAssessment3D';
import AuroraBackground from '../components/omni/AuroraBackground';
import { toast } from 'sonner';

export default function SecurityComplianceHub() {
  const queryClient = useQueryClient();

  const { data: threats } = useQuery({
    queryKey: ['threats'],
    queryFn: () => base44.entities.ThreatIntelligence.list('-created_date', 10),
    refetchInterval: 3000
  });

  const { data: compliancePolicies } = useQuery({
    queryKey: ['compliance-policies'],
    queryFn: () => base44.entities.CompliancePolicy.list('-created_date', 10)
  });

  const { data: accessControls } = useQuery({
    queryKey: ['access-controls'],
    queryFn: () => base44.entities.AccessControl.list('-created_date', 10)
  });

  const { data: privacyPolicies } = useQuery({
    queryKey: ['privacy-policies'],
    queryFn: () => base44.entities.PrivacyManagement.list('-created_date', 10)
  });

  const { data: encryptionPolicies } = useQuery({
    queryKey: ['encryption-policies'],
    queryFn: () => base44.entities.EncryptionManagement.list('-created_date', 10)
  });

  const { data: governanceFrameworks } = useQuery({
    queryKey: ['governance-frameworks'],
    queryFn: () => base44.entities.GovernanceFramework.list('-created_date', 10)
  });

  const { data: auditTrails } = useQuery({
    queryKey: ['audit-trails'],
    queryFn: () => base44.entities.AuditTrail.list('-created_date', 10)
  });

  const { data: vulnerabilityAssessments } = useQuery({
    queryKey: ['vulnerability-assessments'],
    queryFn: () => base44.entities.VulnerabilityAssessment.list('-created_date', 10),
    refetchInterval: 5000
  });

  const detectThreat = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('detectThreats', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
      toast.success('Threat detected!');
    }
  });

  const auditCompliance = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('auditCompliance', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-policies'] });
      toast.success('Compliance audit completed!');
    }
  });

  const configureAccess = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('configureAccessControl', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-controls'] });
      toast.success('Access control configured!');
    }
  });

  const managePrivacy = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('managePrivacy', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-policies'] });
      toast.success('Privacy policy created!');
    }
  });

  const manageEncryption = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('manageEncryption', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encryption-policies'] });
      toast.success('Encryption policy created!');
    }
  });

  const createGovernance = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('createGovernanceFramework', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance-frameworks'] });
      toast.success('Governance framework created!');
    }
  });

  const createAudit = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('createAuditTrail', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-trails'] });
      toast.success('Audit trail created!');
    }
  });

  const scanVulnerabilities = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('scanVulnerabilities', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vulnerability-assessments'] });
      toast.success('Vulnerability scan completed!');
    }
  });

  const [threatForm, setThreatForm] = useState({
    threat_name: '',
    threat_type: 'injection',
    severity_level: 'high'
  });

  const [complianceForm, setComplianceForm] = useState({
    policy_name: '',
    regulatory_framework: 'gdpr'
  });

  const [accessForm, setAccessForm] = useState({
    access_policy_name: '',
    policy_type: 'rbac'
  });

  const [privacyForm, setPrivacyForm] = useState({
    privacy_policy_name: ''
  });

  const [encryptionForm, setEncryptionForm] = useState({
    encryption_policy_name: '',
    encryption_standard: 'aes_256'
  });

  const [governanceForm, setGovernanceForm] = useState({
    framework_name: '',
    governance_model: 'federated'
  });

  const [auditForm, setAuditForm] = useState({
    trail_name: '',
    scope: 'system_wide'
  });

  const [vulnForm, setVulnForm] = useState({
    assessment_name: '',
    assessment_type: 'application_scan'
  });

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-3">
            <Shield className="w-12 h-12 text-cyan-400" />
            Security, Compliance & Governance Hub
          </h1>
          <p className="text-xl text-white/70">
            Threat Intelligence, Compliance Audits, Access Control, Privacy, Encryption & Governance
          </p>
        </div>

        <Tabs defaultValue="threats" className="w-full">
          <TabsList className="grid w-full grid-cols-8 mb-8 bg-black/30 p-1">
            <TabsTrigger value="threats" className="data-[state=active]:bg-red-600">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Threats
            </TabsTrigger>
            <TabsTrigger value="compliance" className="data-[state=active]:bg-green-600">
              <FileText className="w-4 h-4 mr-2" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="access" className="data-[state=active]:bg-cyan-600">
              <Lock className="w-4 h-4 mr-2" />
              Access
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-purple-600">
              <Eye className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="encryption" className="data-[state=active]:bg-blue-600">
              <Lock className="w-4 h-4 mr-2" />
              Encryption
            </TabsTrigger>
            <TabsTrigger value="governance" className="data-[state=active]:bg-indigo-600">
              <Scale className="w-4 h-4 mr-2" />
              Governance
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-orange-600">
              <FileText className="w-4 h-4 mr-2" />
              Audit
            </TabsTrigger>
            <TabsTrigger value="vulnerabilities" className="data-[state=active]:bg-pink-600">
              <Shield className="w-4 h-4 mr-2" />
              Scan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="threats" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Detect Security Threat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Threat name"
                  value={threatForm.threat_name}
                  onChange={(e) => setThreatForm({...threatForm, threat_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={threatForm.threat_type} onValueChange={(v) => setThreatForm({...threatForm, threat_type: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="injection">Injection Attack</SelectItem>
                    <SelectItem value="ddos">DDoS Attack</SelectItem>
                    <SelectItem value="data_breach">Data Breach</SelectItem>
                    <SelectItem value="ai_poisoning">AI Poisoning</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={threatForm.severity_level} onValueChange={(v) => setThreatForm({...threatForm, severity_level: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => detectThreat.mutate(threatForm)}
                  disabled={detectThreat.isPending || !threatForm.threat_name}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600"
                >
                  Detect & Analyze Threat
                </Button>
              </CardContent>
            </Card>

            {threats?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <ThreatIntelligence3D threat={threats[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Audit Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Policy name"
                  value={complianceForm.policy_name}
                  onChange={(e) => setComplianceForm({...complianceForm, policy_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={complianceForm.regulatory_framework} onValueChange={(v) => setComplianceForm({...complianceForm, regulatory_framework: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gdpr">GDPR</SelectItem>
                    <SelectItem value="hipaa">HIPAA</SelectItem>
                    <SelectItem value="soc2">SOC 2</SelectItem>
                    <SelectItem value="iso27001">ISO 27001</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => auditCompliance.mutate(complianceForm)}
                  disabled={auditCompliance.isPending || !complianceForm.policy_name}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  Run Compliance Audit
                </Button>
              </CardContent>
            </Card>

            {compliancePolicies?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <CompliancePolicy3D policy={compliancePolicies[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="access" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Configure Access Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Policy name"
                  value={accessForm.access_policy_name}
                  onChange={(e) => setAccessForm({...accessForm, access_policy_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={accessForm.policy_type} onValueChange={(v) => setAccessForm({...accessForm, policy_type: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rbac">Role-Based (RBAC)</SelectItem>
                    <SelectItem value="abac">Attribute-Based (ABAC)</SelectItem>
                    <SelectItem value="zero_trust">Zero Trust</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => configureAccess.mutate(accessForm)}
                  disabled={configureAccess.isPending || !accessForm.access_policy_name}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
                >
                  Configure Access Policy
                </Button>
              </CardContent>
            </Card>

            {accessControls?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <AccessControl3D accessControl={accessControls[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Manage Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Privacy policy name"
                  value={privacyForm.privacy_policy_name}
                  onChange={(e) => setPrivacyForm({...privacyForm, privacy_policy_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Button
                  onClick={() => managePrivacy.mutate(privacyForm)}
                  disabled={managePrivacy.isPending || !privacyForm.privacy_policy_name}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Create Privacy Policy
                </Button>
              </CardContent>
            </Card>

            {privacyPolicies?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <PrivacyManagement3D privacyPolicy={privacyPolicies[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="encryption" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Manage Encryption</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Encryption policy name"
                  value={encryptionForm.encryption_policy_name}
                  onChange={(e) => setEncryptionForm({...encryptionForm, encryption_policy_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={encryptionForm.encryption_standard} onValueChange={(v) => setEncryptionForm({...encryptionForm, encryption_standard: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aes_256">AES-256</SelectItem>
                    <SelectItem value="rsa_4096">RSA-4096</SelectItem>
                    <SelectItem value="quantum_resistant">Quantum Resistant</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => manageEncryption.mutate(encryptionForm)}
                  disabled={manageEncryption.isPending || !encryptionForm.encryption_policy_name}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  Configure Encryption
                </Button>
              </CardContent>
            </Card>

            {encryptionPolicies?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <EncryptionManagement3D encryptionPolicy={encryptionPolicies[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="governance" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Create Governance Framework</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Framework name"
                  value={governanceForm.framework_name}
                  onChange={(e) => setGovernanceForm({...governanceForm, framework_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={governanceForm.governance_model} onValueChange={(v) => setGovernanceForm({...governanceForm, governance_model: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="centralized">Centralized</SelectItem>
                    <SelectItem value="decentralized">Decentralized</SelectItem>
                    <SelectItem value="federated">Federated</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => createGovernance.mutate(governanceForm)}
                  disabled={createGovernance.isPending || !governanceForm.framework_name}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  Create Framework
                </Button>
              </CardContent>
            </Card>

            {governanceFrameworks?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <GovernanceFramework3D framework={governanceFrameworks[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Create Audit Trail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Trail name"
                  value={auditForm.trail_name}
                  onChange={(e) => setAuditForm({...auditForm, trail_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={auditForm.scope} onValueChange={(v) => setAuditForm({...auditForm, scope: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system_wide">System-Wide</SelectItem>
                    <SelectItem value="user_actions">User Actions</SelectItem>
                    <SelectItem value="data_changes">Data Changes</SelectItem>
                    <SelectItem value="model_operations">Model Operations</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => createAudit.mutate(auditForm)}
                  disabled={createAudit.isPending || !auditForm.trail_name}
                  className="w-full bg-gradient-to-r from-orange-600 to-yellow-600"
                >
                  Create Audit Trail
                </Button>
              </CardContent>
            </Card>

            {auditTrails?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <AuditTrail3D trail={auditTrails[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="vulnerabilities" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Scan Vulnerabilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Assessment name"
                  value={vulnForm.assessment_name}
                  onChange={(e) => setVulnForm({...vulnForm, assessment_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={vulnForm.assessment_type} onValueChange={(v) => setVulnForm({...vulnForm, assessment_type: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="network_scan">Network Scan</SelectItem>
                    <SelectItem value="application_scan">Application Scan</SelectItem>
                    <SelectItem value="api_security">API Security</SelectItem>
                    <SelectItem value="dependency_audit">Dependency Audit</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => scanVulnerabilities.mutate(vulnForm)}
                  disabled={scanVulnerabilities.isPending || !vulnForm.assessment_name}
                  className="w-full bg-gradient-to-r from-pink-600 to-red-600"
                >
                  Start Security Scan
                </Button>
              </CardContent>
            </Card>

            {vulnerabilityAssessments?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <VulnerabilityAssessment3D assessment={vulnerabilityAssessments[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}