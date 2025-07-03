// File: app/page.tsx
'use client';

import { useState } from 'react';

// Define a type for the station data structure.
// This ensures your data is consistent throughout the app.
interface Station {
  id: string;
  name: string;
}

export default function HomePage() {
  const [zipcode, setZipcode] = useState<string>('');
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles the form submission event.
   * @param e The form event, correctly typed for a form element.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent the default form submission behavior.

    if (!/^\d{5}$/.test(zipcode)) {
      setError('Please enter a valid 5-digit zip code.');
      return;
    }

    // Reset state for the new search
    setIsLoading(true);
    setError(null);
    setStations([]);

    try {
      // Fetch data from our own backend API route.
      const response = await fetch(`/api/stations?zipcode=${zipcode}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'An error occurred while fetching stations.',
        );
      }

      const data: Station[] = await response.json();
      setStations(data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-slate-100 p-4 font-sans sm:p-8">
      <div className="w-full max-w-2xl">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
            Find Fishing Stations
          </h1>
          <p className="mt-2 text-slate-600">
            Enter a zip code to find nearby water monitoring stations.
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
            className="w-full rounded-md border-slate-300 px-4 py-3 text-lg shadow-sm transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 sm:w-64"
            aria-label="Zip Code Input"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-cyan-600 px-8 py-3 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-cyan-400 sm:w-auto"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>

        <div className="mt-6 min-h-[50px]">
          {error && <p className="text-center text-red-600">{error}</p>}

          {isLoading && (
            <div className="flex justify-center items-center p-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-cyan-600" />
            </div>
          )}

          {stations.length > 0 && (
            <div className="mt-4 text-left">
              <h2 className="text-2xl font-bold text-center text-slate-700">
                Nearby Stations
              </h2>
              <ul className="mt-4 space-y-3">
                {stations.map((station) => (
                  <li
                    key={station.id}
                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-500 hover:shadow-md"
                  >
                    <p className="font-semibold text-slate-800">
                      {station.name}
                    </p>
                    <p className="text-sm text-slate-500">ID: {station.id}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
