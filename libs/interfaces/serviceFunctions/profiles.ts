export interface DashboardPreferences {
  favoriteStationsOrder?: string[];
  dashboardStationLimit?: number;
  displayUnits?: 'metric' | 'imperial';
}

export interface ServiceUserProfile {
  userSub: string;
  email?: string;
  zipCode?: string;
  dashboardPreferences: DashboardPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserProfileInput {
  userSub: string;
  email?: string;
  zipCode?: string;
  dashboardPreferences?: DashboardPreferences;
  idToken: string;
}

export interface UpdateUserProfileInput {
  userSub: string;
  email?: string;
  zipCode?: string;
  dashboardPreferences?: DashboardPreferences;
  idToken: string;
}

export interface GetUserProfileInput {
  userSub: string;
  idToken: string;
}

export interface ServiceProfileOperationResult {
  success: boolean;
  message?: string;
}

export interface GetUserProfileResult {
  profile: ServiceUserProfile | null;
}

export interface CreateUserProfileFunction {
  serviceName: 'pescador-profiles';
  functionName: 'createUserProfile';
  input: CreateUserProfileInput;
  output: ServiceProfileOperationResult;
}

export interface UpdateUserProfileFunction {
  serviceName: 'pescador-profiles';
  functionName: 'updateUserProfile';
  input: UpdateUserProfileInput;
  output: ServiceProfileOperationResult;
}

export interface GetUserProfileFunction {
  serviceName: 'pescador-profiles';
  functionName: 'getUserProfile';
  input: GetUserProfileInput;
  output: GetUserProfileResult;
}