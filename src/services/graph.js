import httpService from "./httpService"


export const getHistoricalCounts = (
    {
        from,
        to,
        state = 'All',
        district = 'All',
        ministry = 'All',
        showAll = true
    },
    type = 1
) => {
    return httpService.auth.get('/get_distribution', {
        params: {
            startDate: from,
            endDate: to,
            state: state,
            district: district,
            ministry: ministry,
            all_record: 0,
            type: type
        }
    })
}

export const getTimeWiseDistribution = (
    {
        from,
        to,
        state = 'All',
        district = 'All',
        ministry = 'All',
        showAll = true
    },
    type = 'month'
) => {
    return httpService.auth.get('/time_wise_distribution', {
        params: {
            startDate: from,
            endDate: to,
            state: state,
            district: district,
            ministry: ministry,
            all_record: 0,
            type: type
        }
    })
}
