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
            type: filters.type,
            state: filters.state,
            district: filters.district,
            ministry: filters.ministry,
            startDate: filters.startDate,
            endDate: filters.endDate,
            fullFiltersObject: JSON.stringify(filters, null, 2)
        });

        // Use CDIS API to get search results and calculate state distribution
        // NOTE: CDIS API only supports: query, value, skiprecord, size, threshold
        const searchParams = {
            query: filters.query || "",
            value: filters.type || 1,
            skiprecord: 0,
            size: 5000, // Get large dataset for state distribution
            threshold: filters.threshold || 1.2
        };

        console.log('📡 CDIS API call for state counts (only supported params):', searchParams);

        const result = await httpService.search.searchGrievances(searchParams);
        
        if (result.success && result.data?.grievanceData) {
            let grievances = result.data.grievanceData;
            console.log('📊 Processing', grievances.length, 'grievances for state distribution');

            // CLIENT-SIDE FILTERING: Apply all filters since CDIS API doesn't support them
            
            // Apply ministry filter if specified
            if (filters.ministry && filters.ministry !== 'All') {
                const originalCount = grievances.length;
                grievances = grievances.filter(grievance => {
                    const grievanceMinistry = (grievance.ministry || '').toLowerCase().trim();
                    const filterMinistry = filters.ministry.toLowerCase().trim();
                    
                    return grievanceMinistry.includes(filterMinistry) || filterMinistry.includes(grievanceMinistry);
                });
                console.log(`🎯 After ministry filter: ${originalCount} → ${grievances.length} grievances for "${filters.ministry}"`);
            }

                        // Apply date range filter if specified (with smart fallback for old data)
            if (filters.startDate && filters.endDate) {
                const originalCount = grievances.length;
                
                // Check available years in data
                const uniqueYears = [...new Set(grievances.map(item => {
                    const date = new Date(item.recvd_date);
                    return isNaN(date.getTime()) ? 'invalid' : date.getFullYear();
                }).filter(year => year !== 'invalid'))].sort();
                
                // If searching for recent dates (2024+) but data is old, skip date filtering
                const filterStartYear = new Date(filters.startDate).getFullYear();
                const filterEndYear = new Date(filters.endDate).getFullYear();
                const dataMaxYear = Math.max(...uniqueYears.filter(y => y !== 'invalid'));
                
                if (filterStartYear > dataMaxYear && filterStartYear >= 2024) {
                    console.log(`⚠️ Maps: Skipping date filter: Searching for ${filterStartYear}-${filterEndYear} but data only goes up to ${dataMaxYear}`);
                    console.log('🗺️ Maps: Showing all available data instead of filtering by recent dates');
                } else {
                    grievances = grievances.filter(grievance => {
                        const grievanceDate = new Date(grievance.recvd_date);
                        
                        // Check if date is valid
                        if (isNaN(grievanceDate.getTime())) {
                            return false; // Exclude items with invalid dates
                        }
                        
                        let isInRange = true;
                        
                        if (filters.startDate) {
                            const startDate = new Date(filters.startDate);
                            isInRange = isInRange && grievanceDate >= startDate;
                        }
                        
                        if (filters.endDate) {
                            const endDate = new Date(filters.endDate);
                            endDate.setHours(23, 59, 59, 999);
                            isInRange = isInRange && grievanceDate <= endDate;
                        }
                        
                        return isInRange;
                    });
                    console.log(`📅 Maps: After date filter: ${originalCount} → ${grievances.length} grievances for ${filters.startDate} to ${filters.endDate}`);
                }
            }

            // Apply state filter if specified
            if (filters.state && filters.state !== 'All') {
                grievances = grievances.filter(grievance => {
                    const stateFields = ['state', 'stateName', 'State', 'location'];
                    for (const field of stateFields) {
                        if (grievance[field]) {
                            const grievanceState = grievance[field].toString().toLowerCase();
                            const filterState = filters.state.toLowerCase();
                            if (grievanceState.includes(filterState) || filterState.includes(grievanceState)) {
                                return true;
                            }
                        }
                    }
                    return false;
                });
                console.log('🎯 After state filter, found', grievances.length, 'grievances for', filters.state);
                
                // Debug: Show available districts for this state and sample grievance structure
                if (filters.district && filters.district !== 'All') {
                    const availableDistricts = new Set();
                    grievances.forEach(grievance => {
                        if (grievance.district && grievance.district !== 'Unknown') {
                            availableDistricts.add(grievance.district.toString().toLowerCase());
                        }
                    });
                    console.log('🏘️ Available districts in', filters.state + ':', Array.from(availableDistricts));
                    
                    // Debug: Show sample grievance structure
                    if (grievances.length > 0) {
                        console.log('📋 Sample grievance structure:', {
                            id: grievances[0].id,
                            state: grievances[0].state,
                            district: grievances[0].district,
                            name: grievances[0].name
                        });
                    }
                }
            }

            // Apply district filter if specified
            if (filters.district && filters.district !== 'All') {
                grievances = grievances.filter(grievance => {
                    // Since data is already transformed, only check the 'district' field
                    if (grievance.district && grievance.district !== 'Unknown') {
                        const grievanceDistrict = grievance.district.toString().toLowerCase().trim();
                        const filterDistrict = filters.district.toLowerCase().trim();
                        
                        // Handle common district name variations
                        const normalizeDistrict = (name) => {
                            return name
                                .replace(/\s+/g, ' ') // normalize spaces
                                .replace(/\bnagar\b/g, '') // remove "nagar" 
                                .replace(/\bdistrict\b/g, '') // remove "district"
                                .trim();
                        };
                        
                        const normalizedGrievanceDistrict = normalizeDistrict(grievanceDistrict);
                        const normalizedFilterDistrict = normalizeDistrict(filterDistrict);
                        
                        // Check exact match, partial match, or normalized match
                        if (grievanceDistrict === filterDistrict ||
                            grievanceDistrict.includes(filterDistrict) || 
                            filterDistrict.includes(grievanceDistrict) ||
                            normalizedGrievanceDistrict.includes(normalizedFilterDistrict) ||
                            normalizedFilterDistrict.includes(normalizedGrievanceDistrict)) {
                            return true;
                        }
                    }
                    return false;
                });
                console.log('🎯 After district filter, found', grievances.length, 'grievances for', filters.district);
                
                // If no grievances found for specific district, fallback to state-level data
                if (grievances.length === 0 && filters.state && filters.state !== 'All') {
                    console.log('🔄 No data found for district, falling back to state-level data for', filters.state);
                    // Re-get grievances with only state filter (no district filter)
                    let stateOnlyGrievances = result.data.grievanceData;
                    
                    // Apply only state filter
                    stateOnlyGrievances = stateOnlyGrievances.filter(grievance => {
                        const stateFields = ['state', 'stateName', 'State', 'location'];
                        for (const field of stateFields) {
                            if (grievance[field]) {
                                const grievanceState = grievance[field].toString().toLowerCase();
                                const filterState = filters.state.toLowerCase();
                                if (grievanceState.includes(filterState) || filterState.includes(grievanceState)) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    });
                    
                    console.log('🎯 Fallback: Found', stateOnlyGrievances.length, 'grievances for state', filters.state);
                    grievances = stateOnlyGrievances;
                }
            }

            // Calculate state-wise distribution from filtered results
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