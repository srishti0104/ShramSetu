/**
 * Job Feed Component
 * 
 * @fileoverview Clean feed of available jobs for workers
 */

import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import './JobFeed.css';

/**
 * Mock job data - In real app, this would come from API
 */
const MOCK_JOBS = [
  {
    id: 1,
    title: 'Construction Worker',
    company: 'BuildTech Solutions',
    location: 'Mumbai, Maharashtra',
    salary: '₹15,000 - ₹25,000',
    type: 'Full-time',
    experience: '1-3 years',
    skills: ['Construction', 'Safety Protocols', 'Physical Fitness'],
    description: 'Looking for experienced construction workers for residential project.',
    postedDate: '2024-03-01',
    urgent: true
  },
  {
    id: 2,
    title: 'Electrical Technician',
    company: 'PowerGrid Services',
    location: 'Pune, Maharashtra',
    salary: '₹18,000 - ₹30,000',
    type: 'Contract',
    experience: '2-5 years',
    skills: ['Electrical Wiring', 'Circuit Testing', 'Safety'],
    description: 'Electrical technician needed for industrial maintenance work.',
    postedDate: '2024-02-28',
    urgent: false
  },
  {
    id: 3,
    title: 'Painter',
    company: 'Home Decor Plus',
    location: 'Delhi, NCR',
    salary: '₹12,000 - ₹20,000',
    type: 'Part-time',
    experience: '0-2 years',
    skills: ['Wall Painting', 'Color Mixing', 'Surface Preparation'],
    description: 'Residential painting work for multiple projects across Delhi.',
    postedDate: '2024-02-27',
    urgent: false
  },
  {
    id: 4,
    title: 'Plumber',
    company: 'AquaFix Solutions',
    location: 'Bangalore, Karnataka',
    salary: '₹16,000 - ₹28,000',
    type: 'Full-time',
    experience: '1-4 years',
    skills: ['Pipe Installation', 'Leak Repair', 'Drainage Systems'],
    description: 'Experienced plumber for residential and commercial projects.',
    postedDate: '2024-02-26',
    urgent: true
  },
  {
    id: 5,
    title: 'Carpenter',
    company: 'WoodCraft Industries',
    location: 'Chennai, Tamil Nadu',
    salary: '₹14,000 - ₹24,000',
    type: 'Full-time',
    experience: '2-6 years',
    skills: ['Wood Working', 'Furniture Making', 'Tool Handling'],
    description: 'Skilled carpenter for custom furniture and interior work.',
    postedDate: '2024-02-25',
    urgent: false
  },
  {
    id: 6,
    title: 'Welder',
    company: 'MetalWorks Ltd',
    location: 'Hyderabad, Telangana',
    salary: '₹20,000 - ₹35,000',
    type: 'Full-time',
    experience: '3-7 years',
    skills: ['Arc Welding', 'Gas Welding', 'Metal Fabrication'],
    description: 'Experienced welder for industrial manufacturing projects.',
    postedDate: '2024-02-24',
    urgent: true
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

  // Load jobs on mount
  useEffect(() => {
    loadJobs();
  }, []);

  /**
   * Load jobs (mock API call)
   */
  const loadJobs = async () => {
    try {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setJobs(MOCK_JOBS);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

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

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="job-feed">
        <div className="job-feed__header">
          <h2>{t('jobs:title', 'Available Jobs')}</h2>
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
        <h2>{t('jobs:title', 'Available Jobs')}</h2>
        <p className="job-feed__subtitle">
          {filteredJobs.length} {t('jobs:jobsFound', 'jobs found')}
        </p>
      </div>

      <div className="job-feed__controls">
        <div className="job-feed__search">
          <input
            type="text"
            placeholder={t('jobs:searchPlaceholder', 'Search jobs, companies, locations...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="job-feed__search-input"
          />
        </div>

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
          </div>
        ) : (
          filteredJobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Job Card Component
 */
function JobCard({ job }) {
  const { t } = useTranslation();

  const handleApply = () => {
    // Mock apply functionality
    alert(`Applied for ${job.title} at ${job.company}`);
  };

  return (
    <div className="job-card">
      {job.urgent && (
        <div className="job-card__urgent-badge">
          🔥 {t('jobs:urgent', 'Urgent')}
        </div>
      )}
      
      <div className="job-card__header">
        <h3 className="job-card__title">{job.title}</h3>
        <div className="job-card__company">{job.company}</div>
      </div>

      <div className="job-card__details">
        <div className="job-card__detail">
          <span className="job-card__detail-icon">📍</span>
          <span>{job.location}</span>
        </div>
        <div className="job-card__detail">
          <span className="job-card__detail-icon">💰</span>
          <span>{job.salary}</span>
        </div>
        <div className="job-card__detail">
          <span className="job-card__detail-icon">⏰</span>
          <span>{job.type}</span>
        </div>
        <div className="job-card__detail">
          <span className="job-card__detail-icon">🎯</span>
          <span>{job.experience}</span>
        </div>
      </div>

      <div className="job-card__skills">
        {job.skills.map((skill, index) => (
          <span key={index} className="job-card__skill">
            {skill}
          </span>
        ))}
      </div>

      <p className="job-card__description">{job.description}</p>

      <div className="job-card__footer">
        <span className="job-card__posted">
          {t('jobs:posted', 'Posted')}: {new Date(job.postedDate).toLocaleDateString()}
        </span>
        <button className="job-card__apply-btn" onClick={handleApply}>
          {t('jobs:apply', 'Apply Now')}
        </button>
      </div>
    </div>
  );
}