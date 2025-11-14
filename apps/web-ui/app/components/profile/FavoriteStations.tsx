'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { FaStar, FaTrash, FaPlus, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { GET_FAVORITE_STATIONS, ADD_FAVORITE_STATION, REMOVE_FAVORITE_STATION } from '../../../lib/graphql/profileOperations';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';

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
      <div className="bg-amber-900/30 border border-amber-600/40 rounded-lg p-4 backdrop-blur-sm">
        <p className="text-amber-200">Please sign in to view your favorite stations.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner size="md" variant="dark" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="error"
        message={`Error loading favorite stations: ${error.message}`}
      />
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
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FaStar className="text-2xl text-amber-400" />
          <h2 className="text-xl font-bold text-stone-100">Favorite Stations</h2>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          size="md"
          className="flex items-center space-x-2"
        >
          <FaPlus />
          <span>Add Station</span>
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-slate-700/30 rounded-lg border border-emerald-700/30">
          <h3 className="text-lg font-semibold text-stone-100 mb-4">Add New Favorite Station</h3>
          <form onSubmit={handleAddStation} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                type="text"
                label="Station ID *"
                value={newStation.stationId}
                onChange={(e) => setNewStation(prev => ({ ...prev, stationId: e.target.value }))}
                placeholder="e.g., 12345678"
                required
                inputSize="md"
              />
              <TextInput
                type="text"
                label="Station Name *"
                value={newStation.stationName}
                onChange={(e) => setNewStation(prev => ({ ...prev, stationName: e.target.value }))}
                placeholder="e.g., Colorado River at Austin"
                required
                inputSize="md"
              />
              <TextInput
                type="number"
                label="Latitude"
                value={newStation.lat}
                onChange={(e) => setNewStation(prev => ({ ...prev, lat: e.target.value }))}
                placeholder="30.123456"
                inputSize="md"
              />
              <TextInput
                type="number"
                label="Longitude"
                value={newStation.lon}
                onChange={(e) => setNewStation(prev => ({ ...prev, lon: e.target.value }))}
                placeholder="-97.123456"
                inputSize="md"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                onClick={() => setShowAddForm(false)}
                variant="secondary"
                size="md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={addingStation}
                variant="success"
                size="md"
              >
                Add Station
              </Button>
            </div>
          </form>
        </div>
      )}

      {stations.length === 0 ? (
        <div className="text-center py-12">
          <FaStar className="mx-auto text-6xl text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-stone-100 mb-2">No favorite stations yet</h3>
          <p className="text-stone-300 mb-4">Add your first favorite station to get started!</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-700 text-white rounded-md hover:from-orange-500 hover:to-amber-600 transition-all shadow-lg"
          >
            Add Your First Station
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {stations.map((station) => (
            <div
              key={station.stationId}
              className="flex items-center justify-between p-4 border border-emerald-700/40 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <FaStar className="text-amber-400" />
                  <div>
                    <h4 className="font-medium text-stone-100">{station.stationName}</h4>
                    <p className="text-sm text-stone-400">ID: {station.stationId}</p>
                  </div>
                </div>
                {(station.lat || station.lon) && (
                  <div className="mt-2 flex items-center text-sm text-stone-300">
                    <FaMapMarkerAlt className="mr-1" />
                    <span>
                      {station.lat?.toFixed(4)}, {station.lon?.toFixed(4)}
                    </span>
                  </div>
                )}
                <p className="text-xs text-stone-400 mt-1">
                  Added: {new Date(station.dateAdded).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleRemoveStation(station.stationId)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-colors"
                title="Remove from favorites"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}