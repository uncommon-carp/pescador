'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useLazyQuery, ApolloProvider, gql } from '@apollo/client';
import apolloClient from '../../lib/apolloClient';
import { Header } from '../components/ui/Header';
import { useAuth } from '../../context/AuthContext';
import { convertMmHgToInHg } from '@/lib/mmhgToInHg';
import { useRouter } from 'next/navigation';
import { StationListItem, Station } from '../components/ui/StationListItem';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { TextInput } from '../components/ui/TextInput';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { WeatherCard } from '../components/weather/WeatherCard';
import { HistoryModal } from '../components/stations/HistoryModal';
import {
  GET_STATION_QUERY,
  GET_WEATHER_QUERY,
  SEARCH_STATIONS_QUERY,
} from '../../lib/graphql/dashboardOperations';
import {
  GET_FAVORITE_STATIONS,
  GET_USER_PROFILE,
} from '../../lib/graphql/profileOperations';

interface StationValue {
  value: number;
  timestamp: string;
}

interface StationData {
  usgsId: string;
  name: string;
  lat?: number;
  lon?: number;
  values?: {
    flow?: StationValue[];
    gage?: StationValue[];
  };
}

interface FavoriteStation {
  stationId: string;
  stationName: string;
  lat?: number;
  lon?: number;
  dateAdded: string;
}

const GET_STATION_HISTORY_QUERY = gql`
  query GetStationHistory($id: String!, $range: Int!) {
    station(id: $id, range: $range) {
      usgsId
      name
      values {
        flow {
          value
          timestamp
        }
        gage {
          value
          timestamp
        }
      }
    }
  }
`;

// Separate component for each favorite station card
function FavoriteStationCard({
  favorite,
  onStationClick
}: {
  favorite: FavoriteStation;
  onStationClick?: (usgsId: string) => void;
}) {
  const { data, loading, error } = useQuery(GET_STATION_QUERY, {
    variables: { id: favorite.stationId, range: 1 },
    skip: !favorite.stationId,
  });

  const station: StationData | undefined = data?.station;

  const latestFlow =
    station?.values?.flow && station.values.flow.length > 0
      ? station.values.flow[station.values.flow.length - 1].value
      : null;
  const latestGage =
    station?.values?.gage && station.values.gage.length > 0
      ? station.values.gage[station.values.gage.length - 1].value
      : null;

  const handleClick = () => {
    if (onStationClick) {
      onStationClick(favorite.stationId);
    }
  };

  return (
    <div
      className="rounded-lg border border-emerald-700/40 bg-slate-800/60 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl hover:border-orange-600/60 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <h3 className="font-bold text-lg text-stone-100 mb-2">
        {favorite.stationName}
      </h3>
      <p className="text-sm text-stone-400 mb-4">ID: {favorite.stationId}</p>
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-orange-600" />
        </div>
      ) : error ? (
        <p className="text-orange-400 text-sm">Unable to load current data</p>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-stone-300">Flow Rate:</span>
            <span className="font-bold text-amber-400">
              {latestFlow?.toFixed(2) || 'N/A'} cfs
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-300">Gage Height:</span>
            <span className="font-bold text-amber-400">
              {latestGage?.toFixed(2) || 'N/A'} ft
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchZip, setSearchZip] = useState<string>('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [favoritedStationIds, setFavoritedStationIds] = useState<Set<string>>(new Set());
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  // Fetch user profile to get zip code
  const { data: profileData } = useQuery(GET_USER_PROFILE, {
    variables: { userSub: user?.userSub || '' },
    skip: !user?.userSub,
  });

  // Fetch favorite stations
  const { data: favoritesData, loading: favoritesLoading } = useQuery(
    GET_FAVORITE_STATIONS,
    {
      variables: { userSub: user?.userSub || '' },
      skip: !user?.userSub,
      onCompleted: (data) => {
        if (data?.favoriteStations) {
          const ids = new Set<string>(data.favoriteStations.map((f: FavoriteStation) => f.stationId));
          setFavoritedStationIds(ids);
        }
      },
    }
  );

  // Fetch weather data based on user's zip code
  const { data: weatherData, loading: weatherLoading } = useQuery(
    GET_WEATHER_QUERY,
    {
      variables: { zip: profileData?.userProfile?.zipCode || '' },
      skip: !profileData?.userProfile?.zipCode,
    }
  );

  // Search stations query
  const [
    searchStations,
    { data: searchData, loading: searchLoading, error: searchError },
  ] = useLazyQuery(SEARCH_STATIONS_QUERY);

  // Station history query
  const [
    getStationHistory,
    { loading: historyLoading, error: historyError, data: historyData },
  ] = useLazyQuery(GET_STATION_HISTORY_QUERY, {
    onCompleted: () => {
      setIsHistoryModalOpen(true);
    },
    onError: (queryError) => {
      console.error('An error occurred during the history query:', queryError);
      setIsHistoryModalOpen(true);
    },
  });

  // Get the limit from user preferences, default to 5
  const stationLimit =
    profileData?.userProfile?.dashboardPreferences?.dashboardStationLimit || 5;

  // Get first N favorite stations
  const favoriteStations: FavoriteStation[] = useMemo(() => {
    if (!favoritesData?.favoriteStations) return [];
    return favoritesData.favoriteStations.slice(0, stationLimit);
  }, [favoritesData, stationLimit]);

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!/^\d{5}$/.test(searchZip)) {
      alert('Please enter a valid 5-digit zip code');
      return;
    }
    searchStations({ variables: { zip: searchZip } });
    setShowSearchResults(true);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (stationId: string, isFavorited: boolean) => {
    setFavoritedStationIds((prev) => {
      const newSet = new Set(prev);
      if (isFavorited) {
        newSet.add(stationId);
      } else {
        newSet.delete(stationId);
      }
      return newSet;
    });
  };

  // Handle station click to show history
  const handleStationClick = (usgsId: string) => {
    getStationHistory({ variables: { id: usgsId, range: 7 } });
  };

  // Close history modal
  const closeHistoryModal = () => {
    setIsHistoryModalOpen(false);
  };

  // Combine search results
  const searchResults = useMemo(() => {
    if (!searchData?.bulkStation) return [];
    const lakes = searchData.bulkStation.lakes || [];
    const streams = searchData.bulkStation.streams || [];
    return [...lakes, ...streams];
  }, [searchData]);

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <Header />
      <main className="flex min-h-screen w-full flex-col items-center bg-gradient-to-br from-slate-900 via-emerald-900 to-blue-900 px-4 py-8 font-sans sm:p-8 animate-gradient-x">
        <div className="w-full max-w-6xl">
          <header className="text-center pt-8 pb-6">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg sm:text-4xl md:text-5xl bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="mt-3 text-base sm:text-lg text-stone-100 drop-shadow-md">
              Welcome back, {user.name}!
            </p>
          </header>

          {/* Current Weather Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-stone-100 mb-4">
              Current Weather
            </h2>
            {weatherLoading ? (
              <Card>
                <div className="flex justify-center items-center p-2">
                  <LoadingSpinner size="md" variant="dark" />
                </div>
              </Card>
            ) : weatherData?.weather ? (
              <WeatherCard weather={weatherData.weather} showHumidity />
            ) : (
              <Card className="text-center text-stone-400">
                {profileData?.userProfile?.zipCode ? (
                  <p>Unable to load weather data</p>
                ) : (
                  <p>
                    Please set your zip code in{' '}
                    <a
                      href="/profile"
                      className="text-amber-400 hover:text-amber-300 underline"
                    >
                      profile settings
                    </a>{' '}
                    to see weather information
                  </p>
                )}
              </Card>
            )}
          </div>

          {/* Favorite Stations Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-stone-100 mb-4">
              Your Favorite Stations
            </h2>
            {favoritesLoading ? (
              <Card>
                <div className="flex justify-center items-center p-2">
                  <LoadingSpinner size="md" variant="dark" />
                </div>
              </Card>
            ) : favoriteStations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteStations.map((favorite) => (
                  <FavoriteStationCard
                    key={favorite.stationId}
                    favorite={favorite}
                    onStationClick={handleStationClick}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center text-stone-400">
                <p className="mb-4">You haven't favorited any stations yet.</p>
                <p>
                  Search for stations below or visit the{' '}
                  <a
                    href="/"
                    className="text-amber-400 hover:text-amber-300 underline"
                  >
                    home page
                  </a>{' '}
                  to find and favorite stations.
                </p>
              </Card>
            )}
          </div>

          {/* Search Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-stone-100 mb-4">
              Find More Stations
            </h2>
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row gap-4"
            >
              <TextInput
                type="text"
                value={searchZip}
                onChange={(e) => setSearchZip(e.target.value)}
                placeholder="Enter 5-digit zip code"
                pattern="\d{5}"
                maxLength={5}
                inputSize="lg"
                className="flex-1"
                aria-label="Zip Code Search"
              />
              <Button
                type="submit"
                loading={searchLoading}
                size="lg"
              >
                Search
              </Button>
            </form>

            {/* Search Results */}
            {showSearchResults && (
              <div className="mt-6">
                {searchError && (
                  <Alert
                    variant="error"
                    message={`Error: ${searchError.message}`}
                  />
                )}
                {searchResults.length > 0 ? (
                  <div>
                    <h3 className="text-xl font-bold text-stone-100 mb-4">
                      Search Results
                    </h3>
                    <ul className="space-y-3">
                      {searchResults.map((station: Station) => (
                        <StationListItem
                          key={`${station.name}-${station.usgsId}`}
                          station={station}
                          isFavorited={favoritedStationIds.has(station.usgsId)}
                          onFavoriteToggle={handleFavoriteToggle}
                        />
                      ))}
                    </ul>
                  </div>
                ) : (
                  !searchLoading &&
                  searchData && (
                    <p className="text-center text-stone-400 p-4">
                      No stations found for this zip code.
                    </p>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Station History Modal */}
        <HistoryModal
          isOpen={isHistoryModalOpen}
          onClose={closeHistoryModal}
          loading={historyLoading}
          error={historyError}
          data={historyData}
        />
      </main>
    </>
  );
}

export default function DashboardPage() {
  return (
    <ApolloProvider client={apolloClient}>
      <DashboardContent />
    </ApolloProvider>
  );
}
