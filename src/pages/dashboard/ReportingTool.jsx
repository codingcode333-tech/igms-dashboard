import React from 'react';
import { Box, Typography, CircularProgress, Alert, Button, List, ListItem, ListItemText } from '@mui/material';
import CategoryComparison from "@/widgets/component/CategoryComparison";
import config from './resources/env.json';
import BarChart from '@/widgets/component/BarChart';
import { RedressalFlagging } from '@/widgets/component/RedressalFlagging';
import { SearchButton } from '@/widgets/grievance/BasicFilters';
import { sleep } from '@/helpers/general';

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

const joinWithAnd = arr => arr.length > 1 ? arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1] : arr[0] || '';

function ReportingTool() {
    let reportData = JSON.parse(localStorage.getItem('reportData'));
    reportData['categories_state_distribution'] = Object.fromEntries(
        Object.entries(reportData.categories_state_distribution).filter(([key, value]) => value !== null)
    )

    const categories_state_distribution = reportData ? Object.values(reportData.categories_state_distribution) : [];

    const categories = reportData ? Object.values(reportData.categories) : [];

    const ordered_categories = categories.map(category => ({
        category,
        count: Object.values(reportData.categories_state_distribution[category]).reduce((sum, count) => sum + count, 0)
    }))
        .sort((a, b) => b.count - a.count)

    const state_wise_counts = {}

    for (let states of categories_state_distribution) {
        for (let [state, count] of Object.entries(states)) {
            if (!state_wise_counts[state])
                state_wise_counts[state] = 0
            state_wise_counts[state] += count
        }
    }

    const state_wise_count_list = Object.entries(state_wise_counts).map(([state, count]) => ({ state, count })).sort((a, b) => b.count - a.count)

    const bulletPoints = [
        `In the ${reportData.ministry} department, we found ${categories.length} major categories ${joinWithAnd(categories.map(category => `"${category}"`))}.`,
        `"${joinWithAnd(categories.slice(0, 2).map(category => `"${category}"`))} are the major categories.`,
        `Most grievances were filed in ${joinWithAnd(state_wise_count_list.slice(0, 4).map(({ state }) => state))}.`,
        // `From the analysis of Redressal Efficacy ranking Uttar Pradesh, Delhi, Bihar and Haryana are the lagging states in terms of redressal quality.`,
        // `From the analysis of Redressal Efficacy ranking Uttar Pradesh, Delhi, Bihar and Haryana have the GROs which are redressing the grievances too quickly relative to other GROs with respect to the same topic.`,
    ]

    const fetchLocationDistribution = async (state, category) => {
        const params = new URLSearchParams({
            query: category,
            value: '1',
            startDate: reportData.startDate,
            endDate: reportData.endDate,
            state: state,
            district: 'All',
            ministry: reportData.ministry,
            all_record: '1',
            threshold: '1.3',
        });

        const requestOptions = {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${config.API_KEY} `,
            },
        };

        try {
            await wait(1000)
            const data = await fetchWithTimeout(`${config.API_URL} /get_district_wise_distribution/ ? ${params.toString()} `, requestOptions, 5000);
            return { state, data: data.district_wise_distribution };
        } catch (error) {
            console.error(`Error fetching district distribution for ${state}: `, error);
            return null;
        }
    };

    // Check if reportData is valid
    if (!reportData) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
                <Alert severity="error">No report data available. Please try again.</Alert>
            </Box>
        );
    }



    // Function to handle print
    const handlePrint = async () => {
        const printContent = document.getElementById('printable-section');
        const toolbarElements = document.getElementsByClassName('apexcharts-toolbar');

        // Hide all apexcharts-toolbar elements
        Array.from(toolbarElements).forEach(element => {
            element.style.display = 'none';
        });

        // Open print window and add content
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(`
        <html>
            <head>
                <title>Print</title>
                <style>
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    body { font-family: Arial, sans-serif; margin: 20px }
                    h1, h2, h3 { text-align: center; }
                    .chart { margin: 20px; }
                    @media print {
                        .no-print {
                        display: none;
                        }
                    }
                    .new-page {
                        // page-break-before: always;
                    }
                </style>
            </head>
            <body>
                <h1>Analysis Report for ${reportData.ministry}</h1>
                <div>${printContent.innerHTML}</div>
            </body>
        </html>
    `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();

        // Restore the display property after printing
        Array.from(toolbarElements).forEach(element => {
            element.style.display = '';
        });
    };


    return (
        <Box padding={3} width="1200px" margin="0 auto" id="printable-section">
            <Typography variant="h4" align="left" gutterBottom className='no-print'>
                Reporting Tool - AI Categories Report Generator
            </Typography>

            {/* Print Button */}
            <div className='no-print'>
                <Box display="flex" justifyContent="right">
                    <SearchButton startSearch={handlePrint} actionText='Print Report' />
                    {/* <Button variant="contained" color="primary" className='no-print' onClick={handlePrint}>
                    Print Report
                </Button> */}
                </Box>
            </div>

            <Box sx={{ padding: '30px' }}>
                <Typography variant="h5" gutterBottom>
                    1. AI Categories
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ marginTop: '20px' }}>
                    We apply dynamic Root Cause Analysis from {reportData.startDate} to {reportData.endDate} public grievance data. Applying this we got the number of clusters having their
                    specific count. Bag-of-word terms represent each cluster. Dynamic RCA provide output in the form of Bag-of-word representation. We predict the below categories with Bag-of-words representation.
                </Typography>
                <List component="ol" sx={{ paddingLeft: '50px', listStyleType: 'decimal', marginTop: '20px' }}>
                    {categories.map((category, index) => (
                        <React.Fragment key={index}>
                            <ListItem sx={{ display: 'list-item', padding: '5px 0' }}>
                                <ListItemText
                                    primary={capitalizeWords(category)}
                                    primaryTypographyProps={{ variant: 'body2', color: "textSecondary" }}
                                />
                            </ListItem>
                            {index < categories.length - 1}
                        </React.Fragment>
                    ))}
                </List>

            </Box>


            <Box padding="30px">
                <Typography variant="h5"  >
                    2. Geographical Analysis :
                </Typography>

                <Typography variant="body2" color="textSecondary" sx={{ marginTop: '20px' }} >
                    let’s pick some possible categories and analyze them
                    geographically
                </Typography>
            </Box>

            {/* Loading State */}
            {categories_state_distribution.length === 0 ? (
                <Box display="flex" justifyContent="center" marginTop={3}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Box elevation={3} style={{ padding: '16px', marginBottom: '20px' }}>
                        {/* Wrapping in a div for printing */}
                        <div >
                            {Object.entries(reportData.categories_state_distribution).map(([category, state_distribution], index) => {
                                const sortedArrayDesc = Object.entries(state_distribution).sort((a, b) => b[1] - a[1]);
                                const top5States = sortedArrayDesc.slice(0, 5);
                                const top5StatesObj = Object.fromEntries(top5States);


                                return (
                                    <div key={index} className='new-page'>


                                        <Box
                                            margin="0 auto"
                                            mb="100px"
                                            width="1080px" // Default width if not specified
                                        >
                                            <BarChart
                                                chartData={state_distribution} chartTitle={`Utilizing Spatial Analysis of IGMS2 we got the data
below in the bar chart for "${capitalizeWords(category)}"`} chartHeight="350"
                                                barWidth="20px"  // Fixed bar width

                                            />
                                        </Box>

                                        {/* <CategoryVisualization
                                            category={category}
                                            ministry={reportData.ministry}
                                            startDate={reportData.startDate}
                                            endDate={reportData.endDate}
                                            statesToFetch={top5StatesObj}
                                        /> */}
                                    </div>
                                );
                            })}
                        </div>
                    </Box>

                    <div className='new-page'>
                        <Box elevation={3} style={{ padding: '16px' }}>
                            <CategoryComparison
                                categories={categories}
                                ministry={reportData.ministry}
                                startDate={reportData.startDate}
                                endDate={reportData.endDate}
                            />
                        </Box>
                    </div>

                    <Box elevation={3} style={{ padding: '16px' }}>
                        <RedressalFlagging />
                    </Box>


                    <Box elevation={3} style={{ padding: '16px' }}>

                        <Typography variant="h5" marginBottom={'2rem'}>
                            Key Takeaways from the report :
                        </Typography>

                        <List component="ol" sx={{ paddingLeft: '50px', listStyleType: 'decimal', marginTop: '20px' }}>
                            {bulletPoints.map((category, index) => (
                                <React.Fragment key={index}>
                                    <ListItem sx={{ display: 'list-item', padding: '5px 0' }}>
                                        <ListItemText
                                            primary={category}
                                            primaryTypographyProps={{ variant: 'body2', color: "textSecondary" }}
                                        />
                                    </ListItem>

                                    {index < categories.length - 1}
                                </React.Fragment>
                            ))}
                        </List>
                    </Box>
                </>
            )}
        </Box>
    );
}

export default ReportingTool;
