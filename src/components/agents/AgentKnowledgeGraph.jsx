import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, Filter } from 'lucide-react';

export default function AgentKnowledgeGraph({ knowledgeData = [], agentName = "Agent" }) {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filter, setFilter] = useState('all');

  const categoryColors = {
    object: '#00f5ff',
    location: '#a855f7',
    concept: '#ec4899',
    skill: '#10b981',
    person: '#f59e0b',
    event: '#3b82f6'
  };

  useEffect(() => {
    // Build graph structure from knowledge data
    const graphNodes = knowledgeData.map((item, index) => ({
      id: item.id,
      label: item.object_name,
      category: item.category || 'object',
      x: Math.cos((index / knowledgeData.length) * 2 * Math.PI) * 200 + 300,
      y: Math.sin((index / knowledgeData.length) * 2 * Math.PI) * 200 + 250,
      data: item
    }));

    // Create edges based on related tags or sources
    const graphEdges = [];
    knowledgeData.forEach((item1, i) => {
      if (!item1 || !item1.id) return;
      knowledgeData.forEach((item2, j) => {
        if (i < j && item2 && item2.id) {
          const sharedTags = (item1.tags || []).filter(tag => (item2.tags || []).includes(tag)) || [];
          const sameSource = item1.source_url && item2.source_url && item1.source_url === item2.source_url;
          const sameLocation = item1.learned_at_location && item2.learned_at_location &&
            item1.learned_at_location.lat && item2.learned_at_location.lat &&
            Math.abs(item1.learned_at_location.lat - item2.learned_at_location.lat) < 0.01;

          if (sharedTags.length > 0 || sameSource || sameLocation) {
            graphEdges.push({
              from: item1.id,
              to: item2.id,
              strength: sharedTags.length + (sameSource ? 2 : 0) + (sameLocation ? 1 : 0),
              type: sameSource ? 'source' : sameLocation ? 'location' : 'tag'
            });
          }
        }
      });
    });

    setNodes(graphNodes);
    setEdges(graphEdges);
  }, [knowledgeData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw edges
    edges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      if (!fromNode || !toNode) return;

      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      ctx.strokeStyle = edge.type === 'source' ? 'rgba(168, 85, 247, 0.3)' : 
                        edge.type === 'location' ? 'rgba(59, 130, 246, 0.3)' : 
                        'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = Math.max(1, edge.strength);
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(node => {
      if (filter !== 'all' && node.category !== filter) return;

      ctx.beginPath();
      ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = categoryColors[node.category] || '#00f5ff';
      ctx.fill();
      
      if (selectedNode?.id === node.id) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label.substring(0, 15), node.x, node.y + 35);
    });

    ctx.restore();
  }, [nodes, edges, scale, offset, selectedNode, filter]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;

    const clickedNode = nodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < 20;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode);
      setDragging(clickedNode);
    } else {
      setDragging({ isPanning: true, startX: e.clientX, startY: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    if (dragging.isPanning) {
      setOffset({
        x: offset.x + e.clientX - dragging.startX,
        y: offset.y + e.clientY - dragging.startY
      });
      setDragging({ ...dragging, startX: e.clientX, startY: e.clientY });
    } else {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const newX = (e.clientX - rect.left - offset.x) / scale;
      const newY = (e.clientY - rect.top - offset.y) / scale;

      setNodes(nodes.map(n => 
        n.id === dragging.id ? { ...n, x: newX, y: newY } : n
      ));
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-xl">Knowledge Graph</h3>
          <p className="text-white/60 text-sm">{agentName}'s Learning Network</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="all">All Categories</option>
            <option value="object">Objects</option>
            <option value="location">Locations</option>
            <option value="concept">Concepts</option>
            <option value="skill">Skills</option>
            <option value="person">People</option>
            <option value="event">Events</option>
          </select>

          <button
            onClick={() => setScale(Math.max(0.5, scale - 0.2))}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
          >
            <ZoomOut className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => setScale(Math.min(2, scale + 0.2))}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
          >
            <ZoomIn className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
          >
            <Maximize2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-[500px] bg-black/20 rounded-xl cursor-move"
        />

        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl p-4 max-w-xs"
          >
            <h4 className="text-white font-bold mb-2">{selectedNode.label}</h4>
            <div className="text-white/60 text-sm space-y-2">
              <div>
                <span className="text-white/40">Category:</span>{' '}
                <span className="capitalize">{selectedNode.category}</span>
              </div>
              <div>
                <span className="text-white/40">Description:</span>{' '}
                {selectedNode.data.description}
              </div>
              {selectedNode.data.confidence_score && (
                <div>
                  <span className="text-white/40">Confidence:</span>{' '}
                  {selectedNode.data.confidence_score}%
                </div>
              )}
              {selectedNode.data.tags && selectedNode.data.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedNode.data.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
        {Object.entries(categoryColors).map(([category, color]) => (
          <div key={category} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-white/60 text-sm capitalize">{category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}