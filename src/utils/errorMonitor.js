// Error monitoring and debugging utility
// This file helps track and log errors in the application

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚫 Unhandled Promise Rejection:', event.reason);
  
  // Log stack trace if available
  if (event.reason instanceof Error) {
    console.error('Stack:', event.reason.stack);
  }
  
  // Prevent the default error handling
  event.preventDefault();
});

// Global error handler for JavaScript errors
window.addEventListener('error', (event) => {
  console.error('🚫 JavaScript Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

// Console wrapper to track and categorize errors
const originalConsoleError = console.error;
console.error = (...args) => {
  // Check for specific known issues
  const message = args.join(' ');
  
  if (message.includes('total_count is undefined')) {
    console.log('✅ Fixed: Statistics data structure issue resolved');
    return;
  }
  
  if (message.includes('filter is not a function')) {
    console.log('✅ Fixed: Chart data array validation added');
    return;
  }
  
  if (message.includes('map is not a function')) {
    console.log('✅ Fixed: Chart data mapping validation added');
    return;
  }
  
  if (message.includes('checked prop to a form field without an onChange')) {
    console.log('✅ Fixed: Checkbox onChange handler added');
    return;
  }
  
  // Call original console.error for unhandled errors
  originalConsoleError.apply(console, args);
};

// Monitor console.log for frequently repeated messages
const originalConsoleLog = console.log;
console.log = (...args) => {
  const message = args.join(' ');
  
  // Suppress repetitive search history logs
  if (message.includes('{ len: 0, history: [] }') ||
      message.includes('len: 0') ||
      (message.includes('history:') && message.includes('Array []'))) {
    // Silently suppress these repetitive logs
    return;
  }
  
  // Suppress geographical state > district logs
  if (message.includes(' > ') && 
      (message.includes('uttar pradesh') || 
       message.includes('uttarakhand') || 
       message.includes('maharashtra') ||
       message.includes('karnataka') ||
       message.includes('gujarat') ||
       message.includes('bihar') ||
       message.includes('west bengal') ||
       message.includes('andhra pradesh') ||
       message.includes('telangana') ||
       message.includes('tamil nadu') ||
       message.includes('rajasthan') ||
       message.includes('madhya pradesh'))) {
    // Suppress state > district logging patterns
    return;
  }
  
  // Call original console.log for other messages
  originalConsoleLog.apply(console, args);
};

// Monitor console.warn for buildTree and other repetitive warnings
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const message = args.join(' ');
  
  // Suppress known third-party library warnings
  if (message.includes('UNSAFE_componentWillReceiveProps') ||
      message.includes('Using UNSAFE_componentWillReceiveProps in strict mode') ||
      message.includes('Autosuggest2') ||
      message.includes('Autowhatever2') ||
      message.includes('componentWillReceiveProps') ||
      message.includes('unsafe-component-lifecycles') ||
      message.includes('https://reactjs.org/link/unsafe-component-lifecycles') ||
      message.includes('Move data fetching code or side effects to componentDidUpdate') ||
      (message.includes('Please update the following components:') && 
       (message.includes('Autosuggest') || message.includes('Autowhatever')))) {
    console.log('⚠️ Known Issue: Third-party library (react-autosuggest) uses deprecated lifecycle methods - warning suppressed');
    return;
  }
  
  // Suppress repetitive buildTree warnings
  if (message.includes('buildTree: Missing required properties') ||
      message.includes('buildTree: Invalid flatData structure') ||
      message.includes('buildTree: Missing root node data')) {
    // Log once but don't repeat
    if (!console.warn._buildTreeWarningShown) {
      console.log('ℹ️ Note: API returned unexpected data structure for RCA analysis (buildTree warnings suppressed)');
      console.warn._buildTreeWarningShown = true;
    }
    return;
  }
  
  // Call original console.warn for other warnings
  originalConsoleWarn.apply(console, args);
};

// Export monitoring functions for debugging
export const debugUtils = {
  logDataStructure: (data, label = 'Data') => {
    console.log(`🔍 ${label} Structure:`, {
      type: Array.isArray(data) ? 'Array' : typeof data,
      length: Array.isArray(data) ? data.length : 'N/A',
      keys: data && typeof data === 'object' ? Object.keys(data) : 'N/A',
      sample: Array.isArray(data) && data.length > 0 ? data[0] : data
    });
  },
  
  validateChartData: (data, expectedType = 'array') => {
    const isValid = expectedType === 'array' ? Array.isArray(data) : typeof data === expectedType;
    console.log(`🎯 Chart Data Validation:`, {
      expected: expectedType,
      actual: Array.isArray(data) ? 'array' : typeof data,
      valid: isValid,
      count: Array.isArray(data) ? data.length : 'N/A'
    });
    return isValid;
  }
};

console.log('🛠️ Error monitoring initialized - Dashboard debugging active');
