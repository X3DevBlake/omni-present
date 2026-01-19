import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Download, FileJson, FileSpreadsheet, FileText, Database } from 'lucide-react';

export default function SimulationExporter() {
  const [selectedSimulation, setSelectedSimulation] = useState('');
  const [exportFormat, setExportFormat] = useState('json');

  const { data: simulations } = useQuery({
    queryKey: ['exportable-simulations'],
    queryFn: async () => {
      const sims = await base44.entities.Simulation.filter({ status: 'completed' });
      return sims;
    },
  });

  const handleExport = async () => {
    if (!selectedSimulation) {
      alert('Please select a simulation');
      return;
    }

    // Fetch all simulation data
    const simulation = simulations?.find(s => s.id === selectedSimulation);
    const metrics = await base44.entities.SimulationMetrics.filter({ simulation_id: selectedSimulation });
    const behaviors = await base44.entities.EmergentBehavior.filter({ scenario_id: selectedSimulation });

    const exportData = {
      simulation,
      metrics,
      emergentBehaviors: behaviors,
      exportedAt: new Date().toISOString(),
    };

    let blob;
    let filename;

    if (exportFormat === 'json') {
      blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      filename = `simulation-${selectedSimulation.slice(0, 8)}.json`;
    } else if (exportFormat === 'csv') {
      const csvContent = metricsToCSV(metrics);
      blob = new Blob([csvContent], { type: 'text/csv' });
      filename = `simulation-${selectedSimulation.slice(0, 8)}.csv`;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const metricsToCSV = (metrics) => {
    if (!metrics || metrics.length === 0) return '';
    
    const headers = Object.keys(metrics[0]).join(',');
    const rows = metrics.map(m => Object.values(m).join(',')).join('\n');
    return `${headers}\n${rows}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-purple-400" />
            Export Simulation Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-white text-sm mb-2 block">Select Simulation</label>
            <Select value={selectedSimulation} onValueChange={setSelectedSimulation}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Choose simulation to export" />
              </SelectTrigger>
              <SelectContent>
                {simulations?.map((sim) => (
                  <SelectItem key={sim.id} value={sim.id}>
                    Simulation #{sim.id.slice(0, 8)} - {new Date(sim.created_date).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">Export Format</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileJson className="w-4 h-4" />
                    JSON (Full Data)
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    CSV (Metrics Only)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleExport}
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={!selectedSimulation}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Export Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <FileJson className="w-5 h-5 text-cyan-400" />
                <h4 className="text-white font-medium">JSON Format</h4>
              </div>
              <p className="text-white/60 text-sm">
                Complete simulation data including metrics, behaviors, and metadata. Best for further analysis and processing.
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <FileSpreadsheet className="w-5 h-5 text-green-400" />
                <h4 className="text-white font-medium">CSV Format</h4>
              </div>
              <p className="text-white/60 text-sm">
                Performance metrics in spreadsheet format. Compatible with Excel, Google Sheets, and data analysis tools.
              </p>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <p className="text-sm text-purple-200">
                <strong>Tip:</strong> Use exported data with Python, R, or Jupyter notebooks for advanced statistical analysis and machine learning.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}