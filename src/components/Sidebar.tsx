interface MenuItem {
  key: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  activeItem: string;
  setActiveItem: (key: string) => void;
  runestoneCount: number;
  menuItems: MenuItem[];
}

export const Sidebar = ({ activeItem, setActiveItem, runestoneCount, menuItems }: SidebarProps) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary">Runestone Safari</h1>
        <p className="text-sm text-gray-600 mt-1">Explore Swedish heritage</p>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1">
        <ul className="py-2">
          {menuItems.map((item) => (
            <li key={item.key}>
              <button
                onClick={() => setActiveItem(item.key)}
                className={`w-full text-left sidebar-item flex items-center gap-3 ${
                  activeItem === item.key ? 'active' : ''
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Runestone Count */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-sm text-gray-600 text-center">
          <span className="font-medium text-primary">{runestoneCount}</span> visible runestones
        </div>
      </div>
      
      {/* Map Legend */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs font-medium text-gray-700 mb-3">Map Legend:</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-[#51bbd6]"></div>
            <span className="text-gray-600">&lt; 100 stones</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-[#f1f075]"></div>
            <span className="text-gray-600">100-750 stones</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-[#f28cb1]"></div>
            <span className="text-gray-600">&gt; 750 stones</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white"></div>
            <span className="text-gray-600">Individual stone</span>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          <p>Powered by SQLite, Vite, TypeScript, React, Maplibre, and Tailwind</p>
          <p className="mt-1">© 2025 Rune Explorer</p>
        </div>
      </div>
    </div>
  );
}; 