/**
 * Worker Feed Component
 * 
 * @fileoverview Clean feed of available workers for employers
 */

import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import locationService from '../../services/aws/locationService';
import './WorkerFeed.css';

/**
 * Mock worker data focused on Jamshedpur and Jharkhand - In real app, this would come from API
 */
const MOCK_WORKERS = [
  {
    id: 1,
    name: 'राज कुमार सिंह',
    profession: 'Steel Worker',
    experience: '8 years',
    location: 'Jamshedpur, Jharkhand',
    coordinates: { latitude: 22.8046, longitude: 86.2029 },
    rating: 4.9,
    reviewCount: 42,
    skills: ['Steel Fabrication', 'Welding', 'Heavy Machinery', 'Safety Protocols', 'Quality Control'],
    availability: 'Available',
    hourlyRate: '₹350-500/hour',
    languages: ['Hindi', 'Bengali', 'English'],
    verified: true,
    profileImage: null,
    completedJobs: 78,
    description: 'Expert steel worker with extensive experience in Tata Steel and other major industrial projects in Jamshedpur.'
  },
  {
    id: 2,
    name: 'सुनीता देवी',
    profession: 'Electrical Technician',
    experience: '5 years',
    location: 'Jamshedpur, Jharkhand',
    coordinates: { latitude: 22.8046, longitude: 86.2029 },
    rating: 4.8,
    reviewCount: 28,
    skills: ['Industrial Wiring', 'Circuit Installation', 'Maintenance', 'Power Systems'],
    availability: 'Available',
    hourlyRate: '₹280-420/hour',
    languages: ['Hindi', 'Bengali'],
    verified: true,
    profileImage: null,
    completedJobs: 45,
    description: 'Skilled electrical technician specializing in industrial and residential electrical systems in Jamshedpur area.'
  },
  {
    id: 3,
    name: 'अमित कुमार',
    profession: 'Construction Worker',
    experience: '6 years',
    location: 'Ranchi, Jharkhand',
    coordinates: { latitude: 23.3441, longitude: 85.3096 },
    rating: 4.7,
    reviewCount: 35,
    skills: ['Construction', 'Masonry', 'Concrete Work', 'Building Planning'],
    availability: 'Available',
    hourlyRate: '₹250-380/hour',
    languages: ['Hindi', 'English'],
    verified: true,
    profileImage: null,
    completedJobs: 52,
    description: 'Experienced construction worker with expertise in residential and commercial projects across Ranchi.'
  },
  {
    id: 4,
    name: 'प्रिया शर्मा',
    profession: 'Plumber',
    experience: '4 years',
    location: 'Jamshedpur, Jharkhand',
    coordinates: { latitude: 22.8046, longitude: 86.2029 },
    rating: 4.6,
    reviewCount: 22,
    skills: ['Pipe Installation', 'Leak Repair', 'Bathroom Fitting', 'Water Systems'],
    availability: 'Available',
    hourlyRate: '₹200-320/hour',
    languages: ['Hindi', 'Bengali'],
    verified: true,
    profileImage: null,
    completedJobs: 38,
    description: 'Reliable plumber with expertise in residential and industrial plumbing systems in Jamshedpur.'
  },
  {
    id: 5,
    name: 'विकास यादव',
    profession: 'Carpenter',
    experience: '7 years',
    location: 'Dhanbad, Jharkhand',
    coordinates: { latitude: 23.7957, longitude: 86.4304 },
    rating: 4.9,
    reviewCount: 31,
    skills: ['Furniture Making', 'Wood Carving', 'Interior Carpentry', 'Repair Work'],
    availability: 'Available',
    hourlyRate: '₹300-450/hour',
    languages: ['Hindi', 'Bengali', 'English'],
    verified: true,
    profileImage: null,
    completedJobs: 65,
    description: 'Master carpenter specializing in custom furniture and interior woodwork across Dhanbad region.'
  },
  {
    id: 6,
    name: 'गीता रानी',
    profession: 'House Cleaner',
    experience: '3 years',
    location: 'Jamshedpur, Jharkhand',
    coordinates: { latitude: 22.8046, longitude: 86.2029 },
    rating: 4.8,
    reviewCount: 19,
    skills: ['Deep Cleaning', 'Organizing', 'Sanitization', 'Laundry'],
    availability: 'Available',
    hourlyRate: '₹150-250/hour',
    languages: ['Hindi', 'Bengali'],
    verified: true,
    profileImage: null,
    completedJobs: 67,
    description: 'Professional house cleaner with attention to detail, serving residential areas in Jamshedpur.'
  },
  {
    id: 7,
    name: 'रामेश्वर महतो',
    profession: 'Mining Technician',
    experience: '10 years',
    location: 'Bokaro, Jharkhand',
    coordinates: { latitude: 23.6693, longitude: 85.9606 },
    rating: 4.9,
    reviewCount: 48,
    skills: ['Mining Operations', 'Heavy Equipment', 'Safety Management', 'Coal Processing'],
    availability: 'Available',
    hourlyRate: '₹400-600/hour',
    languages: ['Hindi', 'Bengali', 'English'],
    verified: true,
    profileImage: null,
    completedJobs: 89,
    description: 'Experienced mining technician with expertise in coal mining operations and safety protocols in Bokaro Steel City.'
  },
  {
    id: 8,
    name: 'अनीता कुमारी',
    profession: 'Painter',
    experience: '4 years',
    location: 'Jamshedpur, Jharkhand',
    coordinates: { latitude: 22.8046, longitude: 86.2029 },
    rating: 4.7,
    reviewCount: 25,
    skills: ['Wall Painting', 'Texture Work', 'Color Consultation', 'Interior Design'],
    availability: 'Available',
    hourlyRate: '₹180-280/hour',
    languages: ['Hindi', 'Bengali'],
    verified: true,
    profileImage: null,
    completedJobs: 43,
    description: 'Creative painter with experience in residential and commercial painting projects in Jamshedpur area.'
  },
  {
    id: 9,
    name: 'संजय कुमार',
    profession: 'Mechanic',
    experience: '9 years',
    location: 'Deoghar, Jharkhand',
    coordinates: { latitude: 24.4823, longitude: 86.6961 },
    rating: 4.8,
    reviewCount: 37,
    skills: ['Auto Repair', 'Engine Maintenance', 'Electrical Systems', 'Diagnostics'],
    availability: 'Available',
    hourlyRate: '₹250-400/hour',
    languages: ['Hindi', 'Bengali'],
    verified: true,
    profileImage: null,
    completedJobs: 71,
    description: 'Expert mechanic specializing in automotive repair and maintenance services in Deoghar region.'
  },
  {
    id: 10,
    name: 'मीरा देवी',
    profession: 'Tailor',
    experience: '6 years',
    location: 'Jamshedpur, Jharkhand',
    coordinates: { latitude: 22.8046, longitude: 86.2029 },
    rating: 4.9,
    reviewCount: 33,
    skills: ['Garment Stitching', 'Alterations', 'Design', 'Embroidery'],
    availability: 'Available',
    hourlyRate: '₹200-350/hour',
    languages: ['Hindi', 'Bengali', 'English'],
    verified: true,
    profileImage: null,
    completedJobs: 156,
    description: 'Skilled tailor with expertise in traditional and modern garment making, serving Jamshedpur community.'
  }
];

/**
 * Worker Feed Component
 */
export default function WorkerFeed() {
  const { t } = useTranslation();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [useRealLocation, setUseRealLocation] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [maxDistance, setMaxDistance] = useState(50); // Default 50km radius
  const [locationFilter, setLocationFilter] = useState('all');

  // Load workers on mount
  useEffect(() => {
    loadWorkers();
  }, []);

  // Get user location when real location is enabled
  useEffect(() => {
    if (useRealLocation) {
      getUserLocation();
    }
  }, [useRealLocation]);

  /**
   * Get user's current location
   */
  const getUserLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await locationService.getCurrentLocation();
      setUserLocation(location);
      console.log('✅ User location:', location);
      
      // Calculate distances for all workers
      calculateDistances(location);
    } catch (error) {
      console.error('Failed to get location:', error);
      alert('Could not get your location. Showing all workers without distance filtering.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  /**
   * Calculate distances from user location to all workers
   */
  const calculateDistances = (userLoc) => {
    const workersWithDistance = workers.map(worker => {
      const distance = locationService.calculateHaversineDistance(
        userLoc,
        worker.coordinates
      );
      return {
        ...worker,
        distance: distance,
        distanceFormatted: locationService.formatDistance(distance)
      };
    });
    
    setWorkers(workersWithDistance);
  };

  /**
   * Load workers (mock API call)
   */
  const loadWorkers = async () => {
    try {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWorkers(MOCK_WORKERS);
    } catch (error) {
      console.error('Failed to load workers:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter workers based on search, filter criteria, and location
   */
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = searchTerm === '' || 
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filter === 'all' || 
      (filter === 'available' && worker.availability === 'Available') ||
      (filter === 'verified' && worker.verified) ||
      (filter === 'topRated' && worker.rating >= 4.7);

    const matchesLocation = locationFilter === 'all' ||
      (locationFilter === 'jamshedpur' && worker.location.includes('Jamshedpur')) ||
      (locationFilter === 'jharkhand' && worker.location.includes('Jharkhand'));

    const matchesDistance = !useRealLocation || !userLocation || !worker.distance || 
      worker.distance <= maxDistance;

    return matchesSearch && matchesFilter && matchesLocation && matchesDistance;
  }).sort((a, b) => {
    // Sort by distance if real location is enabled, otherwise by rating
    if (useRealLocation && a.distance && b.distance) {
      return a.distance - b.distance;
    }
    return b.rating - a.rating;
  });

  if (loading) {
    return (
      <div className="worker-feed">
        <div className="worker-feed__header">
          <h2>{t('dashboard:talentSearch', 'Available Workers')}</h2>
        </div>
        <div className="worker-feed__loading">
          <div className="loading-spinner"></div>
          <p>{t('common:messages.loading', 'Loading workers...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="worker-feed">
      <div className="worker-feed__header">
        <h2>{t('dashboard:talentSearch', 'Available Workers')}</h2>
        <p className="worker-feed__subtitle">
          {filteredWorkers.length} {t('workers:workersFound', 'workers found')}
          {useRealLocation && userLocation && ' • Sorted by distance'}
        </p>
      </div>

      <div className="worker-feed__controls">
        <div className="worker-feed__search">
          <input
            type="text"
            placeholder={t('workers:searchPlaceholder', 'Search workers, skills, locations...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="worker-feed__search-input"
          />
        </div>

        {/* Location Controls */}
        <div className="worker-feed__location-controls">
          <div className="location-toggle">
            <label className="location-toggle__label">
              <input
                type="checkbox"
                checked={useRealLocation}
                onChange={(e) => setUseRealLocation(e.target.checked)}
                className="location-toggle__checkbox"
              />
              <span className="location-toggle__text">
                📍 Use Real Location
                {isLoadingLocation && ' (Getting location...)'}
              </span>
            </label>
          </div>

          {useRealLocation && userLocation && (
            <div className="distance-filter">
              <label className="distance-filter__label">
                Max Distance: {maxDistance}km
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="distance-filter__slider"
              />
            </div>
          )}
        </div>

        <div className="worker-feed__filters">
          <button
            className={`worker-feed__filter ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            {t('workers:allWorkers', 'All Workers')}
          </button>
          <button
            className={`worker-feed__filter ${filter === 'available' ? 'active' : ''}`}
            onClick={() => setFilter('available')}
          >
            ✅ {t('workers:available', 'Available')}
          </button>
          <button
            className={`worker-feed__filter ${filter === 'verified' ? 'active' : ''}`}
            onClick={() => setFilter('verified')}
          >
            ✓ {t('workers:verified', 'Verified')}
          </button>
          <button
            className={`worker-feed__filter ${filter === 'topRated' ? 'active' : ''}`}
            onClick={() => setFilter('topRated')}
          >
            ⭐ {t('workers:topRated', 'Top Rated')}
          </button>
        </div>

        {/* Location-based Filters */}
        <div className="worker-feed__location-filters">
          <button
            className={`worker-feed__location-filter ${locationFilter === 'all' ? 'active' : ''}`}
            onClick={() => setLocationFilter('all')}
          >
            🌍 All Locations
          </button>
          <button
            className={`worker-feed__location-filter ${locationFilter === 'jamshedpur' ? 'active' : ''}`}
            onClick={() => setLocationFilter('jamshedpur')}
          >
            🏭 Jamshedpur
          </button>
          <button
            className={`worker-feed__location-filter ${locationFilter === 'jharkhand' ? 'active' : ''}`}
            onClick={() => setLocationFilter('jharkhand')}
          >
            🗺️ Jharkhand
          </button>
        </div>
      </div>

      <div className="worker-feed__list">
        {filteredWorkers.length === 0 ? (
          <div className="worker-feed__empty">
            <p>{t('workers:noWorkers', 'No workers found matching your criteria.')}</p>
          </div>
        ) : (
          filteredWorkers.map(worker => (
            <WorkerCard 
              key={worker.id} 
              worker={worker} 
              showDistance={useRealLocation && userLocation}
            />
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Worker Card Component
 */
function WorkerCard({ worker, showDistance = false }) {
  const { t } = useTranslation();

  const handleContact = () => {
    // Mock contact functionality
    alert(`Contacting ${worker.name}`);
  };

  const handleViewProfile = () => {
    // Mock view profile functionality
    alert(`Viewing ${worker.name}'s full profile`);
  };

  return (
    <div className="worker-card">
      {worker.verified && (
        <div className="worker-card__verified-badge">
          ✓ {t('workers:verified', 'Verified')}
        </div>
      )}
      
      <div className="worker-card__header">
        <div className="worker-card__avatar">
          {worker.profileImage ? (
            <img src={worker.profileImage} alt={worker.name} />
          ) : (
            <div className="worker-card__avatar-placeholder">
              {worker.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="worker-card__basic-info">
          <h3 className="worker-card__name">{worker.name}</h3>
          <div className="worker-card__profession">{worker.profession}</div>
          <div className="worker-card__location">
            📍 {worker.location}
            {showDistance && worker.distanceFormatted && (
              <span className="worker-card__distance"> • {worker.distanceFormatted} away</span>
            )}
          </div>
        </div>
      </div>

      <div className="worker-card__stats">
        <div className="worker-card__stat">
          <span className="worker-card__stat-icon">⭐</span>
          <span>{worker.rating} ({worker.reviewCount} reviews)</span>
        </div>
        <div className="worker-card__stat">
          <span className="worker-card__stat-icon">💼</span>
          <span>{worker.completedJobs} jobs completed</span>
        </div>
        <div className="worker-card__stat">
          <span className="worker-card__stat-icon">🕒</span>
          <span>{worker.experience} experience</span>
        </div>
        <div className="worker-card__stat">
          <span className="worker-card__stat-icon">💰</span>
          <span>{worker.hourlyRate}</span>
        </div>
      </div>

      <div className="worker-card__availability">
        <span className={`worker-card__availability-status ${
          worker.availability === 'Available' ? 'available' : 'busy'
        }`}>
          {worker.availability}
        </span>
      </div>

      <div className="worker-card__skills">
        {worker.skills.slice(0, 4).map((skill, index) => (
          <span key={index} className="worker-card__skill">
            {skill}
          </span>
        ))}
        {worker.skills.length > 4 && (
          <span className="worker-card__skill-more">
            +{worker.skills.length - 4} more
          </span>
        )}
      </div>

      <p className="worker-card__description">{worker.description}</p>

      <div className="worker-card__languages">
        <span className="worker-card__languages-label">Languages:</span>
        {worker.languages.join(', ')}
      </div>

      <div className="worker-card__footer">
        <button className="worker-card__view-btn" onClick={handleViewProfile}>
          {t('workers:viewProfile', 'View Profile')}
        </button>
        <button className="worker-card__contact-btn" onClick={handleContact}>
          {t('workers:contact', 'Contact')}
        </button>
      </div>
    </div>
  );
}