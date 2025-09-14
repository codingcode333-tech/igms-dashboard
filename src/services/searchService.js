import axios from "axios";

// FastAPI backend configuration
const FASTAPI_BASE_URL = "https://cdis.iitk.ac.in/consumer_api";

const searchInstance = axios.create({
  baseURL: FASTAPI_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "accept": "application/json"
  },
});

// Search types constants
export const SEARCH_TYPES = {
  SEMANTIC: 1,
  KEYWORD: 2,
  HYBRID: 3
};

/**
 * Search grievances using the FastAPI backend
 * @param {Object} params - Search parameters
 * @param {string} params.query - Search query string
 * @param {number} params.value - Search type (1=Semantic, 2=Keyword, 3=Hybrid)
 * @param {number} params.skiprecord - Number of records to skip (for pagination)
 * @param {number} params.size - Number of records to return
 * @param {number} params.threshold - Relevance threshold
 * @returns {Promise} API response with grievance data
 */
export const searchGrievances = async (params = {}) => {
  const defaultParams = {
    query: "",
    value: SEARCH_TYPES.SEMANTIC,
    skiprecord: 0,
    size: 20,
    threshold: 1.5
  };

  const searchParams = { ...defaultParams, ...params };

  try {
    const response = await searchInstance.get('/search/', {
      params: searchParams
    });

    return {
      success: true,
      data: response.data,
      totalCount: response.data.total_count?.total_count || 0,
      grievances: response.data.grievanceData || []
    };
  } catch (error) {
    console.error("Search API Error:", error);
    return {
      success: false,
      error: error.response?.data || error.message,
      data: null,
      totalCount: 0,
      grievances: []
    };
  }
};

/**
 * Semantic search for grievances
 * @param {string} query - Search query
 * @param {Object} options - Additional options (skiprecord, size, threshold)
 * @returns {Promise} Search results
 */
export const semanticSearch = (query, options = {}) => {
  return searchGrievances({
    query,
    value: SEARCH_TYPES.SEMANTIC,
    ...options
  });
};

/**
 * Keyword search for grievances
 * @param {string} query - Search query
 * @param {Object} options - Additional options (skiprecord, size, threshold)
 * @returns {Promise} Search results
 */
export const keywordSearch = (query, options = {}) => {
  return searchGrievances({
    query,
    value: SEARCH_TYPES.KEYWORD,
    ...options
  });
};

/**
 * Hybrid search for grievances
 * @param {string} query - Search query
 * @param {Object} options - Additional options (skiprecord, size, threshold)
 * @returns {Promise} Search results
 */
export const hybridSearch = (query, options = {}) => {
  return searchGrievances({
    query,
    value: SEARCH_TYPES.HYBRID,
    ...options
  });
};

/**
 * Get grievance statistics from search results
 * @param {string} query - Search query for statistics
 * @returns {Promise} Statistics data
 */
export const getGrievanceStats = async (query = "") => {
  try {
    // Get a larger sample for statistics
    const result = await searchGrievances({
      query: query || "*", // Use wildcard if no query
      value: SEARCH_TYPES.SEMANTIC,
      skiprecord: 0,
      size: 1000, // Get more records for better statistics
      threshold: 0.5 // Lower threshold for broader results
    });

    if (result.success && result.grievances.length > 0) {
      const grievances = result.grievances;
      
      // Calculate statistics
      const stats = {
        total: result.totalCount,
        statusDistribution: calculateStatusDistribution(grievances),
        categoryDistribution: calculateCategoryDistribution(grievances),
        stateDistribution: calculateStateDistribution(grievances),
        monthlyTrends: calculateMonthlyTrends(grievances),
        companyDistribution: calculateCompanyDistribution(grievances)
      };

      return {
        success: true,
        data: stats
      };
    }

    return {
      success: false,
      error: "No data available for statistics"
    };
  } catch (error) {
    console.error("Statistics API Error:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate AI categories for complaints using the FastAPI backend
 * @param {Object} params - Request parameters
 * @param {string} params.startdate - Start date for data range
 * @param {string} params.enddate - End date for data range  
 * @param {string} params.ministry - Ministry/department name
 * @param {Object} params.rcadata - RCA data structure with words, count, doc_ids
 * @returns {Promise} AI-generated categories response
 */
export const generateAICategories = async (params = {}) => {
  const defaultParams = {
    startdate: "2024-01-01",
    enddate: "2024-12-31", 
    ministry: "DOCAF",
    rcadata: {
      words: [],
      count: 0,
      doc_ids: []
    }
  };

  const requestParams = { ...defaultParams, ...params };

  try {
    const response = await searchInstance.post('/generate_ai_categories', requestParams);

    return {
      success: true,
      data: response.data,
      categories: response.data || {}
    };
  } catch (error) {
    console.error("AI Categories API Error:", error);
    return {
      success: false,
      error: error.response?.data || error.message,
      data: null,
      categories: {}
    };
  }
};

// Helper functions for statistics calculation
const calculateStatusDistribution = (grievances) => {
  const statusCount = {};
  grievances.forEach(grievance => {
    const status = grievance.complaintStatus || 'Unknown';
    statusCount[status] = (statusCount[status] || 0) + 1;
  });
  return statusCount;
};

const calculateCategoryDistribution = (grievances) => {
  const categoryCount = {};
  grievances.forEach(grievance => {
    const category = grievance.categoryCode || 'Unknown';
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });
  return categoryCount;
};

const calculateStateDistribution = (grievances) => {
  const stateCount = {};
  grievances.forEach(grievance => {
    const state = grievance.stateName || 'Unknown';
    if (state !== 'nan' && state !== 'Unknown') {
      stateCount[state] = (stateCount[state] || 0) + 1;
    }
  });
  return stateCount;
};

const calculateMonthlyTrends = (grievances) => {
  const monthlyCount = {};
  grievances.forEach(grievance => {
    if (grievance.complaintRegDate) {
      const date = new Date(grievance.complaintRegDate);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyCount[monthYear] = (monthlyCount[monthYear] || 0) + 1;
    }
  });
  return monthlyCount;
};

const calculateCompanyDistribution = (grievances) => {
  const companyCount = {};
  grievances.forEach(grievance => {
    const company = grievance.companyName || 'Unknown';
    if (company !== 'nan' && company !== '' && company !== 'Unknown') {
      companyCount[company] = (companyCount[company] || 0) + 1;
    }
  });
  return companyCount;
};

const searchService = {
  searchGrievances,
  semanticSearch,
  keywordSearch,
  hybridSearch,
  getGrievanceStats,
  generateAICategories,
  SEARCH_TYPES
};

export default searchService;
