import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Chip,
  Spinner,
} from "@material-tailwind/react";
import { getHighAlerts } from "@/services/notifications";
import { formatDate } from "@/helpers/date";

export function Notifications() {
  const [highAlerts, setHighAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertInfo, setAlertInfo] = useState({
    dateRange: '',
    urgentCriteria: '',
    topMinistries: [],
    topStates: []
  });

  useEffect(() => {
    fetchHighAlerts();
  }, []);

  const fetchHighAlerts = async () => {
    setLoading(true);
    try {
      console.log('Fetching high alerts with dynamic filters');
      
      const response = await getHighAlerts({});
      
      console.log('High alerts response:', response);
      
      if (response.success && response.data) {
        setHighAlerts(response.data);
        console.log('Set high alerts:', response.data);
        
        // Set additional info from response
        setAlertInfo({
          dateRange: response.dateRange || 'Based on available data',
          urgentCriteria: response.urgentCriteria || 'Calculated from grievance patterns',
          topMinistries: response.topMinistries || [],
          topStates: response.topStates || []
        });
      } else if (response.data) {
        // Handle fallback demo data
        setHighAlerts(response.data);
        console.log('Using fallback data:', response.data);
        setAlertInfo({
          dateRange: 'Based on available data (2016-present)',
          urgentCriteria: 'Pending + Overdue + High Volume Analysis',
          topMinistries: ['DOCAF', 'General Administration'],
          topStates: ['Maharashtra', 'Uttar Pradesh']
        });
      } else {
        setError("Failed to load high priority alerts");
      }
    } catch (err) {
      console.error("Error fetching high alerts:", err);
      setError("Error loading alerts: " + err.message);
      setAlertInfo({
        dateRange: 'Analysis unavailable',
        urgentCriteria: '',
        topMinistries: [],
        topStates: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto my-20 flex max-w-screen-lg flex-col gap-8">
        <Card>
          <CardHeader
            color="transparent"
            floated={false}
            shadow={false}
            className="m-0 p-4"
          >
            <Typography variant="h5" color="blue-gray">
              High Priority Alerts
            </Typography>
          </CardHeader>
          <CardBody className="flex justify-center items-center p-8">
            <Spinner className="h-8 w-8" />
            <Typography className="ml-2">Loading alerts...</Typography>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto my-20 flex max-w-screen-lg flex-col gap-8">
        <Card>
          <CardHeader
            color="transparent"
            floated={false}
            shadow={false}
            className="m-0 p-4"
          >
            <Typography variant="h5" color="blue-gray">
              High Priority Alerts
            </Typography>
          </CardHeader>
          <CardBody className="p-8">
            <div className="text-center text-red-500">
              <Typography>{error}</Typography>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto my-20 flex max-w-screen-lg flex-col gap-8">
      <Card>
        <CardHeader
          color="transparent"
          floated={false}
          shadow={false}
          className="m-0 p-4"
        >
          <Typography variant="h5" color="blue-gray">
            High Priority Alerts
          </Typography>
          <Typography variant="small" color="gray" className="mt-1">
            {alertInfo.dateRange}
          </Typography>
          {alertInfo.urgentCriteria && (
            <Typography variant="small" color="blue-gray" className="mt-1 italic">
              Analysis: {alertInfo.urgentCriteria}
            </Typography>
          )}
        </CardHeader>
        <CardBody className="p-4">
          {highAlerts.length > 0 ? (
            <div className="space-y-3">
              {highAlerts.map((alert, index) => (
                <div
                  key={index}
                  className="border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded-lg p-4 hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <Chip
                        value="🚨 Urgent"
                        color="red"
                        size="sm"
                        className="text-xs font-bold"
                      />
                      <div>
                        <Typography variant="h6" color="blue-gray" className="font-semibold">
                          📍 {alert.district || 'Unknown District'}, {alert.state}
                        </Typography>
                        <Typography variant="small" color="blue-gray" className="font-medium">
                          {alert.subject?.length > 80 ? `${alert.subject.substring(0, 80)}...` : alert.subject}
                        </Typography>
                      </div>
                    </div>
                    <div className="text-right">
                      <Typography variant="small" color="gray" className="font-medium">
                        📅 {alert.recvd_date ? new Date(alert.recvd_date).toLocaleDateString('en-IN') : "No date"}
                      </Typography>
                      {alert.urgencyScore && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-red-600 font-bold text-sm">⚡ {alert.urgencyScore}</span>
                          <Typography variant="xxs" color="gray" className="text-xs">
                            (Overdue: {alert.daysOverdue || 0} days)
                          </Typography>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span>🏢 {alert.ministry}</span>
                    <span>👤 {alert.name}</span>
                    <span className="text-red-600">Status: {alert.status}</span>
                    {alert.criteria && (
                      <span className="bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded text-red-800 dark:text-red-200">
                        {alert.criteria}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Additional Info Section */}
              {alertInfo.topMinistries.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Typography variant="small" color="blue-gray" className="font-semibold mb-2">
                    📊 Analysis Insights
                  </Typography>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <Typography variant="small" color="gray" className="mb-1">High-Volume Ministries:</Typography>
                      {alertInfo.topMinistries.map((ministry, idx) => (
                        <Chip key={idx} value={ministry} color="blue" size="xxs" className="mt-1" />
                      ))}
                    </div>
                    <div>
                      <Typography variant="small" color="gray" className="mb-1">High-Volume States:</Typography>
                      {alertInfo.topStates.map((state, idx) => (
                        <Chip key={idx} value={state} color="green" size="xxs" className="mt-1" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4">
                <Typography variant="h6" color="green" className="mb-2">
                  ✅ All Systems Operational
                </Typography>
                <Typography color="gray">
                  No urgent alerts detected in the analyzed period ({alertInfo.dateRange}).
                </Typography>
                {alertInfo.urgentCriteria && (
                  <Typography variant="small" color="blue-gray" className="mt-2 italic">
                    Monitoring: {alertInfo.urgentCriteria}
                  </Typography>
                )}
              </div>
              {alertInfo.topMinistries.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <Typography variant="small" color="green" className="font-semibold mb-2">
                    📈 Current Focus Areas
                  </Typography>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {alertInfo.topMinistries.map((ministry, idx) => (
                      <Chip key={idx} value={ministry} color="green" size="sm" />
                    ))}
                    {alertInfo.topStates.map((state, idx) => (
                      <Chip key={`s-${idx}`} value={state} color="blue" size="sm" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default Notifications;