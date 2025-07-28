import { Runestone } from '../types';
import { supabaseRunestones } from '../services/supabaseRunestones';
import { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { Link } from 'react-router-dom';

interface RunestoneModalProps {
  runestone: Runestone | null;
  isOpen: boolean;
  onClose: () => void;
  onVisitedStatusChange?: () => void;
}

export const RunestoneModal = ({ runestone, isOpen, onClose, onVisitedStatusChange }: RunestoneModalProps) => {
  const [isMarkingVisited, setIsMarkingVisited] = useState(false);
  const [visitedError, setVisitedError] = useState<string | null>(null);
  const [isVisited, setIsVisited] = useState(false);
  const [isCheckingVisited, setIsCheckingVisited] = useState(false);
  const [authUser, setAuthUser] = useState(() => authService.getUser());

  const checkVisitedStatus = async () => {
    if (!runestone) return;
    setIsCheckingVisited(true);
    try {
      const visited = await supabaseRunestones.isVisited(runestone.id);
      setIsVisited(visited);
    } catch (error) {
      console.error('Error checking visited status:', error);
      setVisitedError('Failed to check visited status.');
    } finally {
      setIsCheckingVisited(false);
    }
  };

  useEffect(() => {
    if (isOpen && runestone) {
      checkVisitedStatus();
    }
  }, [isOpen, runestone, checkVisitedStatus]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newUser = authService.getUser();
      setAuthUser((prev) => (prev !== newUser ? newUser : prev));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // If modal is not open or no runestone, don't render anything
  if (!isOpen || !runestone) {
    return null;
  }

  const handleMarkAsVisited = async () => {
    setIsMarkingVisited(true);
    setVisitedError(null);

    try {
      if (isVisited) {
        // Unmark as visited
        await supabaseRunestones.deleteVisited(runestone.id);
        setIsVisited(false);
        console.log('Runestone unmarked as visited!');
      } else {
        // Mark as visited
        await supabaseRunestones.markAsVisited(runestone.id);
        setIsVisited(true);
        console.log('Runestone marked as visited!');
      }

      // Notify parent component to refresh map data
      if (onVisitedStatusChange) {
        onVisitedStatusChange();
      }
    } catch (error) {
      console.error('Error updating visited status:', error);
      setVisitedError('Failed to update visited status. Please try again.');
    } finally {
      setIsMarkingVisited(false);
    }
  };

  return (
    <>
      {/* Backdrop - dark overlay behind the modal */}
      <div className="fixed inset-0 bg-black/50 z-1000" onClick={onClose} />

      {/* Modal container */}
      <div className="fixed inset-0 z-1001 flex items-center justify-center p-4">
        {/* Modal content */}
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-800">{runestone.signature_text}</h2>
              <Link
                to={`/stones/${runestone.slug}`}
                className="text-primary hover:text-primary/90 text-sm font-medium"
                onClick={onClose}
              >
                View Full Page
              </Link>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-4">
              {/* Location */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Location</h3>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-800">{runestone.found_location}</p>
                  <p className="text-sm text-gray-600">{runestone.parish}</p>
                  {runestone.district && <p className="text-sm text-gray-600">{runestone.district}</p>}
                  {runestone.municipality && <p className="text-sm text-gray-600">{runestone.municipality}</p>}
                  {runestone.current_location && (
                    <p className="text-sm text-gray-600">Current: {runestone.current_location}</p>
                  )}
                  {runestone.latitude && runestone.longitude && (
                    <p className="text-sm text-gray-600">
                      {runestone.latitude}, {runestone.longitude}
                    </p>
                  )}
                </div>
              </div>

              {/* Basic Details */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Details</h3>
                <div className="bg-gray-50 p-3 rounded space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Material:</span> {runestone.material || 'Unknown'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Dating:</span> {runestone.dating || 'Unknown'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Type:</span> {runestone.rune_type || 'Unknown'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Style:</span> {runestone.material_type || 'Unknown'}
                  </p>
                  {runestone.carver && (
                    <p className="text-sm">
                      <span className="font-medium">Carver:</span> {runestone.carver}
                    </p>
                  )}
                  {runestone.style && (
                    <p className="text-sm">
                      <span className="font-medium">Style:</span> {runestone.style}
                    </p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Status</h3>
                <div className="bg-gray-50 p-3 rounded space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Lost:</span> {runestone.lost ? 'Yes' : 'No'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Ornamental:</span> {runestone.ornamental ? 'Yes' : 'No'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Recent:</span> {runestone.recent ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              {/* English Translation */}
              {runestone.english_translation && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">English Translation</h3>
                  <div className="bg-amber-50 p-3 rounded border-l-4 border-amber-400">
                    <p className="text-gray-800 text-sm leading-relaxed">{runestone.english_translation}</p>
                  </div>
                </div>
              )}

              {/* Swedish Translation */}
              {runestone.swedish_translation && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Swedish Translation</h3>
                  <div className="bg-amber-50 p-3 rounded border-l-4 border-amber-400">
                    <p className="text-gray-800 text-sm leading-relaxed">{runestone.swedish_translation}</p>
                  </div>
                </div>
              )}

              {/* Norse Text */}
              {runestone.norse_text && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Norse Text</h3>
                  <div className="bg-amber-50 p-3 rounded border-l-4 border-amber-400">
                    <p className="text-gray-800 text-sm leading-relaxed italic font-medium">{runestone.norse_text}</p>
                  </div>
                </div>
              )}

              {/* Transliteration */}
              {runestone.transliteration && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Transliteration</h3>
                  <div className="bg-amber-50 p-3 rounded border-l-4 border-amber-400">
                    <p className="text-gray-800 text-sm leading-relaxed font-mono">{runestone.transliteration}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {authUser && visitedError && (
            <div className="px-4 pb-2">
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{visitedError}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center p-4 border-t border-gray-200">
            {/* Mark as Visited Button - only show if user is logged in */}
            {authUser && (
              <button
                onClick={handleMarkAsVisited}
                disabled={isMarkingVisited || isCheckingVisited}
                className={`px-4 py-2 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                  isVisited ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isMarkingVisited ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>{isVisited ? 'Unmarking...' : 'Marking...'}</span>
                  </>
                ) : isCheckingVisited ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <span>{isVisited ? 'Unmark as Visited' : 'Mark as Visited'}</span>
                  </>
                )}
              </button>
            )}

            <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
