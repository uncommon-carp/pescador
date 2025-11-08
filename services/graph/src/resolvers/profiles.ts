import {
  CreateUserProfileFunction,
  UpdateUserProfileFunction,
  GetUserProfileFunction,
  ServiceCreateUserProfileInput,
  ServiceUpdateUserProfileInput,
  ServiceGetUserProfileInput as GetUserProfileInput,
  ServiceProfileOperationResult,
  ServiceGetUserProfileResult as GetUserProfileResult,
} from '@pescador/libs';
import { invokeServiceFunction } from '../utils';
import type {
  CreateUserProfileInput,
  UpdateUserProfileInput,
  UserProfile,
  ProfileOperationResult,
} from '../../../../libs/interfaces/graph/types.generated';
import { DisplayUnits } from '../../../../libs/interfaces/graph/types.generated';

interface GraphQLContext {
  authorization?: string;
}

export const createUserProfileResolver = async (
  _: unknown,
  { input }: { input: CreateUserProfileInput },
  context: GraphQLContext,
): Promise<ProfileOperationResult> => {
  if (!context.authorization) {
    throw new Error('Authorization header is required');
  }

  // Convert GraphQL DisplayUnits enum to service string
  const convertDisplayUnits = (units?: DisplayUnits | null): 'metric' | 'imperial' | undefined => {
    if (!units) return undefined;
    return units === DisplayUnits.Metric ? 'metric' : 'imperial';
  };

  // Convert GraphQL input to service input
  const serviceInput: ServiceCreateUserProfileInput = {
    userSub: input.userSub,
    email: input.email ?? undefined,
    zipCode: input.zipCode ?? undefined,
    dashboardPreferences: input.dashboardPreferences ? {
      favoriteStationsOrder: input.dashboardPreferences.favoriteStationsOrder ?? undefined,
      dashboardStationLimit: input.dashboardPreferences.dashboardStationLimit ?? undefined,
      displayUnits: convertDisplayUnits(input.dashboardPreferences.displayUnits),
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

  try {
    // Convert GraphQL DisplayUnits enum to service string
    const convertDisplayUnits = (units?: DisplayUnits | null): 'metric' | 'imperial' | undefined => {
      if (!units) return undefined;
      return units === DisplayUnits.Metric ? 'metric' : 'imperial';
    };

    // Convert GraphQL input to service input
    const serviceInput: ServiceUpdateUserProfileInput = {
      userSub: input.userSub,
      email: input.email ?? undefined,
      zipCode: input.zipCode ?? undefined,
      dashboardPreferences: input.dashboardPreferences ? {
        favoriteStationsOrder: input.dashboardPreferences.favoriteStationsOrder ?? undefined,
        dashboardStationLimit: input.dashboardPreferences.dashboardStationLimit ?? undefined,
        displayUnits: convertDisplayUnits(input.dashboardPreferences.displayUnits),
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
      success: serviceResp?.success ?? false,
      message: serviceResp?.message ?? null,
    };
  } catch (error) {
    console.error('updateUserProfileResolver - error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
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

  // Convert service DisplayUnits string to GraphQL enum
  const convertToDisplayUnitsEnum = (units?: 'metric' | 'imperial'): DisplayUnits | null => {
    if (!units) return null;
    return units === 'metric' ? DisplayUnits.Metric : DisplayUnits.Imperial;
  };

  // Convert service response to GraphQL response
  return {
    userSub: serviceResp.profile.userSub,
    email: serviceResp.profile.email ?? null,
    zipCode: serviceResp.profile.zipCode ?? null,
    dashboardPreferences: {
      favoriteStationsOrder: serviceResp.profile.dashboardPreferences.favoriteStationsOrder ?? null,
      dashboardStationLimit: serviceResp.profile.dashboardPreferences.dashboardStationLimit ?? null,
      displayUnits: convertToDisplayUnitsEnum(serviceResp.profile.dashboardPreferences.displayUnits),
    },
    createdAt: serviceResp.profile.createdAt,
    updatedAt: serviceResp.profile.updatedAt,
  };
};