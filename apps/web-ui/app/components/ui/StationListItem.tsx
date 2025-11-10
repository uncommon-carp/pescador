'use client';

import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAuth } from '../../../context/AuthContext';

const ADD_FAVORITE_STATION = gql`
  mutation AddFavoriteStation($input: AddFavoriteStationInput!) {
    addFavoriteStation(input: $input) {
      success
      message
    }
  }
`;

const REMOVE_FAVORITE_STATION = gql`
  mutation RemoveFavoriteStation($input: RemoveFavoriteStationInput!) {
    removeFavoriteStation(input: $input) {
      success
      message
    }
  }
`;

export interface Station {
  usgsId: string;
  name: string;
  flowRate?: string | null;
  gageHt?: string | null;
  lat?: number;
  lon?: number;
}

interface StationListItemProps {
  station: Station;
  isFavorited: boolean;
  onFavoriteToggle: (stationId: string, isFavorited: boolean) => void;
  onStationClick?: (usgsId: string) => void;
}

export function StationListItem({
  station,
  isFavorited,
  onFavoriteToggle,
  onStationClick,
}: StationListItemProps) {
  const { user } = useAuth();

  const [addFavoriteStation] = useMutation(ADD_FAVORITE_STATION, {
    onCompleted: () => {
      onFavoriteToggle(station.usgsId, true);
    },
    onError: (error) => {
      console.error('Error adding station to favorites:', error);
      alert('Failed to add station to favorites. Please try again.');
    },
  });

  const [removeFavoriteStation] = useMutation(REMOVE_FAVORITE_STATION, {
    onCompleted: () => {
      onFavoriteToggle(station.usgsId, false);
    },
    onError: (error) => {
      console.error('Error removing station from favorites:', error);
      alert('Failed to remove station from favorites. Please try again.');
    },
  });

  const handleToggleFavorite = async (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!user) {
      alert('Please sign in to favorite stations');
      return;
    }

    try {
      if (isFavorited) {
        await removeFavoriteStation({
          variables: {
            input: {
              userSub: user.userSub,
              stationId: station.usgsId,
            },
          },
        });
      } else {
        await addFavoriteStation({
          variables: {
            input: {
              userSub: user.userSub,
              stationId: station.usgsId,
              stationName: station.name,
              lat: station.lat || null,
              lon: station.lon || null,
            },
          },
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleClick = () => {
    if (onStationClick) {
      onStationClick(station.usgsId);
    }
  };

  return (
    <li
      className={`rounded-lg border border-emerald-700/40 bg-slate-800/60 backdrop-blur-sm p-4 shadow-lg hover:shadow-xl hover:border-orange-600/60 hover:bg-slate-800/80 transition-all duration-200 ${
        onStationClick ? 'cursor-pointer' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-grow">
          <p className="font-semibold text-stone-100">{station.name}</p>
          <p className="text-sm text-stone-400">ID: {station.usgsId}</p>
        </div>
        <button
          onClick={handleToggleFavorite}
          className={`flex-shrink-0 p-2 rounded-lg transition-all duration-200 ${
            isFavorited
              ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
              : 'text-stone-400 hover:text-amber-400 hover:bg-slate-700/50'
          }`}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
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
        <div className="text-right text-sm flex-shrink-0">
          {station.flowRate && (
            <p className="text-stone-200">
              Flow:{' '}
              <span className="font-bold text-amber-400">
                {station.flowRate}
              </span>{' '}
              cfs
            </p>
          )}
          {station.gageHt && (
            <p className="text-stone-200">
              Height:{' '}
              <span className="font-bold text-amber-400">{station.gageHt}</span>{' '}
              ft
            </p>
          )}
        </div>
      </div>
    </li>
  );
}
