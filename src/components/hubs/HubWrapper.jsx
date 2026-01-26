import React from 'react';
import GenericHub from '../../pages/GenericHub';

export default function HubWrapper({ name, category, override3D }) {
  // This wrapper allows us to create specific page files that reuse the 
  // GenericHub logic but can pass specific props or overrides.
  // It ensures that "pages/SomeSpecificHub.js" exists and renders correctly.
  return (
    <GenericHub 
      forcedName={name} 
      forcedCategory={category} 
      visualizerOverride={override3D}
    />
  );
}