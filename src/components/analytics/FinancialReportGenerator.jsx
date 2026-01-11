import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, TrendingUp, Calendar, Zap, Share2 } from 'lucide-react';

export default function FinancialReportGenerator() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  const reports = [
    {
      id: 1,
      title: 'December 2025 Portfolio Report',
      type: 'monthly',
      date: 'Dec 31, 2025',
      status: 'completed',
      sections: [
        'Executive Summary',
        'Portfolio Performance (+8.3%)',
        'Asset Allocation',
        'Market Context',
        'Recommendations',
      ],
      metrics: {
        return: '+8.3%',
        benchmark: 'S&P 500: +6.2%',
        volatility: '12.4%',
      },
    },
    {
      id: 2,
      title: '2025 Year-End Financial Health Assessment',
      type: 'annual',
      date: 'Dec 31, 2025',
      status: 'completed',
      sections: [
        'Financial Health Score: 82/100',
        'Goal Progress',
        'Income & Spending',
        'Savings Growth',
        'Debt Reduction',
        'Tax Planning',
      ],
      metrics: {
        savings: '$24,500',
        investmentGrowth: '+$18,320',
        goalsOnTrack: '5/7',
      },
    },
    {
      id: 3,
      title: 'Goal Achievement Projections (2026)',
      type: 'projection',
      date: 'Generated Jan 11, 2026',
      status: 'completed',
      sections: [
        'Retirement Goal (87% likely)',
        'Home Down Payment (94% likely)',
        'Emergency Fund (100% complete)',
        'Investment Portfolio (92% likely)',
        'Education Savings (78% likely)',
      ],
      metrics: {
        avgProbability: '90%',
        onTrackGoals: '4/5',
        adjustmentNeeded: '1/5',
      },
    },
  ];

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    // Simulate report generation
    setTimeout(() => {
      setGeneratingReport(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-lg p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-400" />
              Financial Reports
            </h3>
            <p className="text-white/60 text-sm mt-1">AI-generated monthly, annual & projection reports with Gemini & Google Docs integration</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-400 rounded-lg text-purple-300 hover:bg-purple-500/30 disabled:opacity-50 transition-all"
          >
            {generatingReport ? (
              <>
                <Zap className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate New Report
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Reports List */}
      <div className="grid grid-cols-1 gap-4">
        {reports.map((report) => (
          <motion.div
            key={report.id}
            whileHover={{ y: -2 }}
            onClick={() => setSelectedReport(report)}
            className="bg-white/5 border border-white/10 rounded-lg p-5 hover:border-white/30 cursor-pointer transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">{report.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-white/60 text-sm flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {report.date}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    report.status === 'completed'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {report.status}
                  </span>
                </div>
              </div>
              <span className="text-2xl">
                {report.type === 'monthly' && '📊'}
                {report.type === 'annual' && '🏆'}
                {report.type === 'projection' && '🎯'}
              </span>
            </div>

            <div className="space-y-3">
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(report.metrics).map(([key, value]) => (
                  <div key={key} className="bg-white/5 rounded p-2 text-center">
                    <p className="text-white/60 text-xs capitalize">{key}</p>
                    <p className="text-white font-bold text-sm">{value}</p>
                  </div>
                ))}
              </div>

              {/* Sections Preview */}
              <div>
                <p className="text-white/60 text-xs mb-2">Key Sections</p>
                <div className="flex flex-wrap gap-1">
                  {report.sections.slice(0, 3).map((section, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-white/10 rounded text-white/70 text-xs">
                      {section}
                    </span>
                  ))}
                  {report.sections.length > 3 && (
                    <span className="px-2 py-0.5 text-white/70 text-xs">+{report.sections.length - 3}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-white/10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded text-white/80 hover:border-white/30 text-sm transition-all flex items-center justify-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  View
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded text-white/80 hover:border-white/30 text-sm transition-all flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Export
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded text-white/80 hover:border-white/30 text-sm transition-all flex items-center justify-center gap-1"
                >
                  <Share2 className="w-3 h-3" />
                  Share
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Report Details */}
      {selectedReport && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-400/20 rounded-lg p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-lg">{selectedReport.title}</h3>
              <p className="text-white/60 text-sm mt-1">{selectedReport.date}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setSelectedReport(null)}
              className="text-white/60 hover:text-white"
            >
              ✕
            </motion.button>
          </div>

          <div className="space-y-4">
            {/* Report Sections */}
            <div>
              <p className="text-white/60 text-sm mb-2">Report Sections</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedReport.sections.map((section, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-2 p-2 bg-white/5 rounded border border-white/10"
                  >
                    <span className="text-cyan-400">✓</span>
                    <span className="text-white/80 text-sm">{section}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div>
              <p className="text-white/60 text-sm mb-2">Export & Share Options</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {[
                  { icon: '📄', label: 'PDF', desc: 'Download as PDF' },
                  { icon: '📑', label: 'Google Docs', desc: 'Edit in Google Docs' },
                  { icon: '📊', label: 'Excel', desc: 'Data in spreadsheet' },
                ].map((option, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ y: -2 }}
                    className="p-3 bg-white/5 border border-white/10 rounded hover:border-white/30 transition-all"
                  >
                    <p className="text-2xl mb-1">{option.icon}</p>
                    <p className="text-white font-semibold text-sm">{option.label}</p>
                    <p className="text-white/60 text-xs mt-1">{option.desc}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Email Report */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="w-full px-4 py-2 bg-purple-500/20 border border-purple-400 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-all"
            >
              Email Report
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}