'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { FaEdit, FaSave, FaTimes, FaUser, FaMapMarkerAlt, FaCog } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { GET_USER_PROFILE, CREATE_USER_PROFILE, UPDATE_USER_PROFILE } from '../../../lib/graphql/profileOperations';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';

interface UserProfileData {
  userProfile: {
    userSub: string;
    email?: string;
    zipCode?: string;
    dashboardPreferences: {
      favoriteStationsOrder?: string[];
      dashboardStationLimit?: number;
      displayUnits?: 'METRIC' | 'IMPERIAL';
    };
    createdAt: string;
    updatedAt: string;
  } | null;
}

interface ProfileFormData {
  email: string;
  zipCode: string;
  dashboardStationLimit: number;
  displayUnits: 'METRIC' | 'IMPERIAL';
}

export function UserProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    email: '',
    zipCode: '',
    dashboardStationLimit: 5,
    displayUnits: 'IMPERIAL',
  });

  const { data, loading, error, refetch } = useQuery<UserProfileData>(GET_USER_PROFILE, {
    variables: { userSub: user?.userSub },
    skip: !user?.userSub,
    onCompleted: (data) => {
      if (data.userProfile) {
        setFormData({
          email: data.userProfile.email || user?.email || '',
          zipCode: data.userProfile.zipCode || '',
          dashboardStationLimit: data.userProfile.dashboardPreferences.dashboardStationLimit || 5,
          displayUnits: data.userProfile.dashboardPreferences.displayUnits || 'IMPERIAL',
        });
      } else if (user) {
        // Profile doesn't exist, set defaults from auth
        setFormData({
          email: user.email,
          zipCode: '',
          dashboardStationLimit: 5,
          displayUnits: 'IMPERIAL',
        });
      }
    },
  });

  const [createProfile] = useMutation(CREATE_USER_PROFILE);
  const [updateProfile] = useMutation(UPDATE_USER_PROFILE);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert
          variant="warning"
          message="Please sign in to view your profile."
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 flex justify-center">
        <LoadingSpinner size="lg" variant="dark" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert
          variant="error"
          message={`Error loading profile: ${error.message}`}
        />
      </div>
    );
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
    if (data?.userProfile) {
      setFormData({
        email: data.userProfile.email || user.email,
        zipCode: data.userProfile.zipCode || '',
        dashboardStationLimit: data.userProfile.dashboardPreferences.dashboardStationLimit || 5,
        displayUnits: data.userProfile.dashboardPreferences.displayUnits || 'IMPERIAL',
      });
    }
  };

  const handleSave = async () => {
    try {
      const input = {
        userSub: user.userSub,
        email: formData.email,
        zipCode: formData.zipCode,
        dashboardPreferences: {
          dashboardStationLimit: formData.dashboardStationLimit,
          displayUnits: formData.displayUnits,
        },
      };

      if (data?.userProfile) {
        await updateProfile({ variables: { input } });
      } else {
        await createProfile({ variables: { input } });
      }

      await refetch();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const profile = data?.userProfile;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FaUser className="text-2xl text-emerald-400" />
            <h1 className="text-2xl font-bold text-stone-100">User Profile</h1>
          </div>
          {!isEditing ? (
            <Button
              onClick={handleEdit}
              size="md"
              className="flex items-center space-x-2"
            >
              <FaEdit />
              <span>Edit</span>
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                variant="success"
                size="md"
                className="flex items-center space-x-2"
              >
                <FaSave />
                <span>Save</span>
              </Button>
              <Button
                onClick={handleCancel}
                variant="secondary"
                size="md"
                className="flex items-center space-x-2"
              >
                <FaTimes />
                <span>Cancel</span>
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-stone-100 mb-4 flex items-center">
              <FaUser className="mr-2 text-emerald-400" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {isEditing ? (
                  <TextInput
                    type="email"
                    label="Email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    inputSize="md"
                  />
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1">
                      Email
                    </label>
                    <p className="text-stone-200 py-2">{profile?.email || user.email}</p>
                  </div>
                )}
              </div>
              <div>
                {isEditing ? (
                  <TextInput
                    type="text"
                    label="ZIP Code"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="Enter ZIP code"
                    inputSize="md"
                  />
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1">
                      ZIP Code
                    </label>
                    <p className="text-stone-200 py-2 flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-stone-400" />
                      {profile?.zipCode || 'Not set'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dashboard Preferences */}
          <div>
            <h2 className="text-lg font-semibold text-stone-100 mb-4 flex items-center">
              <FaCog className="mr-2 text-emerald-400" />
              Dashboard Preferences
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">
                  Station Limit
                </label>
                {isEditing ? (
                  <select
                    value={formData.dashboardStationLimit}
                    onChange={(e) => handleInputChange('dashboardStationLimit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-emerald-700/40 rounded-md text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                  >
                    <option value={3}>3 stations</option>
                    <option value={5}>5 stations</option>
                    <option value={10}>10 stations</option>
                    <option value={15}>15 stations</option>
                  </select>
                ) : (
                  <p className="text-stone-200 py-2">
                    {profile?.dashboardPreferences.dashboardStationLimit || 5} stations
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">
                  Display Units
                </label>
                {isEditing ? (
                  <select
                    value={formData.displayUnits}
                    onChange={(e) => handleInputChange('displayUnits', e.target.value as 'METRIC' | 'IMPERIAL')}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-emerald-700/40 rounded-md text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                  >
                    <option value="IMPERIAL">Imperial (ft, °F)</option>
                    <option value="METRIC">Metric (m, °C)</option>
                  </select>
                ) : (
                  <p className="text-stone-200 py-2">
                    {profile?.dashboardPreferences.displayUnits === 'METRIC' ? 'Metric (m, °C)' : 'Imperial (ft, °F)'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Status */}
          {profile && (
            <div className="pt-4 border-t border-emerald-700/30">
              <div className="text-sm text-stone-400">
                <p>Profile created: {new Date(profile.createdAt).toLocaleDateString()}</p>
                <p>Last updated: {new Date(profile.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}