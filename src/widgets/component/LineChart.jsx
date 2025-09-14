import React from 'react';
import ReactApexChart from 'react-apexcharts';

// List of Indian states and Union Territories
const indianStates = [
    "andhra pradesh", "arunachal pradesh", "assam", "bihar", 
    "chandigarh", "dadra and nagar haveli and daman and diu", 
    "delhi", "goa", "gujarat", "haryana", "himachal pradesh", 
    "jharkhand", "karnataka", "kerala", "madhya pradesh", 
    "maharashtra", "manipur", "meghalaya", "mizoram", 
    "nagaland", "odisha", "punjab", "rajasthan", 
    "sikkim", "tamil nadu", "telangana", "tripura", 
    "uttar pradesh", "uttarakhand", "west bengal"
];

const unionTerritories = [
    "andaman and nicobar islands", "lakshadweep", 
    "puducherry", "jammu and kashmir", "ladakh", 
    "chandigarh"
];

// Sort the states alphabetically
const sortedStates = indianStates.sort();
const sortedUTs = unionTerritories.sort();

// Combine sorted states with sorted UTs, ensuring UTs come last
const allIndianStatesAndUTs = [...sortedStates, ...sortedUTs];

function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}



const LineChart = ({ chartData, chartTitle }) => {
    // Prepare the data for the line chart
    const series = [];
    const dataMap = allIndianStatesAndUTs.reduce((acc, state) => {
        acc[state] = 0; // Default value of 0 for each state
        return acc;
    }, {});

    // Iterate over the chartData to populate series
    Object.entries(chartData).forEach(([category, data]) => {
        series.push({
            name: category,
            data: [] // Start with an empty array for each category
        });

        // Populate the dataMap with actual values
        data.districts.forEach((district, index) => {
            const lowerCaseDistrict = district.toLowerCase(); // Convert district name to lowercase
            // Check if the district is a state in our map
            if (dataMap.hasOwnProperty(lowerCaseDistrict)) {
                dataMap[lowerCaseDistrict] = data.values[index]; // Assign the value from data.values
            }
        });

        // Create series data for the category
        series[series.length - 1].data = allIndianStatesAndUTs.map(state => dataMap[state]);
    });

    return (
        <div>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{chartTitle}</h2>
            <ReactApexChart
                options={{
                    chart: {
                        type: 'line',
                        height: 350,
                    },
                    title: {
                        text: chartTitle,
                        align: 'center',
                    },
                    xaxis: {
                        categories: allIndianStatesAndUTs, // Use all states and UTs for x-axis
                        labels: {
                            rotate: -45, // Rotate labels to prevent overlap
                            hideOverlappingLabels: true, // Hide overlapping labels
                        },
                        tickPlacement: 'on', // Place ticks on the category
                    },
                    markers: {
                        size: 5
                    },
                    colors: [
                        '#008FFB', '#FF4560', '#00E396', '#775DD0', 
                        '#FEB019', '#FF9F00', '#2B908F', '#E83E8C', 
                        '#F15B2A', '#A5D6D8'
                    ],
                    stroke: {
                        curve: 'smooth',
                        width: 3,
                    },
                    grid: {
                        padding: {
                            left: 20,
                            right: 20,
                            top: 20,
                        },
                    },
                    tooltip: {
                        shared: true,
                        intersect: false,
                        y: {
                            formatter: (val) => val === 0 ? 'No data' : val,
                        }
                    },
                }}
                series={series}
                type="line"
            />
        </div>
    );
};

export default LineChart;
