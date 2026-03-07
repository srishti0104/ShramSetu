/**
 * Amazon Location Service
 * 
 * Handles geospatial operations for job search and location-based features
 */

import { LocationClient, SearchPlaceIndexForTextCommand, CalculateRouteCommand } from '@aws-sdk/client-location';

class LocationService {
  constructor() {
    this.client = new LocationClient({
      region: import.meta.env.VITE_AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
      }
    });

    // These will be created by CDK
    this.placeIndexName = 'ShramSetuPlaceIndex';
    this.routeCalculatorName = 'ShramSetuRouteCalculator';
  }

  /**
   * Search for places by text query
   * @param {string} query - Search query (e.g., "Mumbai, Maharashtra")
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchPlaces(query, options = {}) {
    try {
      const command = new SearchPlaceIndexForTextCommand({
        IndexName: this.placeIndexName,
        Text: query,
        MaxResults: options.maxResults || 10,
        BiasPosition: options.biasPosition || undefined, // [longitude, latitude]
        FilterCountries: ['IND'] // Limit to India
      });

      const response = await this.client.send(command);

      const places = response.Results.map(result => ({
        label: result.Place.Label,
        address: result.Place.AddressNumber 
          ? `${result.Place.AddressNumber} ${result.Place.Street}` 
          : result.Place.Street,
        city: result.Place.Municipality,
        state: result.Place.Region,
        postalCode: result.Place.PostalCode,
        country: result.Place.Country,
        coordinates: {
          latitude: result.Place.Geometry.Point[1],
          longitude: result.Place.Geometry.Point[0]
        },
        relevance: result.Relevance
      }));

      console.log('✅ Places found:', places.length);

      return {
        success: true,
        places,
        count: places.length
      };
    } catch (error) {
      console.error('❌ Place search error:', error);
      throw new Error(`Failed to search places: ${error.message}`);
    }
  }

  /**
   * Calculate distance between two points
   * @param {Object} origin - Origin coordinates {latitude, longitude}
   * @param {Object} destination - Destination coordinates {latitude, longitude}
   * @returns {Promise<Object>} Route information with distance and duration
   */
  async calculateRoute(origin, destination) {
    try {
      const command = new CalculateRouteCommand({
        CalculatorName: this.routeCalculatorName,
        DeparturePosition: [origin.longitude, origin.latitude],
        DestinationPosition: [destination.longitude, destination.latitude],
        TravelMode: 'Walking', // Options: Car, Truck, Walking
        DistanceUnit: 'Kilometers'
      });

      const response = await this.client.send(command);

      const leg = response.Legs[0];
      const summary = response.Summary;

      console.log('✅ Route calculated:', summary.Distance, 'km');

      return {
        success: true,
        distance: summary.Distance, // in kilometers
        duration: summary.DurationSeconds, // in seconds
        durationMinutes: Math.round(summary.DurationSeconds / 60),
        route: {
          startPosition: leg.StartPosition,
          endPosition: leg.EndPosition,
          steps: leg.Steps.map(step => ({
            distance: step.Distance,
            duration: step.DurationSeconds,
            startPosition: step.StartPosition,
            endPosition: step.EndPosition
          }))
        }
      };
    } catch (error) {
      console.error('❌ Route calculation error:', error);
      throw new Error(`Failed to calculate route: ${error.message}`);
    }
  }

  /**
   * Calculate distance using Haversine formula (fallback method)
   * @param {Object} point1 - First point {latitude, longitude}
   * @param {Object} point2 - Second point {latitude, longitude}
   * @returns {number} Distance in kilometers
   */
  calculateHaversineDistance(point1, point2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) *
      Math.cos(this.toRadians(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees
   * @returns {number} Radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find jobs within radius
   * @param {Object} userLocation - User's location {latitude, longitude}
   * @param {Array} jobs - Array of job objects with location
   * @param {number} radiusKm - Search radius in kilometers
   * @returns {Array} Filtered jobs within radius
   */
  findJobsWithinRadius(userLocation, jobs, radiusKm = 10) {
    return jobs
      .map(job => {
        const distance = this.calculateHaversineDistance(
          userLocation,
          job.location.coordinates
        );

        return {
          ...job,
          distance,
          withinRadius: distance <= radiusKm
        };
      })
      .filter(job => job.withinRadius)
      .sort((a, b) => a.distance - b.distance); // Sort by distance
  }

  /**
   * Get user's current location using browser geolocation
   * @returns {Promise<Object>} User's coordinates
   */
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        error => {
          reject(new Error(`Failed to get location: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  /**
   * Format distance for display
   * @param {number} distanceKm - Distance in kilometers
   * @returns {string} Formatted distance string
   */
  formatDistance(distanceKm) {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`;
    } else {
      return `${distanceKm.toFixed(1)} km`;
    }
  }

  /**
   * Get major Indian cities with coordinates, including Jharkhand cities
   * @returns {Array} List of major cities
   */
  getMajorCities() {
    return [
      // Major Indian cities
      { name: 'Mumbai', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
      { name: 'Delhi', state: 'Delhi', latitude: 28.7041, longitude: 77.1025 },
      { name: 'Bangalore', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
      { name: 'Hyderabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867 },
      { name: 'Chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
      { name: 'Kolkata', state: 'West Bengal', latitude: 22.5726, longitude: 88.3639 },
      { name: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
      { name: 'Ahmedabad', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714 },
      { name: 'Jaipur', state: 'Rajasthan', latitude: 26.9124, longitude: 75.7873 },
      { name: 'Lucknow', state: 'Uttar Pradesh', latitude: 26.8467, longitude: 80.9462 },
      
      // Jharkhand cities
      { name: 'Jamshedpur', state: 'Jharkhand', latitude: 22.8046, longitude: 86.2029 },
      { name: 'Ranchi', state: 'Jharkhand', latitude: 23.3441, longitude: 85.3096 },
      { name: 'Dhanbad', state: 'Jharkhand', latitude: 23.7957, longitude: 86.4304 },
      { name: 'Bokaro', state: 'Jharkhand', latitude: 23.6693, longitude: 85.9606 },
      { name: 'Deoghar', state: 'Jharkhand', latitude: 24.4823, longitude: 86.6961 },
      { name: 'Hazaribagh', state: 'Jharkhand', latitude: 23.9929, longitude: 85.3647 },
      { name: 'Giridih', state: 'Jharkhand', latitude: 24.1901, longitude: 86.3009 },
      { name: 'Ramgarh', state: 'Jharkhand', latitude: 23.6315, longitude: 85.5197 },
      { name: 'Medininagar', state: 'Jharkhand', latitude: 24.0174, longitude: 84.0736 },
      { name: 'Chatra', state: 'Jharkhand', latitude: 24.2069, longitude: 84.8728 }
    ];
  }
}

export default new LocationService();
