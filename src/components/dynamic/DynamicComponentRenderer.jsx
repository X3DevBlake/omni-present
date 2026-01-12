import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

/**
 * Dynamic Component Renderer
 * Renders UI components based on configuration data from DynamicUIConfig entity
 */
export default function DynamicComponentRenderer({ config }) {
  if (!config || !config.configuration) {
    return <div className="text-gray-400">No configuration provided</div>;
  }

  const { config_type, configuration } = config;

  switch (config_type) {
    case 'dashboard_config':
      return <DynamicDashboard config={configuration} />;
    
    case 'widget_config':
      return <DynamicWidget config={configuration} />;
    
    case 'form_schema':
      return <DynamicForm config={configuration} />;
    
    case 'layout':
      return <DynamicLayout config={configuration} />;
    
    default:
      return <div className="text-gray-400">Unknown config type: {config_type}</div>;
  }
}

function DynamicDashboard({ config }) {
  return (
    <div className="grid gap-4" style={{ 
      gridTemplateColumns: `repeat(${config.columns || 3}, 1fr)` 
    }}>
      {config.widgets?.map((widget, idx) => (
        <Card key={idx} className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white">{widget.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {widget.type === 'metric' && (
              <div>
                <div className="text-3xl font-bold text-white">{widget.value}</div>
                <p className="text-sm text-gray-400">{widget.label}</p>
              </div>
            )}
            {widget.type === 'chart' && (
              <div className="h-32 bg-white/5 rounded flex items-center justify-center">
                <span className="text-gray-400">Chart: {widget.chart_type}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DynamicWidget({ config }) {
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white">{config.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {config.content_type === 'text' && (
          <p className="text-gray-300">{config.content}</p>
        )}
        {config.content_type === 'progress' && (
          <div>
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>{config.label}</span>
              <span>{config.value}%</span>
            </div>
            <Progress value={config.value} />
          </div>
        )}
        {config.content_type === 'list' && (
          <ul className="space-y-2">
            {config.items?.map((item, idx) => (
              <li key={idx} className="text-gray-300 flex items-center gap-2">
                <Badge variant="outline">{item.label}</Badge>
                <span>{item.value}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function DynamicForm({ config }) {
  const [formData, setFormData] = React.useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    config.onSubmit?.(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {config.fields?.map((field, idx) => (
        <div key={idx}>
          <label className="text-sm text-gray-300 mb-1 block">
            {field.label}
            {field.required && <span className="text-red-400 ml-1">*</span>}
          </label>
          {field.type === 'text' && (
            <Input
              placeholder={field.placeholder}
              required={field.required}
              value={formData[field.name] || ''}
              onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
            />
          )}
          {field.type === 'textarea' && (
            <textarea
              placeholder={field.placeholder}
              required={field.required}
              value={formData[field.name] || ''}
              onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
              className="w-full p-2 bg-gray-800 border-gray-700 text-white rounded-md"
              rows={field.rows || 3}
            />
          )}
        </div>
      ))}
      <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
        {config.submit_label || 'Submit'}
      </Button>
    </form>
  );
}

function DynamicLayout({ config }) {
  return (
    <div className={`flex ${config.direction === 'horizontal' ? 'flex-row' : 'flex-col'} gap-4`}>
      {config.sections?.map((section, idx) => (
        <div key={idx} className={config.section_class || 'flex-1'}>
          <h3 className="text-white font-semibold mb-2">{section.title}</h3>
          <div className="text-gray-300">{section.content}</div>
        </div>
      ))}
    </div>
  );
}