import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";

import {
  Avatar,
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav, useTheme } from "@/context";
import { useFilter } from "@/context/FilterContext";


export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { isDark } = useTheme();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const { setToDefault } = useFilter();
  
  // Fixed sidebar - always expanded, no toggle functionality
  
  const sidenavTypes = {
    dark: "bg-gradient-to-br from-blue-gray-800 to-blue-gray-900",
    white: isDark ? "bg-gray-800 shadow-lg border-gray-700" : "bg-white shadow-lg",
    transparent: "bg-transparent",
  };

  return (
    <>
      <aside
        className={`
          ${sidenavTypes[sidenavType]}
          w-72
          fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] rounded-xl 
          transition-all duration-300 ease-in-out z-[1100]
          overflow-hidden
          shadow-xl
          xl:translate-x-0
          ${openSidenav ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
        `}
        onMouseLeave={() => {
          // Reset any temporary hover states when mouse leaves
        }}
      >
      <div
        className={`relative border-b ${sidenavType === "dark" ? "border-white/20" : "border-blue-gray-50"
          }`}
      >
        <div className={`flex items-center gap-3 relative rounded-t-md px-3 py-4 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } transition-colors duration-300`}>
          
          {/* Official Emblem of India - Always visible */}
          <div className="flex-shrink-0 relative w-14 h-14 transition-all duration-300">
            <div className={`
              w-full h-full rounded-full flex items-center justify-center
              ${isDark ? 'bg-white' : 'bg-white'}
              shadow-md border-2 ${isDark ? 'border-gray-300' : 'border-orange-200'}
              transition-all duration-300
            `}>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                alt="Emblem of India"
                className={`
                  ${!sidebarExpanded ? 'w-6 h-6' : 'w-9 h-9'} 
                  transition-all duration-300 ${!sidebarExpanded ? 'group-hover:w-9 group-hover:h-9' : ''}
                  object-contain
                `}
                style={{
                  filter: 'none',
                  mixBlendMode: 'normal'
                }}
                onError={(e) => {
                  console.log('Image failed to load, trying fallback');
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGRjk1MDAiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMiAyTDEzLjA5IDguMjZMMjAgOUwxNCA5TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMjJMMTAuOTEgMTUuNzRMNCAyMkgxMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yIDEyTDguMjYgMTAuOTFMOSA0TDkgMTBMMiAxMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yMiAxMkwxNS43NCAxMy4wOUwyMiAyMFYxMloiIGZpbGw9IndoaXRlIi8+CjwvYXZnPgo8L3N2Zz4K';
                }}
              />
            </div>
          </div>
          
          {/* Title Section - Always visible */}
          <div className="flex-1 min-w-0 transition-all duration-300 overflow-hidden opacity-100 w-auto ml-3">
            <div className="space-y-0">
              <div 
                className={`font-bold text-sm leading-tight transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}
              >
                Integrated Grievance
              </div>
              <div 
                className={`font-medium text-xs transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Management System
              </div>
            </div>
          </div>

          {/* Mobile close button */}
          <div className={`
            absolute -right-8 top-1/2 transform -translate-y-1/2 xl:hidden
            ${!openSidenav && "hidden"}
            ${isDark ? 'bg-gray-800' : 'bg-white'} 
            p-2 rounded-r-lg shadow-lg transition-all duration-300
            border-l-0 border-2 ${isDark ? 'border-gray-600' : 'border-gray-200'}
          `}>
            <XMarkIcon 
              className={`h-5 w-5 cursor-pointer transition-all duration-200 ${
                isDark ? 'text-white hover:text-red-400' : 'text-gray-600 hover:text-red-500'
              } hover:scale-110 active:scale-95`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpenSidenav(dispatch, false);
              }}
              title="Close Navigation Panel"
            />
          </div>
        </div>
      </div>
      <div className="m-4 overflow-hidden">
        <ul className="mb-4 flex flex-col gap-1">
          {routes[0].title && (
            <li className="mx-3.5 mt-4 mb-2 transition-all duration-300 opacity-100">
              <Typography
                variant="small"
                color={sidenavType === "dark" ? "white" : "blue-gray"}
                className="font-black uppercase opacity-75"
              >
                {routes[0].title}
              </Typography>
            </li>
          )}
          {
            routes[0].pages.map(({ icon, name, path }, key) => (
              <li key={key}>
                <NavLink to={`/${routes[0].layout}${path}`} onClick={setToDefault}>
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "gradient" : "text"}
                      color={
                        isActive
                          ? sidenavColor
                          : sidenavType === "dark"
                            ? "white"
                            : "blue-gray"
                      }
                      className="px-3 capitalize justify-start"
                      fullWidth
                    >
                      <div className="flex items-center transition-all duration-300 gap-4" title={name}>
                        <div className="flex-shrink-0">
                          {icon}
                        </div>
                        <div className="font-medium capitalize transition-all duration-300 whitespace-nowrap opacity-100 w-auto">
                          {name}
                        </div>
                      </div>
                    </Button>
                  )}
                </NavLink>
              </li>
            ))}
        </ul>
      </div>
    </aside>
    </>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo-ct.png",
  brandName: "Material Tailwind React",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;
