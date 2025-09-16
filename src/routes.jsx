import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  ChartBarSquareIcon,
  NewspaperIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  StarIcon,
  RectangleGroupIcon,
  FlagIcon,
} from "@heroicons/react/24/solid";
import { EllipsisHorizontalCircleIcon, EnvelopeOpenIcon } from "@heroicons/react/24/outline";
import { Home, Profile, History, Notifications, Grievances, Category, RCA, Spatial, Saved, QueryGrievances, SearchGrievances, AICategories, Read } from "@/pages/dashboard";
import RepeatChildren from "./pages/dashboard/RepeatChildren";
import { PredictPriority } from "./pages/dashboard/PredictPriority";
import { getUser } from "./context/UserContext";
import { CategoricalTree } from "./pages/dashboard/CategoricalTree";
import { GraphicalAnalysis } from "./pages/dashboard/GraphicalAnalysis";
import { SpatialSearch } from "./pages/dashboard/SpatialSearch";
import CategorySearch from "./pages/dashboard/CategorySearch";
import { RedressalFlagging } from "./pages/dashboard/RedressalFlagging";
import SemanticRCA from "./pages/dashboard/semanticRCA";
import DynamicRCA from "./pages/dashboard/DynamicRCA";
import { ElectronIcon } from "./widgets/grievance/svg/electron";
import ReportHome from "./pages/dashboard/ReportHome";
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ReportingTool from "./pages/dashboard/ReportingTool";
import { RealTimeRCA } from "./pages/dashboard/RealTimeRCA";

const icon = {
  className: "w-5 h-5 text-inherit",
};

const SiteMapIcon = ({
  className
}) => {
  return <div className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{ fill: "#fff" }}>
      <path d="M20 13.01h-7V10h1c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v4c0 1.103.897 2 2 2h1v3.01H4V18H3v4h4v-4H6v-2.99h5V18h-1v4h4v-4h-1v-2.99h5V18h-1v4h4v-4h-1v-4.99zM10 8V4h4l.002 4H10z"></path>
    </svg>
  </div >
}

const user = getUser()

let extraRoutes = []

if (user?.username == 'dpg') {
  extraRoutes.push(
    {
      icon: <EllipsisHorizontalCircleIcon {...icon} />,
      name: "Predict Priority",
      path: "/predict-priority",
      element: <PredictPriority />,
    }
  )
}

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <NewspaperIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <BellIcon {...icon} />,
        name: "Notifications",
        path: "/notifications",
        element: <Notifications />,
        hidden: true,
      },
      {
        icon: <GlobeAltIcon {...icon} />,
        name: "Spatial Analysis",
        path: "/spatial-analysis",
        element: <SpatialSearch />,
      },

      // {
      //   icon: <ElectronIcon {...icon} />,
      //   name: "Dynamic RCA",
      //   path: "/dynamic-rca",
      //   element: <DynamicRCA />,
      // },

      {
        icon: <ElectronIcon {...icon} />,
        name: "RCA",
        path: "/rca",
        element: <RealTimeRCA />,
      },

      {
        icon: <RectangleGroupIcon {...icon} />,
        name: "Semantic RCA",
        path: "/semanticRCA",
        element: <SemanticRCA />,
      },

      ...extraRoutes

    ],
  },

  {
    layout: "grievances",
    pages: [
      {
        path: "/grievances/:id/:ministry/:from/:to",
        element: <Grievances />,
      },
      {
        path: "/search-grievances",
        element: <QueryGrievances />,
      },
      {
        path: "/fastapi-search",
        element: <SearchGrievances />,
      },
      {
        path: "/ai-categories",
        element: <AICategories />,
      },
      {
        path: "/grievances/repeat-children",
        element: <RepeatChildren />,
      },
      {
        path: "/spatial-search",
        element: <SpatialSearch />
      },
      {
        path: "/read",
        element: <Read />,
      },

      {
        path: "/search-history",
        element: <History />,
      },

      {
        path: "/saved-grievances",
        element: <Saved />,
      },

      {
        path: "/generatereport",
        element: <ReportingTool />,
      }
    ]
  }
];

export default routes;