import React, { useState, useEffect } from 'react';
import { NotificationService } from '../services/notificationService';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const alerts = await NotificationService.getHighAlertNotifications();
      
      // Filter for high priority alerts from Jan 1, 2025 onwards
      const startDate = new Date('2025-01-01');
      const filteredAlerts = alerts.filter(alert => {
        const alertDate = new Date(alert.date);
        return alertDate >= startDate;
      });
      
      setNotifications(filteredAlerts);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="notification-loading" style={{
        padding: '20px',
        textAlign: 'center',
        color: '#666'
      }}>
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="notifications-container" style={{
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      margin: '20px'
    }}>
      <h3 style={{
        color: '#dc3545',
        marginBottom: '15px',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>🚨 High Alert Cases (Jan 2025 - Present)</h3>
      
      <p style={{
        color: '#666',
        marginBottom: '20px'
      }}>Showing {notifications.length} high priority cases</p>
      
      {notifications.length === 0 ? (
        <div style={{
          textAlign: 'center',
          color: '#888',
          padding: '30px',
          backgroundColor: '#fff',
          borderRadius: '6px',
          border: '1px dashed #dee2e6'
        }}>
          No high alert cases found for this period
        </div>
      ) : (
        <div className="notification-list" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {notifications.map((notification) => (
            <div key={notification.id} className="notification-item high-alert" style={{
              backgroundColor: '#fff',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div className="notification-content" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '18px' }}>📍</span>
                <span className="location" style={{
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '16px'
                }}>
                  {notification.location}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span className="date" style={{
                  color: '#666',
                  fontSize: '14px',
                  backgroundColor: '#f8f9fa',
                  padding: '6px 10px',
                  borderRadius: '20px'
                }}>
                  📅 {formatDate(notification.date)}
                </span>
                <span style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}>
                  High Alert
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;