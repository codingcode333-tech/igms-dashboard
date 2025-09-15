import { countDayDuration, pageSize } from "@/helpers/env";
import httpService from "./httpService";
import { formatDate, dateBefore } from "@/helpers/date";
import { getDefaultDepartment } from "@/data";

export const filteredQueryBuilder = (route, filters, page_no) => {
    let isDateSet = filters.startDate && filters.endDate

    return httpService.auth.get(route, {
        params: {
            ...filters,
            value: filters.type,
            query: filters.query,
            startDate: isDateSet ? filters.startDate : null,
            endDate: isDateSet ? filters.endDate : null,
            skiprecord: (page_no - 1) * pageSize,
            size: filters.size ?? pageSize,
            state: filters.state,
            district: filters.district,
            ministry: filters.ministry,
            all_record: filters.all_record,
            page_req: ['0', '1'].includes(filters.page_req)
                ? filters.page_req
                : (page_no == 1 ? 0 : 1)
        }
    })
}



// Deprecated >
function getPrimary(pageno, filters) {

    return httpService.get(`/profile/?skiprecord=0&size=40`);

}

function getFresh(pageno, filters) {

    return httpService.get(`/fresh/?startDate=${filters.startDate}&endDate=${filters.endDate}&skiprecord=${(pageno - 1) * 20}&size=20&state=${filters.state}&district=${filters.district}&ministry=${filters.ministry}&all_record=1&download_req=0&page_req=0&filename=unknown&user=user`);

}

function getNormal(pageno, filters) {

    return httpService.get(`/primary/?startDate=${filters.startDate}&endDate=${filters.endDate}&skiprecord=${(pageno - 1) * 20}&size=20&state=${filters.state}&district=${filters.district}&ministry=${filters.ministry}&all_record=1&download_req=0&page_req=0&filename=unknown&user=user`);

}

function getSpam(pageno, filters) {

    return httpService.get(`/spam/?startDate=${filters.startDate}&endDate=${filters.endDate}&skiprecord=${(pageno - 1) * 20}&size=20&state=${filters.state}&district=${filters.district}&ministry=${filters.ministry}&all_record=1&download_req=0&page_req=0&filename=unknown&user=user`);

}

function getPriority(pageno, filters) {

    return httpService.get(`/urgent/?startDate=${filters.startDate}&endDate=${filters.endDate}&skiprecord=${(pageno - 1) * 20}&size=20&state=${filters.state}&district=${filters.district}&ministry=${filters.ministry}&all_record=1&download_req=0&page_req=0&filename=unknown&user=user`);

}

function getRepeat(pageno, filters) {

    return httpService.get(`/repeat/?startDate=${filters.startDate}&endDate=${filters.endDate}&skiprecord=${(pageno - 1) * 20}&size=20&state=${filters.state}&district=${filters.district}&ministry=${filters.ministry}&all_record=1&download_req=0&page_req=0&filename=unknown&user=user`);

}
// < Deprecated

function getGrievancesOfType(
    type,
    pageno,
    ministry = getDefaultDepartment(),
    from = dateBefore(countDayDuration),
    to = formatDate(),
    showClosed = 1,
    state = 'All',
    district = 'All',
    download = false
) {
    if (type == 'normal')
        type = 'primary'
    // else if (type == 'repeat')
    //     return getRepeatParents(pageno, download)

    return filteredQueryBuilder(
        `/${type.toLowerCase()}`,
        {
            startDate: from,
            endDate: to,
            ministry: ministry,
            download_req: download ? 1 : 0,
            all_record: showClosed,
            state: state,
            district: district
        },
        pageno
    )
}


function getRepeatParents(page_no = 1) {
    return httpService.auth.get('/get_all_repeat_parents', {
        params: {
            skiprecord: (page_no - 1) * pageSize,
            size: pageSize,
        }
    })
}

function getRepeatChildren(name, from, to, state, district, ministry) {
    return httpService.auth.get('/get_repeat_child', {
        params: {
            name,
            startDate: from,
            endDate: to,
            state,
            district,
            ministry
        }
    })
}

function getRepeatParent(registration_no) {
    return httpService.auth.get('/get_repeat_parent', {
        params: {
            registration_no: registration_no
        }
    })
}


function descGrievance(grievancesId) {

    return httpService.auth.get(`/description/?registration_no=${grievancesId}&user=user`)

}



function queryGrievances(filters, pageno) {
    console.log('🔍 Searching grievances with CDIS API:', { 
        query: filters.query, 
        type: filters.type, 
        ministry: filters.ministry,
        state: filters.state,
        district: filters.district,
        startDate: filters.startDate,
        endDate: filters.endDate,
        pageno,
        fullFiltersObject: JSON.stringify(filters, null, 2)
    });

    // Use CDIS API directly for search
    // NOTE: CDIS API only supports: query, value, skiprecord, size, threshold
    // Date, state, district, ministry filters must be applied client-side
    const searchParams = {
        query: filters.query || "",
        value: filters.type || filters.value || 1, // 1=Semantic, 2=Keyword  
        skiprecord: 0, // Start from beginning to get maximum results for filtering
        size: 5000, // Get large dataset for client-side filtering (max possible)
        threshold: filters.threshold || 1.2 // Use provided threshold
    };

    console.log('📡 CDIS API call (only supported params):', searchParams);

    return httpService.search.searchGrievances(searchParams).then(result => {
        console.log('✅ CDIS API Search Result:', {
            success: result.success,
            totalCount: result.data?.total_count,
            grievanceCount: result.data?.grievanceData?.length
        });

        // Log sample states separately for clarity
        const sampleStates = result.data?.grievanceData?.slice(0, 10).map(item => ({
            id: item.id || 'unknown',
            state: item.stateName || item.state || item.location || 'unknown',
            district: item.CityName || item.district || item.city || 'unknown',
            ministry: item.ministry || 'unknown'
        })) || [];
        
        console.log('🏛️ Sample states from CDIS API response:', sampleStates);
        
        // Check if API is returning mixed states despite filter
        const uniqueStates = [...new Set(sampleStates.map(item => item.state.toLowerCase()))];
        console.log('🎯 Unique states in API response:', uniqueStates);
        
        if (uniqueStates.length > 1) {
            console.log('⚠️ WARNING: CDIS API returned multiple states despite state filter!');
        } else {
            console.log('✅ CDIS API correctly filtered to single state');
        }

        // Transform CDIS API data to match expected format
        let transformedData = (result.data?.grievanceData || []).map(item => ({
            // Map CDIS fields to expected fields
            registration_no: item.id || item.complaintId || item.grievanceId || `CDIS-${Math.random().toString(36).substr(2, 9)}`,
            state: item.stateName || item.state || item.location || 'Unknown',
            district: item.CityName || item.district || item.city || 'Unknown',
            recvd_date: item.complaintRegDate || item.dateOfRegistration || item.registrationDate || new Date().toISOString(),
            closing_date: item.updationDate || item.lastUpdationDate || item.closureDate || '',
            name: item.fullName || item.name || item.complainantName || 'Unknown',
            ministry: item.ministry || 'DOCAF',
            
            // Additional fields that might be useful
            status: item.status || 'Active',
            userType: item.userType || 'Citizen',
            country: item.country || 'India',
            complaintDetails: item.complaintDetails || '',
            
            // Original CDIS data for reference
            originalData: item
        }));

        console.log('🔄 Initial transformed data count:', transformedData.length);

        // CLIENT-SIDE FILTERING: Since CDIS API ignores filters, apply them manually
        
        // Apply state filter if specified
        if (filters.state && filters.state !== 'All') {
            const originalCount = transformedData.length;
            transformedData = transformedData.filter(item => {
                const itemState = (item.state || '').toLowerCase().trim();
                const filterState = filters.state.toLowerCase().trim();
                
                // Flexible state matching
                return itemState.includes(filterState) || filterState.includes(itemState);
            });
            console.log(`🎯 Client-side state filter: ${originalCount} → ${transformedData.length} grievances for "${filters.state}"`);
        }

        // Apply district filter if specified  
        if (filters.district && filters.district !== 'All') {
            const originalCount = transformedData.length;
            transformedData = transformedData.filter(item => {
                const itemDistrict = (item.district || '').toLowerCase().trim();
                const filterDistrict = filters.district.toLowerCase().trim();
                
                // Flexible district matching with common variations
                const normalizeDistrict = (name) => name
                    .replace(/\s+/g, ' ')
                    .replace(/\bnagar\b/g, '')
                    .replace(/\bdistrict\b/g, '')
                    .trim();
                
                const normalizedItemDistrict = normalizeDistrict(itemDistrict);
                const normalizedFilterDistrict = normalizeDistrict(filterDistrict);
                
                return itemDistrict.includes(filterDistrict) || 
                       filterDistrict.includes(itemDistrict) ||
                       normalizedItemDistrict.includes(normalizedFilterDistrict) ||
                       normalizedFilterDistrict.includes(normalizedItemDistrict);
            });
            console.log(`🎯 Client-side district filter: ${originalCount} → ${transformedData.length} grievances for "${filters.district}"`);
        }

        // Apply ministry filter if specified
        if (filters.ministry && filters.ministry !== 'All') {
            const originalCount = transformedData.length;
            transformedData = transformedData.filter(item => {
                const itemMinistry = (item.ministry || '').toLowerCase().trim();
                const filterMinistry = filters.ministry.toLowerCase().trim();
                
                return itemMinistry.includes(filterMinistry) || filterMinistry.includes(itemMinistry);
            });
            console.log(`🎯 Client-side ministry filter: ${originalCount} → ${transformedData.length} grievances for "${filters.ministry}"`);
        }

        // Log sample dates to understand the data
        const sampleDates = transformedData.slice(0, 10).map(item => ({
            registration_no: item.registration_no,
            recvd_date: item.recvd_date,
            parsed_date: new Date(item.recvd_date)
        }));
        console.log('📅 Sample dates in CDIS data:', sampleDates);

        // Get all unique years from the data to understand the range
        const uniqueYears = [...new Set(transformedData.map(item => {
            const date = new Date(item.recvd_date);
            return isNaN(date.getTime()) ? 'invalid' : date.getFullYear();
        }).filter(year => year !== 'invalid'))].sort();
        console.log('📅 Available years in CDIS data:', uniqueYears);

        // Apply date range filter if specified (but be more flexible for old data)
        if (filters.startDate && filters.endDate) {
            const originalCount = transformedData.length;
            
            // If searching for recent dates (2024+) but data is old (2016-2020), 
            // skip date filtering and show a warning
            const filterStartYear = new Date(filters.startDate).getFullYear();
            const filterEndYear = new Date(filters.endDate).getFullYear();
            const dataMaxYear = Math.max(...uniqueYears.filter(y => y !== 'invalid'));
            
            if (filterStartYear > dataMaxYear && filterStartYear >= 2024) {
                console.log(`⚠️ Skipping date filter: Searching for ${filterStartYear}-${filterEndYear} but data only goes up to ${dataMaxYear}`);
                console.log('📅 Showing all available data instead of filtering by recent dates');
            } else {
                transformedData = transformedData.filter(item => {
                    const itemDate = new Date(item.recvd_date);
                    
                    // Check if date is valid
                    if (isNaN(itemDate.getTime())) {
                        return false; // Exclude items with invalid dates
                    }
                    
                    let isInRange = true;
                    
                    if (filters.startDate) {
                        const startDate = new Date(filters.startDate);
                        isInRange = isInRange && itemDate >= startDate;
                    }
                    
                    if (filters.endDate) {
                        const endDate = new Date(filters.endDate);
                        // Add 23:59:59 to end date to include full day
                        endDate.setHours(23, 59, 59, 999);
                        isInRange = isInRange && itemDate <= endDate;
                    }
                    
                    return isInRange;
                });
                console.log(`📅 Client-side date filter: ${originalCount} → ${transformedData.length} grievances for ${filters.startDate} to ${filters.endDate}`);
            }
        }

        // Apply pagination after filtering
        const startIndex = (pageno - 1) * (filters.size || pageSize);
        const endIndex = startIndex + (filters.size || pageSize);
        const paginatedData = transformedData.slice(startIndex, endIndex);
        
        console.log(`📄 Pagination: showing ${startIndex + 1}-${Math.min(endIndex, transformedData.length)} of ${transformedData.length} results (page ${pageno})`);

        console.log('🔄 Final transformed data after client-side filtering:', {
            originalAPICount: result.data?.grievanceData?.length || 0,
            finalFilteredCount: transformedData.length,
            paginatedCount: paginatedData.length,
            sampleFiltered: paginatedData.slice(0, 2)
        });

        // Show final state distribution after client-side filtering
        const finalStates = [...new Set(transformedData.map(item => item.state.toLowerCase()))];
        console.log('✅ Final states after client-side filtering:', finalStates);

        // Transform the response to match expected format
        return {
            data: {
                data: paginatedData, // Use paginated data instead of all filtered data
                count: paginatedData.length, // Count of current page
                total_count: transformedData.length // Total filtered count for pagination
            },
            status: result.success ? 200 : 400
        };
    }).catch(error => {
        console.error('❌ CDIS API Search Error:', error);
        
        // Return empty result on error
        return {
            data: {
                data: [],
                count: 0,
                total_count: { total_count: 0 }
            },
            status: 500
        };
    });
}

const savedGrievances = (page, download = false) => {
    return httpService.auth.get('/saved', {
        params: {
            skiprecord: (page - 1) * pageSize,
            size: pageSize,
            download_req: download ? 1 : 0
        }
    })
}

const readGrievances = () => {
    return httpService.auth.get('/read_list/')
}

const toggleSave = reg_no => {
    return httpService.auth.get('/toggle_save', {
        params: {
            registration_no: reg_no
        }
    })
}

const toggleSpam = reg_no => {
    return httpService.auth.get('/toggle_spam', {
        params: {
            registration_no: reg_no
        }
    })
}

const togglePriority = reg_no => {
    return httpService.auth.get('/toggle_priority', {
        params: {
            registration_no: reg_no
        }
    })
}

const predictMinistries = reg_no => {
    return httpService.auth.get('/predict-department', {
        params: {
            registration_no: reg_no
        }
    })
}

const getPDFRoute = (reg_no, type) => {
    return httpService.auth.get('/showpdf', {
        params: {
            registration_no: reg_no,
            documentType: type ?? "GR"
        }
    })
}

const addLabel = (reg_no, label) => {
    return httpService.auth.post('/add_tag', {}, {
        params: {
            registration_no: reg_no,
            tag: label
        }
    })
}

const deleteTag = tagId => {
    return httpService.auth.get('/delete_tag', {
        params: {
            idx: tagId
        }
    })
}

const readGrievance = reg_no => {
    return httpService.auth.get('/read', {
        params: {
            registration_no: reg_no
        }
    })
}

export const getClosureDetails = (registration_no) =>
    httpService.auth.get('/get_individual_closure_data', {
        params: {
            registration_no
        }
    })

export const checkFinalReport = (registration_no) =>
    httpService.auth.get('/checkpdf', {
        params: {
            registration_no,
            documentType: "FR"
        }
    })

export const checkGradeReport = (registration_no) =>
    httpService.auth.get('/checkpdf', {
        params: {
            registration_no,
            documentType: "GR"
        }
    })

const addVote = (idx, vote, user_query = '') => {
    return httpService.auth.post('/add_vote', {}, {
        params: {
            idx,
            vote,
            user_query
        }
    })
}

const getVotes = (idx) => {
    return httpService.auth.get('/vote_count', {
        params: {
            idx
        }
    })
}

const GrievancesRoutes = {
    getPrimary,
    getRepeat,
    getFresh,
    getNormal,
    getSpam,
    getPriority,
    descGrievance,
    queryGrievances,
    savedGrievances,
    readGrievances,
    getGrievancesOfType,
    toggleSave,
    toggleSpam,
    togglePriority,
    predictMinistries,
    getPDFRoute,
    addLabel,
    deleteTag,
    readGrievance,
    getRepeatChildren,
    getRepeatParent,
    addVote,
    getVotes
}

export default GrievancesRoutes