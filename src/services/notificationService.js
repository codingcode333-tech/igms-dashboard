export class NotificationService {
  static async getHighAlertNotifications() {
    try {
      const startDate = '2025-01-01';
      const currentDate = new Date().toISOString().split('T')[0];
      
      // In a real implementation, this would call your API
      // For now, we'll return mock data that matches the requirement
      const mockData = [
        {
          id: 1,
          location: "Mumbai, Maharashtra",
          date: "2025-01-15",
          alertLevel: "high"
        },
        {
          id: 2,
          location: "Delhi",
          date: "2025-02-20",
          alertLevel: "high"
        },
        {
          id: 3,
          location: "Bangalore, Karnataka",
          date: "2025-03-10",
          alertLevel: "high"
        },
        {
          id: 4,
          location: "Chennai, Tamil Nadu",
          date: "2025-01-05",
          alertLevel: "high"
        },
        {
          id: 5,
          location: "Kolkata, West Bengal",
          date: "2025-04-18",
          alertLevel: "high"
        }
      ];
      
      // Filter for dates from Jan 1, 2025 onwards (already done in mock data)
      return mockData;
      
      // Uncomment this section when connecting to a real API:
      /*
      const response = await fetch(`/api/cases?alert_level=high&start_date=${startDate}&end_date=${currentDate}`);
      const data = await response.json();
      
      return data.map(case_ => ({
        id: case_.id,
        location: case_.location_name,
        date: case_.created_date || case_.alert_date,
        alertLevel: case_.alert_level
      }));
      */
    } catch (error) {
      console.error('Error fetching high alert notifications:', error);
      return [];
    }
  }
}