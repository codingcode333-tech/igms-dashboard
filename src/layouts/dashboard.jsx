import { Routes, Route } from "react-router-dom";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
  Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator, setOpenSidenav, useTheme } from "@/context";
import { Grievances } from "@/pages/dashboard";
import { SignalIcon } from "@heroicons/react/24/outline";
import loader from "./loader.svg"
import { ToastContainer } from "react-toastify";
import { Loader } from "@/pages/dashboard/CategoricalTree";
import { useEffect, useRef } from "react";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { isDark } = useTheme();
  const { sidenavType, openSidenav, loading } = controller;
  const mainContentRef = useRef(null);

  // Handle click outside sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only handle on mobile/tablet (below xl breakpoint)
      if (window.innerWidth < 1280 && openSidenav) {
        const sidebar = document.querySelector('aside');
        if (sidebar && !sidebar.contains(event.target)) {
          setOpenSidenav(dispatch, false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openSidenav, dispatch]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark:bg-dark-bg bg-gray-900' : 'bg-blue-gray-50/50'}`}>
      <Sidenav
        routes={routes}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />
      
      {/* Main Content Area with Enhanced Spacing */}
      <div 
        ref={mainContentRef}
        className={`transition-all duration-300 ${
          openSidenav 
            ? "ml-80" // 320px = sidebar(288px) + gap(32px)
            : "ml-0"  // No margin when sidebar is closed
        }`}
      >
        {/* Content Wrapper with Padding */}
        <div className="p-4">
          <DashboardNavbar />

        <Configurator />

        {/* <IconButton
          size="lg"
          color="white"
          className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10 border-2 bg-blue-600 select-none"
          ripple={false}
          onClick={() => setOpenConfigurator(dispatch, true)}
        >
          <MagnifyingGlassIcon className="h-5 w-5 text-white" title="Search in Grievances" />
        </IconButton> */}

        {
          loading &&
          <div className="fixed h-[100vh] w-[100vw] flex justify-center items-center z-[2000] bg-blur top-0 left-0 select-none">
            <Loader className="animate-spin" height="40px" />
          </div>
        }

        <Routes >
          {routes.map(
            ({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map(({ path, element }) => (
                <Route exact path={path} element={element} />
              ))
          )}
        </Routes>

        <Routes>
          {routes.map(
            ({ layout, pages }) =>
              layout === "grievances" &&
              pages.map(({ path, element }) => (
                <Route exact path={path} element={element} />
              ))
          )}
        </Routes>

        <ToastContainer />
        </div>
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
