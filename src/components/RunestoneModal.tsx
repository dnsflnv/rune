import { Runestone } from '../types';
import { supabaseRunestones } from '../services/supabaseRunestones';
import { useState } from 'react';

interface RunestoneModalProps {
  runestone: Runestone | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RunestoneModal = ({ runestone, isOpen, onClose }: RunestoneModalProps) => {
  const [isMarkingVisited, setIsMarkingVisited] = useState(false);
  const [visitedError, setVisitedError] = useState<string | null>(null);

  // If modal is not open or no runestone, don't render anything
  if (!isOpen || !runestone) {
    return null;
  }

  const handleMarkAsVisited = async () => {
    setIsMarkingVisited(true);
    setVisitedError(null);
    
    try {
      await supabaseRunestones.markAsVisited(runestone.id);
      // You could add a success message or visual feedback here
      console.log('Runestone marked as visited!');
    } catch (error) {
      console.error('Error marking runestone as visited:', error);
      setVisitedError('Failed to mark as visited. Please try again.');
    } finally {
      setIsMarkingVisited(false);
    }
  };

  return (
    <>
      {/* Backdrop - dark overlay behind the modal */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[1000]"
        onClick={onClose}
      />
      
      {/* Modal container */}
      <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
        {/* Modal content */}
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">
              {runestone.signature_text}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
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
                  {runestone.district && (
                    <p className="text-sm text-gray-600">{runestone.district}</p>
                  )}
                  {runestone.municipality && (
                    <p className="text-sm text-gray-600">{runestone.municipality}</p>
                  )}
                  {runestone.current_location && (
                    <p className="text-sm text-gray-600">Current: {runestone.current_location}</p>
                  )}
                </div>
              </div>

              {/* Basic Details */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Details</h3>
                <div className="bg-gray-50 p-3 rounded space-y-1">
                  <p className="text-sm"><span className="font-medium">Material:</span> {runestone.material || "Unknown"}</p>
                  <p className="text-sm"><span className="font-medium">Dating:</span> {runestone.dating || "Unknown"}</p>
                  <p className="text-sm"><span className="font-medium">Type:</span> {runestone.rune_type || "Unknown"}</p>
                  <p className="text-sm"><span className="font-medium">Style:</span> {runestone.material_type || "Unknown"}</p>
                  {runestone.carver && (
                    <p className="text-sm"><span className="font-medium">Carver:</span> {runestone.carver}</p>
                  )}
                  {runestone.style && (
                    <p className="text-sm"><span className="font-medium">Style:</span> {runestone.style}</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Status</h3>
                <div className="bg-gray-50 p-3 rounded space-y-1">
                  <p className="text-sm"><span className="font-medium">Lost:</span> {runestone.lost ? "Yes" : "No"}</p>
                  <p className="text-sm"><span className="font-medium">Ornamental:</span> {runestone.ornamental ? "Yes" : "No"}</p>
                  <p className="text-sm"><span className="font-medium">Recent:</span> {runestone.recent ? "Yes" : "No"}</p>
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
          {visitedError && (
            <div className="px-4 pb-2">
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{visitedError}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center p-4 border-t border-gray-200">
            <button
              onClick={handleMarkAsVisited}
              disabled={isMarkingVisited}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isMarkingVisited ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Marking...</span>
                </>
              ) : (
                <>
                  <span>Mark as Visited</span>
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}; 