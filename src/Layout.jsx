import React from 'react';
import FloatingNav from './components/omni/FloatingNav';

export default function Layout({ children }) {
  return (
    <>
      <FloatingNav />
      {children}
    </>
  );
}