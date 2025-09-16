import React from 'react';
import ReactDOM from 'react-dom/client';
import Notifications from './src/components/Notifications';

// Create a simple test page for the Notifications component
const TestPage = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Notifications Component Test</h1>
      <Notifications />
    </div>
  );
};

// Render the test page
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TestPage />);