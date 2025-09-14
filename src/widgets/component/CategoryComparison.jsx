import React, { useEffect, useState } from 'react';
import LineChart from './LineChart'; // Import the LineChart component
import { Box, Stack, Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';

// Helper function to fetch data with timeout
const fetchWithTimeout = async (url, options, timeout = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        return response.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Request timed out');
        } else {
            console.error('Fetch error:', error);
        }
        throw error;
    } finally {
        clearTimeout(id);
    }
};
function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const CategoryComparison = ({ categories, ministry, startDate, endDate }) => {
    const [stateData, setStateData] = useState([]); // Initialize as an array
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const reportData = JSON.parse(localStorage.getItem('reportData'));

    // useEffect(() => {
    //     const fetchStateDistribution = async (category) => {
    //         const params = new URLSearchParams({
    //             query: category,
    //             value: '1',
    //             startDate: startDate,
    //             endDate: endDate,
    //             state: 'All',
    //             district: 'All',
    //             ministry: ministry,
    //             all_record: '1',
    //             threshold: '1.3',
    //             type: '1'
    //         });

    //         const requestOptions = {
    //             headers: {
    //                 'Accept': 'application/json',
    //                 'Authorization': `Bearer ${config.API_KEY}`,
    //             },
    //         };

    //         try {
    //             await wait(1000)
    //             const data = await fetchWithTimeout(`${config.API_URL}/get_state_wise_distribution/?${params.toString()}`, requestOptions, 5000);
    //             return { category, data: data.state_wise_distribution }; // Return category and data
    //         } catch (error) {
    //             console.error(`Error fetching distribution for ${category}:`, error);
    //             return null; // Return null if there's an error
    //         }
    //     };

    //     const fetchAllStateDetails = async () => {
    //         try {
    //             const allStateData = await Promise.all(
    //                 categories.map((category) => fetchStateDistribution(category))
    //             );
    //             setStateData(allStateData.filter(Boolean)); // Filter out null responses
    //         } catch (error) {
    //             setError("Failed to fetch data. Please try again later.");
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchAllStateDetails();
    // }, []); // Add all dependencies

    // Prepare chart data for each category
    const prepareChartData = () => {
        const chartData = {};

        Object.entries(reportData.categories_state_distribution).forEach(([category, data]) => {
            if (data) {
                const values = Object.values(data);
                const districts = Object.keys(data);
                chartData[category] = { values, districts }; // Store values and districts for each category
            }
        });

        return chartData;
    };

    const chartData = prepareChartData(); // Prepare chart data

    // Render loader, error message, and charts
    return (



        <Box margin="20px auto">
            <Typography variant="h5"  >
                3. State Wise Category Comparison:
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ marginTop: '20px' }} >
                A line chart depicting the comparison between the
                generated categories, X-axis depict states and Y-axis depict the count of the grievances of particular category. </Typography>

            {loading && (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                </Box>
            )}
            {error && (
                <Alert severity="error" style={{ margin: '20px 0' }}>
                    {error}
                </Alert>
            )}
            <Stack container spacing={3} justifyContent="center">
                {Object.entries(chartData).length > 0 ? (
                    <Stack item xs={12}>

                        <LineChart
                            chartData={chartData} // Pass all data at once
                        // chartTitle={`Category Comparison for: ${categories.join(', ')}`}
                        />

                    </Stack>
                ) : (
                    <Stack item xs={12}>
                        <Typography variant="body1" align="center">
                            No data available for the selected categories.
                        </Typography>
                    </Stack>
                )}
            </Stack>
        </Box>
    );
};

export default CategoryComparison;
