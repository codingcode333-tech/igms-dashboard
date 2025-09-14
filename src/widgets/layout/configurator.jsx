import React, { useState, useEffect, useRef, useCallback } from "react";
import { XMarkIcon, MagnifyingGlassIcon, CalendarIcon, BuildingOfficeIcon, MapPinIcon, AdjustmentsHorizontalIcon, GlobeAltIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import {
  Button,
  IconButton,
  Switch,
  Typography,
  Chip,
  Input,
  Select,
  Option,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Card,
  CardBody
} from "@material-tailwind/react";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setSidenavColor,
  setSidenavType,
  setFixedNavbar,
  useTheme,
} from "@/context";

import { departmentData, getDepartmentList, stateData } from "@/data";

import { useNavigate } from "react-router-dom";

import { useFilter } from "@/context/FilterContext";
import GrievancesRoutes from "@/services/grievances";
import { redirect } from "react-router-dom";
import stateObj from "@/data/state-data"
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { DEFAULT_STATE_DISTRICT, DateRangePicker, MinistryAutocomplete, MultipleMinistryAutocomplete, StateDistrictAutocomplete } from "@/pages/dashboard/CategoricalTree";
import { toast } from "react-toastify";

function formatNumber(number, decPlaces) {
  decPlaces = Math.pow(10, decPlaces);

  const abbrev = ["K", "M", "B", "T"];

  for (let i = abbrev.length - 1; i >= 0; i--) {
    var size = Math.pow(10, (i + 1) * 3);

    if (size <= number) {
      number = Math.round((number * decPlaces) / size) / decPlaces;

      if (number == 1000 && i < abbrev.length - 1) {
        number = 1;
        i++;
      }

      number += abbrev[i];

      break;
    }
  }

  return number;
}

export const onlySemanticQueryType = {
  '1': {
    name: "Semantic",
    placeholder: "Enter Natural Language Query..."
  }
}

export const basicQueryTypes = {
  '1': {
    name: "Semantic",
    placeholder: "Enter Natural Language Query..."
  },
  '2': {
    name: "Keyword",
    placeholder: "Enter Keyword To Search..."
  },
}

export const queryTypes = {
  ...basicQueryTypes,
  '3': {
    name: "Registration No",
    placeholder: "Search By Registration No....."
  },
  '4': {
    name: "Name",
    placeholder: "Search By Name....."
  },
  '5': {
    name: "Find Children",
    placeholder: "Enter Registration No...."
  }
}

export function Configurator() {
  const { filters, setFilters, searching, startSearch } = useFilter();
  const navigate = useNavigate();
  const [controller, dispatch] = useMaterialTailwindController();
  const { openConfigurator } = controller;
  const { isDark } = useTheme();

  const [dateRange, setDateRange] = useState(getDefaultDateRange(filters))
  const [stateDistrict, setStateDistrict] = useState(getDefaultStateDistrict(filters))
  const [selectedMinistry, setSelectedMinistry] = useState(getDefaultMinistry(filters))
  const [isExpanded, setIsExpanded] = useState(false)

  const updateDateRange = range => {
    setFilters({
      ...filters,
      startDate: range.startDate,
      endDate: range.endDate
    })

    setDateRange(range)
  }

  const updateStateDistrict = newStateDistrict => {
    setFilters({
      ...filters,
      state: newStateDistrict?.values.state,
      district: newStateDistrict?.values.district
    })

    setStateDistrict(newStateDistrict)
  }

  const updateSelectedMinistry = selection => {
    setFilters({
      ...filters,
      ministry: selection?.value
    })

    setSelectedMinistry(selection)
  }

  const searchGrievances = () => {
    if (initiateSearch())
      navigate('/dashboard/search-grievances')
  }

  const spatiallySearchGrievances = () => {
    if (initiateSearch())
      navigate('/dashboard/spatial-analysis')
  }

  const initiateSearch = async () => {
    if (filters.query?.length == 0) {
      toast("Enter the query to search", { type: 'error' })
      return
    }
    if (filters.type == null) {
      toast("Select the type to search", { type: 'error' })
      return
    }

    startSearch()

    setOpenConfigurator(dispatch, false)
  }

  const handlequeryChange = (value) => {
    setFilters({ ...filters, query: value });
  };

  const handletypeChange = (value) => {
    setFilters({ ...filters, type: value });
  };

  const setThreshold = value => {
    setFilters({ ...filters, threshold: value });
  }

  const setShowClosed = value => {
    setFilters({ ...filters, all_record: (value ? 1 : 0) });
  }

  useEffect(() => {
    setDateRange(getDefaultDateRange(filters))
    setSelectedMinistry(getDefaultMinistry(filters))
    setStateDistrict(getDefaultStateDistrict(filters))
  }, [filters])

  return (
    <aside
      className={`
        fixed top-0 right-0 z-50 h-screen w-[22rem] sm:w-[28rem] 
        ${isDark ? 'bg-gray-900 border-l border-gray-700' : 'bg-white border-l border-gray-200'} 
        shadow-2xl transition-transform duration-300 z-[1100] 
        ${openConfigurator ? "translate-x-0" : "translate-x-[22rem] sm:translate-x-[28rem]"} 
        overflow-hidden flex flex-col
      `}
    >
      {/* Header */}
      <div className={`
        flex items-center justify-between px-6 py-4 
        ${isDark ? 'bg-gray-800 border-b border-gray-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200'}
      `}>
        <div className="flex items-center gap-3">
          <div className={`
            p-2 rounded-lg ${isDark ? 'bg-blue-600' : 'bg-blue-500'} 
            shadow-lg transform rotate-12
          `}>
            <MagnifyingGlassIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <Typography variant="h5" color={isDark ? "white" : "blue-gray"} className="font-bold">
              Advanced Search
            </Typography>
            <Typography variant="small" color="gray" className="text-xs mt-0.5">
              Search & filter grievances intelligently
            </Typography>
          </div>
        </div>
        <IconButton
          variant="text"
          color={isDark ? "white" : "blue-gray"}
          onClick={() => setOpenConfigurator(dispatch, false)}
          className="hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5" />
        </IconButton>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        
        {/* Search Input Section */}
        <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border`}>
          <CardBody className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <MagnifyingGlassIcon className="h-3 w-3 text-blue-500" />
              <Typography variant="h6" color={isDark ? "white" : "blue-gray"} className="text-xs font-medium">
                Search Query
              </Typography>
            </div>
            <SearchInput
              types={queryTypes}
              type={filters.type}
              setType={handletypeChange}
              query={filters.query}
              setQuery={handlequeryChange}
            />
          </CardBody>
        </Card>

        {/* Date Range */}
        <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border`}>
          <CardBody className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon className="h-3 w-3 text-green-500" />
              <Typography variant="h6" color={isDark ? "white" : "blue-gray"} className="text-xs font-medium">
                Date Range
              </Typography>
            </div>
            <div className="z-[100]">
              <DateRangePicker
                value={dateRange}
                onChange={updateDateRange}
              />
            </div>
          </CardBody>
        </Card>

        {/* Ministry Selection */}
        <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border`}>
          <CardBody className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <BuildingOfficeIcon className="h-3 w-3 text-orange-500" />
              <Typography variant="h6" color={isDark ? "white" : "blue-gray"} className="text-xs font-medium">
                Ministry / Department
              </Typography>
            </div>
            <MultipleMinistryAutocomplete
              ministry={selectedMinistry}
              setMinistry={updateSelectedMinistry}
            />
          </CardBody>
        </Card>

        {/* Location */}
        <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border`}>
          <CardBody className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <MapPinIcon className="h-3 w-3 text-purple-500" />
              <Typography variant="h6" color={isDark ? "white" : "blue-gray"} className="text-xs font-medium">
                State & District
              </Typography>
            </div>
            <StateDistrictAutocomplete
              stateDistrict={stateDistrict}
              setStateDistrict={updateStateDistrict}
            />
          </CardBody>
        </Card>

        {/* Advanced Options */}
        <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border`}>
          <CardBody className="p-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full mb-2"
            >
              <div className="flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="h-3 w-3 text-indigo-500" />
                <Typography variant="h6" color={isDark ? "white" : "blue-gray"} className="text-xs font-medium">
                  Advanced Options
                </Typography>
              </div>
              <IconButton size="sm" variant="text">
                <svg 
                  className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </IconButton>
            </button>
            
            <div className={`space-y-2 transition-all duration-300 ${isExpanded ? 'block' : 'hidden'}`}>
              <ThresholdSlider
                type={filters.type}
                threshold={filters.threshold}
                setThreshold={setThreshold}
              />
              
              <ShowClosedCheckbox
                showClosed={filters.all_record}
                setShowClosed={setShowClosed}
              />
            </div>
          </CardBody>
        </Card>

      </div>

      {/* Action Buttons */}
      <div className={`
        px-4 py-3 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}
        space-y-2
      `}>
        <Button 
          variant="gradient" 
          fullWidth 
          onClick={searchGrievances} 
          disabled={searching}
          className="flex items-center justify-center gap-2 h-8 text-xs font-medium shadow-sm hover:shadow-md transition-shadow"
          color="blue"
        >
          <MagnifyingGlassIcon className="h-3 w-3" />
          {searching ? 'Searching...' : 'Category Search'}
        </Button>

        <Button
          variant="gradient"
          color="green"
          fullWidth
          onClick={spatiallySearchGrievances}
          disabled={searching || !isValidSpatialFilterType(filters.type)}
          className="flex items-center justify-center gap-2 h-8 text-xs font-medium shadow-sm hover:shadow-md transition-shadow"
        >
          <GlobeAltIcon className="h-3 w-3" />
          Spatial Search
        </Button>

        <div className="flex gap-2 mt-2">
          <Button
            variant="outlined"
            color="gray"
            fullWidth
            onClick={() => window.location.reload()}
            className={`
              text-xs py-1 h-7 transition-colors
              ${isDark 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-center justify-center gap-1">
              <ArrowPathIcon className="h-3 w-3" />
              Reset
            </div>
          </Button>

          <Button
            variant="text"
            color="gray"
            fullWidth
            onClick={() => setOpenConfigurator(dispatch, false)}
            className={`
              text-xs py-1 h-7 transition-colors
              ${isDark 
                ? 'text-gray-400 hover:bg-gray-700' 
                : 'text-gray-500 hover:bg-gray-100'
              }
            `}
          >
            <div className="flex items-center justify-center gap-1">
              <XMarkIcon className="h-3 w-3" />
              Close
            </div>
          </Button>
        </div>
      </div>
    </aside>
  );
}

Configurator.displayName = "/src/widgets/layout/configurator.jsx";

export default Configurator;

export const SearchInput = ({
  types = queryTypes,
  type,
  setType,
  query,
  setQuery,
  onEnterPress
}) => {
  const { isDark } = useTheme();
  
  return (
    <div className="space-y-2">
      {/* Search Type Selector */}
      <div className={`
        p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} 
        border ${isDark ? 'border-gray-600' : 'border-gray-200'}
      `}>
        <Typography variant="small" color="gray" className="text-xs mb-1 font-medium">
          Search Type
        </Typography>
        <Menu>
          <MenuHandler>
            <Button 
              variant="outlined" 
              size="sm" 
              className={`
                w-full justify-between text-left font-normal
                ${isDark ? 'border-gray-600 text-white' : 'border-gray-300 text-gray-700'}
              `}
            >
              <span className="flex items-center gap-2">
                <Chip 
                  value={types[type] ? types[type].name : types[1].name} 
                  size="sm" 
                  color="blue"
                  className="text-xs"
                />
                <span className="text-xs">based search</span>
              </span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </MenuHandler>
          <MenuList className="max-h-[15rem] z-[1200]">
            {Object.keys(types).map(key => (
              <MenuItem 
                onClick={() => setType(key)} 
                key={key}
                className="text-sm"
              >
                <div className="flex items-center gap-2">
                  <Chip value={types[key].name} size="sm" color="blue" className="text-xs" />
                  <span>Search</span>
                </div>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </div>

      {/* Search Input */}
      <div>
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          type="text"
          label={Object.keys(types).includes(type) && types[type]?.placeholder ? types[type].placeholder : "Enter Natural Language Query..."}
          size="md"
          autoFocus={true}
          className={`text-sm ${isDark ? '!text-white' : '!text-gray-900'}`}
          labelProps={{
            className: `${isDark ? 'text-gray-300' : 'text-gray-600'}`
          }}
          containerProps={{
            className: `${isDark ? 'text-white' : 'text-gray-900'}`
          }}
          onKeyDownCapture={({ key }) => key == 'Enter' && onEnterPress && onEnterPress()}
          icon={<MagnifyingGlassIcon className="h-4 w-4" />}
        />
      </div>
    </div>
  )
}

export const ThresholdSlider = ({
  type,
  threshold,
  setThreshold
}) => {
  const { isDark } = useTheme();
  const ThresholdableTypes = ['1', '5']

  const isThresholdable = useCallback(() => ThresholdableTypes.includes(type), [type])

  return isThresholdable() && (
    <div className={`
      p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} 
      border ${isDark ? 'border-gray-600' : 'border-gray-200'}
    `}>
      <div className="flex justify-between items-center mb-1">
        <Typography variant="small" color={isDark ? "white" : "blue-gray"} className="font-medium text-xs">
          Relevance Threshold
        </Typography>
        <Chip 
          value={threshold} 
          size="sm" 
          color="blue" 
          className="text-xs font-bold py-1 px-2"
        />
      </div>

      <input
        type="range"
        value={threshold}
        min={1.2}
        max={2}
        step={0.1}
        onChange={e => setThreshold(e.target.value)}
        className={`
          w-full h-2 rounded-lg appearance-none cursor-pointer
          ${isDark ? 'bg-gray-600' : 'bg-gray-200'}
          focus:outline-none focus:ring-2 focus:ring-blue-500
        `}
      />
      
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Less Relevant</span>
        <span>More Relevant</span>
      </div>
    </div>
  )
}

export const ShowClosedCheckbox = ({
  showClosed,
  setShowClosed
}) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`
      p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} 
      border ${isDark ? 'border-gray-600' : 'border-gray-200'}
    `}>
      <label className="flex items-center gap-2 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            checked={showClosed}
            onChange={e => setShowClosed(e.target.checked ? 1 : 0)}
            className="sr-only"
          />
          <div className={`
            w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
            ${showClosed 
              ? 'bg-blue-500 border-blue-500' 
              : `${isDark ? 'border-gray-500 bg-gray-800' : 'border-gray-300 bg-white'}`
            }
          `}>
            {showClosed && (
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
        
        <div>
          <Typography variant="small" color={isDark ? "white" : "blue-gray"} className="font-medium text-xs">
            Include Closed Grievances
          </Typography>
          <Typography variant="small" color="gray" className="text-xs">
            Show resolved and closed cases in results
          </Typography>
        </div>
      </label>
    </div>
  )
}

export const getDefaultStateDistrict = filters => (
  filters.state && filters.district && {
    ...(
      (filters.state != 'All')
        ? {
          text: `${filters.state} > ${filters.district}`,
          values: {
            state: filters.state,
            district: filters.district
          }
        }
        : DEFAULT_STATE_DISTRICT
    )
  })

export const getDefaultMinistry = filters => (
  filters.ministry &&
  {
    text: filters.ministry == 'All' ? '' : filters.ministry,
    value: filters.ministry
  }
)

export const getDefaultDateRange = filters => ({
  startDate: filters.startDate,
  endDate: filters.endDate
})

export const isValidSpatialFilterType = type => Object.keys(onlySemanticQueryType).includes(type)

export const isValidBasicQueryType = type => Object.keys(basicQueryTypes).includes(type)
