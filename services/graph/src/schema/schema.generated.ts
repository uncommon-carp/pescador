export const typeDefs = `#graphql
  scalar DateTime

type Query {
  hello: String
  user: User
  userProfile(userSub: String!): UserProfile
  station(id: String!, range: Int!): StationWithRange
  bulkStation(zip: String!): BulkStation
  weather(zip: String!): CurrentWeather
  favoriteStations(userSub: String!): [FavoriteStation!]!
  fuzzySearch: FuzzySearchResult
}

type Mutation {
  addFavoriteStation(input: AddFavoriteStationInput!): StationOperationResult!
  removeFavoriteStation(input: RemoveFavoriteStationInput!): StationOperationResult!
  createUserProfile(input: CreateUserProfileInput!): ProfileOperationResult!
  updateUserProfile(input: UpdateUserProfileInput!): ProfileOperationResult!
}

interface Station {
  name: String!
  usgsId: String!
  lat: Float
  lon: Float
}

type StationWithRange implements Station {
  name: String!
  usgsId: String!
  lat: Float
  lon: Float
  values: ReportedValues
}

type SingleStation implements Station {
  name: String!
  usgsId: String!
  lat: Float
  lon: Float
  gageHt: Float
  flowRate: Float
}

type MapQuestCoords {
  lat: Float
  lng: Float
}

type MapQuestLocation {
  adminArea5: String
  adminArea4: String
  adminArea3: String
  latLng: MapQuestCoords
}

type MultiLocationResponse {
  type: String!
  options: [MapQuestLocation]
  lat: Float
  lon: Float
}

type BulkStation {
  streams: [SingleStation]
  lakes: [SingleStation]
}

union FuzzySearchResult = BulkStation | MultiLocationResponse

type ReportedValues {
  flow: [DataFrame]
  gage: [DataFrame]
  height: [DataFrame]
  temp: [DataFrame]
}

type DataFrame {
  timestamp: String
  value: Float
}

type CurrentWeather {
  temp: Float!
  wind: WindData
  pressure: Float!
  humidity: Float!
  clouds: String!
}

type WindData {
  speed: Float
  direction: String
  gust: Float
}

type User {
  email: String!
  zipCode: Int
}

type FavoriteStation {
  stationId: String!
  stationName: String!
  lat: Float
  lon: Float
  dateAdded: String!
}

input AddFavoriteStationInput {
  userSub: String!
  stationId: String!
  stationName: String!
  lat: Float
  lon: Float
}

input RemoveFavoriteStationInput {
  userSub: String!
  stationId: String!
}

type StationOperationResult {
  success: Boolean!
  message: String
}

type UserProfile {
  userSub: String!
  email: String
  zipCode: String
  dashboardPreferences: DashboardPreferences!
  createdAt: String!
  updatedAt: String!
}

type DashboardPreferences {
  favoriteStationsOrder: [String!]
  dashboardStationLimit: Int
  displayUnits: DisplayUnits
}

enum DisplayUnits {
  METRIC
  IMPERIAL
}

input CreateUserProfileInput {
  userSub: String!
  email: String
  zipCode: String
  dashboardPreferences: DashboardPreferencesInput
}

input UpdateUserProfileInput {
  userSub: String!
  email: String
  zipCode: String
  dashboardPreferences: DashboardPreferencesInput
}

input DashboardPreferencesInput {
  favoriteStationsOrder: [String!]
  dashboardStationLimit: Int
  displayUnits: DisplayUnits
}

type ProfileOperationResult {
  success: Boolean!
  message: String
}
`;
