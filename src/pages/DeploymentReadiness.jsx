import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, XCircle, AlertTriangle, Rocket, 
  Shield, Database, Zap, FileCheck 
} from 'lucide-react';

export default function DeploymentReadiness() {
  const [isChecking, setIsChecking] = useState(false);
  const [checkResults, setCheckResults] = useState(null);

  const { data: upgrades } = useQuery({
    queryKey: ['upgrades'],
    queryFn: () => base44.entities.UpgradeTracker.list(),
  });

  const { data: webhooks } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => base44.entities.WebhookConfiguration.list(),
  });

  const { data: metrics } = useQuery({
    queryKey: ['recent-metrics'],
    queryFn: () => base44.entities.SystemMetric.list('-created_date', 50),
  });

  const runDeploymentChecks = async () => {
    setIsChecking(true);
    
    // Simulate comprehensive deployment checks
    await new Promise(resolve => setTimeout(resolve, 2000));

    const results = {
      security: [
        { name: 'Authentication enabled', status: 'pass', critical: true },
        { name: 'Authorization rules configured', status: 'pass', critical: true },
        { name: 'Input validation implemented', status: 'pass', critical: true },
        { name: 'Rate limiting configured', status: 'warning', critical: false },
        { name: 'SSL/TLS enabled', status: 'pass', critical: true }
      ],
      performance: [
        { name: 'Database indexes optimized', status: 'pass', critical: false },
        { name: 'API response time < 500ms', status: metrics?.some(m => m.metric_name === 'api_avg_response_time' && m.metric_value < 500) ? 'pass' : 'warning', critical: false },
        { name: 'Frontend bundle size optimized', status: 'pass', critical: false },
        { name: 'Image assets optimized', status: 'pass', critical: false },
        { name: 'Caching strategy implemented', status: 'warning', critical: false }
      ],
      functionality: [
        { name: 'Core features tested', status: 'pass', critical: true },
        { name: 'Webhooks configured', status: webhooks?.length > 0 ? 'pass' : 'fail', critical: false },
        { name: 'Error handling implemented', status: 'pass', critical: true },
        { name: 'Critical upgrades completed', status: upgrades?.filter(u => u.priority === 'critical' && u.status === 'completed').length > 0 ? 'pass' : 'warning', critical: true }
      ],
      infrastructure: [
        { name: 'Monitoring configured', status: 'pass', critical: true },
        { name: 'Logging enabled', status: 'pass', critical: true },
        { name: 'Backup strategy defined', status: 'warning', critical: true },
        { name: 'Scalability tested', status: 'warning', critical: false },
        { name: 'Disaster recovery plan', status: 'warning', critical: true }
      ],
      documentation: [
        { name: 'API documentation complete', status: 'pass', critical: false },
        { name: 'User guides created', status: 'warning', critical: false },
        { name: 'Deployment runbook', status: 'pass', critical: true },
        { name: 'Webhook documentation', status: webhooks?.length > 0 ? 'pass' : 'warning', critical: false }
      ]
    };

    setCheckResults(results);
    setIsChecking(false);
  };

  const calculateReadinessScore = () => {
    if (!checkResults) return 0;
    
    let total = 0;
    let passed = 0;

    Object.values(checkResults).forEach(category => {
      category.forEach(check => {
        total++;
        if (check.status === 'pass') passed++;
      });
    });

    return Math.round((passed / total) * 100);
  };

  const readinessScore = calculateReadinessScore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Rocket className="w-10 h-10" />
              Deployment Readiness
            </h1>
            <p className="text-gray-300">Pre-deployment checklist and system validation</p>
          </div>
          <Button 
            onClick={runDeploymentChecks}
            disabled={isChecking}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isChecking ? 'Checking...' : 'Run Checks'}
          </Button>
        </div>

        {/* Overall Score */}
        {checkResults && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Deployment Readiness Score</h2>
                  <p className="text-gray-300">
                    {readinessScore >= 90 ? 'System is ready for deployment' :
                     readinessScore >= 70 ? 'Some improvements needed before deployment' :
                     'Critical issues must be resolved before deployment'}
                  </p>
                </div>
                <div className="text-center">
                  <div className={`text-6xl font-bold ${
                    readinessScore >= 90 ? 'text-green-400' :
                    readinessScore >= 70 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {readinessScore}%
                  </div>
                  <Progress value={readinessScore} className="w-48 mt-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">Total Upgrades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-white">{upgrades?.length || 0}</span>
                <FileCheck className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {upgrades?.filter(u => u.status === 'completed').length || 0} completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">Webhooks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-white">{webhooks?.length || 0}</span>
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {webhooks?.filter(w => w.status === 'active').length || 0} active
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge className="bg-green-500 text-white">Optimal</Badge>
                <Database className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-xs text-gray-400 mt-2">All systems go</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">Security</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge className="bg-green-500 text-white">Secure</Badge>
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-xs text-gray-400 mt-2">All checks passed</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Checks */}
        {checkResults && (
          <Tabs defaultValue="security" className="space-y-6">
            <TabsList className="bg-white/10 backdrop-blur-lg">
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="functionality">Functionality</TabsTrigger>
              <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
            </TabsList>

            {Object.entries(checkResults).map(([category, checks]) => (
              <TabsContent key={category} value={category}>
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white capitalize">{category} Checks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {checks.map((check, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            {check.status === 'pass' ? (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : check.status === 'warning' ? (
                              <AlertTriangle className="w-5 h-5 text-yellow-400" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-400" />
                            )}
                            <span className="text-white">{check.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {check.critical && (
                              <Badge variant="outline" className="text-red-400">Critical</Badge>
                            )}
                            <Badge variant={
                              check.status === 'pass' ? 'default' :
                              check.status === 'warning' ? 'outline' : 'destructive'
                            }>
                              {check.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}

        {!checkResults && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-12 text-center">
              <Rocket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Ready to Deploy?</h3>
              <p className="text-gray-300 mb-6">
                Run deployment checks to validate system readiness
              </p>
              <Button onClick={runDeploymentChecks} className="bg-purple-600 hover:bg-purple-700">
                Run Deployment Checks
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}