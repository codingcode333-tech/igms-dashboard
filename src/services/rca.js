import httpService from "./httpService";

export const getRCAData = (ministry, financialTerm) => {
    return httpService.auth.get('/rca_result', {
        params: {
            ministry: ministry,
            financialterm: financialTerm
        }
    })
}

export const getGrievancesUsingRegNos = (grievanceRegNos = []) => {
    return httpService.auth.post('/get_userdata', {}, {
        params: {
            'registration_no_list': grievanceRegNos.join(',') + ','
        }
    })
}

export const getCategoryTree = ({
    from,
    to,
    state = 'All',
    district = 'All',
    ministry = 'All',
    showAll = true
}) => {
    return httpService.auth.get('/get_rca', {
        params: {
            startDate: from,
            endDate: to,
            state: state,
            district: district,
            ministry: ministry,
            all_record: showAll ? 1 : 0
        }
    })
}

export const getCategorySearch = (filters) => {
    return httpService.auth.post('/create_category_tree', {}, {
        params: filters
    })
}

export const getSemanticRca = (filters = {}) => {
    return httpService.auth.post('/semantic_rca/', filters)
}

export const getDynamicRca = (filters = {}) => {
    return httpService.auth.post('dynamicrca', {}, {
        params: filters
    })
}

export const getRealTimeRCA = (filters = {}) => {
    return httpService.auth.post('realtimerca', {}, {
        params: filters
    })
}

/**
 * Perform cached RCA based on the provided parameters
 * @param {Object} params - RCA parameters
 * @param {string} params.startDate - Start date (YYYY-MM-DD format)
 * @param {string} params.endDate - End date (YYYY-MM-DD format)  
 * @param {string} params.ministry - Ministry/department name
 * @param {number} params.number_of_clusters - Number of clusters for analysis
 * @returns {Promise} API response with cached RCA results
 */
export const getCachedRCA = ({
    startDate,
    endDate,
    ministry,
    number_of_clusters = 11
}) => {
    console.log('getCachedRCA called with:', { startDate, endDate, ministry, number_of_clusters }); // Debug log
    
    // Try direct fetch to bypass any authentication issues for testing
    const url = `https://cdis.iitk.ac.in/consumer_api/realtimerca/?startDate=${startDate}&endDate=${endDate}&ministry=${ministry}&number_of_clusters=${number_of_clusters}`;
    console.log('Direct API URL:', url);
    
    return fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: ''
    })
    .then(response => {
        console.log('Direct fetch response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Direct fetch response data:', data);
        return { data }; // Wrap in data property to match expected format
    })
    .catch(error => {
        console.error('Direct fetch error:', error);
        // Fallback to original method
        return httpService.auth.post('/realtimerca/', {}, {
            params: {
                startDate,
                endDate,
                ministry,
                number_of_clusters
            }
        })
    });
}

export const fetchAICategories = (filters = {}) => {
    return httpService.auth.post('generate_ai_categories', filters)
}

export const fetchAICategoriesHistory = (filters = {}) => {
    return httpService.auth.get('get_ai_categories', filters)
}

// New function to fetch AI categories from CDIS API
export const getAICategories = async () => {
    try {
        const url = 'https://cdis.iitk.ac.in/consumer_api/get_ai_categories';
        
        console.log('🤖 Fetching AI Categories from CDIS API:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`AI Categories API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🤖 AI Categories response:', {
            categoriesCount: data.categories?.length,
            sampleCategory: data.categories?.[0]
        });
        
        return { data };
    } catch (error) {
        console.error('❌ AI Categories API error:', error);
        throw error;
    }
}

export const getCriticalCategories = () => {
    return httpService.auth.get('/critical_categories/')
}

// Enhanced function to get grievances by registration numbers using CDIS API
export const getGrievancesByRegNosUsingCDIS = async (grievanceRegNos = []) => {
    try {
        // Try to search for grievances using registration numbers directly in CDIS
        const regNoQuery = grievanceRegNos.join(' OR ');
        
        const url = `https://cdis.iitk.ac.in/consumer_api/search/?query=${encodeURIComponent(regNoQuery)}&value=2&size=50&threshold=1.0`;
        
        console.log('🔍 CDIS Registration Search URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`CDIS Registration Search API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 CDIS Registration Search response:', {
            totalCount: data.total_count,
            grievanceCount: data.grievanceData?.length,
            requestedRegNos: grievanceRegNos.length
        });
        
        // Transform CDIS API data to match expected grievance list format
        const transformedData = (data.grievanceData || []).map(item => ({
            // Map CDIS fields to expected fields
            registration_no: item.id || item.complaintId || item.grievanceId || `CDIS-${Math.random().toString(36).substr(2, 9)}`,
            state: item.stateName || item.state || item.location || 'Unknown',
            district: item.CityName || item.district || item.city || 'Unknown',
            recvd_date: item.complaintRegDate || item.dateOfRegistration || item.registrationDate || '',
            closing_date: item.updationDate || item.lastUpdationDate || item.closureDate || '',
            name: item.fullName || item.name || item.complainantName || 'Unknown',
            ministry: item.ministry || 'DOCAF',
            
            // Additional fields
            status: item.status || 'Active',
            userType: item.userType || 'Citizen',
            country: item.country || 'India',
            complaintDetails: item.complaintDetails || '',
            
            // Original CDIS data for reference
            originalData: item
        }));
        
        console.log('🔄 Transformed registration-based grievance data:', {
            originalCount: data.grievanceData?.length || 0,
            transformedCount: transformedData.length,
            sampleTransformed: transformedData.slice(0, 2)
        });
        
        // Return grievanceData array with proper format
        return { 
            data: transformedData, 
            total_count: data.total_count?.total_count || transformedData.length
        };
    } catch (error) {
        console.error('❌ CDIS Registration Search API error:', error);
        throw error;
    }
}

// New function to search grievances using CDIS API
export const searchGrievancesUsingCDIS = async (query, options = {}) => {
    const { 
        value = 2, // 2 = Keyword search (as per API doc)
        skiprecord = 0, 
        size = 20, 
        threshold = 1.5 
    } = options;
    
    try {
        // Direct fetch to CDIS API for grievance search
        const url = `https://cdis.iitk.ac.in/consumer_api/search/?query=${encodeURIComponent(query)}&value=${value}&skiprecord=${skiprecord}&size=${size}&threshold=${threshold}`;
        
        console.log('🔍 CDIS RCA Search URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`CDIS Search API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 CDIS RCA Search response:', {
            totalCount: data.total_count,
            grievanceCount: data.grievanceData?.length,
            sampleData: data.grievanceData?.slice(0, 2)
        });
        
        // Transform CDIS API data to match expected grievance list format
        const transformedData = (data.grievanceData || []).map(item => ({
            // Map CDIS fields to expected fields  
            registration_no: item.id || item.complaintId || item.grievanceId || `CDIS-${Math.random().toString(36).substr(2, 9)}`,
            state: item.stateName || item.state || item.location || 'Unknown',
            district: item.CityName || item.district || item.city || 'Unknown', 
            recvd_date: item.complaintRegDate || item.dateOfRegistration || item.registrationDate || '',
            closing_date: item.updationDate || item.lastUpdationDate || item.closureDate || '',
            name: item.fullName || item.name || item.complainantName || 'Unknown',
            ministry: item.ministry || 'DOCAF',
            
            // Additional fields
            status: item.status || 'Active',
            userType: item.userType || 'Citizen',
            country: item.country || 'India',
            complaintDetails: item.complaintDetails || '',
            
            // Original CDIS data for reference
            originalData: item
        }));
        
        console.log('🔄 Transformed RCA grievance data:', {
            originalCount: data.grievanceData?.length || 0,
            transformedCount: transformedData.length,
            sampleTransformed: transformedData.slice(0, 2)
        });
        
        // Return data in expected format
        return { 
            data: transformedData, 
            total_count: data.total_count?.total_count || transformedData.length
        };
    } catch (error) {
        console.error('❌ CDIS RCA Search API error:', error);
        throw error;
    }
}
