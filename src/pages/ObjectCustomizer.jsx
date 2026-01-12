import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Palette } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Live3DViewer from '../components/3d/Live3DViewer';
import CategoryBrowser from '../components/customization/CategoryBrowser';
import ComponentDetailPanel from '../components/customization/ComponentDetailPanel';
import CustomizationControls from '../components/customization/CustomizationControls';

export default function ObjectCustomizer() {
  const [userEmail, setUserEmail] = useState(null);
  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [componentProperties, setComponentProperties] = useState({});
  const [activeComponent, setActiveComponent] = useState(null);
  const [objectName, setObjectName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(user => setUserEmail(user?.email)).catch(() => {});
  }, []);

  const { data: bases = [] } = useQuery({
    queryKey: ['objectBases'],
    queryFn: () => base44.entities.ObjectBase.list()
  });

  const { data: components = [] } = useQuery({
    queryKey: ['customComponents'],
    queryFn: () => base44.entities.CustomComponent.list()
  });

  const handleSelectComponent = (comp) => {
    const exists = selectedComponents.find(c => c.id === comp.id);
    if (!exists) {
      setSelectedComponents([...selectedComponents, comp]);
    }
    setActiveComponent(comp);
  };

  const handleUpdateProperty = (property, value) => {
    if (!activeComponent) return;
    setComponentProperties({
      ...componentProperties,
      [activeComponent.id]: {
        ...componentProperties[activeComponent.id],
        [property]: value
      }
    });
  };

  const handleSave = async () => {
    if (!selectedBase || !objectName) return;
    setSaving(true);
    
    await base44.entities.UserObject.create({
      user_email: userEmail,
      object_name: objectName,
      object_base_id: selectedBase.id,
      selected_components: selectedComponents.map(c => c.id),
      component_properties: componentProperties,
      public: isPublic
    });
    
    setSaving(false);
  };

  const handleClear = () => {
    setSelectedComponents([]);
    setComponentProperties({});
    setActiveComponent(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D1A] via-[#1a1a2e] to-[#0D0D1A] p-6">
      <div className="max-w-[1800px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Box className="w-10 h-10 text-purple-400" />
            Object Customizer
          </h1>
          <p className="text-white/60">Customize vehicles, props, and environments</p>
        </motion.div>

        {!selectedBase ? (
          <div>
            <h2 className="text-white text-xl font-bold mb-4">Choose Your Base Object</h2>
            <div className="grid grid-cols-4 gap-4">
              {bases.map(base => (
                <motion.div
                  key={base.id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedBase(base)}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 cursor-pointer hover:border-purple-400/50"
                >
                  <div className="w-full h-32 bg-white/10 rounded flex items-center justify-center mb-2">
                    <Box className="w-12 h-12 text-white/40" />
                  </div>
                  <p className="text-white text-sm font-semibold text-center">{base.name}</p>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <CategoryBrowser
                components={components}
                onSelectComponent={handleSelectComponent}
              />
            </div>

            <div className="col-span-6 h-[800px]">
              <Live3DViewer
                baseModel={selectedBase}
                selectedComponents={selectedComponents}
                componentProperties={componentProperties}
              />
            </div>

            <div className="col-span-3 space-y-4">
              <ComponentDetailPanel
                component={activeComponent}
                properties={componentProperties[activeComponent?.id]}
                onUpdateProperty={handleUpdateProperty}
              />
              
              <CustomizationControls
                onSave={handleSave}
                onClear={handleClear}
                avatarName={objectName}
                setAvatarName={setObjectName}
                isPublic={isPublic}
                setIsPublic={setIsPublic}
                saving={saving}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}