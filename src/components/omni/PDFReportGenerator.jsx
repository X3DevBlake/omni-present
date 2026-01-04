import React from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

export default function PDFReportGenerator({ blueprint, analytics, simulations, comparisons }) {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF();
      let yPos = 20;
      
      // Title
      pdf.setFontSize(24);
      pdf.setTextColor(0, 245, 255);
      pdf.text('Blueprint Analysis Report', 20, yPos);
      yPos += 15;
      
      // Date
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, yPos);
      yPos += 15;
      
      // Blueprint Overview
      pdf.setFontSize(16);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Blueprint Overview', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(10);
      pdf.setTextColor(200, 200, 200);
      pdf.text(`Name: ${blueprint?.name || 'Untitled'}`, 25, yPos);
      yPos += 7;
      pdf.text(`Version: ${blueprint?.version || 1}`, 25, yPos);
      yPos += 7;
      
      if (blueprint?.estimatedCost) {
        pdf.text(`Estimated Cost: $${blueprint.estimatedCost.toLocaleString()}`, 25, yPos);
        yPos += 7;
      }
      
      if (blueprint?.estimatedPerformance) {
        pdf.text(`Performance: ${blueprint.estimatedPerformance.toFixed(0)} TFLOPS`, 25, yPos);
        yPos += 7;
      }
      
      yPos += 10;
      
      // Components
      if (blueprint?.configuration?.components) {
        pdf.setFontSize(16);
        pdf.setTextColor(255, 255, 255);
        pdf.text('Components', 20, yPos);
        yPos += 10;
        
        blueprint.configuration.components.slice(0, 10).forEach((comp, idx) => {
          pdf.setFontSize(9);
          pdf.setTextColor(200, 200, 200);
          pdf.text(`• ${comp.name || comp.type || `Component ${idx + 1}`}`, 25, yPos);
          yPos += 6;
          
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
        });
        
        yPos += 10;
      }
      
      // Analytics
      if (analytics) {
        if (yPos > 250) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.setFontSize(16);
        pdf.setTextColor(168, 85, 247);
        pdf.text('AI Analytics Insights', 20, yPos);
        yPos += 10;
        
        pdf.setFontSize(10);
        pdf.setTextColor(200, 200, 200);
        
        if (analytics.bottlenecks) {
          pdf.text('Bottlenecks Detected:', 25, yPos);
          yPos += 7;
          analytics.bottlenecks.slice(0, 5).forEach(b => {
            pdf.setFontSize(9);
            pdf.text(`• ${b.component}: ${b.issue}`, 30, yPos);
            yPos += 6;
          });
          yPos += 5;
        }
        
        if (analytics.recommendations) {
          pdf.setFontSize(10);
          pdf.text('Recommendations:', 25, yPos);
          yPos += 7;
          analytics.recommendations.slice(0, 5).forEach(r => {
            pdf.setFontSize(9);
            pdf.text(`• ${r.action}`, 30, yPos);
            yPos += 6;
          });
        }
        
        yPos += 10;
      }
      
      // Simulations
      if (simulations?.length > 0) {
        if (yPos > 250) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.setFontSize(16);
        pdf.setTextColor(236, 72, 153);
        pdf.text('Simulation Results', 20, yPos);
        yPos += 10;
        
        simulations.slice(0, 3).forEach((sim, idx) => {
          pdf.setFontSize(12);
          pdf.setTextColor(255, 255, 255);
          pdf.text(`${idx + 1}. ${sim.scenario}`, 25, yPos);
          yPos += 8;
          
          pdf.setFontSize(9);
          pdf.setTextColor(200, 200, 200);
          pdf.text(`Throughput: ${Math.round(sim.performance?.throughput || 0)} req/s`, 30, yPos);
          yPos += 6;
          pdf.text(`Latency: ${Math.round(sim.performance?.latency || 0)}ms`, 30, yPos);
          yPos += 6;
          pdf.text(`Stability: ${Math.round(sim.performance?.stability || 0)}%`, 30, yPos);
          yPos += 10;
          
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
        });
      }
      
      // Comparisons
      if (comparisons?.length > 0) {
        if (yPos > 250) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.setFontSize(16);
        pdf.setTextColor(59, 130, 246);
        pdf.text('Version Comparisons', 20, yPos);
        yPos += 10;
        
        comparisons.slice(0, 5).forEach((comp, idx) => {
          pdf.setFontSize(10);
          pdf.setTextColor(200, 200, 200);
          pdf.text(`• ${comp.category}: ${comp.change}`, 25, yPos);
          yPos += 7;
        });
      }
      
      // Footer
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page ${i} of ${pageCount}`, 20, 285);
        pdf.text('Omni-Present AI Infrastructure', 105, 285, { align: 'center' });
      }
      
      // Save
      pdf.save(`blueprint-report-${Date.now()}.pdf`);
      toast.success('PDF report generated');
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium disabled:opacity-50 transition-all hover:scale-105"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4" />
          Export PDF Report
        </>
      )}
    </button>
  );
}