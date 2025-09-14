import {
  BanknotesIcon,
  UserPlusIcon,
  UserIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxXMarkIcon,
  DocumentDuplicateIcon,
  BookmarkIcon,
  ChatBubbleBottomCenterTextIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/solid";

import dashboardService from "@/services/dashboard"

export const statisticsCardsData = [
  {
    color: "blue",
    icon: DocumentDuplicateIcon,
    title: "TOTAL GRIEVANCES",
    value: "",
    getCount: (ministry, from, to) => dashboardService.getPrimaryCount(ministry, from, to),
    tooltip: "Total number of grievances registered in the system"
  },
  {
    color: "orange", 
    icon: ExclamationTriangleIcon,
    title: "PENDING",
    value: "",
    getCount: (ministry, from, to) => dashboardService.getFreshCount(ministry, from, to),
    tooltip: "Grievances currently awaiting resolution or action"
  },
  {
    color: "green",
    icon: ChatBubbleBottomCenterTextIcon,
    title: "RESOLVED",
    value: "",
    getCount: (ministry, from, to) => dashboardService.getRepeatCount(ministry, from, to),
    tooltip: "Successfully resolved and closed grievances"
  },
  {
    color: "purple",
    icon: ClockIcon,
    title: "AVG. RESOLUTION TIME",
    value: "",
    getCount: (ministry, from, to) => dashboardService.getSpamCount(ministry, from, to),
    tooltip: "Average number of days taken to resolve grievances",
    suffix: " days"
  },
];

export default statisticsCardsData;
