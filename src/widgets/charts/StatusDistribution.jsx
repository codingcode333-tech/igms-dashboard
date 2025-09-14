import React, { useState, useEffect, memo } from 'react';
import { Card, CardBody, Typography } from "@material-tailwind/react";
import Chart from 'react-apexcharts';
import dashboardService from '@/services/dashboard';

const StateDistribution = memo(({ from = "2016-08-01", to = "2016-08-30", ministry = "DOCAF", stateDistData = null }) => {
  const [chartData, setChartData] = useState({
    series: [], // Will be populated from CDIS API
    options: {
      chart: {
        type: 'donut',
        height: 300
      },
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'], 
      labels: [], // Will be populated from CDIS API
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return Math.round(val) + "%"
        },
        style: {
          fontSize: '11px',
          fontWeight: 'bold',
          colors: ['#FFFFFF']
        },
        dropShadow: {
          enabled: false
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                offsetY: -5
              },
              value: {
                show: true,
                fontSize: '18px',
                fontWeight: 700,
                color: '#1F2937',
                offsetY: 5,
                formatter: function (val) {
                  return val + "%"
                }
              },
              total: {
                show: true,
                showAlways: true,
                label: 'States',
                fontSize: '12px',
                fontWeight: 400,
                color: '#6B7280',
                formatter: function (w) {
                  // Show number of states instead of total value
                  return w.globals.seriesTotals.length;
                }
              }
            }
          }
        }
      },
      legend: {
        show: false // Hide legend to save space
      },
      tooltip: {
        enabled: true,
        style: {
          fontSize: '12px'
        },
        y: {
          formatter: function (val) {
            return val + "%"
          }
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            height: 200
          }
        }
      }]
    }
  });

  const [loading, setLoading] = useState(false);
  const [stateData, setStateData] = useState([]);

  useEffect(() => {
    let isMounted = true;
    
    const loadStateData = async () => {
      try {
        setLoading(true);
        
        // Use passed stateDistData if available, otherwise fetch it
        let stateDistribution;
        if (stateDistData) {
          console.log('🗺️ Using passed state data for chart');
          stateDistribution = stateDistData;
        } else {
          console.log('🗺️ Loading State Distribution for:', { ministry, from, to });
          stateDistribution = await dashboardService.getCDISStateData(ministry, from, to);
        }
        
        if (isMounted) {
          setChartData(prev => ({
            ...prev,
            series: stateDistribution.data,
            options: {
              ...prev.options,
              labels: stateDistribution.labels
            }
          }));
          
          setStateData(stateDistribution.stateDetails);
          
          console.log('✅ State Distribution loaded:', stateDistribution);
        }
      } catch (error) {
        if (isMounted) {
          console.error('❌ Error loading state distribution:', error);
          // Set fallback data
          const fallbackData = {
            labels: ['Maharashtra', 'Uttar Pradesh', 'Karnataka', 'Tamil Nadu'],
            data: [25, 20, 15, 12],
            stateDetails: [
              { name: 'Maharashtra', count: 125, color: 'bg-blue-500' },
              { name: 'Uttar Pradesh', count: 98, color: 'bg-green-500' },
              { name: 'Karnataka', count: 75, color: 'bg-amber-500' },
              { name: 'Tamil Nadu', count: 60, color: 'bg-red-500' }
            ]
          };
          
          setChartData(prev => ({
            ...prev,
            series: fallbackData.data,
            options: {
              ...prev.options,
              labels: fallbackData.labels
            }
          }));
          
          setStateData(fallbackData.stateDetails);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(loadStateData, 150);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [ministry, from, to, stateDistData]);

  return (
    <Card className="shadow-sm h-full">
      <CardBody className="p-3 h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <Typography variant="h6" className="text-gray-700 font-semibold text-sm">
            State Distribution
          </Typography>
          {loading && (
            <div className="text-xs text-gray-500">Loading...</div>
          )}
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 -mt-2 min-h-0">
            <Chart
              options={chartData.options}
              series={chartData.series}
              type="donut"
              height="100%"
            />
          </div>
          
          {/* State Summary - Fixed Overflow */}
          <div className="mt-1 space-y-1 flex-shrink-0">
            <div className="max-h-20 overflow-y-auto space-y-1">
              {stateData && stateData.length > 0 && stateData.slice(0, 3).map((state, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className={`w-2 h-2 ${state.color || 'bg-gray-500'} rounded-full mr-2 flex-shrink-0`}></div>
                    <Typography variant="small" className="text-gray-600 text-xs truncate">
                      {state.name && state.name.length > 10 ? state.name.substring(0, 10) + '..' : state.name}
                    </Typography>
                  </div>
                  <Typography variant="small" className="font-semibold text-gray-700 text-xs ml-1 flex-shrink-0">
                    {state.count || 0}
                  </Typography>
                </div>
              ))}
            </div>
            {stateData && stateData.length > 3 && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                <Typography variant="small" className="text-gray-500 text-xs truncate">
                  +{stateData.length - 3} others
                </Typography>
                <Typography variant="small" className="font-semibold text-gray-600 text-xs flex-shrink-0">
                  {stateData.slice(3).reduce((sum, state) => sum + (state.count || 0), 0)}
                </Typography>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
});

export default StateDistribution;