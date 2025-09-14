import React from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import PropTypes from "prop-types";

export function PremiumStatsCard({ 
  color, 
  icon: Icon, 
  title, 
  value, 
  tooltip,
  loading = false 
}) {
  const colorClasses = {
    blue: {
      gradient: "from-blue-500/20 via-blue-400/10 to-blue-600/20",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-700",
      iconGlow: "shadow-blue-500/30",
      border: "border-blue-200/30",
      textAccent: "text-blue-600"
    },
    green: {
      gradient: "from-green-500/20 via-green-400/10 to-green-600/20", 
      iconBg: "bg-gradient-to-br from-green-500 to-green-700",
      iconGlow: "shadow-green-500/30",
      border: "border-green-200/30",
      textAccent: "text-green-600"
    },
    orange: {
      gradient: "from-orange-500/20 via-orange-400/10 to-orange-600/20",
      iconBg: "bg-gradient-to-br from-orange-500 to-orange-700", 
      iconGlow: "shadow-orange-500/30",
      border: "border-orange-200/30",
      textAccent: "text-orange-600"
    },
    purple: {
      gradient: "from-purple-500/20 via-purple-400/10 to-purple-600/20",
      iconBg: "bg-gradient-to-br from-purple-500 to-purple-700",
      iconGlow: "shadow-purple-500/30", 
      border: "border-purple-200/30",
      textAccent: "text-purple-600"
    },
    red: {
      gradient: "from-red-500/20 via-red-400/10 to-red-600/20",
      iconBg: "bg-gradient-to-br from-red-500 to-red-700",
      iconGlow: "shadow-red-500/30",
      border: "border-red-200/30", 
      textAccent: "text-red-600"
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className="group relative floating-animation" style={{ animationDelay: `${Math.random() * 2}s` }}>
      {/* Premium Card Container */}
      <div className={`
        premium-card-hover glass-effect
        relative overflow-hidden rounded-2xl 
        bg-gradient-to-br ${colors.gradient}
        border-2 ${colors.border}
        shadow-xl shadow-black/10
        hover:shadow-2xl hover:shadow-black/15
        transition-all duration-500 ease-out
        hover:-translate-y-1 hover:scale-[1.02]
        cursor-pointer
        clay-shadow
        smooth-transition
      `}>
        {/* Enhanced glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/30 to-white/10" />
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent transform rotate-12 scale-150 group-hover:rotate-45 transition-transform duration-1000" />
        </div>

        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        <CardBody className="relative p-6">
          <div className="flex items-start justify-between">
            {/* Enhanced Icon Container */}
            <div className={`
              relative flex items-center justify-center
              w-14 h-14 rounded-2xl
              ${colors.iconBg}
              shadow-xl ${colors.iconGlow}
              group-hover:scale-110 group-hover:rotate-12 group-hover:shadow-2xl
              transition-all duration-500 ease-out
              clay-inset
            `}>
              {/* Multiple glow layers */}
              <div className="absolute inset-0 rounded-2xl bg-white/30 blur-sm" />
              <div className="absolute inset-0 rounded-2xl bg-white/10 blur-lg" />
              
              <Icon className="relative w-7 h-7 text-white drop-shadow-2xl filter" />
              
              {/* Enhanced sparkle effects */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pulse-glow-animation" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200" />
            </div>

            {/* Enhanced Value Display */}
            <div className="text-right">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 w-16 premium-skeleton rounded-lg mb-2" />
                  <div className="h-3 w-12 premium-skeleton rounded" />
                </div>
              ) : (
                <>
                  <Typography 
                    variant="h2" 
                    className={`
                      font-black ${colors.textAccent}
                      group-hover:scale-105 transition-transform duration-300
                      drop-shadow-lg text-3xl
                      bg-gradient-to-r ${colors.iconBg} bg-clip-text text-transparent
                    `}
                  >
                    {value?.toLocaleString() || "0"}
                  </Typography>
                  
                  {/* Enhanced pulse animation */}
                  <div className={`
                    w-full h-1 bg-gradient-to-r ${colors.iconBg} rounded-full mt-1
                    opacity-0 group-hover:opacity-70
                    transition-opacity duration-500
                    shadow-sm
                  `}>
                    <div className="h-full bg-white/30 rounded-full animate-pulse" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Enhanced Title Section */}
          <div className="mt-5">
            <Typography 
              variant="h6" 
              className="
                font-bold text-gray-700 uppercase tracking-wider text-xs
                group-hover:text-gray-800 transition-colors duration-300
                leading-tight
                drop-shadow-sm
              "
            >
              {title}
            </Typography>
            
            {/* Enhanced tooltip */}
            {tooltip && (
              <Typography 
                variant="small" 
                className="
                  text-gray-500 mt-2 text-xs leading-relaxed
                  opacity-0 group-hover:opacity-100
                  transform translate-y-2 group-hover:translate-y-0
                  transition-all duration-500 delay-200
                  bg-white/30 p-1 rounded backdrop-blur-sm
                "
              >
                {tooltip}
              </Typography>
            )}
          </div>

          {/* Enhanced accent line */}
          <div className={`
            absolute bottom-0 left-0 right-0 h-2
            bg-gradient-to-r ${colors.iconBg}
            transform scale-x-0 group-hover:scale-x-100
            transition-transform duration-700 ease-out
            origin-left
            shadow-lg
          `} />

          {/* Corner decoration */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-30 transition-opacity duration-500">
            <div className={`w-3 h-3 rounded-full ${colors.iconBg}`} />
          </div>
        </CardBody>
      </div>

      {/* Enhanced outer glow */}
      <div className={`
        absolute inset-0 rounded-3xl
        bg-gradient-to-br ${colors.gradient}
        opacity-0 group-hover:opacity-50
        blur-2xl -z-10
        transition-opacity duration-700
        scale-110
        pulse-glow-animation
      `} />
      
      {/* Additional shadow layer */}
      <div className={`
        absolute inset-0 rounded-3xl
        bg-gradient-to-br from-black/5 to-black/20
        opacity-0 group-hover:opacity-100
        blur-3xl -z-20
        transition-opacity duration-700
        scale-125
      `} />
    </div>
  );
}

PremiumStatsCard.defaultProps = {
  color: "blue",
  loading: false,
};

PremiumStatsCard.propTypes = {
  color: PropTypes.oneOf(["blue", "green", "orange", "purple", "red"]),
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tooltip: PropTypes.string,
  loading: PropTypes.bool,
};

PremiumStatsCard.displayName = "PremiumStatsCard";

export default PremiumStatsCard;