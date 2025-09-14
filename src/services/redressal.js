import httpService from "./httpService"

export const getRedressalFlags = async (filters) => {
    // return httpService.auth.post('/redressalflagging', '', {
    //     params: filters
    // })
    if (filters.query)
        return httpService.auth.get('/dynamicflagging', {
            params: filters
        })
    else if (filters.ministry)
        return httpService.auth.get('/ministryflagging', {
            params: filters
        })
}

export const getFlaggingData = async (search_method, state, district) => {
    return httpService.auth.get('/getflaggingdata', {
        params: {
            search_method,
            state,
            district
        }
    })
}