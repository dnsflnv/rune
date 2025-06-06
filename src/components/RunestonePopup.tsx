import { Runestone } from '../types';

// Utility function to convert React component to HTML string for MapLibre popup
export const getRunestonePopupHTML = (runestone: Runestone): string => {
  return `
    <div class="p-4 max-w-sm">
      <h3 class="font-bold text-xl mb-3 text-primary border-b border-gray-200 pb-2">${runestone.signature_text}</h3>
      
      <div class="space-y-3">
        <div>
          <h4 class="font-semibold text-sm text-gray-700 mb-1">Location</h4>
          <p class="text-sm text-gray-600">${runestone.found_location}</p>
          <p class="text-xs text-gray-500">${runestone.parish}</p>
        </div>
        
        <div>
          <h4 class="font-semibold text-sm text-gray-700 mb-1">Details</h4>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div><span class="font-medium">Material:</span> ${runestone.material || 'Unknown'}</div>
            <div><span class="font-medium">Dating:</span> ${runestone.dating || 'Unknown'}</div>
            <div><span class="font-medium">Type:</span> ${runestone.rune_type || 'Unknown'}</div>
            <div><span class="font-medium">Style:</span> ${runestone.material_type || 'Unknown'}</div>
          </div>
        </div>
        
        ${
          runestone.english_translation
            ? `
        <div>
          <h4 class="font-semibold text-sm text-gray-700 mb-1">English Translation</h4>
          <p class="text-sm text-gray-600 leading-relaxed">${runestone.english_translation}</p>
        </div>
        `
            : ''
        }
        
        ${
          runestone.swedish_translation
            ? `
        <div>
          <h4 class="font-semibold text-sm text-gray-700 mb-1">Swedish Translation</h4>
          <p class="text-sm text-gray-600 leading-relaxed">${runestone.swedish_translation}</p>
        </div>
        `
            : ''
        }
        
        ${
          runestone.norse_text
            ? `
        <div>
          <h4 class="font-semibold text-sm text-gray-700 mb-1">Norse Text</h4>
          <p class="text-sm text-gray-600 italic leading-relaxed">${runestone.norse_text}</p>
        </div>
        `
            : ''
        }
      </div>
    </div>
  `;
};
