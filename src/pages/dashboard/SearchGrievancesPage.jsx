import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  Select,
  Option,
  Spinner
} from "@material-tailwind/react";
import { SearchGrievanceCards } from "@/widgets/grievance/SearchGrievanceCards";
import { useTheme } from "@/context";
import { FilterLayout } from "@/widgets/grievance/BasicFilters";
import { DateRangePicker, MinistryAutocomplete, StateDistrictAutocomplete } from "./CategoricalTree";
import { defaultFrom, defaultTo } from "@/helpers/env";
import { searchGrievances } from "@/services/searchService";
import { toast } from "react-toastify";

export function SearchGrievancesPage() {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    ministry: 'All',
    startDate: defaultFrom,
    endDate: defaultTo,
    state: 'All',
    district: 'All',
    status: 'All',
    priority: 'All'
  });

  // Search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim() && filters.ministry === 'All') {
      toast.warning("Please enter a search term or select a ministry");
      return;
    }

    setLoading(true);
    try {
      // Call your search API here
      const response = await searchGrievances({
        query: searchQuery,
        ...filters
      });
      
      if (response?.data) {
        setGrievances(Array.isArray(response.data) ? response.data : []);
      } else {
        setGrievances([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search grievances. Please try again.");
      setGrievances([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter grievances based on search query
  const filteredGrievances = useMemo(() => {
    if (!searchQuery.trim()) return grievances;
    
    return grievances.filter(grievance => 
      grievance.registration_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grievance.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grievance.ministry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grievance.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [grievances, searchQuery]);

  // Handle viewing grievance details
  const handleViewDetails = (grievance) => {
    // Open modal or navigate to details page
    console.log("View details for:", grievance);
    // You can implement modal opening logic here
  };

  // Handle enter key press in search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto px-4 mt-6 mb-8 flex flex-col gap-6">
      {/* Page Header */}
      <Card className={`${isDark ? 'bg-gray-800' : 'bg-white'} max-w-7xl mx-auto`}>
        <CardHeader
          variant="gradient"
          color="blue"
          className="mb-6 p-4 sm:p-6"
        >
          <Typography variant="h4" color="white" className="font-bold">
            Search Grievances
          </Typography>
          <Typography variant="small" color="white" className="opacity-80 mt-1">
            Search and filter grievances using various criteria
          </Typography>
        </CardHeader>

        <CardBody className="p-4 sm:p-6 pb-6">
          {/* Search Filters */}
          <div className="space-y-4">
            {/* Primary Search Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2 lg:col-span-3">
                <Input
                  type="text"
                  label="Search Grievances"
                  placeholder="Registration number, subject, ministry, or complainant name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={isDark ? 'text-white' : 'text-gray-900'}
                />
              </div>
              
              <div>
                <Select
                  label="Status"
                  value={filters.status}
                  onChange={(val) => setFilters({...filters, status: val})}
                >
                  <Option value="All">All Status</Option>
                  <Option value="Fresh">Fresh</Option>
                  <Option value="Under Process">Under Process</Option>
                  <Option value="Closed">Closed</Option>
                  <Option value="Pending">Pending</Option>
                </Select>
              </div>

              <div>
                <Button
                  onClick={handleSearch}
                  className="w-full h-10"
                  disabled={loading}
                >
                  {loading ? <Spinner className="h-4 w-4" /> : "Search"}
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="sm:col-span-2 lg:col-span-1">
                <MinistryAutocomplete
                  ministry={filters.ministry}
                  setMinistry={(val) => setFilters({...filters, ministry: val})}
                />
              </div>
             
              <div className="sm:col-span-2 lg:col-span-1">
                <StateDistrictAutocomplete
                  stateDistrict={`${filters.state} > ${filters.district}`}
                  setStateDistrict={(val) => {
                    const [state, district] = val.split(' > ');
                    setFilters({...filters, state: state || 'All', district: district || 'All'});
                  }}
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <DateRangePicker
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  setStartDate={(date) => setFilters({...filters, startDate: date})}
                  setEndDate={(date) => setFilters({...filters, endDate: date})}
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <Select
                  label="Priority"
                  value={filters.priority}
                  onChange={(val) => setFilters({...filters, priority: val})}
                >
                  <Option value="All">All Priorities</Option>
                  <Option value="High">High Priority</Option>
                  <Option value="Medium">Medium Priority</Option>
                  <Option value="Low">Low Priority</Option>
                </Select>
              </div>
            </div>

            {/* Results Summary */}
            {filteredGrievances.length > 0 && (
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <Typography variant="small" color={isDark ? "gray" : "blue-gray"}>
                  Found {filteredGrievances.length} grievance{filteredGrievances.length !== 1 ? 's' : ''}
                </Typography>
                
                <div className="flex gap-2">
                  <Button variant="outlined" size="sm">
                    Export Results
                  </Button>
                  <Button variant="outlined" size="sm">
                    Save Search
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Search Results */}
      <SearchGrievanceCards
        grievances={filteredGrievances}
        loading={loading}
        onViewDetails={handleViewDetails}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFilterChange={setFilters}
      />
    </div>
  );
}

export default SearchGrievancesPage;