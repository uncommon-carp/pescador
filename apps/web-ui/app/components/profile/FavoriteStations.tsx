'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { FaStar, FaTrash, FaPlus, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { GET_FAVORITE_STATIONS, ADD_FAVORITE_STATION, REMOVE_FAVORITE_STATION } from '../../../lib/graphql/profileOperations';

interface FavoriteStation {
  stationId: string;
  stationName: string;
  lat?: number;
  lon?: number;
  dateAdded: string;
}

interface FavoriteStationsData {
  favoriteStations: FavoriteStation[];
}

export function FavoriteStations() {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStation, setNewStation] = useState({
    stationId: '',
    stationName: '',
    lat: '',
    lon: '',
  });

  const { data, loading, error, refetch } = useQuery<FavoriteStationsData>(GET_FAVORITE_STATIONS, {
    variables: { userSub: user?.userSub },
    skip: !user?.userSub,
  });

  const [addStation, { loading: addingStation }] = useMutation(ADD_FAVORITE_STATION, {
    onCompleted: () => {
      setShowAddForm(false);
      setNewStation({ stationId: '', stationName: '', lat: '', lon: '' });
      refetch();
    },
  });

  const [removeStation] = useMutation(REMOVE_FAVORITE_STATION, {
    onCompleted: () => {
      refetch();
    },
  });

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Please sign in to view your favorite stations.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading favorite stations: {error.message}</p>
      </div>
    );
  }

  const handleAddStation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStation.stationId || !newStation.stationName) return;

    try {
      await addStation({
        variables: {
          input: {
            userSub: user.userSub,
            stationId: newStation.stationId,
            stationName: newStation.stationName,
            lat: newStation.lat ? parseFloat(newStation.lat) : undefined,
            lon: newStation.lon ? parseFloat(newStation.lon) : undefined,
          },
        },
      });
    } catch (error) {
      console.error('Error adding station:', error);
    }
  };

  const handleRemoveStation = async (stationId: string) => {
    if (!confirm('Are you sure you want to remove this station from your favorites?')) return;

    try {
      await removeStation({
        variables: {
          input: {
            userSub: user.userSub,
            stationId,
          },
        },
      });
    } catch (error) {
      console.error('Error removing station:', error);
    }
  };

  const stations = data?.favoriteStations || [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FaStar className="text-2xl text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-900">Favorite Stations</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
        >
          <FaPlus />
          <span>Add Station</span>
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Add New Favorite Station</h3>
          <form onSubmit={handleAddStation} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Station ID *
                </label>
                <input
                  type="text"
                  value={newStation.stationId}
                  onChange={(e) => setNewStation(prev => ({ ...prev, stationId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g., 12345678"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Station Name *
                </label>
                <input
                  type="text"
                  value={newStation.stationName}
                  onChange={(e) => setNewStation(prev => ({ ...prev, stationName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g., Colorado River at Austin"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={newStation.lat}
                  onChange={(e) => setNewStation(prev => ({ ...prev, lat: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="30.123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={newStation.lon}
                  onChange={(e) => setNewStation(prev => ({ ...prev, lon: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="-97.123456"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addingStation}
                className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors disabled:opacity-50"
              >
                {addingStation ? 'Adding...' : 'Add Station'}
              </button>
            </div>
          </form>
        </div>
      )}

      {stations.length === 0 ? (
        <div className="text-center py-12">
          <FaStar className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite stations yet</h3>
          <p className="text-gray-500 mb-4">Add your first favorite station to get started!</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
          >
            Add Your First Station
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {stations.map((station) => (
            <div
              key={station.stationId}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <FaStar className="text-yellow-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">{station.stationName}</h4>
                    <p className="text-sm text-gray-500">ID: {station.stationId}</p>
                  </div>
                </div>
                {(station.lat || station.lon) && (
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <FaMapMarkerAlt className="mr-1" />
                    <span>
                      {station.lat?.toFixed(4)}, {station.lon?.toFixed(4)}
                    </span>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Added: {new Date(station.dateAdded).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleRemoveStation(station.stationId)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                title="Remove from favorites"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}