// Custom Badge component for notifications
import React from 'react';

export const NotificationBadge = ({ count, className = '' }) => {
  if (!count || count === 0) return null;
  
  return (
    <div 
      className={`absolute -top-1 -right-1 min-w-[1.25rem] min-h-[1.25rem] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 ${className}`}
    >
      {count > 99 ? '99+' : count}
    </div>
  );
};

export default NotificationBadge;