'use client';

import { Header } from './components/ui/Header';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#2a3941] text-white flex flex-col items-center">
      <Header />
      <header
        className="w-full text-center py-40 bg-[#496e6e] bg-cover bg-center relative"
        style={{ backgroundImage: 'url(\'/images/hero-back.webp\')' }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-65"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-bold">Always Be Prepared</h1>
          <p className="text-lg mt-4">
            Real-time weather and water conditions at your fingertips
          </p>
          <div className="mt-6">
            <input
              type="text"
              placeholder="Enter zip, county, or address..."
              className="p-3 rounded-l bg-white text-black w-64"
            />
            <button className="p-3 bg-[#a1d9d2] text-black rounded-r">
              Search
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-3xl text-center mt-16 px-4">
        <h2 className="text-3xl font-semibold">How It Works</h2>
        <p className="mt-4 text-lg">
          Enter a location to get up-to-date water and weather conditions. Sign
          up to save your favorite spots and log your trips.
        </p>
        <button className="mt-4 px-6 py-3 bg-[#a1d9d2] text-black rounded">
          Sign Up
        </button>
      </section>
    </div>
  );
}
