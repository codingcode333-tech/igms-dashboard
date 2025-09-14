// Theme utility functions and classes
export const getThemeClasses = (isDark) => ({
  // Background classes
  bg: {
    primary: isDark ? 'bg-gray-900' : 'bg-white',
    secondary: isDark ? 'bg-gray-800' : 'bg-gray-50', 
    surface: isDark ? 'bg-gray-800' : 'bg-white',
    card: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
  },
  
  // Text classes
  text: {
    primary: isDark ? 'text-white' : 'text-gray-900',
    secondary: isDark ? 'text-gray-300' : 'text-gray-600',
    muted: isDark ? 'text-gray-400' : 'text-gray-500',
    accent: isDark ? 'text-blue-400' : 'text-blue-600',
  },
  
  // Border classes
  border: {
    primary: isDark ? 'border-gray-700' : 'border-gray-200',
    secondary: isDark ? 'border-gray-600' : 'border-gray-300',
  },
  
  // Hover states
  hover: {
    bg: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
    text: isDark ? 'hover:text-white' : 'hover:text-gray-900',
  },
  
  // Focus states  
  focus: {
    ring: isDark ? 'focus:ring-blue-400' : 'focus:ring-blue-500',
  }
});

// Common theme-aware component classes
export const themeClasses = {
  // Card component
  card: (isDark) => `
    ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}
    transition-colors duration-300 rounded-lg shadow-sm border
  `,
  
  // Button variants
  button: {
    primary: (isDark) => `
      ${isDark 
        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
        : 'bg-blue-600 hover:bg-blue-700 text-white'
      }
      transition-colors duration-200
    `,
    secondary: (isDark) => `
      ${isDark 
        ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600' 
        : 'bg-white hover:bg-gray-50 text-gray-900 border-gray-300'
      }
      transition-colors duration-200 border
    `,
  },
  
  // Input field
  input: (isDark) => `
    ${isDark 
      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
    }
    transition-colors duration-200
  `,
  
  // Modal/Dialog
  modal: (isDark) => `
    ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
    transition-colors duration-300
  `,
  
  // Table
  table: {
    header: (isDark) => `
      ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700'}
      transition-colors duration-300
    `,
    row: (isDark) => `
      ${isDark 
        ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700' 
        : 'bg-white hover:bg-gray-50 text-gray-900 border-gray-200'
      }
      transition-colors duration-200 border-b
    `,
  },
};

// Utility function to combine theme classes
export const combineThemeClasses = (baseClasses, themeSpecificClasses, isDark) => {
  return `${baseClasses} ${themeSpecificClasses(isDark)}`.trim();
};