'use client';

import { UserProfile } from '../components/profile/UserProfile';
import { FavoriteStations } from '../components/profile/FavoriteStations';
import { Header } from '../components/ui/Header';

export default function ProfilePage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-blue-900 animate-gradient-x">
        <main className="container mx-auto py-8 px-4 space-y-8 max-w-6xl">
          <UserProfile />
          <FavoriteStations />
        </main>
      </div>
    </>
  );
}