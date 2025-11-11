import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: Date; }
};

export type AddFavoriteStationInput = {
  lat?: InputMaybe<Scalars['Float']['input']>;
  lon?: InputMaybe<Scalars['Float']['input']>;
  stationId: Scalars['String']['input'];
  stationName: Scalars['String']['input'];
  userSub: Scalars['String']['input'];
};

export type BulkStation = {
  lakes?: Maybe<Array<Maybe<SingleStation>>>;
  streams?: Maybe<Array<Maybe<SingleStation>>>;
};

export type CreateUserProfileInput = {
  dashboardPreferences?: InputMaybe<DashboardPreferencesInput>;
  email?: InputMaybe<Scalars['String']['input']>;
  userSub: Scalars['String']['input'];
  zipCode?: InputMaybe<Scalars['String']['input']>;
};

export type CurrentWeather = {
  clouds: Scalars['String']['output'];
  humidity: Scalars['Float']['output'];
  pressure: Scalars['Float']['output'];
  temp: Scalars['Float']['output'];
  wind?: Maybe<WindData>;
};

export type DashboardPreferences = {
  dashboardStationLimit?: Maybe<Scalars['Int']['output']>;
  displayUnits?: Maybe<DisplayUnits>;
  favoriteStationsOrder?: Maybe<Array<Scalars['String']['output']>>;
};

export type DashboardPreferencesInput = {
  dashboardStationLimit?: InputMaybe<Scalars['Int']['input']>;
  displayUnits?: InputMaybe<DisplayUnits>;
  favoriteStationsOrder?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type DataFrame = {
  timestamp?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

export enum DisplayUnits {
  Imperial = 'IMPERIAL',
  Metric = 'METRIC'
}

export type FavoriteStation = {
  dateAdded: Scalars['String']['output'];
  lat?: Maybe<Scalars['Float']['output']>;
  lon?: Maybe<Scalars['Float']['output']>;
  stationId: Scalars['String']['output'];
  stationName: Scalars['String']['output'];
};

export type FuzzySearchResult = BulkStation | MultiLocationResponse;

export type MapQuestCoords = {
  lat?: Maybe<Scalars['Float']['output']>;
  lng?: Maybe<Scalars['Float']['output']>;
};

export type MapQuestLocation = {
  adminArea3?: Maybe<Scalars['String']['output']>;
  adminArea4?: Maybe<Scalars['String']['output']>;
  adminArea5?: Maybe<Scalars['String']['output']>;
  latLng?: Maybe<MapQuestCoords>;
};

export type MultiLocationResponse = {
  lat?: Maybe<Scalars['Float']['output']>;
  lon?: Maybe<Scalars['Float']['output']>;
  options?: Maybe<Array<Maybe<MapQuestLocation>>>;
  type: Scalars['String']['output'];
};

export type Mutation = {
  addFavoriteStation: StationOperationResult;
  createUserProfile: ProfileOperationResult;
  removeFavoriteStation: StationOperationResult;
  updateUserProfile: ProfileOperationResult;
};


export type MutationAddFavoriteStationArgs = {
  input: AddFavoriteStationInput;
};


export type MutationCreateUserProfileArgs = {
  input: CreateUserProfileInput;
};


export type MutationRemoveFavoriteStationArgs = {
  input: RemoveFavoriteStationInput;
};


export type MutationUpdateUserProfileArgs = {
  input: UpdateUserProfileInput;
};

export type ProfileOperationResult = {
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type Query = {
  bulkStation?: Maybe<BulkStation>;
  favoriteStations: Array<FavoriteStation>;
  fuzzySearch?: Maybe<FuzzySearchResult>;
  hello?: Maybe<Scalars['String']['output']>;
  station?: Maybe<StationWithRange>;
  user?: Maybe<User>;
  userProfile?: Maybe<UserProfile>;
  weather?: Maybe<CurrentWeather>;
};


export type QueryBulkStationArgs = {
  zip: Scalars['String']['input'];
};


export type QueryFavoriteStationsArgs = {
  userSub: Scalars['String']['input'];
};


export type QueryStationArgs = {
  id: Scalars['String']['input'];
  range: Scalars['Int']['input'];
};


export type QueryUserProfileArgs = {
  userSub: Scalars['String']['input'];
};


export type QueryWeatherArgs = {
  zip: Scalars['String']['input'];
};

export type RemoveFavoriteStationInput = {
  stationId: Scalars['String']['input'];
  userSub: Scalars['String']['input'];
};

export type ReportedValues = {
  flow?: Maybe<Array<Maybe<DataFrame>>>;
  gage?: Maybe<Array<Maybe<DataFrame>>>;
  height?: Maybe<Array<Maybe<DataFrame>>>;
  temp?: Maybe<Array<Maybe<DataFrame>>>;
};

export type SingleStation = Station & {
  flowRate?: Maybe<Scalars['Float']['output']>;
  gageHt?: Maybe<Scalars['Float']['output']>;
  lat?: Maybe<Scalars['Float']['output']>;
  lon?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  usgsId: Scalars['String']['output'];
};

export type Station = {
  lat?: Maybe<Scalars['Float']['output']>;
  lon?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  usgsId: Scalars['String']['output'];
};

export type StationOperationResult = {
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type StationWithRange = Station & {
  lat?: Maybe<Scalars['Float']['output']>;
  lon?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  usgsId: Scalars['String']['output'];
  values?: Maybe<ReportedValues>;
};

export type UpdateUserProfileInput = {
  dashboardPreferences?: InputMaybe<DashboardPreferencesInput>;
  email?: InputMaybe<Scalars['String']['input']>;
  userSub: Scalars['String']['input'];
  zipCode?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  email: Scalars['String']['output'];
  zipCode?: Maybe<Scalars['Int']['output']>;
};

export type UserProfile = {
  createdAt: Scalars['String']['output'];
  dashboardPreferences: DashboardPreferences;
  email?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
  userSub: Scalars['String']['output'];
  zipCode?: Maybe<Scalars['String']['output']>;
};

export type WindData = {
  direction?: Maybe<Scalars['String']['output']>;
  gust?: Maybe<Scalars['Float']['output']>;
  speed?: Maybe<Scalars['Float']['output']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping of union types */
export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
  FuzzySearchResult: ( BulkStation ) | ( MultiLocationResponse );
};

/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
  Station: ( SingleStation ) | ( StationWithRange );
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AddFavoriteStationInput: AddFavoriteStationInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  BulkStation: ResolverTypeWrapper<BulkStation>;
  CreateUserProfileInput: CreateUserProfileInput;
  CurrentWeather: ResolverTypeWrapper<CurrentWeather>;
  DashboardPreferences: ResolverTypeWrapper<DashboardPreferences>;
  DashboardPreferencesInput: DashboardPreferencesInput;
  DataFrame: ResolverTypeWrapper<DataFrame>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  DisplayUnits: DisplayUnits;
  FavoriteStation: ResolverTypeWrapper<FavoriteStation>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  FuzzySearchResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['FuzzySearchResult']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  MapQuestCoords: ResolverTypeWrapper<MapQuestCoords>;
  MapQuestLocation: ResolverTypeWrapper<MapQuestLocation>;
  MultiLocationResponse: ResolverTypeWrapper<MultiLocationResponse>;
  Mutation: ResolverTypeWrapper<{}>;
  ProfileOperationResult: ResolverTypeWrapper<ProfileOperationResult>;
  Query: ResolverTypeWrapper<{}>;
  RemoveFavoriteStationInput: RemoveFavoriteStationInput;
  ReportedValues: ResolverTypeWrapper<ReportedValues>;
  SingleStation: ResolverTypeWrapper<SingleStation>;
  Station: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Station']>;
  StationOperationResult: ResolverTypeWrapper<StationOperationResult>;
  StationWithRange: ResolverTypeWrapper<StationWithRange>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  UpdateUserProfileInput: UpdateUserProfileInput;
  User: ResolverTypeWrapper<User>;
  UserProfile: ResolverTypeWrapper<UserProfile>;
  WindData: ResolverTypeWrapper<WindData>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AddFavoriteStationInput: AddFavoriteStationInput;
  Boolean: Scalars['Boolean']['output'];
  BulkStation: BulkStation;
  CreateUserProfileInput: CreateUserProfileInput;
  CurrentWeather: CurrentWeather;
  DashboardPreferences: DashboardPreferences;
  DashboardPreferencesInput: DashboardPreferencesInput;
  DataFrame: DataFrame;
  DateTime: Scalars['DateTime']['output'];
  FavoriteStation: FavoriteStation;
  Float: Scalars['Float']['output'];
  FuzzySearchResult: ResolversUnionTypes<ResolversParentTypes>['FuzzySearchResult'];
  Int: Scalars['Int']['output'];
  MapQuestCoords: MapQuestCoords;
  MapQuestLocation: MapQuestLocation;
  MultiLocationResponse: MultiLocationResponse;
  Mutation: {};
  ProfileOperationResult: ProfileOperationResult;
  Query: {};
  RemoveFavoriteStationInput: RemoveFavoriteStationInput;
  ReportedValues: ReportedValues;
  SingleStation: SingleStation;
  Station: ResolversInterfaceTypes<ResolversParentTypes>['Station'];
  StationOperationResult: StationOperationResult;
  StationWithRange: StationWithRange;
  String: Scalars['String']['output'];
  UpdateUserProfileInput: UpdateUserProfileInput;
  User: User;
  UserProfile: UserProfile;
  WindData: WindData;
};

export type BulkStationResolvers<ContextType = any, ParentType extends ResolversParentTypes['BulkStation'] = ResolversParentTypes['BulkStation']> = {
  lakes?: Resolver<Maybe<Array<Maybe<ResolversTypes['SingleStation']>>>, ParentType, ContextType>;
  streams?: Resolver<Maybe<Array<Maybe<ResolversTypes['SingleStation']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CurrentWeatherResolvers<ContextType = any, ParentType extends ResolversParentTypes['CurrentWeather'] = ResolversParentTypes['CurrentWeather']> = {
  clouds?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  humidity?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  pressure?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  temp?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  wind?: Resolver<Maybe<ResolversTypes['WindData']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DashboardPreferencesResolvers<ContextType = any, ParentType extends ResolversParentTypes['DashboardPreferences'] = ResolversParentTypes['DashboardPreferences']> = {
  dashboardStationLimit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  displayUnits?: Resolver<Maybe<ResolversTypes['DisplayUnits']>, ParentType, ContextType>;
  favoriteStationsOrder?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DataFrameResolvers<ContextType = any, ParentType extends ResolversParentTypes['DataFrame'] = ResolversParentTypes['DataFrame']> = {
  timestamp?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  value?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type FavoriteStationResolvers<ContextType = any, ParentType extends ResolversParentTypes['FavoriteStation'] = ResolversParentTypes['FavoriteStation']> = {
  dateAdded?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lon?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  stationId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  stationName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FuzzySearchResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['FuzzySearchResult'] = ResolversParentTypes['FuzzySearchResult']> = {
  __resolveType: TypeResolveFn<'BulkStation' | 'MultiLocationResponse', ParentType, ContextType>;
};

export type MapQuestCoordsResolvers<ContextType = any, ParentType extends ResolversParentTypes['MapQuestCoords'] = ResolversParentTypes['MapQuestCoords']> = {
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lng?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MapQuestLocationResolvers<ContextType = any, ParentType extends ResolversParentTypes['MapQuestLocation'] = ResolversParentTypes['MapQuestLocation']> = {
  adminArea3?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  adminArea4?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  adminArea5?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  latLng?: Resolver<Maybe<ResolversTypes['MapQuestCoords']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MultiLocationResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['MultiLocationResponse'] = ResolversParentTypes['MultiLocationResponse']> = {
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lon?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  options?: Resolver<Maybe<Array<Maybe<ResolversTypes['MapQuestLocation']>>>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addFavoriteStation?: Resolver<ResolversTypes['StationOperationResult'], ParentType, ContextType, RequireFields<MutationAddFavoriteStationArgs, 'input'>>;
  createUserProfile?: Resolver<ResolversTypes['ProfileOperationResult'], ParentType, ContextType, RequireFields<MutationCreateUserProfileArgs, 'input'>>;
  removeFavoriteStation?: Resolver<ResolversTypes['StationOperationResult'], ParentType, ContextType, RequireFields<MutationRemoveFavoriteStationArgs, 'input'>>;
  updateUserProfile?: Resolver<ResolversTypes['ProfileOperationResult'], ParentType, ContextType, RequireFields<MutationUpdateUserProfileArgs, 'input'>>;
};

export type ProfileOperationResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProfileOperationResult'] = ResolversParentTypes['ProfileOperationResult']> = {
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  bulkStation?: Resolver<Maybe<ResolversTypes['BulkStation']>, ParentType, ContextType, RequireFields<QueryBulkStationArgs, 'zip'>>;
  favoriteStations?: Resolver<Array<ResolversTypes['FavoriteStation']>, ParentType, ContextType, RequireFields<QueryFavoriteStationsArgs, 'userSub'>>;
  fuzzySearch?: Resolver<Maybe<ResolversTypes['FuzzySearchResult']>, ParentType, ContextType>;
  hello?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  station?: Resolver<Maybe<ResolversTypes['StationWithRange']>, ParentType, ContextType, RequireFields<QueryStationArgs, 'id' | 'range'>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  userProfile?: Resolver<Maybe<ResolversTypes['UserProfile']>, ParentType, ContextType, RequireFields<QueryUserProfileArgs, 'userSub'>>;
  weather?: Resolver<Maybe<ResolversTypes['CurrentWeather']>, ParentType, ContextType, RequireFields<QueryWeatherArgs, 'zip'>>;
};

export type ReportedValuesResolvers<ContextType = any, ParentType extends ResolversParentTypes['ReportedValues'] = ResolversParentTypes['ReportedValues']> = {
  flow?: Resolver<Maybe<Array<Maybe<ResolversTypes['DataFrame']>>>, ParentType, ContextType>;
  gage?: Resolver<Maybe<Array<Maybe<ResolversTypes['DataFrame']>>>, ParentType, ContextType>;
  height?: Resolver<Maybe<Array<Maybe<ResolversTypes['DataFrame']>>>, ParentType, ContextType>;
  temp?: Resolver<Maybe<Array<Maybe<ResolversTypes['DataFrame']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SingleStationResolvers<ContextType = any, ParentType extends ResolversParentTypes['SingleStation'] = ResolversParentTypes['SingleStation']> = {
  flowRate?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  gageHt?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lon?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  usgsId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Station'] = ResolversParentTypes['Station']> = {
  __resolveType: TypeResolveFn<'SingleStation' | 'StationWithRange', ParentType, ContextType>;
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lon?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  usgsId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type StationOperationResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['StationOperationResult'] = ResolversParentTypes['StationOperationResult']> = {
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StationWithRangeResolvers<ContextType = any, ParentType extends ResolversParentTypes['StationWithRange'] = ResolversParentTypes['StationWithRange']> = {
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lon?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  usgsId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  values?: Resolver<Maybe<ResolversTypes['ReportedValues']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  zipCode?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserProfileResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserProfile'] = ResolversParentTypes['UserProfile']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dashboardPreferences?: Resolver<ResolversTypes['DashboardPreferences'], ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userSub?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  zipCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WindDataResolvers<ContextType = any, ParentType extends ResolversParentTypes['WindData'] = ResolversParentTypes['WindData']> = {
  direction?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  gust?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  speed?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  BulkStation?: BulkStationResolvers<ContextType>;
  CurrentWeather?: CurrentWeatherResolvers<ContextType>;
  DashboardPreferences?: DashboardPreferencesResolvers<ContextType>;
  DataFrame?: DataFrameResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  FavoriteStation?: FavoriteStationResolvers<ContextType>;
  FuzzySearchResult?: FuzzySearchResultResolvers<ContextType>;
  MapQuestCoords?: MapQuestCoordsResolvers<ContextType>;
  MapQuestLocation?: MapQuestLocationResolvers<ContextType>;
  MultiLocationResponse?: MultiLocationResponseResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  ProfileOperationResult?: ProfileOperationResultResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ReportedValues?: ReportedValuesResolvers<ContextType>;
  SingleStation?: SingleStationResolvers<ContextType>;
  Station?: StationResolvers<ContextType>;
  StationOperationResult?: StationOperationResultResolvers<ContextType>;
  StationWithRange?: StationWithRangeResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserProfile?: UserProfileResolvers<ContextType>;
  WindData?: WindDataResolvers<ContextType>;
};

