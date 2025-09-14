import React, { useEffect, useState } from 'react';
import BarChart from './BarChart';
import config from '@/pages/dashboard/resources/env.json';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import stateinfo from '@pages/dashboard/resources/stateinfo.json';

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

const CategoryVisualization = ({ category, ministry, startDate, endDate, statesToFetch }) => {
    const [categorywiseStateDistribution, setCategorywiseStateDistribution] = useState([]);
    const [top5statesDistrictDistribution, setTop5statesDistrictDistribution] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Ensure statesToFetch is always an array
    const statesToFetchArray = Array.isArray(statesToFetch)
        ? statesToFetch
        : Object.keys(statesToFetch);

    useEffect(() => {
        if (statesToFetchArray.length === 0) {
            setError('No states to fetch data for.');
            setLoading(false);
            return;
        }

        const fetchLocationDistribution = async (state) => {
            const params = new URLSearchParams({
                query: category,
                value: '1',
                startDate,
                endDate,
                state,
                district: 'All',
                ministry,
                all_record: '1',
                threshold: '1.3',
            });

            const requestOptions = {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${config.API_KEY}`,
                },
            };

            try {
                await wait(1000)
                const data = await fetchWithTimeout(
                    `${config.API_URL}/get_district_wise_distribution/?${params.toString()}`,
                    requestOptions,
                    5000
                );
                return { state, data: data.district_wise_distribution };
            } catch (error) {
                console.error(`Error fetching district distribution for ${state}:`, error);
                return null;
            }
        };

        const fetchAllStateDetails = async () => {
            setLoading(true);
            try {
                const allStateData = await Promise.all(
                    statesToFetchArray.map((state) => fetchLocationDistribution(state))
                );

                const validData = allStateData.filter(Boolean); // Filter out failed fetches
                if (validData.length === 0) {
                    setError('No data available for the selected categories.');
                } else {
                    setTop5statesDistrictDistribution(validData);
                }
            } catch (err) {
                setError('An error occurred while fetching state data.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllStateDetails();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <div>
            <Typography variant="h5" align="center" gutterBottom margin="100px 40px 40px 40px">
                Let’s analyze the Top 5 State data's with their District distribution for "{capitalizeWords(category)}"
            </Typography>

            <Box display="flex" flexDirection="column" alignItems="center">
                {top5statesDistrictDistribution.map(({ state, data }) => (
                    <Box
                        key={state}
                        margin="0 auto"
                        mb={4}
                        width={stateinfo[state]?.width || '100%'} // Default width if not specified
                    >
                        <BarChart
                            chartData={data}
                            chartTitle={`${capitalizeWords(state)}`}
                            barWidth="20px"  // Fixed bar width
                            chartHeight="350" // Set chart height
                        />
                    </Box>
                ))}
            </Box>
        </div>
    );
};

export default CategoryVisualization;
