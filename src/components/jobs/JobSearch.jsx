/**
 * Job Search Component
 * 
 * @fileoverview Job marketplace with search, filter, and apply functionality
 */

import { useState, useEffect } from 'react';
import './JobSearch.css';

// Mock job data
const MOCK_JOBS = [
  {
    id: 'job_001',
    title: 'Construction Worker',
    contractor: 'ABC Builders Pvt Ltd',
    location: 'Sector 15, Noida',
    city: 'Noida',
    wage: 600,
    wageType: 'daily',
    duration: '3 months',
    startDate: '2024-03-01',
    category: 'construction',
    description: 'Need experienced construction workers for residential project',
    requirements: ['Physical fitness', 'Basic construction knowledge'],
    slots: 10,
    filledSlots: 3,
    distance: 2.5
  },
  {
    id: 'job_002',
    title: 'Plumber',
    contractor: 'Home Services Co',
    location: 'Sector 62, Noida',
    city: 'Noida',
    wage: 800,
    wageType: 'daily',
    duration: '1 month',
    startDate: '2024-02-25',
    category: 'plumbing',
    description: 'Experienced plumber needed for residential plumbing work',
    requirements: ['5+ years experience', 'Own tools'],
    slots: 2,
    filledSlots: 0,
    distance: 5.2
  },
  {
    id: 'job_003',
    title: 'Electrician',
    contractor: 'Power Solutions',
    location: 'Sector 18, Noida',
    city: 'Noida',
    wage: 900,
    wageType: 'daily',
    duration: '2 months',
    startDate: '2024-03-05',
    category: 'electrical',
    description: 'Licensed electrician for commercial building wiring',
    requirements: ['ITI certificate', 'Commercial experience'],
    slots: 5,
    filledSlots: 2,
    distance: 3.8
  },
  {
    id: 'job_004',
    title: 'Painter',
    contractor: 'Color Masters',
    location: 'Sector 50, Noida',
    city: 'Noida',
    wage: 700,
    wageType: 'daily',
    duration: '1 month',
    startDate: '2024-02-28',
    category: 'painting',
    description: 'Interior and exterior painting for residential complex',
    requirements: ['Experience with spray painting', 'Height work comfortable'],
    slots: 8,
    filledSlots: 5,
    distance: 7.1
  },
  {
    id: 'job_005',
    title: 'Domestic Helper',
    contractor: 'Home Care Services',
    location: 'Sector 25, Noida',
    city: 'Noida',
    wage: 12000,
    wageType: 'monthly',
    duration: '6 months',
    startDate: '2024-03-01',
    category: 'domestic',
    description: 'Full-time domestic helper for household work',
    requirements: ['Cooking skills', 'Cleaning experience'],
    slots: 1,
    filledSlots: 0,
    distance: 4.3
  },
  {
    id: 'job_006',
    title: 'Carpenter',
    contractor: 'Wood Works Ltd',
    location: 'Sector 32, Noida',
    city: 'Noida',
    wage: 850,
    wageType: 'daily',
    duration: '2 months',
    startDate: '2024-03-10',
    category: 'carpentry',
    description: 'Skilled carpenter for furniture making and installation',
    requirements: ['Furniture making experience', 'Own basic tools'],
    slots: 4,
    filledSlots: 1,
    distance: 6.5
  }
];

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'construction', label: 'Construction' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'painting', label: 'Painting' },
  { value: 'domestic', label: 'Domestic' },
  { value: 'carpentry', label: 'Carpentry' }
];

/**
 * Job Search Component
 */
export default function JobSearch() {
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [filteredJobs, setFilteredJobs] = useState(MOCK_JOBS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minWage, setMinWage] = useState('');
  const [maxDistance, setMaxDistance] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    filterJobs();
  }, [searchQuery, selectedCategory, minWage, maxDistance]);

  const filterJobs = () => {
    let filtered = [...jobs];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.contractor.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }

    // Wage filter
    if (minWage) {
      filtered = filtered.filter(job => {
        const dailyWage = job.wageType === 'monthly' ? job.wage / 30 : job.wage;
        return dailyWage >= parseInt(minWage);
      });
    }

    // Distance filter
    if (maxDistance) {
      filtered = filtered.filter(job => job.distance <= parseFloat(maxDistance));
    }

    // Sort by distance
    filtered.sort((a, b) => a.distance - b.distance);

    setFilteredJobs(filtered);
  };

  const handleApply = (jobId) => {
    if (appliedJobs.includes(jobId)) {
      alert('You have already applied for this job!');
      return;
    }

    setAppliedJobs([...appliedJobs, jobId]);
    alert('Application submitted successfully! The contractor will contact you soon.');
    setSelectedJob(null);
  };

  const formatWage = (wage, wageType) => {
    return wageType === 'monthly' 
      ? `₹${wage.toLocaleString()}/month`
      : `₹${wage}/day`;
  };

  return (
    <div className="job-search">
      <div className="job-search__header">
        <h2>🔍 Job Marketplace</h2>
        <p>Find work opportunities near you</p>
      </div>

      {/* Search and Filters */}
      <div className="job-search__filters">
        <div className="job-search__search-box">
          <input
            type="text"
            placeholder="Search jobs, location, contractor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="job-search__input"
          />
        </div>

        <div className="job-search__filter-row">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="job-search__select"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min wage (₹/day)"
            value={minWage}
            onChange={(e) => setMinWage(e.target.value)}
            className="job-search__input job-search__input--small"
          />

          <input
            type="number"
            placeholder="Max distance (km)"
            value={maxDistance}
            onChange={(e) => setMaxDistance(e.target.value)}
            className="job-search__input job-search__input--small"
          />

          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setMinWage('');
              setMaxDistance('');
            }}
            className="job-search__clear-btn"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="job-search__results-info">
        Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
      </div>

      {/* Job Listings */}
      <div className="job-search__list">
        {filteredJobs.length === 0 ? (
          <div className="job-search__no-results">
            <p>No jobs found matching your criteria</p>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          filteredJobs.map(job => (
            <div key={job.id} className="job-card">
              <div className="job-card__header">
                <div>
                  <h3 className="job-card__title">{job.title}</h3>
                  <p className="job-card__contractor">{job.contractor}</p>
                </div>
                <div className="job-card__wage">
                  {formatWage(job.wage, job.wageType)}
                </div>
              </div>

              <div className="job-card__details">
                <div className="job-card__detail">
                  <span className="job-card__icon">📍</span>
                  <span>{job.location} ({job.distance} km away)</span>
                </div>
                <div className="job-card__detail">
                  <span className="job-card__icon">📅</span>
                  <span>Duration: {job.duration}</span>
                </div>
                <div className="job-card__detail">
                  <span className="job-card__icon">👥</span>
                  <span>{job.slots - job.filledSlots} of {job.slots} positions available</span>
                </div>
              </div>

              <p className="job-card__description">{job.description}</p>

              <div className="job-card__actions">
                <button
                  onClick={() => setSelectedJob(job)}
                  className="job-card__btn job-card__btn--view"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleApply(job.id)}
                  disabled={appliedJobs.includes(job.id)}
                  className={`job-card__btn job-card__btn--apply ${
                    appliedJobs.includes(job.id) ? 'job-card__btn--applied' : ''
                  }`}
                >
                  {appliedJobs.includes(job.id) ? '✓ Applied' : 'Apply Now'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="job-modal" onClick={() => setSelectedJob(null)}>
          <div className="job-modal__content" onClick={(e) => e.stopPropagation()}>
            <button
              className="job-modal__close"
              onClick={() => setSelectedJob(null)}
            >
              ×
            </button>

            <h2 className="job-modal__title">{selectedJob.title}</h2>
            <p className="job-modal__contractor">{selectedJob.contractor}</p>

            <div className="job-modal__wage-badge">
              {formatWage(selectedJob.wage, selectedJob.wageType)}
            </div>

            <div className="job-modal__section">
              <h3>Location</h3>
              <p>📍 {selectedJob.location}</p>
              <p>🚶 {selectedJob.distance} km from your location</p>
            </div>

            <div className="job-modal__section">
              <h3>Job Details</h3>
              <p><strong>Duration:</strong> {selectedJob.duration}</p>
              <p><strong>Start Date:</strong> {new Date(selectedJob.startDate).toLocaleDateString()}</p>
              <p><strong>Category:</strong> {selectedJob.category}</p>
              <p><strong>Available Positions:</strong> {selectedJob.slots - selectedJob.filledSlots} of {selectedJob.slots}</p>
            </div>

            <div className="job-modal__section">
              <h3>Description</h3>
              <p>{selectedJob.description}</p>
            </div>

            <div className="job-modal__section">
              <h3>Requirements</h3>
              <ul>
                {selectedJob.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleApply(selectedJob.id)}
              disabled={appliedJobs.includes(selectedJob.id)}
              className={`job-modal__apply-btn ${
                appliedJobs.includes(selectedJob.id) ? 'job-modal__apply-btn--applied' : ''
              }`}
            >
              {appliedJobs.includes(selectedJob.id) ? '✓ Already Applied' : 'Apply for This Job'}
            </button>
          </div>
        </div>
      )}

      {/* Demo Notice */}
      <div className="job-search__demo-notice">
        <p>💡 <strong>Demo Mode:</strong> This is mock job data. In production, jobs will be fetched from AWS DynamoDB with real-time geospatial matching.</p>
      </div>
    </div>
  );
}
