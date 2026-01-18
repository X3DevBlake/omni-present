import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Download, Mail } from 'lucide-react';

export default function AlertReportGenerator() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('daily');

  const generateReport = async (type) => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateAlertReport', {
        reportType: type,
        includeRecommendations: true,
        includeTrends: true
      });

      // Download or display report
      if (response.data?.reportUrl) {
        window.open(response.data.reportUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  const reports = [
    {
      type: 'daily',
      label: 'Daily Summary',
      desc: 'Daily alert summary and trends',
      icon: '📊'
    },
    {
      type: 'weekly',
      label: 'Weekly Report',
      desc: 'Weekly analysis with root causes',
      icon: '📈'
    },
    {
      type: 'monthly',
      label: 'Monthly Report',
      desc: 'Comprehensive monthly analysis',
      icon: '📋'
    }
  ];

  return (
    <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Alert Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {reports.map(report => (
            <button
              key={report.type}
              onClick={() => generateReport(report.type)}
              disabled={loading}
              className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-600/50 rounded-lg transition text-left"
            >
              <div className="text-2xl mb-2">{report.icon}</div>
              <p className="font-medium text-white text-sm">{report.label}</p>
              <p className="text-xs text-slate-400 mt-1">{report.desc}</p>
              {loading && (
                <div className="mt-2">
                  <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Report Settings */}
        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700 space-y-3">
          <p className="text-sm font-medium text-slate-300">Automated Reporting</p>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-slate-300">Email daily summaries</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-slate-300">Include root cause analysis</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-slate-300">Send recommendations</span>
            </label>
          </div>
        </div>

        <Button className="w-full bg-blue-600 hover:bg-blue-700">
          <Mail className="w-4 h-4 mr-2" />
          Configure Email Reports
        </Button>
      </CardContent>
    </Card>
  );
}