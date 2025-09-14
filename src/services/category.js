import httpService from "./httpService";

export const getTrendyKeywords = () => {
    return httpService.auth.get('/get_trendy_keywords/')
}

export const getTopSuggestions = () => {
    return httpService.auth.get('/get_top_suggestions/')
}

export const getCategories = (ministry, level) => {
    return httpService.auth.get('/get_category', {
        params: {
            ministry,
            level
        }
    })
}

export const getTopCategories = (filters) => {
    return httpService.auth.get('/get_top_categories', {
        params: {
            ...filters,
            state: filters.state ?? 'All',
            district: filters.district ?? 'All',
            ministry: filters.ministry ?? 'All'
        }
    })
}

export const getSuggestions = (ministry, user_query) => {
    return httpService.auth.get('/category_suggestion', {
        params: {
            ministry,
            user_query
        }
    })
}

/**
 * Retrieve AI-generated categories from the API
 * @param {Object} filters - Optional filters to apply to the request
 * @returns {Promise} API response with AI categories data
 */
export const getAICategories = (filters = {}) => {
    return httpService.auth.get('/get_ai_categories', {
        params: {
            ...filters
        }
    })
}
