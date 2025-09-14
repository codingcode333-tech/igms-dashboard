import React from 'react';
import { Card, CardBody, Typography } from "@material-tailwind/react";

const HeatmapStats = ({ heatMapData, loading }) => {
  if (loading) {
    return (
      <Card className="h-full">
        <CardBody className="p-4 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <Typography variant="small" className="text-gray-600">
              Loading stats...
            </Typography>
          </div>
        </CardBody>
      </Card>
    );
  }

  const totalGrievances = heatMapData.reduce((sum, state) => sum + state.count, 0);
  const topState = heatMapData.sort((a, b) => b.count - a.count)[0];
  const totalStates = heatMapData.length;
  const totalCities = heatMapData.reduce((sum, state) => 
    sum + Object.keys(state.cities || {}).length, 0
  );

  return (
    <Card className="h-full">
      <CardBody className="p-4">
        <Typography variant="h6" className="text-gray-800 font-bold mb-4">
          Heatmap Overview
        </Typography>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Typography variant="small" className="text-gray-600">
              Total States
            </Typography>
            <Typography variant="small" className="font-bold text-blue-600">
              {totalStates}
            </Typography>
          </div>
          
          <div className="flex justify-between items-center">
            <Typography variant="small" className="text-gray-600">
              Total Cities
            </Typography>
            <Typography variant="small" className="font-bold text-green-600">
              {totalCities}
            </Typography>
          </div>
          
          <div className="flex justify-between items-center">
            <Typography variant="small" className="text-gray-600">
              Total Grievances
            </Typography>
            <Typography variant="small" className="font-bold text-purple-600">
              {totalGrievances.toLocaleString()}
            </Typography>
          </div>
          
          {topState && (
            <div className="pt-2 border-t border-gray-200">
              <Typography variant="small" className="text-gray-600 mb-1">
                Highest State
              </Typography>
              <Typography variant="small" className="font-bold text-red-600">
                {topState.state} ({topState.count.toLocaleString()})
              </Typography>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default HeatmapStats;