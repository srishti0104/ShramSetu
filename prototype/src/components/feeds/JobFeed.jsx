/**
 * Job Feed Component
 * 
 * @fileoverview Clean feed of available jobs for workers with location-based filtering
 */

import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import './JobFeed.css';

/**
 * Mock job data with coordinates - In real app, this would come from API
 */
const MOCK_JOBS = [
  {
    id: 1,
    title: 'Construction Worker',
    company: 'BuildTech Solutions',
    location: 'Mumbai, Maharashtra',
    coordinates: { lat: 19.0760, lng: 72.8777 }, // Mumbai coordinates
    salary: '₹15,000 - ₹25,000',
    type: 'Full-time',
    experience: '1-3 years',
    skills: ['Construction', 'Safety Protocols', 'Physical Fitness'],
    description: 'Looking for experienced construction workers for residential project.',
    postedDate: '2024-03-01',
    urgent: true,
    positions: 5
  },
  {
    id: 2,
    title: 'Electrical Technician',
    company: 'PowerGrid Services',
    location: 'Sector 15, Noida',
    coordinates: { lat: 28.5355, lng: 77.3910 }, // Noida coordinates
    salary: '₹18,000 - ₹30,000',
    type: 'Contract',
    experience: '2-5 years',
    skills: ['Electrical Wiring', 'Circuit Testing', 'Safety'],
    description: 'Electrical technician needed for industrial maintenance work.',
    postedDate: '2024-02-28',
    urgent: false,
    positions: 3,
    duration: '3 months'
  },
  {
    id: 3,
    title: 'Painter',
    company: 'Home Decor Plus',
    location: 'Delhi, NCR',
    coordinates: { lat: 28.7041, lng: 77.1025 }, // Delhi coordinates
    salary: '₹12,000 - ₹20,000',
    type: 'Part-time',
    experience: '0-2 years',
    skills: ['Wall Painting', 'Color Mixing', 'Surface Preparation'],
    description: 'Residential painting work for multiple projects across Delhi.',
    postedDate: '2024-02-27',
    urgent: false,
    positions: 2
  },
  {
    id: 4,
    title: 'Plumber',
    company: 'AquaFix Solutions',
    location: 'Bangalore, Karnataka',
    coordinates: { lat: 12.9716, lng: 77.5946 }, // Bangalore coordinates
    salary: '₹16,000 - ₹28,000',
    type: 'Full-time',
    experience: '1-4 years',
    skills: ['Pipe Installation', 'Leak Repair', 'Drainage Systems'],
    description: 'Experienced plumber for residential and commercial projects.',
    postedDate: '2024-02-26',
    urgent: true,
    positions: 4
  },
  {
    id: 5,
    title: 'Carpenter',
    company: 'WoodCraft Industries',
    location: 'Chennai, Tamil Nadu',
    coordinates: { lat: 13.0827, lng: 80.2707 }, // Chennai coordinates
    salary: '₹14,000 - ₹24,000',
    type: 'Full-time',
    experience: '2-6 years',
    skills: ['Wood Working', 'Furniture Making', 'Tool Handling'],
    description: 'Skilled carpenter for custom furniture and interior work.',
    postedDate: '2024-02-25',
    urgent: false,
    positions: 1
  },
  {
    id: 6,
    title: 'Welder',
    company: 'MetalWorks Ltd',
    location: 'Hyderabad, Telangana',
    coordinates: { lat: 17.3850, lng: 78.4867 }, // Hyderabad coordinates
    salary: '₹20,000 - ₹35,000',
    type: 'Full-time',
    experience: '3-7 years',
    skills: ['Arc Welding', 'Gas Welding', 'Metal Fabrication'],
    description: 'Experienced welder for industrial manufacturing projects.',
    postedDate: '2024-02-24',
    urgent: true,
    positions: 2
  }
];

/**
 * Job Feed Component
 */
export default function JobFeed() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [useRealLocation, setUseRealLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [minWage, setMinWage] = useState('');
  const [maxResults, setMaxResults] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load jobs on mount
  useEffect(() => {
    loadJobs();
    
    // Check for AI-suggested filters from sessionStorage
    const storedFilters = sessionStorage.getItem('job_search_filters');
    if (storedFilters) {
      try {
        const filters = JSON.parse(storedFilters);
        console.log('🔍 Applying AI-suggested filters:', filters);
        
        if (filters.category) {
          setSelectedCategory(filters.category);
        }
        if (filters.searchQuery) {
          setSearchTerm(filters.searchQuery);
        }
        if (filters.location) {
          // Could set location filter if we had one
          console.log('📍 Location filter:', filters.location);
        }
        
        // Clear the stored filters after applying them
        sessionStorage.removeItem('job_search_filters');
      } catch (error) {
        console.error('Error parsing stored filters:', error);
      }
    }
  }, []);

  /**
   * Get user's real location using Geolocation API
   */
  const getUserLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes cache
    };

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

      const { latitude, longitude } = position.coords;
      console.log('📍 Got user location:', { latitude, longitude });

      // Reverse geocode to get address
      const locationData = await reverseGeocode(latitude, longitude);
      
      setUserLocation({
        latitude,
        longitude,
        address: locationData.address,
        city: locationData.city,
        state: locationData.state,
        accuracy: position.coords.accuracy
      });

      console.log('🏠 User location set:', locationData);
      
    } catch (error) {
      console.error('❌ Location error:', error);
      let errorMessage = 'Unable to get your location';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied. Please enable location permissions.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out. Please try again.';
          break;
        default:
          errorMessage = 'An error occurred while getting your location.';
      }
      
      setLocationError(errorMessage);
      setUseRealLocation(false); // Uncheck the checkbox on error
    } finally {
      setIsGettingLocation(false);
    }
  };

  /**
   * Reverse geocode coordinates to get address
   */
  const reverseGeocode = async (latitude, longitude) => {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ShramSetu/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      console.log('🗺️ Geocoding result:', data);

      const address = data.display_name || 'Unknown location';
      const city = data.address?.city || data.address?.town || data.address?.village || 'Unknown city';
      const state = data.address?.state || 'Unknown state';

      return { address, city, state };
    } catch (error) {
      console.error('❌ Geocoding error:', error);
      return {
        address: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        city: 'Unknown city',
        state: 'Unknown state'
      };
    }
  };

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  /**
   * Handle location checkbox change
   */
  const handleLocationToggle = async (checked) => {
    setUseRealLocation(checked);
    
    if (checked && !userLocation) {
      await getUserLocation();
    }
  };
  const loadJobs = async () => {
    try {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let jobsWithDistance = [...MOCK_JOBS];
      
      // Calculate distances if user location is available
      if (useRealLocation && userLocation) {
        jobsWithDistance = MOCK_JOBS.map(job => {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            job.coordinates.lat,
            job.coordinates.lng
          );
          
          return {
            ...job,
            distance: distance < 1 ? 
              `${Math.round(distance * 1000)}m away` : 
              `${distance.toFixed(1)}km away`,
            distanceKm: distance
          };
        });
        
        // Sort by distance when using real location
        jobsWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);
      }
      
      setJobs(jobsWithDistance);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reload jobs when location changes
  useEffect(() => {
    if (useRealLocation && userLocation) {
      loadJobs();
    }
  }, [useRealLocation, userLocation]);

  /**
   * Filter jobs based on search and filter criteria
   */
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filter === 'all' || 
      (filter === 'urgent' && job.urgent) ||
      (filter === 'fulltime' && job.type === 'Full-time') ||
      (filter === 'parttime' && job.type === 'Part-time') ||
      (filter === 'contract' && job.type === 'Contract');

    const matchesCategory = selectedCategory === 'all' || 
      job.title.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesWage = minWage === '' || 
      parseInt(job.salary.replace(/[^\d]/g, '')) >= parseInt(minWage);

    return matchesSearch && matchesFilter && matchesCategory && matchesWage;
  }).slice(0, maxResults);

  if (loading) {
    return (
      <div className="job-feed">
        <div className="job-feed__header">
          <h2>🔍 {t('jobs:title', 'Job Marketplace')}</h2>
          <p>{t('jobs:subtitle', 'Find work opportunities near you')}</p>
        </div>
        <div className="job-feed__loading">
          <div className="loading-spinner"></div>
          <p>{t('common:messages.loading', 'Loading jobs...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-feed">
      <div className="job-feed__header">
        <h2>🔍 {t('jobs:title', 'Job Marketplace')}</h2>
        <p className="job-feed__subtitle">
          {t('jobs:subtitle', 'Find work opportunities near you')}
        </p>
      </div>

      {/* Location and Advanced Filters */}
      <div className="job-feed__advanced-filters">
        <div className="job-feed__location-filter">
          <label className="job-feed__checkbox-label">
            <input
              type="checkbox"
              checked={useRealLocation}
              onChange={(e) => handleLocationToggle(e.target.checked)}
              className="job-feed__checkbox"
              disabled={isGettingLocation}
            />
            <span className="job-feed__checkbox-text">
              📍 {isGettingLocation ? 
                t('jobs:gettingLocation', 'Getting your location...') : 
                t('jobs:useRealLocation', 'Use My Real Location')
              }
            </span>
          </label>
          
          {/* Location Status */}
          {userLocation && (
            <div className="job-feed__location-status">
              <span className="job-feed__location-success">
                ✅ {userLocation.city}, {userLocation.state}
              </span>
            </div>
          )}
          
          {locationError && (
            <div className="job-feed__location-error">
              <span className="job-feed__error-text">
                ❌ {locationError}
              </span>
            </div>
          )}
        </div>

        <div className="job-feed__search-row">
          <input
            type="text"
            placeholder={t('jobs:searchPlaceholder', 'Search jobs, location, contractor...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="job-feed__search-input"
          />
        </div>

        <div className="job-feed__filter-row">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="job-feed__category-select"
          >
            <option value="all">{t('jobs:allCategories', 'All Categories')}</option>
            <option value="construction">{t('jobs:construction', 'Construction')}</option>
            <option value="electrical">{t('jobs:electrical', 'Electrical')}</option>
            <option value="plumber">{t('jobs:plumbing', 'Plumbing')}</option>
            <option value="painter">{t('jobs:painting', 'Painting')}</option>
            <option value="carpenter">{t('jobs:carpentry', 'Carpentry')}</option>
            <option value="welder">{t('jobs:welding', 'Welding')}</option>
          </select>

          <input
            type="number"
            placeholder={t('jobs:minWage', 'Min wage (₹/day)')}
            value={minWage}
            onChange={(e) => setMinWage(e.target.value)}
            className="job-feed__wage-input"
          />

          <select
            value={maxResults}
            onChange={(e) => setMaxResults(parseInt(e.target.value))}
            className="job-feed__results-select"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setMinWage('');
              setFilter('all');
              setUseRealLocation(false);
            }}
            className="job-feed__clear-filters"
          >
            {t('jobs:clearFilters', 'Clear Filters')}
          </button>
        </div>
      </div>

      <div className="job-feed__results-info">
        <p>{t('jobs:foundJobs', 'Found')} {filteredJobs.length} {t('jobs:jobs', 'jobs')}</p>
      </div>

      <div className="job-feed__controls">
        <div className="job-feed__filters">
          <button
            className={`job-feed__filter ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            {t('jobs:allJobs', 'All Jobs')}
          </button>
          <button
            className={`job-feed__filter ${filter === 'urgent' ? 'active' : ''}`}
            onClick={() => setFilter('urgent')}
          >
            🔥 {t('jobs:urgent', 'Urgent')}
          </button>
          <button
            className={`job-feed__filter ${filter === 'fulltime' ? 'active' : ''}`}
            onClick={() => setFilter('fulltime')}
          >
            {t('jobs:fullTime', 'Full-time')}
          </button>
          <button
            className={`job-feed__filter ${filter === 'parttime' ? 'active' : ''}`}
            onClick={() => setFilter('parttime')}
          >
            {t('jobs:partTime', 'Part-time')}
          </button>
        </div>
      </div>

      <div className="job-feed__list">
        {filteredJobs.length === 0 ? (
          <div className="job-feed__empty">
            <p>{t('jobs:noJobs', 'No jobs found matching your criteria.')}</p>
            <div className="job-feed__help-card">
              <h4>💡 {t('jobs:needHelp', 'Need help finding the right job?')}</h4>
              <p>{t('jobs:askAI', 'Ask me about job types, locations, or wages!')}</p>
            </div>
          </div>
        ) : (
          filteredJobs.map(job => (
            <JobCard key={job.id} job={job} useRealLocation={useRealLocation} />
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Job Card Component
 */
function JobCard({ job, useRealLocation }) {
  const { t } = useTranslation();

  const handleViewDetails = () => {
    // Mock view details functionality
    console.log(`Viewing details for ${job.title} at ${job.company}`);
  };

  const handleApplyNow = () => {
    // Mock apply functionality
    alert(`Applied for ${job.title} at ${job.company}`);
  };

  return (
    <div className="job-card">
      <div className="job-card__header">
        <div className="job-card__title-section">
          <h3 className="job-card__title">{job.title}</h3>
          <div className="job-card__company">{job.company}</div>
        </div>
        {job.urgent && (
          <div className="job-card__urgent-badge">
            {t('jobs:urgent', 'Urgent')}
          </div>
        )}
      </div>

      <div className="job-card__location-info">
        <div className="job-card__location">
          <span className="job-card__location-icon">📍</span>
          <span>{job.location}</span>
        </div>
        {useRealLocation && job.distance && (
          <div className="job-card__distance">
            <span className="job-card__distance-icon">🚶</span>
            <span>{job.distance}</span>
          </div>
        )}
      </div>

      <div className="job-card__details">
        <div className="job-card__detail">
          <span className="job-card__detail-icon">💰</span>
          <span>{job.salary}</span>
        </div>
        <div className="job-card__detail">
          <span className="job-card__detail-icon">⏰</span>
          <span>{job.type}</span>
        </div>
        {job.duration && (
          <div className="job-card__detail">
            <span className="job-card__detail-icon">📅</span>
            <span>{t('jobs:duration', 'Duration')}: {job.duration}</span>
          </div>
        )}
        {job.positions && (
          <div className="job-card__detail">
            <span className="job-card__detail-icon">👥</span>
            <span>{job.positions} {t('jobs:of', 'of')} {job.positions} {t('jobs:positionsAvailable', 'positions available')}</span>
          </div>
        )}
      </div>

      <div className="job-card__skills">
        {job.skills.slice(0, 3).map((skill, index) => (
          <span key={index} className="job-card__skill">
            {skill}
          </span>
        ))}
        {job.skills.length > 3 && (
          <span className="job-card__skill job-card__skill--more">
            +{job.skills.length - 3} more
          </span>
        )}
      </div>

      <p className="job-card__description">{job.description}</p>

      <div className="job-card__footer">
        <span className="job-card__posted">
          {t('jobs:posted', 'Posted')}: {new Date(job.postedDate).toLocaleDateString()}
        </span>
        <div className="job-card__actions">
          <button className="job-card__view-btn" onClick={handleViewDetails}>
            {t('jobs:viewDetails', 'View Details')}
          </button>
          <button className="job-card__apply-btn" onClick={handleApplyNow}>
            {t('jobs:applyNow', 'Apply Now')}
          </button>
        </div>
      </div>
    </div>
  );
}