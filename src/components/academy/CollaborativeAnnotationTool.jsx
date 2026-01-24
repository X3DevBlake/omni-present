import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Type, Highlighter, Eraser, Users, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CollaborativeAnnotationTool({ sessionId, onAnnotationAdded }) {
  const [annotations, setAnnotations] = useState([]);
  const [annotationText, setAnnotationText] = useState('');
  const [annotationType, setAnnotationType] = useState('note');
  const [brushColor, setBrushColor] = useState('#3b82f6');
  const [isDrawing, setIsDrawing] = useState(false);

  // Real-time subscription to annotations
  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = base44.entities.Annotation.subscribe((event) => {
      if (event.type === 'create' && event.data.entity_id === sessionId) {
        setAnnotations(prev => [...prev, event.data]);
        if (onAnnotationAdded) {
          onAnnotationAdded(event.data);
        }
      }
    });

    return unsubscribe;
  }, [sessionId, onAnnotationAdded]);

  const addAnnotation = async () => {
    if (!annotationText.trim()) return;

    const newAnnotation = {
      annotation_id: `ann_${Date.now()}`,
      entity_type: 'holographic_session',
      entity_id: sessionId,
      annotation_content: annotationText,
      annotation_type: annotationType,
      spatial_position: { x: 0, y: 2, z: -7 },
      metadata: {
        color: brushColor,
        timestamp: new Date().toISOString()
      }
    };

    try {
      await base44.entities.Annotation.create(newAnnotation);
      setAnnotationText('');
    } catch (error) {
      console.error('Failed to create annotation:', error);
      // Fallback to local state
      setAnnotations([...annotations, newAnnotation]);
    }
  };

  const annotationTypes = [
    { id: 'note', label: 'Note', icon: Type },
    { id: 'highlight', label: 'Highlight', icon: Highlighter },
    { id: 'sketch', label: 'Sketch', icon: Pencil }
  ];

  const colors = [
    { hex: '#3b82f6', name: 'Blue' },
    { hex: '#10b981', name: 'Green' },
    { hex: '#ef4444', name: 'Red' },
    { hex: '#fbbf24', name: 'Yellow' },
    { hex: '#8b5cf6', name: 'Purple' },
    { hex: '#ec4899', name: 'Pink' }
  ];

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          Collaborative Annotations
          <Badge className="bg-green-500 ml-auto">{annotations.length} live</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Annotation Type Selector */}
        <div className="flex gap-2">
          {annotationTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Button
                key={type.id}
                size="sm"
                onClick={() => setAnnotationType(type.id)}
                className={`flex-1 ${
                  annotationType === type.id 
                    ? 'bg-blue-600' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <Icon className="w-3 h-3 mr-1" />
                {type.label}
              </Button>
            );
          })}
        </div>

        {/* Color Picker */}
        <div className="flex gap-2 items-center">
          <span className="text-gray-400 text-xs">Color:</span>
          {colors.map((color) => (
            <button
              key={color.hex}
              onClick={() => setBrushColor(color.hex)}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                brushColor === color.hex ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>

        {/* Drawing Canvas (for sketch mode) */}
        {annotationType === 'sketch' && (
          <div 
            className="bg-black/60 rounded-lg h-48 border border-white/20 cursor-crosshair relative"
            onMouseDown={() => setIsDrawing(true)}
            onMouseUp={() => setIsDrawing(false)}
            onMouseLeave={() => setIsDrawing(false)}
          >
            {isDrawing && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                Drawing...
              </div>
            )}
          </div>
        )}

        {/* Text Input */}
        <div className="flex gap-2">
          <Input
            placeholder={`Add ${annotationType}...`}
            value={annotationText}
            onChange={(e) => setAnnotationText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addAnnotation()}
            className="bg-white/10 border-white/20 text-white"
            style={{ borderLeftColor: brushColor, borderLeftWidth: '3px' }}
          />
          <Button
            size="sm"
            onClick={addAnnotation}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Live Annotations Feed */}
        <div className="bg-black/40 rounded-lg p-3 max-h-48 overflow-y-auto">
          <AnimatePresence>
            {annotations.slice(-10).reverse().map((ann, idx) => (
              <motion.div
                key={ann.annotation_id || idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="mb-2 pb-2 border-b border-white/5 last:border-0"
                style={{ borderLeftColor: ann.metadata?.color || '#3b82f6', borderLeftWidth: '3px', paddingLeft: '8px' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-blue-500/20 text-blue-300 text-xs">
                    {ann.annotation_type}
                  </Badge>
                  <span className="text-gray-500 text-xs">
                    {ann.metadata?.timestamp ? new Date(ann.metadata.timestamp).toLocaleTimeString() : 'now'}
                  </span>
                </div>
                <p className="text-gray-300 text-sm">{ann.annotation_content}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}