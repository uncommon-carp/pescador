'use client';

import { useState, useMemo, useEffect } from 'react';
import { gql, useLazyQuery, ApolloProvider } from '@apollo/client';
import apolloClient from '../lib/apolloClient';
import { Header } from './components/ui/Header';
import { useAuth } from '../context/AuthContext';
import { StationListItem, Station } from './components/ui/StationListItem';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Button } from './components/ui/Button';
import { TextInput } from './components/ui/TextInput';
import { Card } from './components/ui/Card';
import { Alert } from './components/ui/Alert';
import { HistoryModal } from './components/stations/HistoryModal';
import { WeatherCard } from './components/weather/WeatherCard';
import { SearchForm } from './components/search/SearchForm';
import { LocationOptionsCard } from './components/search/LocationOptionsCard';
import dynamic from 'next/dynamic';

// Load MapView only on client-side (Leaflet requires window object)
const MapView = dynamic(() => import('./components/map/MapView').then((mod) => mod.MapView), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] sm:h-[500px] md:h-[600px] rounded-lg border border-emerald-700/40 bg-slate-900/80 flex items-center justify-center">
      <div className="text-stone-300">Loading map...</div>
    </div>
  ),
});

const GET_DATA_QUERY = gql`
  query GetStationAndWeather($userInput: String!, $radius: Int) {
    fuzzySearch(userInput: $userInput, radius: $radius) {
      ... on BulkStation {
        lakes {
          usgsId
          name
          flowRate
          gageHt
          lat
          lon
        }
        streams {
          usgsId
          name
          flowRate
          gageHt
          lat
          lon
        }
      }
      ... on MultiLocationResponse {
        type
        options {
          display
          lat
          lon
          county
        }
      }
    }
    weather(zip: $userInput) {
      temp
      wind {
        speed
        direction
        gust
      }
      pressure
      humidity
      clouds
      sunrise
      sunset
      condition {
        main
        description
        icon
      }
    }
  }
`;

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

interface LocationOption {
  display: string;
  lat: number;
  lng: number;
  city?: string;
  county?: string;
  state?: string;
}

function HomePageContent() {
  const { user } = useAuth();
  const [searchInput, setSearchInput] = useState<string>('');
  const [submittedSearch, setSubmittedSearch] = useState<string | null>(null);
  const [locationOptions, setLocationOptions] = useState<LocationOption[] | null>(null);
  const [noResultsFound, setNoResultsFound] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [favoritedStations, setFavoritedStations] = useState<Set<string>>(new Set());
  const [searchRadius, setSearchRadius] = useState<number>(10);
  const [getData, { loading, error, data }] = useLazyQuery(GET_DATA_QUERY, {
    onError: (queryError) => {
      console.error('An error occurred during the bulk query:', queryError);
      console.error('Error details:', {
        message: queryError.message,
        graphQLErrors: queryError.graphQLErrors,
        networkError: queryError.networkError,
      });
    },
    onCompleted: (responseData) => {
      // Check if we got multiple location options
      if (responseData?.fuzzySearch?.__typename === 'MultiLocationResponse') {
        // Check if this is a 'failed to find' response
        if (responseData.fuzzySearch.type === 'ftf') {
          setNoResultsFound(true);
          setLocationOptions(null);
          return;
        }

        const options = responseData.fuzzySearch.options?.map((opt: any) => {
          // Parse the display string to extract city and state
          // Format: "Springfield, IL (Sangamon)"
          const match = opt.display.match(/^([^,]+),\s*([^(]+)/);
          const city = match ? match[1].trim() : '';
          const state = match ? match[2].trim() : '';

          return {
            display: opt.display,
            lat: opt.lat,
            lng: opt.lon,
            city,
            county: opt.county,
            state,
          };
        }) || [];
        setLocationOptions(options);
        setNoResultsFound(false);
      } else {
        setLocationOptions(null);
        setNoResultsFound(false);
      }
    },
  });

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

  const handleFavoriteToggle = (stationId: string, isFavorited: boolean) => {
    setFavoritedStations((prev) => {
      const newSet = new Set(prev);
      if (isFavorited) {
        newSet.add(stationId);
      } else {
        newSet.delete(stationId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (submittedSearch) {
      const variables = { userInput: submittedSearch, radius: searchRadius };
      console.log('Sending GraphQL query with variables:', variables);
      getData({ variables });
    }
  }, [submittedSearch, searchRadius, getData]);

  const allStations = useMemo(() => {
    if (!data?.fuzzySearch || data.fuzzySearch.__typename !== 'BulkStation') return [];
    const lakes = data.fuzzySearch.lakes || [];
    const streams = data.fuzzySearch.streams || [];
    return [...lakes, ...streams];
  }, [data]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      return;
    }
    setSubmittedSearch(searchInput);
    setLocationOptions(null); // Clear any previous location options
    setNoResultsFound(false); // Clear any previous error state
  };

  const handleLocationSelect = (location: LocationOption) => {
    // Format a specific search string that MapQuest will definitively match
    // Using "city, state" or "county, state" format
    const searchString = location.city
      ? `${location.city}, ${location.state}`
      : `${location.county}, ${location.state}`;
    setSearchInput(searchString);
    setLocationOptions(null);
    // Refetch both fuzzySearch and weather with the specific location
    console.log('Location selected, fetching with radius:', searchRadius);
    getData({ variables: { userInput: searchString, radius: searchRadius } });
  };

  const handleStationClick = (usgsId: string) => {
    getStationHistory({ variables: { id: usgsId, range: 7 } });
  };

  const closeHistoryModal = () => {
    setIsHistoryModalOpen(false);
  };


  return (
    <>
      <Header />
      <main className="flex min-h-screen w-full flex-col items-center bg-gradient-to-br from-slate-900 via-emerald-900 to-blue-900 px-4 py-8 font-sans sm:p-8 animate-gradient-x">
        <div className="w-full max-w-5xl">
          <header className="text-center pt-8 pb-6 sm:pt-16 sm:pb-8">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg sm:text-4xl md:text-5xl bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent animate-fade-in">
              Make the Right Call
            </h1>
            <p className="mt-3 text-base sm:text-lg text-stone-100 drop-shadow-md animate-fade-in-delay px-2">
              Search by address, city, state, zip, or county for water station and weather info.
            </p>
          </header>

          <SearchForm
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            onSubmit={handleSubmit}
            loading={loading}
            radius={searchRadius}
            onRadiusChange={setSearchRadius}
          />

          <div className="mt-6 min-h-[50px]">
            {loading && (
              <div className="flex justify-center items-center p-4">
                <LoadingSpinner size="md" variant="dark" />
              </div>
            )}

            {error && (
              <div className="text-center">
                <Alert variant="error" message={`Error: ${error.message}`} />
              </div>
            )}

            {noResultsFound && submittedSearch && (
              <Alert
                variant="warning"
                message={`No results for ${submittedSearch}. Please search by zip, city and state, or county.`}
                className="animate-fade-in"
              />
            )}

            <LocationOptionsCard
              locations={locationOptions || []}
              onLocationSelect={handleLocationSelect}
            />

            {data && !locationOptions && (
              <div className="space-y-8 mt-4">
                {data.weather && <WeatherCard weather={data.weather} />}

                {allStations.length > 0 && (
                  <div className="text-left">
                    <h2 className="text-2xl font-bold text-center text-stone-100 mb-4">
                      Nearby Stations
                    </h2>
                    <MapView
                      stations={allStations}
                      onStationClick={handleStationClick}
                      onFavoriteToggle={handleFavoriteToggle}
                      favoritedStations={favoritedStations}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Station History Modal */}
          <HistoryModal
            isOpen={isHistoryModalOpen}
            onClose={closeHistoryModal}
            loading={historyLoading}
            error={historyError}
            data={historyData}
          />
        </div>
      </main>
    </>
  );
}

export default function HomePage() {
  return (
    <ApolloProvider client={apolloClient}>
      <HomePageContent />
    </ApolloProvider>
  );
}
