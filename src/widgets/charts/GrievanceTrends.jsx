import React, { useState, useEffect, memo } from 'react';
import { Card, CardBody, Typography } from "@material-tailwind/react";
import Chart from 'react-apexcharts';
import dashboardService from '@/services/dashboard';

const GrievanceTrends = memo(({ from = "2016-08-01", to = "2016-08-30", ministry = "DOCAF" }) => {
  const [chartData, setChartData] = useState({
    series: [{
      name: 'Grievances',
      data: []
    }],
    options: {
      chart: {
        type: 'area',
        height: 300,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },
      colors: ['#3B82F6'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.1,
          stops: [0, 90, 100]
        }
      },
      grid: {
        show: true,
        borderColor: '#E5E7EB',
        strokeDashArray: 2,
        padding: {
          left: 10,
          right: 10
        }
      },
      xaxis: {
        categories: [],
        labels: {
          style: {
            fontSize: '12px',
            colors: '#6B7280'
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        labels: {
          style: {
            fontSize: '12px',
            colors: '#6B7280'
          }
        }
      },
      tooltip: {
        theme: 'light',
        style: {
          fontSize: '12px'
        },
        y: {
          formatter: function (val) {
            return val + " grievances"
          }
        }
      }
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadTrendData = async () => {
      try {
        setLoading(true);
        console.log('📈 Loading Grievance Trends for:', { ministry, from, to });
        
        const trendData = await dashboardService.getCDISTrendData(ministry, from, to);
        
        if (isMounted) {
          setChartData(prev => ({
            ...prev,
            series: [{
              name: 'Grievances',
              data: trendData.data
            }],
            options: {
              ...prev.options,
              xaxis: {
                ...prev.options.xaxis,
                categories: trendData.categories
              }
            }
          }));
          
          console.log('✅ Grievance Trends loaded:', trendData);
        }
      } catch (error) {
        if (isMounted) {
          console.error('❌ Error loading grievance trends:', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Debounce the API call to prevent multiple rapid calls
    const timeoutId = setTimeout(loadTrendData, 100);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [ministry, from, to]);

  return (
    <Card className="shadow-sm h-full">
      <CardBody className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <Typography variant="h6" className="text-gray-700 font-semibold">
              Grievance Trends
            </Typography>
          </div>
          {loading && (
            <div className="text-xs text-gray-500">Loading...</div>
          )}
        </div>
        <div className="flex-1">
          <Chart
            options={chartData.options}
            series={chartData.series}
            type="area"
            height="100%"
          />
        </div>
      </CardBody>
    </Card>
  );
});

export default GrievanceTrends;