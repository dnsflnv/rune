import { observer } from 'mobx-react-lite';
import { AuthWidget } from './widgets/AuthWidget';
import { SearchWidget } from './widgets/SearchWidget';
import { authStore } from '../../stores/authStore';
import { Link } from 'react-router';

// Cluster styling constants (matching MapComponent)
const CLUSTER_COLORS = {
  SMALL: '#8B4513', // Dark brown for clusters with < 100 points
  MEDIUM: '#A0522D', // Medium brown for clusters with 100-750 points
  LARGE: '#CD853F', // Light brown for clusters with > 750 points
} as const;

interface SidebarProps {
  visitedCount: number;
  visible?: boolean;
  onClose?: () => void;
}

export const Sidebar = observer(({ visitedCount, visible = false, onClose }: SidebarProps) => {
  // Helper to detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  return (
    <>
      {/* Mobile overlay */}
      {visible && isMobile && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`
          fixed z-50 top-0 left-0 h-screen min-h-0 w-64 bg-white border-r border-gray-200 flex flex-col
          transition-transform duration-200 ease-in-out
          ${visible ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0
        `}
        aria-label="Sidebar"
      >
        {/* Close button for mobile */}
        <button
          className="absolute top-4 right-4 z-60 md:hidden bg-white border border-gray-300 rounded p-1 shadow"
          style={{ display: visible ? 'block' : 'none' }}
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {/* All content except footer in a flex-1 column */}
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-primary">Runestone Safari</h1>
            <p className="text-sm text-gray-600 mt-1">Explore Swedish runestones</p>
          </div>
          {/* Search Widget */}
          <SearchWidget />
          {/* Visited Runestone Count - only show if user is logged in */}
          {authStore.user && (
            <div className="p-4 border-t border-gray-200">
              <div className="text-sm text-gray-600 text-center">
                <Link to="/profile" className="hover:underline">
                  <span className="font-medium text-primary">{visitedCount}</span> visited runestones
                </Link>
              </div>
            </div>
          )}
          {/* Map Legend */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs font-medium text-gray-700 mb-3">Map Legend:</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CLUSTER_COLORS.SMALL }}></div>
                <span className="text-gray-600">&lt; 100 stones</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CLUSTER_COLORS.MEDIUM }}></div>
                <span className="text-gray-600">100-750 stones</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CLUSTER_COLORS.LARGE }}></div>
                <span className="text-gray-600">&gt; 750 stones</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white"></div>
                <span className="text-gray-600">Unvisited stone</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
                <span className="text-gray-600">Visited stone</span>
              </div>
            </div>
          </div>
          {/* Auth Widget */}
          <AuthWidget />
        </div>
        {/* Footer (always at the bottom) */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            <a href="/about" className="underline">
              About
            </a>
            {' • '}
            <a href="/privacy" className="underline">
              Privacy Policy
            </a>
            {' • '}
            <a href="/license" className="underline">
              License
            </a>
            {' • '}
            <a href="https://github.com/dnsflnv/rune" className="underline">
              GitHub
            </a>
            <p className="mt-1">© 2025 Denis Filonov</p>
          </div>
        </div>
      </aside>
    </>
  );
});
