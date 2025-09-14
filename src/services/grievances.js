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
        pageno 
    });

    // Use CDIS API directly for search
    const searchParams = {
        query: filters.query || "",
        value: filters.type || filters.value || 1, // 1=Semantic, 2=Keyword  
        skiprecord: (pageno - 1) * (filters.size || pageSize),
        size: filters.size || pageSize,
        threshold: filters.threshold || 0.5 // Lower threshold for more results
    };

    return httpService.search.searchGrievances(searchParams).then(result => {
        console.log('✅ CDIS API Search Result:', {
            success: result.success,
            totalCount: result.data?.total_count,
            grievanceCount: result.data?.grievanceData?.length,
            sampleData: result.data?.grievanceData?.slice(0, 2)
        });

        // Transform CDIS API data to match expected format
        const transformedData = (result.data?.grievanceData || []).map(item => ({
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

        console.log('🔄 Transformed grievance data:', {
            originalCount: result.data?.grievanceData?.length || 0,
            transformedCount: transformedData.length,
            sampleTransformed: transformedData.slice(0, 2)
        });

        // Transform the response to match expected format
        return {
            data: {
                data: transformedData,
                count: transformedData.length,
                total_count: { 
                    total_count: result.data?.total_count || transformedData.length
                }
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