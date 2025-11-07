'use client';

import { useState, useMemo, useEffect } from 'react';
import { gql, useLazyQuery, useMutation, ApolloProvider } from '@apollo/client';
// This is a placeholder type. Replace with your actual type definition if available.
interface SingleStation {
  usgsId: string;
  name: string;
  flowRate?: string | null;
  gageHt?: string | null;
}
// Assuming apolloClient and convertMmHgToInHg are correctly set up in these paths
import apolloClient from '../lib/apolloClient';
import { convertMmHgToInHg } from '@/lib/mmhgToInHg';
import { Header } from './components/ui/Header';
import { useAuth } from '../context/AuthContext';

// Existing Query for Bulk Stations and Weather
const GET_DATA_QUERY = gql`
  query GetStationAndWeather($zip: String!) {
    bulkStation(zip: $zip) {
      lakes {
        usgsId
        name
        flowRate
        gageHt
      }
      streams {
        usgsId
        name
        flowRate
        gageHt
      }
    }
    weather(zip: $zip) {
      temp
      wind {
        speed
        direction
      }
      pressure
    }
  }
`;

// UPDATED Query for Single Station History (to match your backend)
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

// Mutation to add a station to favorites
const ADD_FAVORITE_STATION = gql`
  mutation AddFavoriteStation($input: AddFavoriteStationInput!) {
    addFavoriteStation(input: $input) {
      success
      message
    }
  }
`;

// Mutation to remove a station from favorites
const REMOVE_FAVORITE_STATION = gql`
  mutation RemoveFavoriteStation($input: RemoveFavoriteStationInput!) {
    removeFavoriteStation(input: $input) {
      success
      message
    }
  }
`;

function HomePageContent() {
  const { user } = useAuth();
  const [zipcode, setZipcode] = useState<string>('');
  const [submittedZip, setSubmittedZip] = useState<string | null>(null);

  // State for managing the history pop-up visibility
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  // State for tracking favorited stations
  const [favoritedStations, setFavoritedStations] = useState<Set<string>>(new Set());

  // Bulk data query
  const [getData, { loading, error, data }] = useLazyQuery(GET_DATA_QUERY, {
    onCompleted: (queryData) => {
      console.log('Bulk Query completed successfully:', queryData);
    },
    onError: (queryError) => {
      console.error('An error occurred during the bulk query:', queryError);
    },
  });

  // Lazy query for single station history
  const [
    getStationHistory,
    { loading: historyLoading, error: historyError, data: historyData },
  ] = useLazyQuery(GET_STATION_HISTORY_QUERY, {
    onCompleted: (queryData) => {
      console.log('History Query completed successfully:', queryData);
      console.log('History Data Values Structure:', queryData?.station?.values);
      setIsHistoryModalOpen(true); // Open modal on successful fetch
    },
    onError: (queryError) => {
      console.error('An error occurred during the history query:', queryError);
      setIsHistoryModalOpen(true); // Still open modal to show error
    },
  });

  // Mutations for favoriting stations
  const [addFavoriteStation] = useMutation(ADD_FAVORITE_STATION, {
    onCompleted: (data) => {
      if (data.addFavoriteStation.success) {
        console.log('Station added to favorites:', data.addFavoriteStation.message);
      }
    },
    onError: (error) => {
      console.error('Error adding station to favorites:', error);
    },
  });

  const [removeFavoriteStation] = useMutation(REMOVE_FAVORITE_STATION, {
    onCompleted: (data) => {
      if (data.removeFavoriteStation.success) {
        console.log('Station removed from favorites:', data.removeFavoriteStation.message);
      }
    },
    onError: (error) => {
      console.error('Error removing station from favorites:', error);
    },
  });

  // Handler to toggle favorite status
  const handleToggleFavorite = async (station: SingleStation, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering station click

    if (!user) {
      alert('Please sign in to favorite stations');
      return;
    }

    const isFavorited = favoritedStations.has(station.usgsId);

    try {
      if (isFavorited) {
        // Remove from favorites
        await removeFavoriteStation({
          variables: {
            input: {
              userSub: user.userSub,
              stationId: station.usgsId,
            },
          },
        });
        setFavoritedStations((prev) => {
          const newSet = new Set(prev);
          newSet.delete(station.usgsId);
          return newSet;
        });
      } else {
        // Add to favorites
        await addFavoriteStation({
          variables: {
            input: {
              userSub: user.userSub,
              stationId: station.usgsId,
              stationName: station.name,
              lat: null,
              lon: null,
            },
          },
        });
        setFavoritedStations((prev) => new Set(prev).add(station.usgsId));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  useEffect(() => {
    if (submittedZip) {
      console.log('useEffect triggered. Calling getData with:', submittedZip);
      getData({ variables: { zip: submittedZip } });
    }
  }, [submittedZip, getData]);

  const allStations = useMemo(() => {
    if (!data?.bulkStation) return [];
    const lakes = data.bulkStation.lakes || [];
    const streams = data.bulkStation.streams || [];
    return [...lakes, ...streams];
  }, [data]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!/^\d{5}$/.test(zipcode)) {
      // Potentially add visual feedback for invalid zip code
      return;
    }
    setSubmittedZip(zipcode);
    setZipcode(''); // Clear input after submission
  };

  // Function to handle station click and fetch history
  const handleStationClick = (usgsId: string) => {
    // Fetch last 7 days of data for the clicked station
    getStationHistory({ variables: { id: usgsId, range: 7 } });
  };

  const closeHistoryModal = () => {
    setIsHistoryModalOpen(false);
  };

  // *** FIXED *** Helper to format timestamp from an ISO string
  const formatTimestamp = (timestamp: string) => {
    // The new Date() constructor can directly parse ISO 8601 strings
    const date = new Date(timestamp);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString();
  };

  // *** REFINED *** Memoized data processing for historical records
  const historicalRecords = useMemo(() => {
    if (!historyData?.station?.values) return [];

    const flowData = historyData.station.values.flow || [];
    const gageData = historyData.station.values.gage || [];

    // Combine all data points into one map with the timestamp as the key
    const dataMap = new Map<
      string,
      { flowValue: string | null; gageValue: string | null }
    >();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    flowData.forEach((item: any) => {
      if (!dataMap.has(item.timestamp)) {
        dataMap.set(item.timestamp, { flowValue: null, gageValue: null });
      }
      dataMap.get(item.timestamp)!.flowValue = item.value;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gageData.forEach((item: any) => {
      if (!dataMap.has(item.timestamp)) {
        dataMap.set(item.timestamp, { flowValue: null, gageValue: null });
      }
      dataMap.get(item.timestamp)!.gageValue = item.value;
    });

    // Convert the map to an array, sort by date, and return
    return (
      Array.from(dataMap.entries())
        .map(([timestamp, values]) => ({ timestamp, ...values }))
        // *** FIXED *** Sort by creating Date objects from the ISO strings
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        )
    );
  }, [historyData]);

  return (
    <>
      <Header />
      <main className="flex min-h-screen w-full flex-col items-center bg-gradient-to-br from-slate-900 via-emerald-900 to-blue-900 px-4 py-8 font-sans sm:p-8 animate-gradient-x">
        <div className="w-full max-w-2xl">
          <header className="text-center pt-8 pb-6 sm:pt-16 sm:pb-8">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg sm:text-4xl md:text-5xl bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent animate-fade-in">
              Make the Right Call
            </h1>
            <p className="mt-3 text-base sm:text-lg text-stone-100 drop-shadow-md animate-fade-in-delay px-2">
              Enter a zip code for water station and weather info.
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center animate-slide-up"
          >
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                placeholder="Enter 5-digit zip code"
                pattern="\d{5}"
                maxLength={5}
                className="w-full rounded-xl bg-slate-800/40 backdrop-blur-md border border-emerald-700/50 px-6 py-4 text-stone-100 text-lg placeholder-stone-400 shadow-lg transition-all duration-300 focus:bg-slate-800/60 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-700/30 focus:outline-none"
                aria-label="Zip Code Input"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-orange-600 to-amber-700 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:from-orange-500 hover:to-amber-600 hover:shadow-2xl hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Searching...
                </span>
              ) : (
                'Search'
              )}
            </button>
          </form>

          <div className="mt-6 min-h-[50px]">
            {loading && (
              <div className="flex justify-center items-center p-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-300 border-t-orange-600" />
              </div>
            )}

            {error && (
              <p className="text-center text-orange-400">Error: {error.message}</p>
            )}

            {data && (
              <div className="space-y-8 mt-4">
                {data.weather && (
                  <div className="text-center bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-emerald-700/40">
                    <h2 className="text-2xl font-bold text-stone-100 mb-4">
                      Current Weather
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center justify-center">
                      <p className="text-5xl font-bold text-amber-400">
                        {Math.round(data.weather.temp)}°F
                      </p>
                      <div className="text-center sm:text-left">
                        <p className="text-lg font-semibold text-stone-200">
                          Wind
                        </p>
                        <p className="text-stone-300">
                          {data.weather.wind.speed} from the{' '}
                          {data.weather.wind.direction}
                        </p>
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-lg font-semibold text-stone-200">
                          Pressure
                        </p>
                        <p className="text-stone-300">
                          {convertMmHgToInHg(Number(data.weather.pressure))} inHg
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {allStations.length > 0 && (
                  <div className="text-left">
                    <h2 className="text-2xl font-bold text-center text-stone-100">
                      Nearby Stations
                    </h2>
                    <ul className="mt-4 space-y-3">
                      {allStations.map((station: SingleStation) => {
                        const isFavorited = favoritedStations.has(station.usgsId);
                        return (
                          <li
                            key={`${station.name}-${station.usgsId}`}
                            className="rounded-lg border border-emerald-700/40 bg-slate-800/60 backdrop-blur-sm p-4 shadow-lg cursor-pointer hover:shadow-xl hover:border-orange-600/60 hover:bg-slate-800/80 transition-all duration-200"
                            onClick={() => handleStationClick(station.usgsId)}
                          >
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex-grow">
                                <p className="font-semibold text-stone-100">
                                  {station.name}
                                </p>
                                <p className="text-sm text-stone-400">
                                  ID: {station.usgsId}
                                </p>
                              </div>
                              <button
                                onClick={(e) => handleToggleFavorite(station, e)}
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
                                    <span className="font-bold text-amber-400">
                                      {station.gageHt}
                                    </span>{' '}
                                    ft
                                  </p>
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Station History Modal */}
          {isHistoryModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
              <div className="relative w-full max-w-lg rounded-lg bg-slate-800 border border-emerald-700/40 p-6 shadow-2xl">
                <button
                  onClick={closeHistoryModal}
                  className="absolute right-4 top-4 text-stone-400 hover:text-stone-100 text-2xl font-bold"
                  aria-label="Close"
                >
                  &times;
                </button>
                {historyLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-300 border-t-orange-600" />
                  </div>
                ) : historyError ? (
                  <div className="text-center text-orange-400 p-4">
                    <h2 className="text-xl font-bold mb-2">
                      Error Loading History
                    </h2>
                    <p>Could not load historical data for this station.</p>
                    <p className="text-sm mt-2">{historyError.message}</p>
                  </div>
                ) : historyData?.station ? (
                  <div>
                    <h2 className="text-2xl font-bold text-stone-100 mb-4">
                      {historyData.station.name} History
                    </h2>
                    <p className="text-sm text-stone-400 mb-4">
                      USGS ID: {historyData.station.usgsId}
                    </p>
                    {historicalRecords.length > 0 ? (
                      <div className="max-h-80 overflow-y-auto pr-2">
                        <table className="min-w-full divide-y divide-emerald-700/40">
                          <thead className="bg-slate-900/50 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-stone-300 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-stone-300 uppercase tracking-wider">
                                Flow (cfs)
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-stone-300 uppercase tracking-wider">
                                Height (ft)
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-emerald-700/30">
                            {historicalRecords.map((record, index: number) => (
                              <tr key={index}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-stone-200">
                                  {formatTimestamp(record.timestamp)}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-amber-400 font-semibold">
                                  {record.flowValue !== null
                                    ? record.flowValue
                                    : 'N/A'}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-amber-400 font-semibold">
                                  {record.gageValue !== null
                                    ? record.gageValue
                                    : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-center text-stone-400 p-4">
                        No historical data available for this station.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-stone-400 p-4">
                    Select a station to view its history.
                  </div>
                )}
              </div>
            </div>
          )}
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
