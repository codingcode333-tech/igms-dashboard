import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Typography,
  Chip,
  Button,
  IconButton,
  Input,
  Select,
  Option,
  Tooltip
} from "@material-tailwind/react";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  DocumentTextIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  ClockIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";
import { useTheme } from "@/context";

export function SearchGrievanceCards({ 
  grievances = [], 
  loading = false, 
  onViewDetails,
  searchQuery = "",
  onSearchChange,
  filters = {},
  onFilterChange 
}) {
  const { isDark } = useTheme();
  const [sortBy, setSortBy] = useState("date");
  const [showFilters, setShowFilters] = useState(false);

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'closed':
      case 'resolved':
        return 'green';
      case 'under process':
      case 'pending':
        return 'orange';
      case 'fresh':
      case 'new':
        return 'blue';
      case 'urgent':
      case 'high':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Priority indicator
  const getPriorityIcon = (priority) => {
    if (priority === 'high' || priority === 'urgent') {
      return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <Card key={index} className={`${isDark ? 'bg-gray-800' : 'bg-white'} animate-pulse`}>
          <CardBody className="p-4">
            <div className="space-y-3">
              <div className={`h-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-3/4`}></div>
              <div className={`h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/2`}></div>
              <div className={`h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-full`}></div>
              <div className={`h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-2/3`}></div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className={`flex flex-col sm:flex-row gap-4 p-4 rounded-lg ${
        isDark ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        {/* Search Input */}
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search grievances by registration number, subject, or ministry..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
            className={isDark ? 'text-white' : 'text-gray-900'}
          />
        </div>

        {/* Sort Dropdown */}
        <div className="w-full sm:w-48">
          <Select
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            label="Sort by"
          >
            <Option value="date">Date</Option>
            <Option value="status">Status</Option>
            <Option value="ministry">Ministry</Option>
            <Option value="priority">Priority</Option>
          </Select>
        </div>

        {/* Filter Toggle */}
        <IconButton
          variant={showFilters ? "filled" : "outlined"}
          onClick={() => setShowFilters(!showFilters)}
          className="h-10 w-10"
        >
          <FunnelIcon className="h-5 w-5" />
        </IconButton>
      </div>

      {/* Grievance Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {grievances.map((grievance, index) => (
          <Card
            key={grievance.id || index}
            className={`
              ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
              border transition-all duration-200 hover:shadow-lg hover:scale-[1.02]
              cursor-pointer group
            `}
            onClick={() => onViewDetails && onViewDetails(grievance)}
          >
            <CardBody className="p-4">
              {/* Header with Registration Number and Status */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <Typography
                    variant="h6"
                    color={isDark ? "white" : "blue-gray"}
                    className="text-sm font-bold truncate max-w-[180px]"
                  >
                    {grievance.registration_no || grievance.regn_no || 'N/A'}
                  </Typography>
                  {getPriorityIcon(grievance.priority)}
                </div>
                
                <Chip
                  value={grievance.status || 'Pending'}
                  color={getStatusColor(grievance.status)}
                  size="sm"
                  className="text-xs font-medium"
                />
              </div>

              {/* Subject */}
              <div className="mb-3">
                <Typography
                  variant="small"
                  color={isDark ? "gray" : "blue-gray"}
                  className="text-xs font-medium mb-1 opacity-80"
                >
                  Subject
                </Typography>
                <Typography
                  color={isDark ? "white" : "blue-gray"}
                  className="text-sm leading-5 line-clamp-2"
                >
                  {truncateText(grievance.subject || grievance.grievance_desc, 120)}
                </Typography>
              </div>

              {/* Details Grid */}
              <div className="space-y-2 mb-4">
                {/* Date */}
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <Typography variant="small" color="gray" className="text-xs">
                    {formatDate(grievance.recvd_date || grievance.received_date)}
                  </Typography>
                </div>

                {/* Ministry */}
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <Typography variant="small" color="gray" className="text-xs truncate">
                    {truncateText(grievance.ministry || grievance.dept_name, 30)}
                  </Typography>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  <Typography variant="small" color="gray" className="text-xs truncate">
                    {grievance.state}, {grievance.district}
                  </Typography>
                </div>

                {/* Complainant */}
                {grievance.name && (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-purple-500 rounded-full flex-shrink-0 flex items-center justify-center">
                      <Typography className="text-white text-[10px] font-bold">
                        {grievance.name.charAt(0).toUpperCase()}
                      </Typography>
                    </div>
                    <Typography variant="small" color="gray" className="text-xs truncate">
                      {truncateText(grievance.name, 25)}
                    </Typography>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <Button
                  size="sm"
                  variant="outlined"
                  className="flex-1 flex items-center justify-center gap-2 text-xs py-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails && onViewDetails(grievance);
                  }}
                >
                  <EyeIcon className="h-4 w-4" />
                  View Details
                </Button>
                
                {grievance.closing_date && (
                  <Tooltip content="Resolved">
                    <IconButton size="sm" color="green" variant="outlined">
                      <CheckBadgeIcon className="h-4 w-4" />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {grievances.length === 0 && !loading && (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <Typography variant="h6" color="gray" className="mb-2">
            No grievances found
          </Typography>
          <Typography variant="small" color="gray">
            Try adjusting your search criteria or filters
          </Typography>
        </div>
      )}
    </div>
  );
}

export default SearchGrievanceCards;