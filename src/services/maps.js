import { defaultThreshold } from "@/helpers/env";
import httpService from "./httpService";
import { filteredQueryBuilder } from "./grievances";

const handleCatch = (error, reject) => {
    console.log(error)
    reject(error)
}

const getHeatmapGrievances = (ministry, from, to) => {
    return httpService.auth.get('/graph_statistics3', {
        params: {
            'startDate': from,
            'endDate': to,
            'ministry': ministry
        }
    })
}

const getPmayGrievances = (ministry, from, to) => {
    return new Promise((resolve, reject) => {
        httpService.get('/search', {
            params: {
                'query': 'pmay',
                'value': 1,
                'startDate': from,
                'endDate': to,
                'ministry': ministry
            }
        })
            .then(response => resolve(response))
            .catch(error => handleCatch(error, reject))
    })
}

const getDistrictCount = (state, ministry, from, to) => {
    return httpService.auth.get('/get_district_count', {
        params: {
            state: state,
            ministry: ministry,
            startDate: from,
            endDate: to
        }
    })
}

const searchSpatially = (query, type, ministry, from, to, state = 'All', district = 'All', showClosed = 1, threshold = defaultThreshold, recordInHistory = true) => {
    return httpService.auth.get('/spatial_analysis', {
        params: {
            query: query,
            type: type,
            startDate: from,
            endDate: to,
            state: state,
            district: district,
            ministry: ministry,
            all_record: showClosed,
            threshold: threshold,
            page_req: recordInHistory ? 0 : 1
        }
    })
}

const searchSpatiallyAndSilently = (query, type, ministry, from, to) => {
    return searchSpatially(query, type, ministry, from, to, 'All', 'All', 1, defaultThreshold, false)
}

const searchSpatiallyForState = (filename, state) => {
    return httpService.auth.get('/get_state_data', {
        params: {
            filename: filename,
            state: state
        }
    })
}

const stateWiseCounts = async (filters, page_no) => {
    try {
        console.log('🗺️ Fetching state-wise counts from CDIS API:', { 
            query: filters.query, 
            type: filters.type 
        });

        // Use CDIS API to get search results and calculate state distribution
        const searchParams = {
            query: filters.query || "",
            value: filters.type || 1,
            skiprecord: 0,
            size: 5000, // Get more data for accurate state distribution
            threshold: filters.threshold || 0.5
        };

        const result = await httpService.search.searchGrievances(searchParams);
        
        if (result.success && result.data?.grievanceData) {
            const grievances = result.data.grievanceData;
            console.log('📊 Processing', grievances.length, 'grievances for state distribution');

            // Calculate state-wise distribution
            const stateWiseDistribution = {};
            
            grievances.forEach(grievance => {
                // Try different possible state field names
                const stateFields = ['state', 'stateName', 'State', 'location'];
                let state = null;
                
                for (const field of stateFields) {
                    if (grievance[field]) {
                        state = grievance[field];
                        break;
                    }
                }
                
                if (state) {
                    const stateName = state.toString().toLowerCase();
                    stateWiseDistribution[stateName] = (stateWiseDistribution[stateName] || 0) + 1;
                } else {
                    // Fallback to 'unknown' for grievances without state
                    stateWiseDistribution['unknown'] = (stateWiseDistribution['unknown'] || 0) + 1;
                }
            });

            console.log('🗺️ State distribution calculated:', stateWiseDistribution);

            return {
                data: {
                    state_wise_distribution: stateWiseDistribution
                },
                status: 200
            };
        } else {
            console.warn('⚠️ No grievance data found in CDIS API response');
            return {
                data: {
                    state_wise_distribution: {}
                },
                status: 200
            };
        }
    } catch (error) {
        console.error('❌ Error fetching state-wise counts:', error);
        
        // Fallback to original implementation if CDIS API fails
        return filteredQueryBuilder('/get_state_wise_distribution', filters, page_no);
    }
}

const districtWiseCounts = async (filters, page_no) => {
    try {
        console.log('🏘️ Fetching district-wise counts from CDIS API for state:', filters.state);

        // Use CDIS API to get search results and calculate district distribution
        const searchParams = {
            query: filters.query || "",
            value: filters.type || 1,
            skiprecord: 0,
            size: 5000, // Get more data for accurate district distribution
            threshold: filters.threshold || 0.5
        };

        const result = await httpService.search.searchGrievances(searchParams);
        
        if (result.success && result.data?.grievanceData) {
            const grievances = result.data.grievanceData;
            console.log('📊 Processing', grievances.length, 'grievances for district distribution');

            // Filter by state and calculate district-wise distribution
            const districtWiseDistribution = {};
            
            grievances.forEach(grievance => {
                // Try different possible field names
                const stateFields = ['state', 'stateName', 'State', 'location'];
                const districtFields = ['district', 'districtName', 'District', 'city', 'CityName'];
                
                let state = null;
                let district = null;
                
                // Find state
                for (const field of stateFields) {
                    if (grievance[field]) {
                        state = grievance[field].toString().toLowerCase();
                        break;
                    }
                }
                
                // Find district
                for (const field of districtFields) {
                    if (grievance[field]) {
                        district = grievance[field];
                        break;
                    }
                }
                
                // Only count if state matches the filter
                if (state && filters.state && state.includes(filters.state.toLowerCase())) {
                    if (district) {
                        const districtName = district.toString().toLowerCase();
                        districtWiseDistribution[districtName] = (districtWiseDistribution[districtName] || 0) + 1;
                    } else {
                        districtWiseDistribution['unknown'] = (districtWiseDistribution['unknown'] || 0) + 1;
                    }
                }
            });

            console.log('🏘️ District distribution calculated:', districtWiseDistribution);

            return {
                data: {
                    district_wise_distribution: districtWiseDistribution
                },
                status: 200
            };
        } else {
            return {
                data: {
                    district_wise_distribution: {}
                },
                status: 200
            };
        }
    } catch (error) {
        console.error('❌ Error fetching district-wise counts:', error);
        
        // Fallback to original implementation
        return filteredQueryBuilder('/get_district_wise_distribution', filters, page_no);
    }
}

export default {
    getHeatmapGrievances,
    getPmayGrievances,
    getDistrictCount,
    searchSpatially,
    searchSpatiallyAndSilently,
    searchSpatiallyForState,
    stateWiseCounts,
    districtWiseCounts
}