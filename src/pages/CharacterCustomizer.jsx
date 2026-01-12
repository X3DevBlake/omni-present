import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Live3DViewer from '../components/3d/Live3DViewer';
import CategoryBrowser from '../components/customization/CategoryBrowser';
import ComponentDetailPanel from '../components/customization/ComponentDetailPanel';
import AvatarBaseSelector from '../components/customization/AvatarBaseSelector';
import CustomizationControls from '../components/customization/CustomizationControls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CharacterCustomizer() {
  const [userEmail, setUserEmail] = useState(null);
  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [componentProperties, setComponentProperties] = useState({});
  const [activeComponent, setActiveComponent] = useState(null);
  const [avatarName, setAvatarName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    base44.auth.me().then(user => setUserEmail(user?.email)).catch(() => {});
  }, []);

  const { data: bases = [] } = useQuery({
    queryKey: ['avatarBases'],
    queryFn: () => base44.entities.AvatarBase.list()
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
    if (!selectedBase || !avatarName) return;
    setSaving(true);
    
    await base44.entities.UserAvatar.create({
      user_email: userEmail,
      avatar_name: avatarName,
      avatar_base_id: selectedBase.id,
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

  const componentTypes = [
    { value: 'hair', label: 'Hair' },
    { value: 'eyes', label: 'Eyes' },
    { value: 'facial_hair', label: 'Facial Hair' },
    { value: 'headwear', label: 'Headwear' },
    { value: 'torso', label: 'Torso' },
    { value: 'legs', label: 'Legs' },
    { value: 'feet', label: 'Feet' },
    { value: 'hands', label: 'Hands' },
    { value: 'weapon', label: 'Weapons' },
    { value: 'accessory', label: 'Accessories' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D1A] via-[#1a1a2e] to-[#0D0D1A] p-6">
      <div className="max-w-[1800px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Palette className="w-10 h-10 text-cyan-400" />
            Character Customizer
          </h1>
          <p className="text-white/60">Create your unique 3D avatar with 1500+ customization options</p>
        </motion.div>

        {!selectedBase ? (
          <div>
            <h2 className="text-white text-xl font-bold mb-4">Choose Your Base Avatar</h2>
            <AvatarBaseSelector 
              bases={bases} 
              selectedBase={selectedBase} 
              onSelectBase={setSelectedBase} 
            />
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <Tabs value={selectedType} onValueChange={setSelectedType}>
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value={null}>All</TabsTrigger>
                  <TabsTrigger value="filter">Filter</TabsTrigger>
                </TabsList>
                
                {selectedType === 'filter' && (
                  <div className="mb-4 space-y-2">
                    {componentTypes.map(type => (
                      <button
                        key={type.value}
                        onClick={() => setSelectedType(type.value)}
                        className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-white text-sm text-left"
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                )}
              </Tabs>
              
              <CategoryBrowser
                components={components}
                onSelectComponent={handleSelectComponent}
                selectedType={selectedType !== 'filter' ? selectedType : null}
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
                avatarName={avatarName}
                setAvatarName={setAvatarName}
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