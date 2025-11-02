import {
  addFavoriteStationResolver,
  removeFavoriteStationResolver,
  getFavoriteStationsResolver,
} from './stations';
import { invokeServiceFunction } from '../utils';
import {
  AddFavoriteStationInput,
  RemoveFavoriteStationInput,
  StationOperationResult,
  ServiceStationOperationResult,
  GetFavoriteStationsResult,
} from '@pescador/libs';

// Mock the invokeServiceFunction utility
jest.mock('../utils', () => ({
  invokeServiceFunction: jest.fn(),
}));

const mockInvokeServiceFunction = jest.mocked(invokeServiceFunction);

describe('Stations Resolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addFavoriteStationResolver', () => {
    const mockInput: AddFavoriteStationInput = {
      userSub: 'user-123',
      stationId: 'station-456',
      stationName: 'Test Station',
      lat: 40.7128,
      lon: -74.0060,
    };

    it('should add favorite station successfully', async () => {
      // Arrange: Mock successful service response
      const mockServiceResponse: ServiceStationOperationResult = {
        success: true,
        message: 'Station added to favorites successfully',
      };
      mockInvokeServiceFunction.mockResolvedValue(mockServiceResponse);

      // Act: Call the resolver
      const result = await addFavoriteStationResolver(
        undefined,
        { input: mockInput }
      );

      // Assert: Check the result and service invocation
      expect(result).toEqual({
        success: true,
        message: 'Station added to favorites successfully',
      });
      expect(mockInvokeServiceFunction).toHaveBeenCalledWith(
        'pescador-stations',
        'addFavoriteStation',
        {
          userSub: 'user-123',
          stationId: 'station-456',
          stationName: 'Test Station',
          lat: 40.7128,
          lon: -74.0060,
        }
      );
      expect(mockInvokeServiceFunction).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      // Arrange: Mock service error
      const mockError = new Error('Service error');
      mockInvokeServiceFunction.mockRejectedValue(mockError);

      // Act & Assert: Expect the error to be thrown
      await expect(
        addFavoriteStationResolver(undefined, { input: mockInput })
      ).rejects.toThrow('Service error');

      expect(mockInvokeServiceFunction).toHaveBeenCalledWith(
        'pescador-stations',
        'addFavoriteStation',
        mockInput
      );
    });

    it('should handle input without coordinates', async () => {
      // Arrange: Input without lat/lon
      const inputWithoutCoords: AddFavoriteStationInput = {
        userSub: 'user-123',
        stationId: 'station-456',
        stationName: 'Test Station',
      };
      
      const mockResponse: StationOperationResult = {
        success: true,
        message: 'Station added to favorites successfully',
      };
      mockInvokeServiceFunction.mockResolvedValue(mockResponse);

      // Act
      const result = await addFavoriteStationResolver(
        undefined,
        { input: inputWithoutCoords }
      );

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockInvokeServiceFunction).toHaveBeenCalledWith(
        'pescador-stations',
        'addFavoriteStation',
        {
          userSub: 'user-123',
          stationId: 'station-456',
          stationName: 'Test Station',
          lat: null,
          lon: null,
        }
      );
    });
  });

  describe('removeFavoriteStationResolver', () => {
    const mockInput: RemoveFavoriteStationInput = {
      userSub: 'user-123',
      stationId: 'station-456',
    };

    it('should remove favorite station successfully', async () => {
      // Arrange: Mock successful service response
      const mockResponse: StationOperationResult = {
        success: true,
        message: 'Station removed from favorites successfully',
      };
      mockInvokeServiceFunction.mockResolvedValue(mockResponse);

      // Act: Call the resolver
      const result = await removeFavoriteStationResolver(
        undefined,
        { input: mockInput }
      );

      // Assert: Check the result and service invocation
      expect(result).toEqual(mockResponse);
      expect(mockInvokeServiceFunction).toHaveBeenCalledWith(
        'pescador-stations',
        'removeFavoriteStation',
        mockInput
      );
      expect(mockInvokeServiceFunction).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      // Arrange: Mock service error
      const mockError = new Error('Service error');
      mockInvokeServiceFunction.mockRejectedValue(mockError);

      // Act & Assert: Expect the error to be thrown
      await expect(
        removeFavoriteStationResolver(undefined, { input: mockInput })
      ).rejects.toThrow('Service error');

      expect(mockInvokeServiceFunction).toHaveBeenCalledWith(
        'pescador-stations',
        'removeFavoriteStation',
        mockInput
      );
    });

    it('should handle station not found scenario', async () => {
      // Arrange: Mock service response for station not found
      const mockResponse: StationOperationResult = {
        success: false,
        message: 'Station was not in favorites',
      };
      mockInvokeServiceFunction.mockResolvedValue(mockResponse);

      // Act
      const result = await removeFavoriteStationResolver(
        undefined,
        { input: mockInput }
      );

      // Assert
      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(false);
    });
  });

  describe('getFavoriteStationsResolver', () => {
    const userSub = 'user-123';

    it('should get favorite stations successfully', async () => {
      // Arrange: Mock successful service response
      const mockStations = [
        {
          stationId: 'station-456',
          stationName: 'Test Station 1',
          lat: 40.7128,
          lon: -74.0060,
          dateAdded: '2024-01-15T10:30:00.000Z',
        },
        {
          stationId: 'station-789',
          stationName: 'Test Station 2',
          lat: null,
          lon: null,
          dateAdded: '2024-01-16T11:30:00.000Z',
        },
      ];

      const mockResponse: GetFavoriteStationsResult = {
        stations: mockStations,
      };
      mockInvokeServiceFunction.mockResolvedValue(mockResponse);

      // Act: Call the resolver
      const result = await getFavoriteStationsResolver(
        undefined,
        { userSub }
      );

      // Assert: Check the result and service invocation
      expect(result).toEqual(mockStations);
      expect(mockInvokeServiceFunction).toHaveBeenCalledWith(
        'pescador-stations',
        'getFavoriteStations',
        { userSub }
      );
      expect(mockInvokeServiceFunction).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when user has no favorites', async () => {
      // Arrange: Mock empty service response
      const mockResponse: GetFavoriteStationsResult = {
        stations: [],
      };
      mockInvokeServiceFunction.mockResolvedValue(mockResponse);

      // Act
      const result = await getFavoriteStationsResolver(
        undefined,
        { userSub }
      );

      // Assert
      expect(result).toEqual([]);
      expect(mockInvokeServiceFunction).toHaveBeenCalledWith(
        'pescador-stations',
        'getFavoriteStations',
        { userSub }
      );
    });

    it('should handle service errors', async () => {
      // Arrange: Mock service error
      const mockError = new Error('Service error');
      mockInvokeServiceFunction.mockRejectedValue(mockError);

      // Act & Assert: Expect the error to be thrown
      await expect(
        getFavoriteStationsResolver(undefined, { userSub })
      ).rejects.toThrow('Service error');

      expect(mockInvokeServiceFunction).toHaveBeenCalledWith(
        'pescador-stations',
        'getFavoriteStations',
        { userSub }
      );
    });

    it('should handle stations with mixed coordinate data', async () => {
      // Arrange: Mock service response with mixed coordinate data
      const mockStations = [
        {
          stationId: 'station-1',
          stationName: 'Station with coords',
          lat: 40.7128,
          lon: -74.0060,
          dateAdded: '2024-01-15T10:30:00.000Z',
        },
        {
          stationId: 'station-2',
          stationName: 'Station without coords',
          lat: null,
          lon: null,
          dateAdded: '2024-01-16T11:30:00.000Z',
        },
        {
          stationId: 'station-3',
          stationName: 'Station with partial coords',
          lat: 40.7128,
          lon: null,
          dateAdded: '2024-01-17T12:30:00.000Z',
        },
      ];

      const mockResponse: GetFavoriteStationsResult = {
        stations: mockStations,
      };
      mockInvokeServiceFunction.mockResolvedValue(mockResponse);

      // Act
      const result = await getFavoriteStationsResolver(
        undefined,
        { userSub }
      );

      // Assert
      expect(result).toEqual(mockStations);
      expect(result).toHaveLength(3);
      
      // Verify coordinate handling
      expect(result[0].lat).toBe(40.7128);
      expect(result[0].lon).toBe(-74.0060);
      expect(result[1].lat).toBeNull();
      expect(result[1].lon).toBeNull();
      expect(result[2].lat).toBe(40.7128);
      expect(result[2].lon).toBeNull();
    });
  });

  describe('Resolver argument handling', () => {
    it('should handle undefined parent and context in addFavoriteStationResolver', async () => {
      // Arrange
      const mockInput: AddFavoriteStationInput = {
        userSub: 'user-123',
        stationId: 'station-456',
        stationName: 'Test Station',
      };
      
      const mockResponse: StationOperationResult = {
        success: true,
        message: 'Station added to favorites successfully',
      };
      mockInvokeServiceFunction.mockResolvedValue(mockResponse);

      // Act: Call with undefined parent (first argument)
      const result = await addFavoriteStationResolver(
        undefined,
        { input: mockInput }
      );

      // Assert
      expect(result).toEqual(mockResponse);
    });

    it('should handle different argument patterns consistently', async () => {
      // Arrange: Mock responses for all resolvers
      mockInvokeServiceFunction
        .mockResolvedValueOnce({ success: true, message: 'Added' })
        .mockResolvedValueOnce({ success: true, message: 'Removed' })
        .mockResolvedValueOnce({ stations: [] });

      // Act: Call all resolvers with consistent argument patterns
      const addResult = await addFavoriteStationResolver(
        undefined,
        { input: { userSub: 'user', stationId: 'station', stationName: 'name' } }
      );
      
      const removeResult = await removeFavoriteStationResolver(
        undefined,
        { input: { userSub: 'user', stationId: 'station' } }
      );
      
      const getResult = await getFavoriteStationsResolver(
        undefined,
        { userSub: 'user' }
      );

      // Assert: All should work with the same argument pattern
      expect(addResult.success).toBe(true);
      expect(removeResult.success).toBe(true);
      expect(getResult).toEqual([]);
      expect(mockInvokeServiceFunction).toHaveBeenCalledTimes(3);
    });
  });
});