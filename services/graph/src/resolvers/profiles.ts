import {
  CreateUserProfileFunction,
  UpdateUserProfileFunction,
  GetUserProfileFunction,
  CreateUserProfileInput as ServiceCreateUserProfileInput,
  UpdateUserProfileInput as ServiceUpdateUserProfileInput,
  GetUserProfileInput,
  ServiceProfileOperationResult,
  GetUserProfileResult,
} from '@pescador/libs';
import { invokeServiceFunction } from '../utils';

interface GraphQLContext {
  authorization?: string;
}

// GraphQL types (should match the schema)
interface CreateUserProfileInput {
  userSub: string;
  email?: string;
  zipCode?: string;
  dashboardPreferences?: DashboardPreferencesInput;
}

interface UpdateUserProfileInput {
  userSub: string;
  email?: string;
  zipCode?: string;
  dashboardPreferences?: DashboardPreferencesInput;
}

interface DashboardPreferencesInput {
  favoriteStationsOrder?: string[];
  dashboardStationLimit?: number;
  displayUnits?: 'METRIC' | 'IMPERIAL';
}

interface ProfileOperationResult {
  success: boolean;
  message?: string | null;
}

interface UserProfile {
  userSub: string;
  email?: string | null;
  zipCode?: string | null;
  dashboardPreferences: DashboardPreferences;
  createdAt: string;
  updatedAt: string;
}

interface DashboardPreferences {
  favoriteStationsOrder?: string[] | null;
  dashboardStationLimit?: number | null;
  displayUnits?: 'METRIC' | 'IMPERIAL' | null;
}

export const createUserProfileResolver = async (
  _: unknown,
  { input }: { input: CreateUserProfileInput },
  context: GraphQLContext,
): Promise<ProfileOperationResult> => {
  if (!context.authorization) {
    throw new Error('Authorization header is required');
  }

  // Convert GraphQL input to service input
  const serviceInput: ServiceCreateUserProfileInput = {
    userSub: input.userSub,
    email: input.email,
    zipCode: input.zipCode,
    dashboardPreferences: input.dashboardPreferences ? {
      favoriteStationsOrder: input.dashboardPreferences.favoriteStationsOrder,
      dashboardStationLimit: input.dashboardPreferences.dashboardStationLimit,
      displayUnits: input.dashboardPreferences.displayUnits?.toLowerCase() as 'metric' | 'imperial',
    } : undefined,
    idToken: context.authorization,
  };

  const serviceResp = await invokeServiceFunction<CreateUserProfileFunction>(
    'pescador-profiles',
    'createUserProfile',
    serviceInput,
  );

  // Convert service response to GraphQL response
  return {
    success: serviceResp.success,
    message: serviceResp.message ?? null,
  };
};

export const updateUserProfileResolver = async (
  _: unknown,
  { input }: { input: UpdateUserProfileInput },
  context: GraphQLContext,
): Promise<ProfileOperationResult> => {
  if (!context.authorization) {
    throw new Error('Authorization header is required');
  }

  // Convert GraphQL input to service input
  const serviceInput: ServiceUpdateUserProfileInput = {
    userSub: input.userSub,
    email: input.email,
    zipCode: input.zipCode,
    dashboardPreferences: input.dashboardPreferences ? {
      favoriteStationsOrder: input.dashboardPreferences.favoriteStationsOrder,
      dashboardStationLimit: input.dashboardPreferences.dashboardStationLimit,
      displayUnits: input.dashboardPreferences.displayUnits?.toLowerCase() as 'metric' | 'imperial',
    } : undefined,
    idToken: context.authorization,
  };

  const serviceResp = await invokeServiceFunction<UpdateUserProfileFunction>(
    'pescador-profiles',
    'updateUserProfile',
    serviceInput,
  );

  // Convert service response to GraphQL response
  return {
    success: serviceResp.success,
    message: serviceResp.message ?? null,
  };
};

export const getUserProfileResolver = async (
  _: unknown,
  { userSub }: { userSub: string },
  context: GraphQLContext,
): Promise<UserProfile | null> => {
  if (!context.authorization) {
    throw new Error('Authorization header is required');
  }

  const input: GetUserProfileInput = { 
    userSub,
    idToken: context.authorization,
  };
  
  const serviceResp = await invokeServiceFunction<GetUserProfileFunction>(
    'pescador-profiles',
    'getUserProfile',
    input,
  );

  if (!serviceResp.profile) {
    return null;
  }

  // Convert service response to GraphQL response
  return {
    userSub: serviceResp.profile.userSub,
    email: serviceResp.profile.email ?? null,
    zipCode: serviceResp.profile.zipCode ?? null,
    dashboardPreferences: {
      favoriteStationsOrder: serviceResp.profile.dashboardPreferences.favoriteStationsOrder ?? null,
      dashboardStationLimit: serviceResp.profile.dashboardPreferences.dashboardStationLimit ?? null,
      displayUnits: serviceResp.profile.dashboardPreferences.displayUnits?.toUpperCase() as 'METRIC' | 'IMPERIAL' ?? null,
    },
    createdAt: serviceResp.profile.createdAt,
    updatedAt: serviceResp.profile.updatedAt,
  };
};