// Test file to check notification service
import { getHighAlerts } from './src/services/notifications.js';

async function testNotifications() {
    try {
        console.log('Testing notification service...');
        const result = await getHighAlerts();
        console.log('Notification API Test Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Notification API Test Error:', error);
    }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testNotifications();
}

export { testNotifications };