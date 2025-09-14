import React, { useState } from 'react';
import { Box, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Paper, Stack, Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import config from './resources/env.json';
import httpService from '@/services/httpService';
import { getUser } from '@/context/UserContext';
import { DateRangePicker, MinistryAutocomplete } from './CategoricalTree';
import { SearchButton } from '@/widgets/grievance/BasicFilters';
import { defaultFrom, defaultTo } from '@/helpers/env';
import { Input } from '@material-tailwind/react';
import { sleep } from '@/helpers/general';
import { getDynamicRca, getRealTimeRCA } from '@/services/rca';

const env = import.meta.env

let RCA_URL = config.RCA_URL
let API_URL = config.API_URL
let API_KEY = config.API_KEY

if (env.VITE_ENVIRONMENT && env.VITE_ENVIRONMENT != 'dev') {
    RCA_URL = httpService.baseURL
    API_URL = httpService.baseURL

    let user = getUser()
    API_KEY = user?.accessToken
}



const ReportHome = () => {
    const navigate = useNavigate(); // Initialize useNavigate
    const [ministry, setMinistry] = useState('');
    const [startDate, setStartDate] = useState(defaultFrom);
    const [endDate, setEndDate] = useState(defaultTo);
    const [number_of_clusters, setNumberofClusters] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingCategory, setLoadingCategory] = useState(false)
    const [apiData, setApiData] = useState(null);
    const [reportData, setReportData] = useState({});
    const [categories, setCategories] = useState({});
    const user = getUser()
    const [selectedMinistry, setSelectedMinistry] = useState({
        text: 'CBODT',
        value: 'CBODT'
    })
    const [dateRange, setDateRange] = useState({
        startDate: defaultFrom,
        endDate: defaultTo
    })

    // Helper function to fetch data with timeout
    const fetchWithTimeout = async (url, options, timeout = 5000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.accessToken}`
                }
            });
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

    // Handle form submission and API call
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const requestBody = {
            ministry: selectedMinistry.value,
            startDate,
            endDate,
            state: 'All',
            district: 'All',
            // number_of_clusters: parseInt(number_of_clusters) + 1,
            registration_no_list: ['NA'],
        };

        try {
            // const params = new URLSearchParams(requestBody);

            // const response = await fetch(`${RCA_URL}dynamicrca/?${params}`, {
            //     method: 'POST',
            //     headers: {
            //         'accept': 'application/json',
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${user.accessToken}`
            //     },
            //     // body: JSON.stringify(requestBody),
            // });

            // const data = await response.json();

            const response = await getRealTimeRCA(requestBody)

            setApiData(convertRCATreeToFlatData(response.data));

            // Save to local storage
            const storedData = {
                ministry: selectedMinistry.value,
                startDate,
                endDate
            };
            setReportData(storedData);
            // localStorage.setItem('reportData', JSON.stringify(storedData));

        } catch (error) {
            console.error('API error:', error);
        } finally {
            setLoading(false);
        }
    };


    const fetchStateDistribution = async (category) => {
        const params = new URLSearchParams({
            query: category,
            value: '1',
            startDate: startDate,
            endDate: endDate,
            state: 'All',
            district: 'All',
            ministry: selectedMinistry.value,
            all_record: '1',
            threshold: '1.3',
        });

        const requestOptions = {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
        };

        // try {
        const data = await fetchWithTimeout(`${API_URL}/get_state_wise_distribution/?${params.toString()}`, requestOptions, 5000);

        // const sortedArray = Object.values(data.state_wise_distribution).sort((a, b) => b[1] - a[1]);

        // // (data.state_wise_distribution).sort((a, b) => b.value - a.value);
        // const top5states = sortedArray.slice(0, 5);
        // console.log("data state", data.state_wise_distribution, top5states);


        return data.state_wise_distribution;
        // } catch (error) {
        //     console.error(`Error fetching district distribution`, error);
        //     return null;
        // }
    };


    const fetchRedressalEfficacy = async (category) => {
        const params = new URLSearchParams({
            query: category,
            value: '1',
            startDate: startDate,
            endDate: endDate,
            state: 'All',
            district: 'All',
            ministry: selectedMinistry.value,
            all_record: '1',
            threshold: '1.3',
            distribution: 'state'
        });

        const requestOptions = {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${config.API_KEY}`,
            },
        };

        try {
            const data = await fetchWithTimeout(`${config.API_URL}/dynamicflagging/?${params.toString()}`, requestOptions, 5000);

            // const sortedArray = Object.values(data.state_wise_distribution).sort((a, b) => b[1] - a[1]);

            // // (data.state_wise_distribution).sort((a, b) => b.value - a.value);
            // const top5states = sortedArray.slice(0, 5);
            // console.log("data state", data.state_wise_distribution, top5states);


            return data;
        } catch (error) {
            console.error(`Error fetching Redressal Efficacy Data`, error);
            return null;
        }
    };


    // Handle category input for each row
    const handleCategoryChange = (index, newCategory) => {
        setCategories({ ...categories, [index]: newCategory });
    };

    const handleCategorySubmit = async () => {

        setLoadingCategory(true)

        reportData.categories = categories;
        const categories_state_distribution = {}
        const redressalEfficacy = {}

        for (const [key, value] of Object.entries(reportData.categories)) {
            const redressalEfficacyData = await fetchRedressalEfficacy(value);
            redressalEfficacy[value] = redressalEfficacyData
            const state_distribution = await fetchStateDistribution(value);
            categories_state_distribution[value] = state_distribution;

            await sleep(10_000)
        }

        reportData.categories_state_distribution = categories_state_distribution;
        reportData.redressalEfficacy = redressalEfficacy
        localStorage.setItem('reportData', JSON.stringify(reportData));

        setLoadingCategory(false)

        // Redirect to another page after submission
        navigate('/dashboard/generatereport'); // Change '/anotherPage' to your desired route
    };

    const updateDateRange = range => {
        setStartDate(range.startDate)
        setEndDate(range.endDate)
        setDateRange(range)
    }

    return (
        <Box marginTop="40px">
            <Paper elevation={3} sx={{ padding: 4, maxWidth: 720, margin: '0 auto' }}>
                {/* <Typography variant="h4" gutterBottom>
                    Generate AI Categories
                </Typography> */}
                <form onSubmit={handleSubmit}>
                    <Stack container spacing={2}>
                        <Stack item xs={12}>
                            {/* <TextField
                                label="Ministry"
                                value={ministry}
                                onChange={(e) => setMinistry(e.target.value)}
                                required
                                fullWidth
                            /> */}
                            <MinistryAutocomplete
                                ministry={selectedMinistry}
                                setMinistry={setSelectedMinistry}
                            />
                        </Stack>
                        {/* <Stack item xs={6}>
                            <TextField
                                label="Start Date"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                                fullWidth
                            />
                        </Stack> */}
                        <Stack item xs={6}>
                            <DateRangePicker
                                value={dateRange}
                                onChange={updateDateRange}
                            />

                            {/* <TextField
                                label="End Date"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                                fullWidth
                            /> */}
                        </Stack>
                        {/* <Stack item xs={12}>
                            <TextField
                                label="Number of Clusters"
                                type="number"
                                InputLabelProps={{ shrink: true }}
                                value={number_of_clusters}
                                onChange={(e) => setNumberofClusters(e.target.value)}
                                required
                                fullWidth
                            />
                            
                            <Input
                                type="number"
                                label="Number of Clusters"
                                value={number_of_clusters}
                                className="bg-white-input basic-input font-bold"
                                onChange={(e) => setNumberofClusters(e.target.value)}
                                autoFocus
                            />
                        </Stack> */}
                        <Stack item xs={12}>
                            {/* <LoadingButton
                                type="submit"
                                variant="contained"
                                loading={loading}
                                fullWidth
                            >
                                Submit
                            </LoadingButton> */}

                            <SearchButton searching={loading} startSearch={handleSubmit} />
                        </Stack>

                        <div className='text-sm text-blue-gray-300'>
                            ! Due to hardware constraints, please limit the search for a range of 2 months only.
                        </div>
                    </Stack>
                </form>
            </Paper>

            {apiData && (
                <Box mt={4}>
                    <Paper elevation={3} sx={{ padding: 4, maxWidth: 1080, margin: '40px auto' }}>
                        <Typography variant="h5" gutterBottom>
                            AI Categories
                        </Typography>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Words</TableCell>
                                    <TableCell>Count</TableCell>
                                    <TableCell>Category</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.keys(apiData).map((key) => (
                                    <TableRow key={key}>
                                        <TableCell>{apiData[key]?.words?.join(', ')}</TableCell>
                                        <TableCell>{apiData[key]?.count}</TableCell>
                                        <TableCell>
                                            <TextField
                                                label="Category"
                                                value={categories[key] || ''}
                                                onChange={(e) => handleCategoryChange(key, e.target.value)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <SearchButton searching={loadingCategory} startSearch={handleCategorySubmit} actionText='Submit Categories' className='mt-2' />
                        {/* <Button variant="contained" color="primary" onClick={handleCategorySubmit} sx={{ marginTop: 2 }}>
                            Submit Categories
                        </Button> */}
                    </Paper>
                </Box>
            )}
        </Box>
    );
};

export default ReportHome;

function convertRCATreeToFlatData(inputJson) {
    const output = {};
    let newIndex = 0;

    // Iterate through the keys in the words object
    for (const key in inputJson.words) {
        // Check if the key has exactly one dot
        if (key.split('.').length === 2) {
            output[newIndex] = {
                words: inputJson.words[key].split(','), // Convert comma-separated string to array
                count: inputJson.count[key], // Get corresponding count
                doc_ids: inputJson.doc_ids[key] // Get corresponding doc_ids
            };
            newIndex++;
        }
    }

    return output;
}
