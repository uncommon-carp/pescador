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
import { convertDisplayUnitsToService, convertDisplayUnitsToGraphQL } from '../utils/displayUnitsConverter';
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

  const serviceInput: ServiceCreateUserProfileInput = {
    userSub: input.userSub,
    email: input.email ?? undefined,
    zipCode: input.zipCode ?? undefined,
    dashboardPreferences: input.dashboardPreferences ? {
      favoriteStationsOrder: input.dashboardPreferences.favoriteStationsOrder ?? undefined,
      dashboardStationLimit: input.dashboardPreferences.dashboardStationLimit ?? undefined,
      displayUnits: convertDisplayUnitsToService(input.dashboardPreferences.displayUnits),
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
    const serviceInput: ServiceUpdateUserProfileInput = {
      userSub: input.userSub,
      email: input.email ?? undefined,
      zipCode: input.zipCode ?? undefined,
      dashboardPreferences: input.dashboardPreferences ? {
        favoriteStationsOrder: input.dashboardPreferences.favoriteStationsOrder ?? undefined,
        dashboardStationLimit: input.dashboardPreferences.dashboardStationLimit ?? undefined,
        displayUnits: convertDisplayUnitsToService(input.dashboardPreferences.displayUnits),
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

  return {
    userSub: serviceResp.profile.userSub,
    email: serviceResp.profile.email ?? null,
    zipCode: serviceResp.profile.zipCode ?? null,
    dashboardPreferences: {
      favoriteStationsOrder: serviceResp.profile.dashboardPreferences.favoriteStationsOrder ?? null,
      dashboardStationLimit: serviceResp.profile.dashboardPreferences.dashboardStationLimit ?? null,
      displayUnits: convertDisplayUnitsToGraphQL(serviceResp.profile.dashboardPreferences.displayUnits),
    },
    createdAt: serviceResp.profile.createdAt,
    updatedAt: serviceResp.profile.updatedAt,
  };
};