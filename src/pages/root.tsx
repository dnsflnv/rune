/// <reference types="vite/client" />
import { useState } from 'react';
import { MapComponent } from '../components/MapComponent';
import { Sidebar } from '../components/Sidebar';

const menuItems = [{ key: '1', label: 'Runestones' }];

export const Root = () => {
  const [activeItem, setActiveItem] = useState('1');
  const [visitedCount, setVisitedCount] = useState(0);

  return (
    <div className="h-screen bg-gray-50">
      {/* Main layout container */}
      <div className="flex h-full">
        {/* Sidebar */}
        <Sidebar
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          visitedCount={visitedCount}
          menuItems={menuItems}
        />

        {/* Main content area */}
        <div className="flex-1 relative">
          <MapComponent onVisitedCountChange={setVisitedCount} />
        </div>
      </div>
    </div>
  );
};
