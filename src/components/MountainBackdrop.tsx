import React from 'react';

export function MountainBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
      {/* High-tech Himalayan Mountain Landscape Image */}
      <img
        src="/mountain-bg.png"
        alt="Himalayan Tech Landscape"
        className="w-full h-full object-cover opacity-90"
      />
      
      {/* Dark gradient overlay for smooth contrast with UI elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/80" />
    </div>
  );
}
