/**
 * Job Feed Component
 * 
 * @fileoverview Clean feed of available jobs for workers with location-based filtering
 */

import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import ContractorProfile from '../contractors/ContractorProfile';
import './JobFeed.css';

/**
 * Jharkhand cities with coordinates
 */
const JHARKHAND_CITIES = [
  { name: 'Ranchi', lat: 23.3441, lng: 85.3096 },
  { name: 'Jamshedpur', lat: 22.8046, lng: 86.2029 },
  { name: 'Dhanbad', lat: 23.7957, lng: 86.4304 },
  { name: 'Bokaro', lat: 23.6693, lng: 86.1511 },
  { name: 'Deoghar', lat: 24.4823, lng: 86.6961 },
  { name: 'Phusro', lat: 23.7939, lng: 86.0326 },
  { name: 'Hazaribagh', lat: 23.9929, lng: 85.3647 },
  { name: 'Giridih', lat: 24.1901, lng: 86.3008 },
  { name: 'Ramgarh', lat: 23.6309, lng: 85.5169 },
  { name: 'Medininagar', lat: 24.0174, lng: 84.0736 },
  { name: 'Chirkunda', lat: 23.7280, lng: 86.7219 },
  { name: 'Chaibasa', lat: 22.5541, lng: 85.8066 }
];

/**
 * Job titles and categories - STRICT KEYWORDS ONLY
 */
const JOB_CATEGORIES = {
  construction: ['Construction Worker', 'Mason', 'Building Helper', 'Site Supervisor', 'Concrete Mixer'],
  welder: ['Welder', 'Arc Welder', 'Gas Welder', 'Metal Fabricator', 'Cutting Operator'],
  electrician: ['Electrician', 'Electrical Helper', 'Wiring Technician', 'Electrical Supervisor', 'Panel Operator'],
  painter: ['Painter', 'Wall Painter', 'Spray Painter', 'Texture Artist', 'Color Mixer'],
  carpenter: ['Carpenter', 'Wood Worker', 'Furniture Maker', 'Cabinet Installer', 'Flooring Specialist']
};

/**
 * Company names for Jharkhand
 */
const COMPANIES = [
  'Jharkhand Construction Ltd', 'Ranchi Builders', 'Tata Steel Projects', 'SAIL Contractors',
  'Coal India Services', 'Jharkhand Infrastructure', 'Bokaro Steel Works', 'Hindalco Projects',
  'Adani Mining Services', 'Vedanta Resources', 'JSW Steel Contractors', 'NTPC Projects',
  'Ranchi Municipal Corp', 'Jamshedpur Development', 'Dhanbad Coal Services', 'Hazaribagh Builders',
  'Giridih Stone Works', 'Deoghar Tourism Dept', 'Ramgarh Industries', 'Chaibasa Tribal Dev',
  'Jharkhand Road Construction', 'State Electricity Board', 'Water Supply Department', 'Forest Department',
  'Rural Development Corp', 'Urban Development Authority', 'Industrial Development Corp', 'Mining Corporation',
  'Agricultural Development', 'Transport Corporation', 'Housing Board', 'Public Works Department',
  'Skill Development Mission', 'Employment Exchange', 'Labour Department', 'Tribal Welfare Dept',
  'Women Development Corp', 'Youth Development', 'Sports Authority', 'Tourism Development',
  'Handicrafts Board', 'Handloom Corporation', 'Sericulture Department', 'Fisheries Department',
  'Animal Husbandry Dept', 'Dairy Development', 'Horticulture Department', 'Watershed Development',
  'MGNREGA Projects', 'Swachh Bharat Mission', 'Digital India Initiative', 'Skill India Mission'
];

/**
 * Generate mock jobs data - INTRACITY FOCUS
 */
function generateMockJobs() {
  const jobs = [];
  const jobTypes = ['Daily Wage', 'Contract']; // Removed Full-time and Part-time for short-term focus
  const experienceLevels = ['0-1 years', '1-3 years', '2-5 years'];
  
  // Generate jobs for each city separately to keep them intracity
  JHARKHAND_CITIES.forEach((city, cityIndex) => {
    const jobsPerCity = Math.floor(200 / JHARKHAND_CITIES.length); // Distribute jobs evenly across cities
    
    for (let i = 1; i <= jobsPerCity; i++) {
      const categoryKeys = Object.keys(JOB_CATEGORIES);
      const randomCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
      const jobTitles = JOB_CATEGORIES[randomCategory];
      const randomTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
      const randomCompany = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
      
      // Generate salary based on job category
      const salaryRanges = {
        construction: [800, 1500], // Daily wage rates
        welder: [1200, 2200],
        electrician: [1000, 2000],
        painter: [700, 1300],
        carpenter: [800, 1600]
      };
      
      const [minSalary, maxSalary] = salaryRanges[randomCategory];
      const adjustedMin = minSalary + Math.floor(Math.random() * 200);
      const adjustedMax = maxSalary + Math.floor(Math.random() * 300);
      
      // Generate skills based on category
      const skillSets = {
        construction: ['Construction', 'Safety Protocols', 'Physical Fitness', 'Tool Handling', 'Blueprint Reading'],
        welder: ['Arc Welding', 'Gas Welding', 'Metal Fabrication', 'Safety', 'Blueprint Reading'],
        electrician: ['Electrical Wiring', 'Circuit Testing', 'Safety', 'Troubleshooting', 'Panel Installation'],
        painter: ['Wall Painting', 'Color Mixing', 'Surface Preparation', 'Spray Painting', 'Texture Work'],
        carpenter: ['Wood Working', 'Furniture Making', 'Tool Handling', 'Measurement', 'Finishing']
      };
      
      const categorySkills = skillSets[randomCategory];
      const jobSkills = categorySkills.slice(0, Math.floor(Math.random() * 3) + 2);
      
      // Generate posting date (last 7 days for recent jobs)
      const daysAgo = Math.floor(Math.random() * 7);
      const postDate = new Date();
      postDate.setDate(postDate.getDate() - daysAgo);
      
      // Generate duration - mostly 1 day, some 3-5 days max
      const durationOptions = [
        '1 day', '1 day', '1 day', '1 day', '1 day', '1 day', // 60% are 1 day
        '2 days', '2 days', // 20% are 2 days
        '3 days', '4 days', '5 days' // 20% are 3-5 days
      ];
      const randomDuration = durationOptions[Math.floor(Math.random() * durationOptions.length)];
      
      const globalJobId = cityIndex * jobsPerCity + i;
      
      jobs.push({
        id: globalJobId,
        title: randomTitle,
        company: randomCompany,
        location: `${city.name}, Jharkhand`, // All jobs within the same city
        coordinates: { 
          // Add small random offset within city (±0.01 degrees ≈ ±1km)
          lat: city.lat + (Math.random() - 0.5) * 0.02, 
          lng: city.lng + (Math.random() - 0.5) * 0.02 
        },
        salary: `₹${adjustedMin.toLocaleString()}/day`, // Daily wage format
        type: jobTypes[Math.floor(Math.random() * jobTypes.length)],
        experience: experienceLevels[Math.floor(Math.random() * experienceLevels.length)],
        skills: jobSkills,
        description: `Looking for ${randomTitle.toLowerCase()} for ${randomDuration} ${randomCategory} work in ${city.name}. ${randomDuration === '1 day' ? 'Same day payment.' : 'Payment on completion.'}`,
        postedDate: postDate.toISOString().split('T')[0],
        urgent: Math.random() < 0.4, // 40% chance of being urgent for short-term work
        positions: Math.floor(Math.random() * 5) + 1, // 1-5 positions
        duration: randomDuration,
        category: randomCategory,
        contractorId: `contractor_${Math.floor(Math.random() * 50) + 1}`,
        contactNumber: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        workingHours: randomDuration === '1 day' ? 
          ['8 hours', '10 hours', '12 hours'][Math.floor(Math.random() * 3)] :
          '8-10 hours/day',
        benefits: Math.random() < 0.3 ? 
          ['Food provided', 'Transport', 'Tools provided'][Math.floor(Math.random() * 3)] : null,
        cityFocus: city.name // Track which city this job belongs to
      });
    }
  });
  
  return jobs;
}

/**
 * Mock job data with 200 jobs in Jharkhand cities
 */
const MOCK_JOBS = generateMockJobs();

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
    const loadJobsAsync = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500)); // Reduced delay
        
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
        setJobs(MOCK_JOBS); // Fallback to original jobs
      } finally {
        setLoading(false);
      }
    };

    loadJobsAsync();
    
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
        coordinates: locationData.coordinates,
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
   * Find closest Jharkhand city to user's location
   */
  const findClosestCity = (userLat, userLng) => {
    let closestCity = JHARKHAND_CITIES[0];
    let minDistance = calculateDistance(userLat, userLng, closestCity.lat, closestCity.lng);

    for (let i = 1; i < JHARKHAND_CITIES.length; i++) {
      const city = JHARKHAND_CITIES[i];
      const distance = calculateDistance(userLat, userLng, city.lat, city.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    }

    return {
      name: closestCity.name,
      distance: minDistance
    };
  };

  /**
   * Reverse geocode coordinates to get address
   */
  const reverseGeocode = async (latitude, longitude) => {
    try {
      // Find closest Jharkhand city
      const closestCity = findClosestCity(latitude, longitude);
      
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
      const state = data.address?.state || 'Jharkhand';

      return { 
        address, 
        city: closestCity.name, // Use closest Jharkhand city
        state: state,
        coordinates: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      };
    } catch (error) {
      console.error('❌ Geocoding error:', error);
      // Fallback to closest city even on error
      const closestCity = findClosestCity(latitude, longitude);
      return {
        address: `Location near ${closestCity.name}`,
        city: closestCity.name,
        state: 'Jharkhand',
        coordinates: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
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
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      setJobs(MOCK_JOBS); // Fallback
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
      (filter === 'dailywage' && job.type === 'Daily Wage') ||
      (filter === 'contract' && job.type === 'Contract');

    const matchesCategory = selectedCategory === 'all' || 
      job.category === selectedCategory;

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
              <div className="job-feed__coordinates">
                📍 {userLocation.coordinates}
              </div>
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
            <option value="welder">{t('jobs:welder', 'Welder')}</option>
            <option value="electrician">{t('jobs:electrician', 'Electrician')}</option>
            <option value="painter">{t('jobs:painter', 'Painter')}</option>
            <option value="carpenter">{t('jobs:carpenter', 'Carpenter')}</option>
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
            className={`job-feed__filter ${filter === 'dailywage' ? 'active' : ''}`}
            onClick={() => setFilter('dailywage')}
          >
            {t('jobs:dailyWage', 'Daily Wage')}
          </button>
          <button
            className={`job-feed__filter ${filter === 'contract' ? 'active' : ''}`}
            onClick={() => setFilter('contract')}
          >
            {t('jobs:contract', 'Contract')}
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
  const [showContractorProfile, setShowContractorProfile] = useState(false);
  const [contractorData, setContractorData] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleViewDetails = () => {
    console.log(`Viewing details for ${job.title} at ${job.company}`);
  };

  const handleApplyNow = async () => {
    try {
      setIsApplying(true);
      
      // Get user profile data from localStorage
      const userProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');
      const onboardingData = JSON.parse(localStorage.getItem('onboarding_progress') || '{}');
      
      // Collect all profile information
      const applicantProfile = {
        // Basic Info
        userId: userProfile.userId || `user_${Date.now()}`,
        name: userProfile.name || onboardingData.profile?.name || 'Anonymous User',
        phoneNumber: userProfile.phoneNumber || onboardingData.phoneNumber || '',
        email: userProfile.email || '',
        age: userProfile.age || onboardingData.profile?.age || null,
        gender: userProfile.gender || onboardingData.profile?.gender || '',
        
        // Location
        location: {
          city: userProfile.location?.city || onboardingData.location?.city || '',
          state: userProfile.location?.state || onboardingData.location?.state || '',
          pincode: userProfile.location?.pincode || onboardingData.location?.pincode || '',
          address: userProfile.location?.address || onboardingData.location?.address || '',
          coordinates: {
            latitude: userProfile.location?.latitude || onboardingData.location?.latitude || null,
            longitude: userProfile.location?.longitude || onboardingData.location?.longitude || null
          }
        },
        
        // Skills and Experience
        skills: userProfile.skills || onboardingData.skills || [],
        customSkills: userProfile.customSkills || onboardingData.customSkills || {},
        experience: userProfile.experience || '',
        
        // Profile Photo
        photo: userProfile.photo || onboardingData.profile?.photo || null,
        
        // Language Preference
        preferredLanguage: localStorage.getItem('app_language') || 'en',
        
        // Application Metadata
        appliedAt: new Date().toISOString(),
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        }
      };

      // Prepare application data
      const applicationData = {
        jobId: job.id.toString(),
        contractorId: job.contractorId,
        applicantProfile,
        jobDetails: {
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          type: job.type,
          category: job.category,
          skills: job.skills,
          description: job.description
        },
        location: applicantProfile.location
      };

      console.log('📝 Submitting job application:', applicationData);

      // Import and use the job applications service
      const { default: jobApplicationsService } = await import('../../services/aws/jobApplicationsService');
      
      const result = await jobApplicationsService.submitApplication(applicationData);
      
      // Show success message
      alert(`✅ Application submitted successfully!\n\nJob: ${job.title}\nCompany: ${job.company}\nApplication ID: ${result.applicationId}\n\nThe contractor will review your application and contact you soon.`);
      
      console.log('✅ Application submitted:', result);
      
    } catch (error) {
      console.error('❌ Error submitting application:', error);
      
      // Show error message
      alert(`❌ Failed to submit application: ${error.message}\n\nPlease check your internet connection and try again.`);
    } finally {
      setIsApplying(false);
    }
  };

  const handleViewContractor = async () => {
    try {
      // Import contractor data dynamically
      const { CONTRACTORS_DATA } = await import('../../data/contractorsData');
      
      // Find contractor by ID
      const contractor = CONTRACTORS_DATA.find(c => c.id === job.contractorId);
      if (contractor) {
        setContractorData(contractor);
        setShowContractorProfile(true);
      } else {
        console.warn('Contractor not found:', job.contractorId);
      }
    } catch (error) {
      console.error('Error loading contractor data:', error);
    }
  };

  const handleContactContractor = (contractor) => {
    alert(`Contacting ${contractor.name} at ${contractor.contactNumber}`);
    setShowContractorProfile(false);
  };

  return (
    <>
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
              <span>{job.positions} {t('jobs:positionsAvailable', 'positions available')}</span>
            </div>
          )}
          {job.workingHours && (
            <div className="job-card__detail">
              <span className="job-card__detail-icon">🕐</span>
              <span>{job.workingHours}</span>
            </div>
          )}
          {job.benefits && (
            <div className="job-card__detail">
              <span className="job-card__detail-icon">🎁</span>
              <span>{job.benefits}</span>
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
            <button className="job-card__contractor-btn" onClick={handleViewContractor}>
              👤 Contractor
            </button>
            <button 
              className="job-card__apply-btn" 
              onClick={handleApplyNow}
              disabled={isApplying}
              style={{ 
                opacity: isApplying ? 0.7 : 1,
                cursor: isApplying ? 'not-allowed' : 'pointer'
              }}
            >
              {isApplying ? '⏳ Applying...' : t('jobs:applyNow', 'Apply Now')}
            </button>
          </div>
        </div>
      </div>

      {/* Contractor Profile Modal */}
      {showContractorProfile && contractorData && (
        <ContractorProfile
          contractor={contractorData}
          onClose={() => setShowContractorProfile(false)}
          onContact={handleContactContractor}
        />
      )}
    </>
  );
}