import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, X, Plus, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DynamicWidgetGrid({ widgets = [], onReorder, onRemove, onAdd, onConfigure }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onReorder(items);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">Your Widgets</h3>
        <Button
          onClick={onAdd}
          size="sm"
          className="bg-gradient-to-r from-cyan-600 to-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Widget
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="widgets">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {widgets.map((widget, index) => (
                <Draggable key={widget.id} draggableId={widget.id} index={index}>
                  {(provided, snapshot) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={snapshot.isDragging ? 'z-50' : ''}
                    >
                      <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="w-4 h-4 text-white/40 cursor-grab" />
                              </div>
                              <CardTitle className="text-white text-sm">
                                {widget.widget_type.replace(/_/g, ' ').toUpperCase()}
                              </CardTitle>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-white/40 hover:text-white"
                                onClick={() => onConfigure(widget)}
                              >
                                <Settings className="w-3 h-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-white/40 hover:text-red-400"
                                onClick={() => onRemove(widget.id)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-32 bg-black/20 rounded-lg flex items-center justify-center text-white/40">
                            Widget Content
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}