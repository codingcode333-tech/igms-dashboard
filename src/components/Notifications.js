import { useEffect, useState } from 'react';

const Notifications = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Replace with your actual API endpoint
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        const startDate = new Date('2025-01-01');
        const today = new Date();
        // Filter for high alert cases within date range
        const filtered = data.filter(item => 
          item.alertType === 'high alert' &&
          new Date(item.date) >= startDate &&
          new Date(item.date) <= today
        );
        setAlerts(filtered);
      });
  }, []);

  return (
    <div>
      <h3>High Alert Locations & Dates</h3>
      {alerts.length === 0 ? (
        <div>No high alert cases found for this period</div>
      ) : (
        <ul>
          {alerts.map((alert, idx) => (
            <li key={idx}>
              {alert.locationName || alert.location} - {new Date(alert.date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;