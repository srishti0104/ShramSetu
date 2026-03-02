/**
 * Worker Feed Component
 * 
 * @fileoverview Clean feed of available workers for employers
 */

import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import './WorkerFeed.css';

/**
 * Mock worker data - In real app, this would come from API
 */
const MOCK_WORKERS = [
  {
    id: 1,
    name: 'राज कुमार',
    profession: 'Construction Worker',
    experience: '5 years',
    location: 'Mumbai, Maharashtra',
    rating: 4.8,
    reviewCount: 24,
    skills: ['Construction', 'Masonry', 'Safety Protocols', 'Team Leadership'],
    availability: 'Available',
    hourlyRate: '₹200-300/hour',
    languages: ['Hindi', 'Marathi', 'English'],
    verified: true,
    profileImage: null,
    completedJobs: 45,
    description: 'Experienced construction worker with expertise in residential and commercial projects.'
  },
  {
    id: 2,
    name: 'सुनीता देवी',
    profession: 'Electrical Technician',
    experience: '3 years',
    location: 'Pune, Maharashtra',
    rating: 4.9,
    reviewCount: 18,
    skills: ['Electrical Wiring', 'Circuit Installation', 'Maintenance', 'Troubleshooting'],
    availability: 'Available',
    hourlyRate: '₹250-400/hour',
    languages: ['Hindi', 'Marathi'],
    verified: true,
    profileImage: null,
    completedJobs: 32,
    description: 'Skilled electrical technician specializing in residential and small commercial projects.'
  },
  {
    id: 3,
    name: 'अमित शर्मा',
    profession: 'Painter',
    experience: '2 years',
    location: 'Delhi, NCR',
    rating: 4.6,
    reviewCount: 15,
    skills: ['Wall Painting', 'Texture Work', 'Color Consultation', 'Interior Design'],
    availability: 'Busy until March 15',
    hourlyRate: '₹150-250/hour',
    languages: ['Hindi', 'English'],
    verified: true,
    profileImage: null,
    completedJobs: 28,
    description: 'Creative painter with experience in residential and office painting projects.'
  },
  {
    id: 4,
    name: 'लक्ष्मी पटेल',
    profession: 'Plumber',
    experience: '4 years',
    location: 'Ahmedabad, Gujarat',
    rating: 4.7,
    reviewCount: 21,
    skills: ['Pipe Installation', 'Leak Repair', 'Bathroom Fitting', 'Water Systems'],
    availability: 'Available',
    hourlyRate: '₹200-350/hour',
    languages: ['Hindi', 'Gujarati'],
    verified: true,
    profileImage: null,
    completedJobs: 38,
    description: 'Reliable plumber with expertise in residential and commercial plumbing systems.'
  },
  {
    id: 5,
    name: 'विकास यादव',
    profession: 'Carpenter',
    experience: '6 years',
    location: 'Bangalore, Karnataka',
    rating: 4.9,
    reviewCount: 31,
    skills: ['Furniture Making', 'Wood Carving', 'Interior Carpentry', 'Repair Work'],
    availability: 'Available',
    hourlyRate: '₹300-450/hour',
    languages: ['Hindi', 'Kannada', 'English'],
    verified: true,
    profileImage: null,
    completedJobs: 52,
    description: 'Master carpenter specializing in custom furniture and interior woodwork.'
  },
  {
    id: 6,
    name: 'गीता रानी',
    profession: 'House Cleaner',
    experience: '3 years',
    location: 'Chennai, Tamil Nadu',
    rating: 4.8,
    reviewCount: 19,
    skills: ['Deep Cleaning', 'Organizing', 'Sanitization', 'Laundry'],
    availability: 'Available',
    hourlyRate: '₹100-200/hour',
    languages: ['Hindi', 'Tamil'],
    verified: true,
    profileImage: null,
    completedJobs: 67,
    description: 'Professional house cleaner with attention to detail and reliability.'
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

  // Load workers on mount
  useEffect(() => {
    loadWorkers();
  }, []);

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
   * Filter workers based on search and filter criteria
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

    return matchesSearch && matchesFilter;
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
      </div>

      <div className="worker-feed__list">
        {filteredWorkers.length === 0 ? (
          <div className="worker-feed__empty">
            <p>{t('workers:noWorkers', 'No workers found matching your criteria.')}</p>
          </div>
        ) : (
          filteredWorkers.map(worker => (
            <WorkerCard key={worker.id} worker={worker} />
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Worker Card Component
 */
function WorkerCard({ worker }) {
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
          <div className="worker-card__location">📍 {worker.location}</div>
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