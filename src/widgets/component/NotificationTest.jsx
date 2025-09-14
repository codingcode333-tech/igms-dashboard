// Test component to validate notification API integration
import React, { useState, useEffect } from 'react';
import { getHighAlerts } from '@/services/notifications';

export const NotificationTest = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('🔍 Testing notification API...');
        const result = await getHighAlerts();
        console.log('📊 API Response:', result);
        
        if (result.success && result.data) {
          setAlerts(result.data);
          console.log('✅ Successfully loaded', result.data.length, 'alerts');
        } else {
          console.log('⚠️ API returned unsuccessful response or no data');
          setError('No data received from API');
        }
      } catch (err) {
        console.error('❌ Error testing notification API:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    testAPI();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p>🔄 Testing notification API...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">❌ Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="text-lg font-semibold text-green-800 mb-2">
        ✅ Notification API Test Results
      </h3>
      <p className="text-green-700 mb-2">
        Successfully loaded {alerts.length} urgent alerts
      </p>
      
      {alerts.length > 0 && (
        <div className="mt-3">
          <h4 className="font-medium text-green-800 mb-2">Sample Alert:</h4>
          <div className="bg-white p-3 rounded border text-sm">
            <pre className="text-gray-700">
              {JSON.stringify(alerts[0], null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationTest;