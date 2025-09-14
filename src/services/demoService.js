// Demo service to provide mock data when running in demo mode
export const isDemoMode = () => {
  // Check environment variable first
  const envDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
  if (envDemoMode) return true;
  
  // Check if user has demo token (for backward compatibility)
  const user = JSON.parse(window.sessionStorage.getItem('User') || 'null');
  return user && user.accessToken === 'demo-access-token';
};

// Mock data for demo purposes
export const demoData = {
  // Dashboard statistics - compatible with both structures
  primaryCount: { data: { total_count: 15420 } },
  freshCount: { data: { total_count: 8750 } },
  repeatCount: { data: { total_count: 6670 } },
  spamCount: { data: { total_count: 1250 } },
  urgentCount: { data: { total_count: 890 } },

  // State-wise distribution for bar chart (expected array format)
  stateWiseDistribution: [
    { key: "Uttar Pradesh", doc_count: 2340 },
    { key: "Maharashtra", doc_count: 1890 },
    { key: "Bihar", doc_count: 1560 },
    { key: "West Bengal", doc_count: 1320 },
    { key: "Madhya Pradesh", doc_count: 1180 },
    { key: "Tamil Nadu", doc_count: 1050 },
    { key: "Rajasthan", doc_count: 980 },
    { key: "Karnataka", doc_count: 870 },
    { key: "Gujarat", doc_count: 780 },
    { key: "Andhra Pradesh", doc_count: 690 },
    { key: "Odisha", doc_count: 620 },
    { key: "Telangana", doc_count: 580 },
    { key: "Kerala", doc_count: 520 },
    { key: "Jharkhand", doc_count: 450 },
    { key: "Assam", doc_count: 420 }
  ],

  // Time-wise distribution for line chart (expected array format)
  timeWiseDistribution: [
    { key_as_string: "2024-01-01T00:00:00.000Z", doc_count: 120 },
    { key_as_string: "2024-01-02T00:00:00.000Z", doc_count: 135 },
    { key_as_string: "2024-01-03T00:00:00.000Z", doc_count: 148 },
    { key_as_string: "2024-01-04T00:00:00.000Z", doc_count: 162 },
    { key_as_string: "2024-01-05T00:00:00.000Z", doc_count: 158 },
    { key_as_string: "2024-01-06T00:00:00.000Z", doc_count: 142 },
    { key_as_string: "2024-01-07T00:00:00.000Z", doc_count: 155 },
    { key_as_string: "2024-01-08T00:00:00.000Z", doc_count: 169 },
    { key_as_string: "2024-01-09T00:00:00.000Z", doc_count: 173 },
    { key_as_string: "2024-01-10T00:00:00.000Z", doc_count: 165 }
  ],

  // AI Categories demo response
  aiCategories: {
    "primary_topics": [
      "Electricity and Power",
      "Billing and Payment Issues", 
      "Service Quality",
      "Infrastructure Problems"
    ],
    "sub_categories": {
      "electricity": ["power outage", "meter reading", "billing error", "connection issue"],
      "service": ["poor service", "delayed response", "staff behavior", "complaint handling"],
      "billing": ["wrong charges", "payment issues", "refund request", "tariff problems"]
    },
    "confidence_scores": {
      "electricity": 0.89,
      "billing": 0.82,
      "service": 0.76,
      "infrastructure": 0.71
    },
    "suggested_actions": [
      "Improve billing system accuracy",
      "Enhance customer service training",
      "Regular infrastructure maintenance",
      "Implement automated complaint tracking"
    ]
  },

  // Sample grievances
  grievances: {
    data: [
      {
        registration_no: "DARPG/E/2024/00001",
        name: "Rajesh Kumar",
        state: "Uttar Pradesh",
        district: "Lucknow",
        subject: "Delay in pension disbursement",
        recvd_date: "2024-01-15",
        closing_date: null,
        status: "Under Process",
        priority: "High",
        ministry: "Department of Pension"
      },
      {
        registration_no: "DARPG/E/2024/00002", 
        name: "Priya Sharma",
        state: "Maharashtra",
        district: "Mumbai",
        subject: "Issues with ration card renewal",
        recvd_date: "2024-01-14",
        closing_date: "2024-01-20",
        status: "Closed",
        priority: "Medium",
        ministry: "Food and Public Distribution"
      },
      {
        registration_no: "DARPG/E/2024/00003",
        name: "Mohammed Ali",
        state: "Karnataka",
        district: "Bangalore",
        subject: "Problems with online land record access",
        recvd_date: "2024-01-13",
        closing_date: null,
        status: "Under Process",
        priority: "Low",
        ministry: "Revenue Department"
      },
      {
        registration_no: "DARPG/E/2024/00004",
        name: "Sunita Devi",
        state: "Bihar",
        district: "Patna",
        subject: "Electricity connection delay",
        recvd_date: "2024-01-12",
        closing_date: null,
        status: "Fresh",
        priority: "High",
        ministry: "Power Ministry"
      },
      {
        registration_no: "DARPG/E/2024/00005",
        name: "Amit Patel",
        state: "Gujarat",
        district: "Ahmedabad",
        subject: "Water supply issues in locality",
        recvd_date: "2024-01-11",
        closing_date: "2024-01-18",
        status: "Closed",
        priority: "Medium",
        ministry: "Urban Development"
      }
    ],
    count: 5,
    total: 15420
  },

  // Category tree data
  categoryTree: {
    data: {
      "Root": {
        "registration_no": ["DARPG/E/2024/00001", "DARPG/E/2024/00002", "DARPG/E/2024/00003"],
        "count": 3,
        "Pension Issues": {
          "registration_no": ["DARPG/E/2024/00001"],
          "count": 1,
          "Delay in Processing": {
            "registration_no": ["DARPG/E/2024/00001"],
            "count": 1
          }
        },
        "Public Distribution": {
          "registration_no": ["DARPG/E/2024/00002"],
          "count": 1,
          "Ration Card Issues": {
            "registration_no": ["DARPG/E/2024/00002"],
            "count": 1
          }
        },
        "Land Records": {
          "registration_no": ["DARPG/E/2024/00003"],
          "count": 1,
          "Online Access": {
            "registration_no": ["DARPG/E/2024/00003"],
            "count": 1
          }
        }
      }
    }
  },

  // Heatmap data
  heatmapData: {
    data: {
      "uttar-pradesh": { count: 2340, lat: 26.8467, lng: 80.9462 },
      "maharashtra": { count: 1890, lat: 19.7515, lng: 75.7139 },
      "bihar": { count: 1560, lat: 25.0961, lng: 85.3131 },
      "west-bengal": { count: 1320, lat: 22.9868, lng: 87.8550 },
      "madhya-pradesh": { count: 1180, lat: 22.9734, lng: 78.6569 },
      "tamil-nadu": { count: 1050, lat: 11.1271, lng: 78.6569 },
      "rajasthan": { count: 980, lat: 27.0238, lng: 74.2179 },
      "karnataka": { count: 870, lat: 15.3173, lng: 75.7139 },
      "gujarat": { count: 780, lat: 22.2587, lng: 71.1924 },
      "andhra-pradesh": { count: 690, lat: 15.9129, lng: 79.7400 }
    }
  },

  // Top categories
  topCategories: {
    data: [
      { category: "Pension & Retirement", count: 3240 },
      { category: "Public Distribution System", count: 2890 },
      { category: "Land Records", count: 2450 },
      { category: "Electricity & Power", count: 2120 },
      { category: "Water Supply", count: 1980 },
      { category: "Healthcare", count: 1760 },
      { category: "Education", count: 1540 },
      { category: "Transportation", count: 1320 },
      { category: "Banking & Finance", count: 1180 },
      { category: "Employment", count: 980 }
    ]
  }
};

// Demo service functions that return promises with mock data
export const demoService = {
  get: (route, config = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Route-based mock responses
        switch (route) {
          case '/primary_count':
            resolve(demoData.primaryCount);
            break;
          case '/fresh_count':
            resolve(demoData.freshCount);
            break;
          case '/repeat_count':
            resolve(demoData.repeatCount);
            break;
          case '/spam_count':
            resolve(demoData.spamCount);
            break;
          case '/urgent_count':
            resolve(demoData.urgentCount);
            break;
          case '/state_wise_distribution':
            resolve(demoData.stateWiseDistribution);
            break;
          case '/time_wise_distribution':
            resolve(demoData.timeWiseDistribution);
            break;
          case '/line_chart_data':
            resolve(demoData.lineChartData);
            break;
          case '/get_grievances_of_type':
          case '/search_grievances':
            resolve(demoData.grievances);
            break;
          case '/get_category_tree':
            resolve(demoData.categoryTree);
            break;
          case '/get_heatmap_grievances':
            resolve(demoData.heatmapData);
            break;
          case '/get_top_categories':
            resolve(demoData.topCategories);
            break;
          default:
            // Return empty data for unknown routes
            resolve({ data: {} });
        }
      }, 300); // Simulate network delay
    });
  },

  post: (route, data, config = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        switch (route) {
          case '/predict_priority':
            resolve({ 
              data: { 
                priority: Math.random() > 0.5 ? 1 : 0,
                confidence: 0.85 
              } 
            });
            break;
          case '/generate_ai_categories':
            resolve(demoData.aiCategories);
            break;
          default:
            resolve({ data: { success: true } });
        }
      }, 500);
    });
  }
};
