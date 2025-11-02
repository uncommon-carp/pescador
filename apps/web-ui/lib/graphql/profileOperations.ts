import { gql } from '@apollo/client';

export const GET_USER_PROFILE = gql`
  query GetUserProfile($userSub: String!) {
    userProfile(userSub: $userSub) {
      userSub
      email
      zipCode
      dashboardPreferences {
        favoriteStationsOrder
        dashboardStationLimit
        displayUnits
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_USER_PROFILE = gql`
  mutation CreateUserProfile($input: CreateUserProfileInput!) {
    createUserProfile(input: $input) {
      success
      message
    }
  }
`;

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      success
      message
    }
  }
`;

export const GET_FAVORITE_STATIONS = gql`
  query GetFavoriteStations($userSub: String!) {
    favoriteStations(userSub: $userSub) {
      stationId
      stationName
      lat
      lon
      dateAdded
    }
  }
`;

export const ADD_FAVORITE_STATION = gql`
  mutation AddFavoriteStation($input: AddFavoriteStationInput!) {
    addFavoriteStation(input: $input) {
      success
      message
    }
  }
`;

export const REMOVE_FAVORITE_STATION = gql`
  mutation RemoveFavoriteStation($input: RemoveFavoriteStationInput!) {
    removeFavoriteStation(input: $input) {
      success
      message
    }
  }
`;