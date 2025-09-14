import axios from "axios";
import { getUser, logout, useFilter } from '@/context/UserContext'
import { isDemoMode, demoService } from './demoService'
import searchService from './searchService'
// import { useContext } from "react";
// import { useNavigate } from "react-router-dom";

// const navigate = useNavigate()
const env = import.meta.env

// Default to FastAPI backend for real API calls
var baseURL = "https://cdis.iitk.ac.in/consumer_api"

// Allow override via environment variables if needed
if (env.VITE_BASE_URL && env.VITE_DEV_BASE_URL) {
  if (env.VITE_ENVIRONMENT && env.VITE_ENVIRONMENT == 'dev')
    baseURL = env.VITE_DEV_BASE_URL
  else
    baseURL = env.VITE_BASE_URL
}
else if (env.VITE_BASE_URL)
  baseURL = env.VITE_BASE_URL
else if (env.VITE_DEV_BASE_URL)
  baseURL = env.VITE_DEV_BASE_URL

const instance = axios.create({
  baseURL: baseURL,

  timeout: 30_00_000,
  // withCredentials: true,

  headers: {
    "Content-Type": "application/json",
    // 'token': localStorage.getItem("token"),
  },
});

const handleCatch = (error, reject) => {
  if (error.response?.status == 401) {
    logout()
  }
  console.log(error)
  reject(error)
}

const get = (route, config = {}) => {
  // Check if in demo mode
  if (isDemoMode()) {
    return demoService.get(route, config);
  }

  return new Promise((resolve, reject) => {
    if (config.params && Object.values(config.params).length > 0)
      route += '/'

    return instance.get(route, config)
      .then(response => resolve(response))
      .catch(error => handleCatch(error, reject))
  })
}

const post = (route, params, config = {}) => {
  // Check if in demo mode
  if (isDemoMode()) {
    return demoService.post(route, params, config);
  }

  return new Promise((resolve, reject) => {
    if (config.params && Object.values(config.params).length > 0)
      route += '/'

    return instance.post(route, params, config)
      .then(response => resolve(response))
      .catch(error => handleCatch(error, reject))
  })
}

// Add authentication to the config
const auth = (config = {}) => {
  let user = getUser()
  console.log('Auth token being used:', user?.accessToken ? 'Token present' : 'No token'); // Debug log
  
  config.headers = {
    ...(config.headers || {}),
    ...{
      'Authorization': `Bearer ${user.accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }

  return config
}

const httpService = {
  // setJWT,
  get: get,
  post: post,
  put: instance.put,
  delete: instance.delete,
  baseURL: baseURL,
  auth: {
    get: (route, config) => get(route, auth(config)),
    post: (route, params, config) => post(route, params, auth(config))
  },
  // Expose search service for grievance search functionality
  search: searchService
};

export default httpService;