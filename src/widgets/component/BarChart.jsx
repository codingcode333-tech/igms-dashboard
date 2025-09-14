import React from 'react';
import ReactApexChart from 'react-apexcharts';

const BarChart = ({ chartData, chartTitle, chartHeight = '350', barWidth = '20px', color = "#008ffbd9", additionalOptions = null }) => {
  const options = {
    chart: {
      type: 'bar',
      height: chartHeight, // Use the height passed via props
    },
    plotOptions: {
      bar: {
        columnWidth: barWidth,  // Set the bar width dynamically
        endingShape: 'rounded',  // Rounded bar endings
        horizontal: true,  // Vertical bars
      },
    },
    colors: [color],
    xaxis: {
      categories: Object.keys(chartData), // Get categories from the data
    },
    title: {
      text: chartTitle, // Set the title dynamically
    },
    ...(
      additionalOptions ?? {}
    )
  };

  const series = [{
    name: 'Grievance Count',
    data: Object.values(chartData), // Use the values from the data
  }];

  return (
    <div style={{ marginBottom: '30px' }}>
      <ReactApexChart options={options} series={series} type="bar" />
    </div>
  );
};

export default BarChart;

export const ExtreemeEndsBarChart = ({ chartData, chartTitle, chartHeight = '350px', barWidth = '20px' }) => {
  // Transform the data into segments based on the percentages

  const transformedData = Object.values(chartData).map(({ value, startPercent, endPercent }) => {
    const startRed = Math.round((value * (startPercent ?? 0)) / 100);
    const endRed = Math.round((value * (endPercent ?? 0)) / 100);
    const middleBlue = value - startRed - endRed;
    return [startRed, middleBlue, endRed];
  });

  const options = {
    chart: {
      type: 'bar',
      height: chartHeight,
      stacked: true, // Enable stacking
    },
    plotOptions: {
      bar: {
        columnWidth: barWidth,
        endingShape: 'rounded',
        horizontal: true,
      },
    },
    colors: ['#ff510ed9', '#008ffbd9', '#ff0e0ed9'], // Red for start and end, blue for the middle
    xaxis: {
      categories: Object.keys(chartData),
    },
    title: {
      text: chartTitle,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val.toFixed(2); // Format tooltip to show two decimals
        }
      }
    },
  };

  // Prepare series data for the stacked bar chart
  const series = [
    {
      name: 'Early Redressal',
      data: transformedData.map(([startRed]) => startRed),
    },
    {
      name: 'Normal Grievances',
      data: transformedData.map(([, middleBlue]) => middleBlue),
    },
    {
      name: 'Late Redressal',
      data: transformedData.map(([, , endRed]) => endRed),
    },
  ];

  return (
    <div style={{ marginBottom: '30px' }}>
      <ReactApexChart options={options} series={series} type="bar" />
    </div>
  );
};
