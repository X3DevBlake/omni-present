import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileJson, FileSpreadsheet, Database, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SimulationExporter({ simulationId }) {
  const [format, setFormat] = useState('json');
  const [scope, setScope] = useState('full');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await base44.functions.invoke('exportSimulationData', {
        simulation_id: simulationId,
        export_format: format,
        export_scope: scope,
        custom_filters: {}
      });

      if (response.data.download_url) {
        const link = document.createElement('a');
        link.href = response.data.download_url;
        link.download = `simulation-export-${Date.now()}.${format}`;
        link.click();
        toast.success(`Exported ${response.data.export.rows_exported} rows`);
      }
    } catch (error) {
      toast.error('Export failed');
    }
    setExporting(false);
  };

  const formatIcons = {
    json: FileJson,
    csv: FileSpreadsheet,
    sql: Database,
    pdf_report: FileText
  };

  const FormatIcon = formatIcons[format] || FileJson;

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Download className="w-5 h-5 text-green-400" />
          Export Simulation Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-white/80 text-sm mb-2 block">Export Format</label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <FileJson className="w-4 h-4" />
                  JSON
                </div>
              </SelectItem>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  CSV
                </div>
              </SelectItem>
              <SelectItem value="sql">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  SQL
                </div>
              </SelectItem>
              <SelectItem value="pdf_report">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  PDF Report
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-white/80 text-sm mb-2 block">Export Scope</label>
          <Select value={scope} onValueChange={setScope}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Dataset</SelectItem>
              <SelectItem value="metrics_only">Metrics Only</SelectItem>
              <SelectItem value="events_only">Events Only</SelectItem>
              <SelectItem value="agent_data">Agent Data</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleExport}
          disabled={exporting}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
        >
          <FormatIcon className="w-4 h-4 mr-2" />
          {exporting ? 'Exporting...' : `Export as ${format.toUpperCase()}`}
        </Button>
      </CardContent>
    </Card>
  );
}