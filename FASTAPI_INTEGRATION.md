# FastAPI Backend Integration - IGMS Dashboard

## Overview
Successfully integrated the IGMS Dashboard with the FastAPI backend at `https://cdis.iitk.ac.in/consumer_api/`. The integration includes search functionality, data transformation, and backward compatibility with existing demo mode.

## 🔧 Integration Components

### 1. Search Service (`src/services/searchService.js`)
- **Purpose**: Dedicated service for FastAPI search endpoints
- **Features**:
  - Semantic Search (Type 1)
  - Keyword Search (Type 2) 
  - Hybrid Search (Type 3)
  - Statistics generation from search results
  - Error handling and response transformation

### 2. Updated HTTP Service (`src/services/httpService.js`)
- **Purpose**: Enhanced main HTTP service with FastAPI integration
- **Changes**:
  - Default baseURL changed to FastAPI endpoint
  - Integrated search service
  - Maintains demo mode compatibility

### 3. Environment Configuration (`.env`)
- **Purpose**: Configurable API endpoints and settings
- **Key Variables**:
  - `VITE_BASE_URL`: https://cdis.iitk.ac.in/consumer_api
  - `VITE_DEMO_MODE`: false (set to 'true' for demo mode)
  - `VITE_DEFAULT_SEARCH_TYPE`: 1 (Semantic)
  - `VITE_DEFAULT_THRESHOLD`: 1.5

### 4. Enhanced Grievances Service (`src/services/grievances.js`)
- **Purpose**: Updated to use new search API
- **Changes**:
  - `queryGrievances()` function uses FastAPI search
  - Response transformation for backward compatibility
  - Maintains existing interface for components

### 5. New Search Component (`src/pages/dashboard/SearchGrievances.jsx`)
- **Purpose**: Modern search interface showcasing FastAPI capabilities
- **Features**:
  - Search type selection (Semantic/Keyword/Hybrid)
  - Adjustable relevance threshold
  - Pagination support
  - Real-time result statistics
  - User-friendly search instructions

## 🛠 API Endpoint Details

### Search Endpoint: `/search/`
**Parameters:**
- `query`: Search query string
- `value`: Search type (1=Semantic, 2=Keyword, 3=Hybrid)
- `skiprecord`: Pagination offset
- `size`: Number of results per page
- `threshold`: Relevance threshold (default: 1.5)

**Example Request:**
```
GET https://cdis.iitk.ac.in/consumer_api/search/?query=electricity&value=1&skiprecord=0&size=20&threshold=1.5
```

### AI Categories Endpoint: `/generate_ai_categories`
**Method:** POST
**Purpose:** Generate AI-powered topic labels for complaints using RCA data

**Request Body:**
```json
{
  "startdate": "2024-01-01",
  "enddate": "2024-12-31", 
  "ministry": "DOCAF",
  "rcadata": {
    "words": ["electricity", "billing", "complaint"],
    "count": 3,
    "doc_ids": ["doc1", "doc2", "doc3"]
  }
}
```

**Example Request:**
```bash
curl -X 'POST' \
  'https://cdis.iitk.ac.in/consumer_api/generate_ai_categories' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "startdate": "2024-01-01",
    "enddate": "2024-12-31",
    "ministry": "DOCAF",
    "rcadata": {
      "words": ["electricity", "billing", "complaint", "service"],
      "count": 4,
      "doc_ids": ["doc1", "doc2", "doc3", "doc4"]
    }
  }'
```

**Response Structure:**
```json
{
  "total_count": { "total_count": "3929" },
  "grievanceData": [
    {
      "id": "510107",
      "complaintDetails": "electrictiy",
      "userId": 539423,
      "fullName": "VIKRAM POL",
      "CityName": "Mumbai",
      "stateName": "MAHARASHTRA",
      "country": "India",
      "status": 1,
      "complaintRegDate": "2017-11-17T15:00:14",
      "complaintType": "Query",
      "categoryCode": 4,
      "companyName": "RELIANCE ENERGY LTD.",
      "complaintStatus": "dispose off"
    }
  ]
}
```

## 🚀 How to Use

### 1. Demo Mode (admin/admin)
```bash
# Set in .env file
VITE_DEMO_MODE=true

# Login with admin/admin credentials
# Uses mock data for testing
```

### 2. Live API Mode
```bash
# Set in .env file  
VITE_DEMO_MODE=false

# Uses real FastAPI backend
# Search functionality connected to live data
```

### 3. Testing Search Functionality

#### Via Search Component:
1. Navigate to `/fastapi-search` route
2. Enter search query
3. Select search type (Semantic/Keyword/Hybrid)
4. Adjust threshold if needed
5. Click Search button

#### Via Code:
```javascript
import searchService from '@/services/searchService';

// Semantic search
const result = await searchService.semanticSearch('electricity', {
  size: 20,
  threshold: 1.5
});

// Keyword search  
const result = await searchService.keywordSearch('water');

// Hybrid search
const result = await searchService.hybridSearch('complaint');
```

## 📊 Statistics & Analytics

The search service automatically generates statistics from search results:
- Status distribution
- Category distribution  
- State-wise distribution
- Monthly trends
- Company distribution

```javascript
const stats = await searchService.getGrievanceStats('electricity');
```

## 🔀 Backward Compatibility

All existing components continue to work:
- Original `/search-grievances` route uses QueryGrievances component
- Demo mode still available with admin/admin credentials
- Existing API structure maintained through response transformation

## 🧪 Testing

Run the test suite to verify integration:
```javascript
import testSearchService from '@/services/testSearchService';
testSearchService();
```

## 🎯 Routes

### Available Routes:
- `/fastapi-search` - New FastAPI search interface
- `/ai-categories` - AI category generation interface  
- `/search-grievances` - Original search interface (backward compatible)
- `/grievances/:type/:ministry/:from/:to` - Grievance listings
- `/spatial-search` - Spatial analysis

### Navigation:
Access the new interfaces from the dashboard or directly via URL:
- Search: `http://localhost:5003/igms2/fastapi-search`
- AI Categories: `http://localhost:5003/igms2/ai-categories`

## 📈 Performance Notes

- **Timeout**: 30 seconds for API calls
- **Pagination**: Configurable page size (10, 20, 50, 100)
- **Caching**: Response caching available
- **Error Handling**: Comprehensive error handling with user feedback

## 🔧 Development Server

Current setup:
- **Port**: 5003 (auto-selected)
- **Host**: 0.0.0.0 (universal binding)
- **Base Path**: /igms2
- **Hot Reload**: Enabled

## ✅ Verification Steps

1. ✅ FastAPI service integration complete
2. ✅ Search functionality working (Semantic/Keyword/Hybrid)
3. ✅ Response transformation implemented
4. ✅ Backward compatibility maintained
5. ✅ Demo mode preserved
6. ✅ New search component created
7. ✅ Environment configuration updated
8. ✅ Development server running

## 🎉 Success!

The IGMS Dashboard is now successfully integrated with the FastAPI backend, providing:
- Real-time grievance search capabilities
- Multiple search algorithms
- Comprehensive analytics
- Modern user interface
- Seamless integration with existing workflow
