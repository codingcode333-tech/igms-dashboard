import React from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import PropTypes from "prop-types";

export function SimpleStatsCard({ 
  color, 
  icon: Icon, 
  title, 
  value, 
  tooltip,
  suffix = "",
  loading = false 
}) {
  const colorClasses = {
    blue: {
      iconBg: "bg-blue-500",
      textColor: "text-blue-600"
    },
    green: {
      iconBg: "bg-green-500",
      textColor: "text-green-600"
    },
    orange: {
      iconBg: "bg-orange-500",
      textColor: "text-orange-600"
    },
    purple: {
      iconBg: "bg-purple-500",
      textColor: "text-purple-600"
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardBody className="p-4">
        <div className="flex items-center justify-between">
          {/* Simple Icon */}
          <div className={`
            flex items-center justify-center
            w-10 h-10 rounded-lg
            ${colors.iconBg}
          `}>
            <Icon className="w-5 h-5 text-white" />
          </div>

          {/* Value */}
          <div className="text-right">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-6 w-12 bg-gray-200 rounded mb-1" />
              </div>
            ) : (
              <Typography variant="h4" className={`font-bold ${colors.textColor}`}>
                {value?.toLocaleString() || "0"}{suffix}
              </Typography>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="mt-3">
          <Typography 
            variant="small" 
            className="font-medium text-gray-600 uppercase text-xs"
          >
            {title}
          </Typography>
        </div>
      </CardBody>
    </Card>
  );
}

SimpleStatsCard.defaultProps = {
  color: "blue",
  loading: false,
};

SimpleStatsCard.propTypes = {
  color: PropTypes.oneOf(["blue", "green", "orange", "purple"]),
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tooltip: PropTypes.string,
  suffix: PropTypes.string,
  loading: PropTypes.bool,
};

SimpleStatsCard.displayName = "SimpleStatsCard";

export default SimpleStatsCard;