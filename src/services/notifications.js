import httpService from './httpService';
import { formatDate, dateBefore } from '@/helpers/date';

// Get high priority alerts/notifications using real API
export const getHighAlerts = async (params = {}) => {
    try {
        // Use the urgent/priority endpoint
        const defaultFilters = {
            startDate: dateBefore(90), // Last 90 days
            endDate: formatDate(),
            ministry: 'All',
            state: 'All', 
            district: 'All',
            ...params.filters
        };

        // Call the priority/urgent grievances endpoint
        const response = await httpService.get(
            `/urgent/?startDate=${defaultFilters.startDate}&endDate=${defaultFilters.endDate}&skiprecord=0&size=20&state=${defaultFilters.state}&district=${defaultFilters.district}&ministry=${defaultFilters.ministry}&all_record=1&download_req=0&page_req=0&filename=unknown&user=user`
        );
        
        // Handle different response structures
        let grievanceData = [];
        if (response?.data) {
            // If response.data is an array
            if (Array.isArray(response.data)) {
                grievanceData = response.data;
            }
            // If response.data has a data property that's an array
            else if (response.data.data && Array.isArray(response.data.data)) {
                grievanceData = response.data.data;
            }
            // If response.data has a grievances property that's an array
            else if (response.data.grievances && Array.isArray(response.data.grievances)) {
                grievanceData = response.data.grievances;
            }
            // If response.data has response property (CDIS format)
            else if (response.data.response && Array.isArray(response.data.response)) {
                grievanceData = response.data.response;
            }
        }
        
        // Process and limit to 5 most recent urgent grievances
        const processedAlerts = grievanceData
            .slice(0, 20) // Get first 20
            .map(item => ({
                registration_no: item.registration_no || item.regn_no || 'N/A',
                subject: item.subject || item.grievance_desc || 'No subject available',
                recvd_date: item.recvd_date || item.received_date || new Date().toISOString().split('T')[0],
                ministry: item.ministry || item.dept_name || 'Unknown Ministry',
                priority: "High",
                status: item.status || "Under Process",
                name: item.name || item.complainant_name || 'Anonymous',
                state: item.state || 'Unknown State',
                district: item.district || 'Unknown District'
            }))
            .slice(0, 5); // Limit to 5 for notification display
        
        return {
            success: true,
            data: processedAlerts,
            count: processedAlerts.length,
            totalCount: grievanceData.length // Total urgent grievances found
        };
        
    } catch (error) {
        console.error('Error fetching high alerts:', error);
        
        // Return demo data as fallback
        return {
            success: false,
            data: [
                {
                    registration_no: "DARPG/E/2024/00001",
                    subject: "Urgent: Pension disbursement delay affecting senior citizens",
                    recvd_date: "2024-01-15",
                    ministry: "Department of Pension",
                    priority: "High",
                    status: "Under Process",
                    name: "Rajesh Kumar",
                    state: "Uttar Pradesh",
                    district: "Lucknow"
                },
                {
                    registration_no: "DARPG/E/2024/00004", 
                    subject: "Critical: Power connection delay in rural area",
                    recvd_date: "2024-01-12",
                    ministry: "Power Ministry", 
                    priority: "High",
                    status: "Fresh",
                    name: "Sunita Devi",
                    state: "Bihar", 
                    district: "Patna"
                },
                {
                    registration_no: "DARPG/E/2024/00007",
                    subject: "Emergency: Medical facility access issues",
                    recvd_date: "2024-01-10",
                    ministry: "Health Ministry",
                    priority: "High",
                    status: "Under Process",
                    name: "Dr. Amit Sharma",
                    state: "Maharashtra",
                    district: "Mumbai"
                }
            ],
            count: 3,
            totalCount: 3,
            fallback: true
        };
    }
};

// Mark notification as read
export const markNotificationRead = async (registrationNo) => {
    try {
        const response = await httpService.post('/mark_notification_read', {
            registration_no: registrationNo
        });
        
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return { success: false, error: error.message };
    }
};

// Get notification count
export const getNotificationCount = async () => {
    try {
        const response = await httpService.post('/get_notification_count');
        
        return { 
            success: true, 
            count: response?.data?.count || 0 
        };
    } catch (error) {
        console.error('Error fetching notification count:', error);
        return { success: false, count: 0 };
    }
};

export default {
    getHighAlerts,
    markNotificationRead,
    getNotificationCount
};