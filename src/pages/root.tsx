/// <reference types="vite/client" />
import { useState } from 'react';
import { MapComponent } from '../components/MapComponent';
import { Sidebar } from '../components/Sidebar/Sidebar';

const menuItems = [{ key: '1', label: 'Runestones' }];

export const Root = () => {
  const [activeItem, setActiveItem] = useState('1');
  const [visitedCount, setVisitedCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Hide sidebar by default on mobile, show on desktop
  // Sidebar is controlled by sidebarOpen on mobile

  return (
    <div className="min-h-screen h-screen bg-gray-50">
      {/* Hamburger button for mobile */}
      <button
        className="absolute top-4 left-4 z-30 md:hidden bg-white border border-gray-300 rounded p-2 shadow"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="flex h-full">
        {/* Sidebar with overlay for mobile */}
        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
        )}
        <Sidebar
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          visitedCount={visitedCount}
          menuItems={menuItems}
          visible={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        {/* Main content area */}
        <div className="flex-1 relative">
          <MapComponent onVisitedCountChange={setVisitedCount} />
        </div>
      </div>
    </div>
  );
};
