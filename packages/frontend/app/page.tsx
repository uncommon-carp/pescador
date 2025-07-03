'use client';

import { useState, useMemo, useEffect } from 'react';
import { gql, useLazyQuery, ApolloProvider } from '@apollo/client';
import apolloClient from '../lib/apolloClient';

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

interface Station {
  usgsId: string;
  name: string;
  flowRate?: string;
  gageHt?: string;
}

const convertMmHgToInHg = (mmHg: number): string => {
  if (typeof mmHg !== 'number') return '';
  const inHg = mmHg * 0.0393701;
  return inHg.toFixed(2);
};

function HomePageContent() {
  const [zipcode, setZipcode] = useState<string>('');
  const [submittedZip, setSubmittedZip] = useState<string | null>(null);

  const [getData, { loading, error, data }] = useLazyQuery(GET_DATA_QUERY, {
    onCompleted: (queryData) => {
      console.log('Query completed successfully:', queryData);
    },
    onError: (queryError) => {
      console.error('An error occurred during the query:', queryError);
    },
  });

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
      return;
    }
    setZipcode('');
    setSubmittedZip(zipcode);
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-slate-100 p-4 font-sans sm:p-8">
      <div className="w-full max-w-2xl">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
            Find Fishing Spots
          </h1>
          <p className="mt-2 text-slate-600">
            Enter a zip code for water station and weather info.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex w-full flex-col items-center gap-2 sm:flex-row sm:justify-center"
        >
          <input
            type="text"
            value={zipcode}
            onChange={(e) => setZipcode(e.target.value)}
            placeholder="Enter 5-digit zip code"
            pattern="\d{5}"
            maxLength={5}
            className="w-full rounded-md border-slate-300 px-4 py-3 text-black text-lg shadow-sm transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 sm:w-64"
            aria-label="Zip Code Input"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-cyan-600 px-8 py-3 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-cyan-400 sm:w-auto"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        <div className="mt-6 min-h-[50px]">
          {loading && (
            <div className="flex justify-center items-center p-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-cyan-600" />
            </div>
          )}

          {error && (
            <p className="text-center text-red-600">Error: {error.message}</p>
          )}

          {data && (
            <div className="space-y-8 mt-4">
              {data.weather && (
                <div className="text-center bg-white p-6 rounded-lg shadow-md border border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-700 mb-4">
                    Current Weather
                  </h2>
                  <div className="flex items-center justify-center gap-6">
                    <p className="text-5xl font-bold text-slate-800">
                      {Math.round(data.weather.temp)}°F
                    </p>
                    <div className="text-left">
                      <p className="text-lg font-semibold text-slate-700">
                        Wind
                      </p>
                      <p className="text-slate-600">
                        {data.weather.wind.speed} from the{' '}
                        {data.weather.wind.direction}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-semibold text-slate-700">
                        Pressure
                      </p>
                      <p className="text-slate-600">
                        {convertMmHgToInHg(Number(data.weather.pressure))} inHg
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {allStations.length > 0 && (
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-center text-slate-700">
                    Nearby Stations
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {allStations.map((station: Station) => (
                      <li
                        key={`${station.name}-${station.usgsId}`}
                        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-slate-800">
                              {station.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              ID: {station.usgsId}
                            </p>
                          </div>
                          <div className="text-right text-sm flex-shrink-0 ml-4">
                            {/* Conditionally render Flow Rate if it exists */}
                            {station.flowRate && (
                              <p className="text-slate-700">
                                Flow:{' '}
                                <span className="font-bold">
                                  {station.flowRate}
                                </span>{' '}
                                cfs
                              </p>
                            )}
                            {/* Conditionally render Gage Height if it exists */}
                            {station.gageHt && (
                              <p className="text-slate-700">
                                Height:{' '}
                                <span className="font-bold">
                                  {station.gageHt}
                                </span>{' '}
                                ft
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <ApolloProvider client={apolloClient}>
      <HomePageContent />
    </ApolloProvider>
  );
}
