'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngBounds, divIcon } from 'leaflet';
import { gql, useMutation } from '@apollo/client';
import { Station } from '../ui/StationListItem';
import { StationPopupContent } from './StationPopupContent';
import { useAuth } from '../../../context/AuthContext';
import { renderToStaticMarkup } from 'react-dom/server';

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

interface MapViewProps {
  stations: Station[];
  onStationClick: (usgsId: string) => void;
  onFavoriteToggle: (stationId: string, isFavorited: boolean) => void;
  favoritedStations: Set<string>;
}

// Component to handle map bounds updates
function MapBoundsHandler({ stations }: { stations: Station[] }) {
  const map = useMap();

  useEffect(() => {
    if (stations.length > 0) {
      const bounds = new LatLngBounds(
        stations.map((s) => [s.lat!, s.lon!])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [stations, map]);

  return null;
}

export const MapView: React.FC<MapViewProps> = ({
  stations,
  onStationClick,
  onFavoriteToggle,
  favoritedStations,
}) => {
  const { user } = useAuth();

  // Filter stations with valid coordinates
  const validStations = useMemo(
    () =>
      stations.filter(
        (station) =>
          station.lat != null &&
          station.lon != null &&
          !isNaN(station.lat) &&
          !isNaN(station.lon)
      ),
    [stations]
  );

  // Calculate center for initial map view
  const center = useMemo(() => {
    if (validStations.length === 0) {
      return { lat: 39.8283, lng: -98.5795 }; // Center of US
    }
    const lats = validStations.map((s) => s.lat!);
    const lons = validStations.map((s) => s.lon!);
    return {
      lat: (Math.min(...lats) + Math.max(...lats)) / 2,
      lng: (Math.min(...lons) + Math.max(...lons)) / 2,
    };
  }, [validStations]);

  const [addFavoriteStation] = useMutation(ADD_FAVORITE_STATION, {
    onError: (error) => {
      console.error('Error adding station to favorites:', error);
      alert('Failed to add station to favorites. Please try again.');
    },
  });

  const [removeFavoriteStation] = useMutation(REMOVE_FAVORITE_STATION, {
    onError: (error) => {
      console.error('Error removing station from favorites:', error);
      alert('Failed to remove station from favorites. Please try again.');
    },
  });

  const handleFavoriteClick = async (e: React.MouseEvent, station: Station) => {
    e.stopPropagation();

    if (!user) {
      alert('Please sign in to favorite stations');
      return;
    }

    const isFavorited = favoritedStations.has(station.usgsId);

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
        onFavoriteToggle(station.usgsId, false);
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
        onFavoriteToggle(station.usgsId, true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleViewHistoryClick = (e: React.MouseEvent, station: Station) => {
    e.stopPropagation();
    onStationClick(station.usgsId);
  };

  // Create custom marker icon with label
  const createMarkerIcon = (station: Station) => {
    const label = station.flowRate
      ? `${station.flowRate} cfs`
      : station.gageHt
      ? `${station.gageHt} ft`
      : 'N/A';

    const iconHtml = renderToStaticMarkup(
      <div className="flex flex-col items-center">
        <div className="hidden sm:flex mb-1 px-2 py-1 bg-slate-800/95 border border-amber-400/60 rounded-md shadow-lg whitespace-nowrap">
          <span className="text-xs font-bold text-amber-400">{label}</span>
        </div>
        <svg
          width="30"
          height="40"
          viewBox="0 0 30 40"
          className="drop-shadow-lg"
        >
          <path
            d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 25 15 25s15-16.716 15-25c0-8.284-6.716-15-15-15z"
            fill="#10b981"
            stroke="#064e3b"
            strokeWidth="1"
          />
          <circle cx="15" cy="15" r="6" fill="#fbbf24" />
        </svg>
      </div>
    );

    return divIcon({
      html: iconHtml,
      className: 'custom-marker',
      iconSize: [30, 40],
      iconAnchor: [15, 40],
      popupAnchor: [0, -40],
    });
  };

  if (validStations.length === 0) {
    return (
      <div className="w-full h-[400px] sm:h-[500px] md:h-[600px] rounded-lg overflow-hidden border border-emerald-700/40 shadow-lg relative flex items-center justify-center bg-slate-900/80">
        <p className="text-stone-300">
          {stations.length > 0
            ? 'No stations with coordinates available to display on map'
            : 'No stations found'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] sm:h-[500px] md:h-[600px] rounded-lg overflow-hidden border border-emerald-700/40 shadow-lg relative">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBoundsHandler stations={validStations} />

        {validStations.map((station) => (
          <Marker
            key={station.usgsId}
            position={[station.lat!, station.lon!]}
            icon={createMarkerIcon(station)}
          >
            <Popup>
              <StationPopupContent
                station={station}
                isFavorited={favoritedStations.has(station.usgsId)}
                onFavoriteClick={handleFavoriteClick}
                onViewHistoryClick={handleViewHistoryClick}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
