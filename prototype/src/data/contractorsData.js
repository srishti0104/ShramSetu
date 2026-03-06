/**
 * Contractor/Employer Mock Data for Jharkhand
 */

const JHARKHAND_CITIES = [
  'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Phusro',
  'Hazaribagh', 'Giridih', 'Ramgarh', 'Medininagar', 'Chirkunda', 'Chaibasa'
];

const COMPANY_TYPES = [
  'Construction Company', 'Mining Corporation', 'Steel Plant', 'Manufacturing Unit',
  'Government Department', 'Private Contractor', 'Infrastructure Developer', 'Real Estate Builder',
  'Industrial Project', 'Agricultural Cooperative', 'Transport Company', 'Service Provider'
];

const BUSINESS_CATEGORIES = [
  'construction', 'mining', 'manufacturing', 'agriculture', 'transport',
  'electrical', 'plumbing', 'painting', 'carpentry', 'welding', 'cleaning', 'security'
];

/**
 * Generate contractor profiles
 */
function generateContractors() {
  const contractors = [];
  const firstNames = [
    'Rajesh', 'Suresh', 'Ramesh', 'Mahesh', 'Dinesh', 'Naresh', 'Mukesh', 'Ritesh',
    'Anil', 'Sunil', 'Manoj', 'Vinod', 'Ashok', 'Deepak', 'Sanjay', 'Vijay',
    'Ravi', 'Amit', 'Rohit', 'Mohit', 'Sumit', 'Ajit', 'Lalit', 'Hemant',
    'Pradeep', 'Sandeep', 'Kuldeep', 'Mandeep', 'Jagdeep', 'Amardeep'
  ];
  
  const lastNames = [
    'Kumar', 'Singh', 'Sharma', 'Gupta', 'Verma', 'Mishra', 'Tiwari', 'Pandey',
    'Yadav', 'Prasad', 'Jha', 'Thakur', 'Sinha', 'Roy', 'Das', 'Mahto',
    'Oraon', 'Munda', 'Soren', 'Hembrom', 'Marandi', 'Tudu', 'Hansda', 'Kisku'
  ];

  const companies = [
    'Jharkhand Construction Ltd', 'Ranchi Builders', 'Tata Steel Projects', 'SAIL Contractors',
    'Coal India Services', 'Jharkhand Infrastructure', 'Bokaro Steel Works', 'Hindalco Projects',
    'Adani Mining Services', 'Vedanta Resources', 'JSW Steel Contractors', 'NTPC Projects',
    'Ranchi Municipal Corp', 'Jamshedpur Development', 'Dhanbad Coal Services', 'Hazaribagh Builders',
    'Giridih Stone Works', 'Deoghar Tourism Dept', 'Ramgarh Industries', 'Chaibasa Tribal Dev'
  ];

  for (let i = 1; i <= 50; i++) { // Back to 50 contractors
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const city = JHARKHAND_CITIES[Math.floor(Math.random() * JHARKHAND_CITIES.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const companyType = COMPANY_TYPES[Math.floor(Math.random() * COMPANY_TYPES.length)];
    const businessCategory = BUSINESS_CATEGORIES[Math.floor(Math.random() * BUSINESS_CATEGORIES.length)];
    
    // Generate experience (5-25 years)
    const experience = Math.floor(Math.random() * 20) + 5;
    
    // Generate rating (3.0-5.0)
    const rating = (Math.random() * 2 + 3).toFixed(1);
    
    // Generate number of projects completed
    const projectsCompleted = Math.floor(Math.random() * 200) + 10;
    
    // Generate team size
    const teamSize = Math.floor(Math.random() * 500) + 5;
    
    contractors.push({
      id: `contractor_${i}`,
      name: `${firstName} ${lastName}`,
      company: company,
      companyType: companyType,
      businessCategory: businessCategory,
      location: `${city}, Jharkhand`,
      experience: `${experience} years`,
      rating: parseFloat(rating),
      totalRatings: Math.floor(Math.random() * 500) + 50,
      projectsCompleted: projectsCompleted,
      teamSize: teamSize,
      contactNumber: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      establishedYear: 2024 - Math.floor(Math.random() * 15) - 5, // 5-20 years ago
      specializations: getSpecializations(businessCategory),
      certifications: getCertifications(businessCategory),
      workingAreas: getWorkingAreas(city),
      paymentTerms: getPaymentTerms(),
      languages: ['Hindi', 'English', getLocalLanguage()],
      verified: Math.random() < 0.8, // 80% verified
      trustScore: Math.floor(Math.random() * 30) + 70, // 70-100
      responseTime: `${Math.floor(Math.random() * 4) + 1} hours`,
      activeJobs: Math.floor(Math.random() * 10) + 1,
      description: `Experienced ${businessCategory} contractor in ${city} with ${experience} years of expertise. Specializing in quality work and timely delivery.`,
      workPhotos: Math.floor(Math.random() * 20) + 5, // 5-25 photos
      clientTestimonials: Math.floor(Math.random() * 50) + 10,
      insuranceCovered: Math.random() < 0.6, // 60% have insurance
      safetyRecord: Math.random() < 0.9 ? 'Excellent' : 'Good',
      equipmentOwned: Math.random() < 0.7, // 70% own equipment
      bankVerified: Math.random() < 0.85, // 85% bank verified
      gstRegistered: Math.random() < 0.75, // 75% GST registered
      panVerified: Math.random() < 0.95, // 95% PAN verified
      lastActive: getLastActiveTime(),
      joinedDate: getJoinedDate(),
      preferredWorkType: getPreferredWorkType(businessCategory),
      minimumProjectValue: getMinimumProjectValue(businessCategory),
      maximumProjectValue: getMaximumProjectValue(businessCategory)
    });
  }
  
  return contractors;
}

function getSpecializations(category) {
  const specializations = {
    construction: ['Residential Building', 'Commercial Construction', 'Road Construction', 'Bridge Construction'],
    mining: ['Coal Mining', 'Iron Ore Mining', 'Stone Quarrying', 'Sand Mining'],
    manufacturing: ['Steel Production', 'Cement Manufacturing', 'Textile Production', 'Food Processing'],
    electrical: ['Power Distribution', 'Industrial Wiring', 'Solar Installation', 'Electrical Maintenance'],
    plumbing: ['Water Supply Systems', 'Drainage Systems', 'Bathroom Fitting', 'Pipeline Installation'],
    painting: ['Interior Painting', 'Exterior Painting', 'Industrial Coating', 'Decorative Painting'],
    carpentry: ['Furniture Making', 'Door Installation', 'Flooring', 'Custom Woodwork'],
    welding: ['Structural Welding', 'Pipeline Welding', 'Fabrication Work', 'Repair Welding'],
    agriculture: ['Crop Farming', 'Livestock Management', 'Irrigation Systems', 'Organic Farming'],
    transport: ['Goods Transportation', 'Passenger Service', 'Logistics', 'Vehicle Maintenance'],
    cleaning: ['Industrial Cleaning', 'Office Cleaning', 'Deep Cleaning', 'Waste Management'],
    security: ['Industrial Security', 'Residential Security', 'Event Security', 'CCTV Installation']
  };
  
  const categorySpecs = specializations[category] || ['General Work'];
  return categorySpecs.slice(0, Math.floor(Math.random() * 3) + 1);
}

function getCertifications(category) {
  const certifications = {
    construction: ['Civil Engineering Diploma', 'Safety Management Certificate', 'Quality Control Certificate'],
    mining: ['Mining Engineering Certificate', 'Safety Officer License', 'Explosives Handling License'],
    electrical: ['Electrical License', 'Safety Certificate', 'Solar Installation Certificate'],
    welding: ['Welding Certificate', 'Safety Training', 'Quality Assurance Certificate']
  };
  
  const categoryCerts = certifications[category] || ['Trade Certificate', 'Safety Training'];
  return categoryCerts.slice(0, Math.floor(Math.random() * 2) + 1);
}

function getWorkingAreas(baseCity) {
  const areas = [baseCity];
  const otherCities = JHARKHAND_CITIES.filter(city => city !== baseCity);
  const additionalAreas = otherCities.slice(0, Math.floor(Math.random() * 3) + 1);
  return [...areas, ...additionalAreas];
}

function getPaymentTerms() {
  const terms = ['Weekly Payment', 'Bi-weekly Payment', 'Monthly Payment', 'Project Completion', 'Milestone Based'];
  return terms[Math.floor(Math.random() * terms.length)];
}

function getLocalLanguage() {
  const languages = ['Nagpuri', 'Khortha', 'Kurmali', 'Santali', 'Ho', 'Mundari'];
  return languages[Math.floor(Math.random() * languages.length)];
}

function getLastActiveTime() {
  const hours = Math.floor(Math.random() * 72); // Last 3 days
  if (hours < 1) return 'Online now';
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

function getJoinedDate() {
  const daysAgo = Math.floor(Math.random() * 1095); // Last 3 years
  const joinDate = new Date();
  joinDate.setDate(joinDate.getDate() - daysAgo);
  return joinDate.toISOString().split('T')[0];
}

function getPreferredWorkType(category) {
  const workTypes = {
    construction: ['Large Projects', 'Residential Work', 'Commercial Projects', 'Government Contracts'],
    mining: ['Long-term Contracts', 'Equipment-based Work', 'Safety-critical Projects'],
    manufacturing: ['Production Work', 'Quality Control', 'Maintenance Projects'],
    electrical: ['Installation Work', 'Maintenance Contracts', 'Emergency Repairs'],
    plumbing: ['New Installations', 'Repair Work', 'Maintenance Contracts'],
    painting: ['Large Scale Projects', 'Decorative Work', 'Industrial Coating'],
    carpentry: ['Custom Work', 'Bulk Orders', 'Repair Services'],
    welding: ['Fabrication Projects', 'Repair Work', 'Structural Work'],
    agriculture: ['Seasonal Work', 'Long-term Contracts', 'Organic Projects'],
    transport: ['Regular Routes', 'Contract Work', 'Emergency Services'],
    cleaning: ['Regular Contracts', 'Deep Cleaning', 'Specialized Cleaning'],
    security: ['Long-term Contracts', 'Event Security', 'Residential Security']
  };
  
  const categoryTypes = workTypes[category] || ['General Work'];
  return categoryTypes[Math.floor(Math.random() * categoryTypes.length)];
}

function getMinimumProjectValue(category) {
  const minimums = {
    construction: 50000,
    mining: 100000,
    manufacturing: 75000,
    electrical: 25000,
    plumbing: 15000,
    painting: 10000,
    carpentry: 20000,
    welding: 30000,
    agriculture: 20000,
    transport: 15000,
    cleaning: 5000,
    security: 10000
  };
  
  const baseMin = minimums[category] || 10000;
  return baseMin + Math.floor(Math.random() * baseMin * 0.5);
}

function getMaximumProjectValue(category) {
  const maximums = {
    construction: 5000000,
    mining: 10000000,
    manufacturing: 7500000,
    electrical: 2500000,
    plumbing: 1500000,
    painting: 1000000,
    carpentry: 2000000,
    welding: 3000000,
    agriculture: 2000000,
    transport: 1500000,
    cleaning: 500000,
    security: 1000000
  };
  
  const baseMax = maximums[category] || 1000000;
  return baseMax + Math.floor(Math.random() * baseMax * 0.5);
}

export const CONTRACTORS_DATA = generateContractors();
export { JHARKHAND_CITIES, BUSINESS_CATEGORIES };