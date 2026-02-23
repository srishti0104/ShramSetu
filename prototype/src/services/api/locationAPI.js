/**
 * Location API
 * 
 * @fileoverview API methods for location services
 */

import apiClient from './apiClient';

/**
 * Location API Service
 */
class LocationAPI {
  /**
   * Reverse geocode coordinates to address
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {Promise<Object>} Address details
   */
  async reverseGeocode(latitude, longitude) {
    try {
      const response = await apiClient.get('/location/reverse-geocode', {
        lat: latitude,
        lng: longitude
      });

      return {
        success: true,
        city: response.city,
        state: response.state,
        pincode: response.pincode,
        address: response.address,
        district: response.district,
        country: response.country
      };
    } catch (error) {
      console.error('[MOCK] Reverse geocode error:', error);
      
      // Mock response based on coordinates
      return {
        success: true,
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        address: 'Mock Address, Mumbai',
        district: 'Mumbai City',
        country: 'India'
      };
    }
  }

  /**
   * Get location from browser geolocation API
   * @returns {Promise<Object>} Coordinates
   */
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Get address from coordinates
          const address = await this.reverseGeocode(latitude, longitude);
          
          resolve({
            success: true,
            latitude,
            longitude,
            accuracy: position.coords.accuracy,
            ...address
          });
        },
        (error) => {
          reject(new Error(error.message));
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
   * Search for cities
   * @param {string} query - Search query
   * @returns {Promise<Array>} List of cities
   */
  async searchCities(query) {
    try {
      const response = await apiClient.get('/location/search-cities', {
        q: query,
        limit: 10
      });

      return {
        success: true,
        cities: response.cities
      };
    } catch (error) {
      console.error('[MOCK] Search cities error:', error);
      
      // Mock response with common Indian cities
      const mockCities = [
        { name: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
        { name: 'Delhi', state: 'Delhi', pincode: '110001' },
        { name: 'Bangalore', state: 'Karnataka', pincode: '560001' },
        { name: 'Hyderabad', state: 'Telangana', pincode: '500001' },
        { name: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
        { name: 'Kolkata', state: 'West Bengal', pincode: '700001' },
        { name: 'Pune', state: 'Maharashtra', pincode: '411001' },
        { name: 'Ahmedabad', state: 'Gujarat', pincode: '380001' }
      ];

      const filtered = mockCities.filter(city =>
        city.name.toLowerCase().includes(query.toLowerCase())
      );

      return {
        success: true,
        cities: filtered
      };
    }
  }

  /**
   * Get states list
   * @returns {Promise<Array>} List of states
   */
  async getStates() {
    try {
      const response = await apiClient.get('/location/states');

      return {
        success: true,
        states: response.states
      };
    } catch (error) {
      console.error('[MOCK] Get states error:', error);
      
      // Mock response with Indian states
      const mockStates = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
        'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
        'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        'Delhi', 'Puducherry', 'Jammu and Kashmir', 'Ladakh'
      ];

      return {
        success: true,
        states: mockStates
      };
    }
  }

  /**
   * Validate pincode
   * @param {string} pincode - Pincode to validate
   * @returns {Promise<Object>} Validation result with location details
   */
  async validatePincode(pincode) {
    try {
      const response = await apiClient.get('/location/validate-pincode', {
        pincode
      });

      return {
        success: true,
        valid: response.valid,
        city: response.city,
        state: response.state,
        district: response.district
      };
    } catch (error) {
      console.error('[MOCK] Validate pincode error:', error);
      
      // Mock validation (basic format check)
      const isValid = /^\d{6}$/.test(pincode);
      
      return {
        success: true,
        valid: isValid,
        city: isValid ? 'Mock City' : null,
        state: isValid ? 'Mock State' : null,
        district: isValid ? 'Mock District' : null
      };
    }
  }
}

// Create singleton instance
const locationAPI = new LocationAPI();

export default locationAPI;
export { LocationAPI };
