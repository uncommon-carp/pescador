'use client';

import { UserProfile } from '../components/profile/UserProfile';
import { FavoriteStations } from '../components/profile/FavoriteStations';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-8 space-y-8">
        <UserProfile />
        <FavoriteStations />
      </main>
    </div>
  );
}