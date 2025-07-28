import { Runestone } from '../types';
import { supabaseRunestones } from '../services/supabaseRunestones';
import { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { Link } from 'react-router-dom';
import { PageHeader } from './PageHeader';

interface RunestonePageProps {
  runestone: Runestone | null;
  onVisitedStatusChange?: () => void;
}

export const RunestonePage = ({ runestone, onVisitedStatusChange }: RunestonePageProps) => {
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
    if (runestone) {
      checkVisitedStatus();
    }
  }, [runestone]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newUser = authService.getUser();
      setAuthUser((prev) => (prev !== newUser ? newUser : prev));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // If no runestone, show loading or error
  if (!runestone) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading runestone...</p>
        </div>
      </div>
    );
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
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={runestone.signature_text} />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Location */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3 text-lg">Location</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 font-medium">{runestone.found_location}</p>
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

              {/* Visit Status */}
              {authUser && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 text-lg">Visit Status</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {isCheckingVisited ? (
                          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        ) : (
                          <div
                            className={`w-5 h-5 rounded-full border-2 ${
                              isVisited ? 'bg-green-500 border-green-500' : 'bg-gray-300 border-gray-300'
                            }`}
                          ></div>
                        )}
                        <span className="text-sm font-medium text-gray-700">
                          {isVisited ? 'Visited' : 'Not visited'}
                        </span>
                      </div>
                      <button
                        onClick={handleMarkAsVisited}
                        disabled={isMarkingVisited || isCheckingVisited}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          isVisited
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isMarkingVisited ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                            <span>Updating...</span>
                          </div>
                        ) : (
                          <span>{isVisited ? 'Mark as not visited' : 'Mark as visited'}</span>
                        )}
                      </button>
                    </div>
                    {visitedError && <p className="text-red-600 text-sm mt-2">{visitedError}</p>}
                  </div>
                </div>
              )}

              {/* Basic Details */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3 text-lg">Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
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
                <h3 className="font-semibold text-gray-700 mb-3 text-lg">Status</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
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

              {/* Text Content */}
              {runestone.norse_text && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 text-lg">Norse Text</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800 font-mono text-sm">{runestone.norse_text}</p>
                  </div>
                </div>
              )}

              {runestone.transliteration && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 text-lg">Transliteration</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800 font-mono text-sm">{runestone.transliteration}</p>
                  </div>
                </div>
              )}

              {runestone.swedish_translation && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 text-lg">Swedish Translation</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800">{runestone.swedish_translation}</p>
                  </div>
                </div>
              )}

              {runestone.english_translation && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 text-lg">English Translation</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800">{runestone.english_translation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
