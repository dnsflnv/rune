/// <reference types="vite/client" />
import { useState } from 'react';
import { MapComponent } from '../components/MapComponent';
import { Sidebar } from '../components/Sidebar';

const menuItems = [
  { key: '1', label: 'All Runestones' },
  { key: '2', label: 'Visited Runestones'},
];

export const Root = () => {
  const [activeItem, setActiveItem] = useState('1');
  const [runestoneCount, setRunestoneCount] = useState(0);

  return (
    <div className="h-screen bg-gray-50">
      {/* Main layout container */}
      <div className="flex h-full">
        {/* Sidebar */}
        <Sidebar
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          runestoneCount={runestoneCount}
          menuItems={menuItems}
        />

        {/* Main content area */}
        <div className="flex-1 relative">
          <MapComponent onRunestoneCountChange={setRunestoneCount} />
        </div>
      </div>
    </div>
  );
};
