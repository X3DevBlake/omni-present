import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export default function AgentDecisionVisualizer({ selectedAgent }) {
  const canvasRef = useRef(null);
  const [decisionTree, setDecisionTree] = useState(null);

  useEffect(() => {
    drawDecisionTree();
  }, [selectedAgent]);

  const sampleTree = {
    name: 'Market Analysis',
    value: 0.82,
    children: [
      {
        name: 'Price Action',
        value: 0.75,
        children: [
          { name: 'Uptrend', value: 0.85, children: [] },
          { name: 'Downtrend', value: 0.65, children: [] }
        ]
      },
      {
        name: 'Volume Analysis',
        value: 0.78,
        children: [
          { name: 'High Volume', value: 0.88, children: [] },
          { name: 'Low Volume', value: 0.68, children: [] }
        ]
      }
    ]
  };

  const drawDecisionTree = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawNode = (node, x, y, offsetX) => {
      const nodeRadius = 30;
      const nodeColor = `hsl(${node.value * 120}, 70%, 50%)`;

      // Draw connections to children
      if (node.children && node.children.length > 0) {
        const childOffsetX = offsetX / 2;
        node.children.forEach((child, i) => {
          const childX = x + (i - (node.children.length - 1) / 2) * childOffsetX;
          const childY = y + 100;

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(childX, childY);
          ctx.stroke();

          drawNode(child, childX, childY, childOffsetX);
        });
      }

      // Draw node
      ctx.fillStyle = nodeColor;
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
      ctx.fill();

      // Node label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(node.value * 100) + '%', x, y);

      // Node name below
      ctx.font = '10px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(node.name, x, y + nodeRadius + 20);
    };

    drawNode(sampleTree, canvas.width / 2, 50, canvas.width / 3);
  };

  return (
    <div className="space-y-6">
      {/* Visualization */}
      <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-bold">Decision Tree</h3>
        </div>
        <canvas
          ref={canvasRef}
          className="w-full h-[500px] bg-black/20 rounded-xl"
        />
      </div>

      {/* Decision Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: 'Confidence', value: 82, color: 'cyan' },
          { label: 'Accuracy', value: 94, color: 'green' },
          { label: 'Execution Speed', value: 87, color: 'purple' }
        ].map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-black/40 backdrop-blur-xl border border-${metric.color}-500/30 rounded-lg p-4`}
          >
            <div className="text-white/60 text-sm mb-2">{metric.label}</div>
            <div className="text-3xl font-bold text-white mb-2">{metric.value}%</div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metric.value}%` }}
                transition={{ duration: 1.5 }}
                className={`h-full bg-gradient-to-r from-${metric.color}-500 to-${metric.color}-400`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Decisions */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4">Recent Decisions</h3>
        <div className="space-y-2">
          {[
            { decision: 'Execute Long Trade', confidence: 89, timestamp: '2m ago' },
            { decision: 'Hold Position', confidence: 76, timestamp: '5m ago' },
            { decision: 'Request Market Data', confidence: 92, timestamp: '8m ago' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
              <div>
                <p className="text-white text-sm font-semibold">{item.decision}</p>
                <p className="text-white/40 text-xs">{item.timestamp}</p>
              </div>
              <div className="text-right">
                <div className="text-white font-bold text-sm">{item.confidence}%</div>
                <div className="text-white/40 text-xs">Confidence</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}