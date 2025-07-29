import { useState } from 'react';
import { MapComponent } from '../components/MapComponent';
import { Sidebar } from '../components/Sidebar/Sidebar';

export const Root = () => {
  const [visitedCount, setVisitedCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen h-screen bg-gray-50">
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
        <Sidebar visitedCount={visitedCount} visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 relative">
          <MapComponent onVisitedCountChange={setVisitedCount} />
        </div>
      </div>
    </div>
  );
};
