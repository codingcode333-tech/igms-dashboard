import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { HeatMap2 } from "@/widgets/maps/heatmap/HeatMap2";

const EnhancedHeatmap = ({ 
  grievances = [], 
  className = '', 
  getDistricts = null,
  loading = false 
}) => {
  const [selectedState, setSelectedState] = useState(null);
  const [cityData, setCityData] = useState([]);

  console.log('🗺️ EnhancedHeatmap received:', { 
    grievancesCount: grievances.length, 
    loading, 
    grievances: grievances.slice(0, 2) 
  });

  // Create a custom getDistricts function that also handles city data
  const handleStateClick = async (stateId) => {
    console.log('🗺️ State clicked with ID:', stateId);
    
    // Find the state data by matching the state ID or name
    const stateInfo = grievances.find(g => {
      const stateName = g.state?.toLowerCase();
      // Try to match by various possible formats
      return stateName === stateId?.toLowerCase() || 
             stateName?.includes(stateId?.toLowerCase()) ||
             stateId?.toLowerCase()?.includes(stateName);
    });
    
    if (stateInfo && stateInfo.cities) {
      setSelectedState(stateInfo.state);
      
      // Convert cities object to array format
      const cities = Object.entries(stateInfo.cities).map(([city, count]) => ({
        name: city,
        count: count,
        state: stateInfo.state
      }));
      
      setCityData(cities);
      console.log('🏙️ Cities data for', stateInfo.state, ':', cities);
    }

    // Call original getDistricts if provided
    if (getDistricts) {
      try {
        const districts = await getDistricts(stateId);
        return districts;
      } catch (error) {
        console.log('No districts data available for', stateId);
        return [];
      }
    }
    
    return [];
  };

  const closeCityView = () => {
    setSelectedState(null);
    setCityData([]);
  };

  return (
    <div className="relative h-full">
      {/* Main Heatmap */}
      <div className={`h-full transition-all duration-300 ${selectedState ? 'opacity-75' : 'opacity-100'}`}>
        <HeatMap2
          grievances={grievances}
          className={`h-full ${className}`}
          getDistricts={handleStateClick}
          noFocus={false}
        />
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <Typography variant="small" className="text-gray-600">
              Loading heatmap data...
            </Typography>
          </div>
        </div>
      )}

      {/* City Details Popup */}
      {selectedState && cityData.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="bg-black bg-opacity-50 absolute inset-0" onClick={closeCityView}></div>
          <Card className="relative max-w-lg w-full mx-4 max-h-[500px] overflow-hidden shadow-2xl">
            <CardBody className="p-6">
              <div className="flex justify-between items-center mb-4">
                <Typography variant="h5" className="text-gray-800 font-bold">
                  {selectedState} - City Distribution
                </Typography>
                <button 
                  onClick={closeCityView}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {cityData
                  .sort((a, b) => b.count - a.count)
                  .map((city, index) => {
                    const total = cityData.reduce((sum, c) => sum + c.count, 0);
                    const percentage = ((city.count / total) * 100).toFixed(1);
                    
                    return (
                      <div key={index} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center flex-1">
                          <div className={`w-4 h-4 rounded-full mr-3 ${
                            index === 0 ? 'bg-blue-600' : 
                            index === 1 ? 'bg-blue-500' : 
                            index === 2 ? 'bg-blue-400' : 
                            index === 3 ? 'bg-blue-300' : 'bg-blue-200'
                          }`}></div>
                          <div className="flex-1">
                            <Typography variant="small" className="font-semibold text-gray-800">
                              {city.name}
                            </Typography>
                            <Typography variant="small" className="text-gray-500">
                              {percentage}% of total
                            </Typography>
                          </div>
                        </div>
                        <div className="text-right">
                          <Typography variant="small" className="font-bold text-gray-900 text-lg">
                            {city.count.toLocaleString()}
                          </Typography>
                          <Typography variant="small" className="text-gray-500">
                            grievances
                          </Typography>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <Typography variant="small" className="text-blue-800">
                  � <strong>State Summary:</strong> {cityData.reduce((sum, city) => sum + city.count, 0).toLocaleString()} total grievances across {cityData.length} cities in {selectedState}
                </Typography>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedHeatmap;