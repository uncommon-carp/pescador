'use client';

import { Station } from '../ui/StationListItem';
import { useAuth } from '../../../context/AuthContext';

interface StationPopupContentProps {
  station: Station;
  isFavorited: boolean;
  onFavoriteClick: (e: React.MouseEvent, station: Station) => void;
  onViewHistoryClick: (e: React.MouseEvent, station: Station) => void;
}

export const StationPopupContent: React.FC<StationPopupContentProps> = ({
  station,
  isFavorited,
  onFavoriteClick,
  onViewHistoryClick,
}) => {
  const { user } = useAuth();

  return (
    <div className="p-3 min-w-[200px]">
      <h3 className="font-bold text-sm text-stone-900 mb-1">
        {station.name}
      </h3>
      <p className="text-xs text-stone-600 mb-2">ID: {station.usgsId}</p>

      <div className="space-y-1 mb-3">
        {station.flowRate && (
          <div className="flex justify-between text-xs">
            <span className="text-stone-700">Flow:</span>
            <span className="font-bold text-amber-600">
              {station.flowRate} cfs
            </span>
          </div>
        )}
        {station.gageHt && (
          <div className="flex justify-between text-xs">
            <span className="text-stone-700">Height:</span>
            <span className="font-bold text-cyan-600">
              {station.gageHt} ft
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={(e) => onViewHistoryClick(e, station)}
          className="flex-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded transition-colors"
        >
          View Charts
        </button>

        {user && (
          <button
            onClick={(e) => onFavoriteClick(e, station)}
            className={`px-3 py-1.5 rounded transition-colors ${
              isFavorited
                ? 'bg-amber-400/20 hover:bg-amber-400/30 text-amber-700'
                : 'bg-slate-200 hover:bg-slate-300 text-stone-600'
            }`}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill={isFavorited ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
