import { useLocation, Link } from "react-router-dom";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Breadcrumbs,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Chip,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  ArrowPathRoundedSquareIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  ArrowLeftOnRectangleIcon,
  SunIcon,
  MoonIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setOpenSidenav,
  useTheme,
} from "@/context";
import { UserContext, logout, getUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { getHighAlerts } from "@/services/notifications";
import NotificationBadge from "@/widgets/component/NotificationBadge";
import { formatDate, dateBefore } from "@/helpers/date";


export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const { fixedNavbar, openSidenav } = controller;
  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");
  
  const [highAlerts, setHighAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [totalAlertsCount, setTotalAlertsCount] = useState(0);
  
  // Fixed date range for notifications (January 1st to present)
  const startDateDisplay = '2025-01-01';
  const endDateDisplay = formatDate();
  
  // const [userData, setUser] = useContext(UserContext);
  // const user = JSON.parse(userData)
  const user = getUser()

  // Fetch high priority alerts
  useEffect(() => {
    fetchHighAlerts();
    // Refresh alerts every 5 minutes
    const interval = setInterval(fetchHighAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchHighAlerts = async () => {
    setAlertsLoading(true);
    try {
      console.log('🔍 Fetching high priority alerts...');
      const response = await getHighAlerts();
      console.log('📊 Notification API Response:', response);
      
      if (response?.success && response?.data && Array.isArray(response.data)) {
        // Use real data if API succeeds
        setHighAlerts(response.data);
        setTotalAlertsCount(response.count || response.data.length);
        console.log(`✅ Loaded ${response.data.length} high priority alerts`);
      } else {
        // API returned but no data or unsuccessful
        console.log('⚠️ API returned no data or unsuccessful response');
        setHighAlerts([]);
        setTotalAlertsCount(0);
      }
    } catch (error) {
      console.error("❌ Error fetching high alerts:", error);
      setHighAlerts([]);
      setTotalAlertsCount(0);
    } finally {
      setAlertsLoading(false);
    }
  };

  return (
    <Navbar
      color={fixedNavbar ? (isDark ? "gray" : "white") : "transparent"}
      className={`rounded-xl transition-all duration-300 ${
        isDark 
          ? 'dark:bg-dark-surface bg-gray-800 dark:text-dark-text text-white' 
          : ''
      } ${fixedNavbar
        ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
        : "pl-2 pr-0 py-1"
        }`}
      fullWidth
      blurred={fixedNavbar}

    >
      <div className="flex justify-between gap-6 flex-row md:items-center">
        <div className="flex gap-3 items-center">
          <IconButton
            variant="text"
            size="sm"
            className={`transition-all duration-200 hover:bg-opacity-20 ${
              isDark ? 'text-white hover:bg-white' : 'text-gray-700 hover:bg-gray-700'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpenSidenav(dispatch, !openSidenav);
            }}
            title={!openSidenav ? 'Show Navigation Panel' : 'Hide Navigation Panel'}
          >
            <Bars3Icon className="h-6 w-6" />
          </IconButton>

          <div className="capitalize">
            <Typography 
              variant="h6" 
              color={isDark ? "white" : "blue-gray"}
              className="transition-colors"
            >
              {page.replace(/-/g, ' ')}
            </Typography>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Enhanced Theme Toggle */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <SunIcon className={`h-4 w-4 transition-colors ${
              !isDark ? 'text-yellow-600' : 'text-gray-400'
            }`} />
            <div
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-12 cursor-pointer rounded-full transition-colors duration-300 focus:outline-none ${
                isDark ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  isDark ? 'translate-x-7' : 'translate-x-1'
                }`}
                style={{ marginTop: '4px' }}
              />
            </div>
            <MoonIcon className={`h-4 w-4 transition-colors ${
              isDark ? 'text-blue-400' : 'text-gray-400'
            }`} />
          </div>

          {/* Notifications Bell */}
          <Menu>
            <MenuHandler>
              <div className="relative">
                <IconButton
                  variant="text"
                  color="blue-gray"
                  title="High Priority Alerts"
                  className={`${isDark ? 'text-white' : 'text-gray-700'}`}
                >
                  <BellIcon className="h-5 w-5" />
                </IconButton>
                {totalAlertsCount > 0 && (
                  <NotificationBadge
                    count={totalAlertsCount > 99 ? 99 : totalAlertsCount}
                    className="z-50"
                  />
                )}
              </div>
            </MenuHandler>
            <MenuList className={`w-80 max-h-96 overflow-y-auto ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white'}`}>
              <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                <Typography variant="h6" color={isDark ? "white" : "blue-gray"} className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  High Priority Alerts
                </Typography>
                <Typography variant="small" color="gray" className="mt-1">
                  Showing alerts from January 1, 2025 to {endDateDisplay} ({totalAlertsCount} total)
                </Typography>
              </div>
              
              {alertsLoading ? (
                <div className="p-4 text-center">
                  <Typography color={isDark ? "white" : "blue-gray"}>Loading alerts...</Typography>
                </div>
              ) : highAlerts.length > 0 ? (
                highAlerts.map((alert, idx) => (
                  <MenuItem key={alert.registration_no || idx} className={`p-3 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <div className="flex flex-col space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-blue-gray-800 dark:text-white text-sm">
                          {alert.state || alert.district || 'Unknown Location'}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {new Date(alert.recvd_date).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-700 dark:text-gray-200">
                        {alert.subject?.length > 60 ? `${alert.subject.substring(0, 60)}...` : alert.subject}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                        <span>{alert.ministry || 'Unknown Ministry'}</span>
                        <span className="font-medium text-red-600">{alert.priority || 'High'}</span>
                      </div>
                    </div>
                  </MenuItem>
                ))
              ) : (
                <div className="p-4 text-center py-8">
                  <ExclamationTriangleIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <Typography color={isDark ? "white" : "blue-gray"} className="mb-1">
                    No high priority alerts
                  </Typography>
                  <Typography variant="small" color="gray">
                    All systems operational
                  </Typography>
                </div>
              )}
            </MenuList>
          </Menu>

          {/* Search Icon */}
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={() => setOpenConfigurator(dispatch, true)}
            title="Search in Grievances"
            className={`${isDark ? 'text-white' : 'text-gray-700'}`}
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </IconButton>

          {/* Enhanced Profile Menu */}
          <Menu>
            <MenuHandler>
              <div className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Avatar
                  variant="circular"
                  size="sm"
                  alt={user?.username || "User"}
                  className="border border-gray-300 dark:border-gray-600"
                  src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=1480&amp;q=80"
                />
                <div className="hidden md:block text-left">
                  <Typography variant="small" color={isDark ? "white" : "blue-gray"} className="font-medium">
                    {user?.username || "User"}
                  </Typography>
                  <Typography variant="small" color="gray" className="text-xs">
                    {user?.role || "Admin"}
                  </Typography>
                </div>
              </div>
            </MenuHandler>
            <MenuList className={`w-64 ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white'}`}>
              {/* User Info Header */}
              <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <Avatar
                    variant="circular"
                    size="md"
                    alt={user?.username || "User"}
                    src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=1480&amp;q=80"
                  />
                  <div>
                    <Typography variant="h6" color={isDark ? "white" : "blue-gray"}>
                      {user?.username || "User"}
                    </Typography>
                    <Typography variant="small" color="gray">
                      {user?.email || "user@example.com"}
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <MenuItem className={`flex items-center gap-3 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                <Link to="/dashboard/read" className="flex items-center gap-3 w-full">
                  <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
                  <Typography variant="small" color={isDark ? "white" : "blue-gray"} className="font-medium">
                    Read Grievances
                  </Typography>
                </Link>
              </MenuItem>

              <MenuItem className={`flex items-center gap-3 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                <Link to="/dashboard/saved-grievances" className="flex items-center gap-3 w-full">
                  <BellIcon className="h-5 w-5 text-blue-gray-500" />
                  <Typography variant="small" color={isDark ? "white" : "blue-gray"} className="font-medium">
                    Saved Grievances
                  </Typography>
                </Link>
              </MenuItem>

              <MenuItem className={`flex items-center gap-3 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                <Link to="/dashboard/search-history" className="flex items-center gap-3 w-full">
                  <MagnifyingGlassIcon className="h-5 w-5 text-blue-gray-500" />
                  <Typography variant="small" color={isDark ? "white" : "blue-gray"} className="font-medium">
                    Search History
                  </Typography>
                </Link>
              </MenuItem>

              <MenuItem className={`flex items-center gap-3 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                <Link to="/change-password" className="flex items-center gap-3 w-full">
                  <Cog6ToothIcon className="h-5 w-5 text-blue-gray-500" />
                  <Typography variant="small" color={isDark ? "white" : "blue-gray"} className="font-medium">
                    Change Password
                  </Typography>
                </Link>
              </MenuItem>

              {/* Divider */}
              <hr className="my-2 border-gray-200 dark:border-gray-600" />

              {/* Logout */}
              <MenuItem 
                className={`flex items-center gap-3 ${isDark ? 'hover:bg-red-900' : 'hover:bg-red-50'} text-red-600`}
                onClick={logout}
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 text-red-600" />
                <Typography variant="small" color="red" className="font-medium">
                  Logout
                </Typography>
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;