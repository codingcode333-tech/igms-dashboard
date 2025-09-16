import { useFilter } from "@/context/FilterContext"
import { SearchFilters } from "."
import { basicQueryTypes, isValidBasicQueryType, isValidSpatialFilterType, onlySemanticQueryType } from "@/widgets/layout"
import { HeatMap2 } from "@/widgets/maps/heatmap/HeatMap2"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "react-toastify"
import mapService from "@/services/maps"
import grievanceService from "@/services/grievances"
import GrievanceList from "@/widgets/grievance/list"
import { pageSize } from "@/helpers/env"
import { json2csv } from "json-2-csv"
import district_lat_long from "@/data/json/district_lat_long.json"
import { downloadData } from "@/helpers/download"
import { GlobeAltIcon, MapPinIcon, ChartBarIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/solid"
import { formatDate } from "@/helpers/date"
import { Card, CardBody, Typography, Button, Input, Select, Option, Checkbox, Slider } from "@material-tailwind/react"
import { useTheme } from "@/context"
import { MinistryAutocomplete, DateRangePicker, StateDistrictAutocomplete } from "@/pages/dashboard/CategoricalTree"

export const SpatialSearch = () => {
    const { filters, searching, startSearch, stopSearch, setFilters, setPageno } = useFilter()
    const [grievanceLength, setGrievanceLength] = useState(0)
    const { isDark } = useTheme()

    const initiateSearch = () => {
        setPageno(1)
        startSearch()
    }

    return (
        <div 
            className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}
            style={{
                backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Blank_Map_of_India.svg/800px-Blank_Map_of_India.svg.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
                backgroundBlendMode: 'soft-light',
                opacity: isDark ? 0.8 : 0.9
            }}
        >
            {/* Search Filters Section */}
            <div className="container mx-auto px-4 py-6 bg-gray-50 flex flex-col items-center justify-center min-h-[70vh]">
                <div className="w-full max-w-6xl">
                    {/* Search Parameters Card */}
                    <Card className="bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden h-full" style={{ backdropFilter: 'blur(15px)', backgroundColor: 'rgba(255, 255, 255, 0.5)', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                        <CardBody className="p-4 sm:p-8">
                            {/* Header */}
                            <Typography variant="h4" color="gray" className="font-medium mb-6 sm:mb-8 text-gray-600">
                                Search Parameters
                            </Typography>

                            {/* Search Query Row */}
                            <div className="flex flex-col sm:flex-row gap-3 items-stretch mb-8">
                                <div className="w-full sm:w-48">
                                    <SpatialSearchTypeSelector />
                                </div>
                                <div className="flex-1">
                                    <SpatialSearchInput />
                                </div>
                                <div className="w-full sm:w-auto">
                                    <SpatialSearchButton />
                                </div>
                            </div>

                            {/* Main Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-8">
                                {/* Date Range - Left Column */}
                                <div className="lg:col-span-1">
                                    <Typography variant="h6" color="gray" className="font-medium mb-2 text-gray-600">
                                        Date Range
                                    </Typography>
                                    <Typography variant="small" color="gray" className="text-xs text-gray-500 mb-3">
                                        Note: CDIS data is available from 2016-2024. Selecting recent dates may show limited results.
                                    </Typography>
                                    <SpatialDateRangeInput />
                                </div>

                                {/* State/District & Ministry - Right Column */}
                                <div className="space-y-6 lg:col-span-1">
                                    <div className="relative z-30">
                                        <Typography variant="h6" color="gray" className="font-medium mb-4 text-gray-600">
                                            State / District
                                        </Typography>
                                        <SpatialStateDistrictPicker />
                                    </div>
                                    <div className="relative z-20">
                                        <Typography variant="h6" color="gray" className="font-medium mb-4 text-gray-600">
                                            Ministry
                                        </Typography>
                                        <SpatialMinistryFilter />
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Row - Relevance & Checkbox */}
                            <div className="flex items-center justify-between">
                                <div className="w-1/2 pr-8">
                                    <SpatialThresholdSlider />
                                </div>
                                <div className="flex items-center gap-2">
                                    <SpatialClosedCheckbox />
                                    <Typography variant="small" color="gray" className="text-gray-600">
                                        Include Closed Grievances
                                    </Typography>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Data Display Section */}
            <div className="container mx-auto px-4 pb-8">
                <SpatialDataDisplay updateGrievanceLength={setGrievanceLength} />
            </div>
        </div>
    )
}

export const SpatialDataDisplay = ({
    updateGrievanceLength = () => ''
}) => {
    const { filters, searching, startSearch, tempFilters, stopSearch, setFilters, pageno, setPageno } = useFilter()
    const { isDark } = useTheme()
    const listingRef = useRef(null)
    const [stateWiseGrievances, setStateWiseGrievances] = useState([])
    const [grievances, setGrievances] = useState([])
    const [count, setCount] = useState(0)
    const [total, setTotal] = useState(0)
    const [noDataFound, setNoDataFound] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [isLocallySearching, setIsLocallySearching] = useState(false)
    const [selectedState, setSelectedState] = useState(undefined)
    const [preventHeatmapUpdate, setPreventHeatmapUpdate] = useState(false)
    const [focusedDistrict, setFocusedDistrict] = useState(undefined)

    const getDistrictStats = stateName =>
        new Promise(async resolve => {
            const filtersWithState = {
                ...filters,
                state: stateName,
                district: filters.district == focusedDistrict ? 'All' : filters.district
            }

            // setFilters(filtersWithState)

            setPreventHeatmapUpdate(true)

            setSelectedState(stateName)

            setPageno(1)

            startSearch(filtersWithState)

            const districts = (await mapService.districtWiseCounts(filtersWithState, pageno))
                ?.data?.district_wise_distribution
                ?? {}

            resolve(
                Object.entries(districts)
                    .map(([district, count]) => ({
                        district,
                        count,
                        ...getDistrictLatLong(district, stateName)
                    }))
                ?? []
            )
        })

    const focusDistrict = newDistrict => {
        if (searching)
            return false

        setFocusedDistrict(newDistrict)

        setPageno(1)

        setPreventHeatmapUpdate(true)

        // setFilters({
        //     ...filters,
        //     district: newDistrict
        // })

        startSearch({
            ...filters,
            state: selectedState,
            district: newDistrict
        })

        return true
    }

    const listingTitle = useMemo(() => `Searched Grievances ${selectedState ? `for ${selectedState}` : ''} ${focusedDistrict ? ` -> ${focusedDistrict}` : ''}`, [selectedState, focusedDistrict])

    const download = async () => {
        setDownloading(true)

        const data = (await grievanceService.queryGrievances({
            ...filters,
            download_req: 1,
            size: 10000
        }, pageno)).data

        downloadData(data?.filename)


        setDownloading(false)
    }

    const getGrievances = async (temp = null) => {
        try {
            const data = (await grievanceService.queryGrievances(temp ?? tempFilters ?? filters, pageno)).data
            let list = data.data[0] == '{}' ? [] : data.data

            // Sort grievances by received date (newest first)
            if (list && Array.isArray(list) && list.length > 0) {
                list = list.sort((a, b) => {
                    // Try different date fields
                    const dateA = new Date(a.recvd_date || a.received_date || a.date || '1970-01-01');
                    const dateB = new Date(b.recvd_date || b.received_date || b.date || '1970-01-01');
                    
                    // Sort in descending order (newest first)
                    return dateB.getTime() - dateA.getTime();
                });
                
                console.log('📅 Grievance list sorted by date (newest first)');
            }

            if (!preventHeatmapUpdate) {
                const stateDistribution = data.count > 0 
                    ? (await mapService.stateWiseCounts(filters, pageno)).data?.state_wise_distribution
                    : {};
                
                const stateWiseData = createStateWiseArray(stateDistribution);
                setStateWiseGrievances(stateWiseData);

                // Auto-select the state with highest grievance count
                if (stateWiseData.length > 0) {
                    const topState = stateWiseData.reduce((prev, current) => 
                        (prev.count > current.count) ? prev : current
                    );
                    
                    console.log('🎯 Auto-selecting top state:', topState.state, 'with', topState.count, 'grievances');
                    
                    // Don't set selected state automatically as it might interfere with user interaction
                    // setSelectedState(topState.state);
                } else {
                    setSelectedState(undefined);
                }
            }
            else
                setPreventHeatmapUpdate(false)

            stopSearch()

            if (!list || list.length == 0) {
                toast.warn("No data found!")
            }

            setGrievances(list)
            setCount(data.count || list.length)
            // Ensure total is always a number, not an object
            const totalCount = typeof data.total_count === 'object' 
                ? (data.total_count?.total_count || data.total_count?.count || data.count || list.length)
                : (data.total_count || data.count || list.length);
            setTotal(totalCount)
            setNoDataFound((data.count || list.length) == 0)

            console.log('📋 Grievance list updated:', {
                listLength: list.length,
                count: data.count,
                total: data.total_count,
                finalCount: data.count || list.length,
                finalTotal: totalCount
            });

            listingRef.current.scrollIntoView({
                behavior: 'smooth'
            })
        } catch {
            toast("There was an error. Please try again.", { type: "error" })
            stopSearch()
        }
    }

    useEffect(() => {
        if (isLocallySearching && filters.query && filters.query.trim().length > 0) {
            getGrievances()
        } else if (isLocallySearching && (!filters.query || filters.query.trim().length === 0)) {
            toast.warn("Enter the text to search")
            stopSearch()
        }
    }, [isLocallySearching])

    // Updating local search state to prevent multiple calls at initial load
    useEffect(() => {
        setIsLocallySearching(searching)
    }, [searching])

    useEffect(() => {
        if (filters.query && filters.query.trim().length > 0) {
            startSearch()
        }
    }, [pageno])

    useEffect(() => {
        updateGrievanceLength(grievances.length)
    }, [grievances])

    return (
        <div className="max-w-7xl mx-auto" ref={listingRef}>
            {stateWiseGrievances.length > 0 && (
                <div className={`grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6`}>
                    {/* Map Visualization Section */}
                    <div className="lg:col-span-2 xl:col-span-3 order-2 lg:order-1">
                        <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg border flex-1 min-h-[60vh]`} style={{ backdropFilter: 'blur(15px)', backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.5)' }}>
                            <CardBody className="p-3 flex flex-col h-full">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className={`p-1.5 rounded-lg ${isDark ? 'bg-purple-600' : 'bg-purple-100'}`}>
                                        <MapPinIcon className={`h-4 w-4 ${isDark ? 'text-white' : 'text-purple-600'}`} />
                                    </div>
                                    <div>
                                        <Typography variant="h6" color={isDark ? "white" : "blue-gray"} className="font-medium text-sm">
                                            Geographic Distribution
                                        </Typography>
                                        <Typography variant="small" color="gray" className="text-xs">
                                            Interactive heat map visualization
                                        </Typography>
                                    </div>
                                </div>
                                
                                <div className="flex-1 min-h-[50vh] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 relative" style={{ boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '0.5rem' }}>
                                    <HeatMap2
                                        grievances={stateWiseGrievances}
                                        className="w-full h-full"
                                        getDistricts={getDistrictStats}
                                        focusDistrict={focusDistrict}
                                    />
                                </div>
                                
                                {/* Map Stats */}
                                <div className="mt-3 flex items-center gap-3 text-xs">
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span className={isDark ? "text-gray-300" : "text-gray-600"}>High</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <span className={isDark ? "text-gray-300" : "text-gray-600"}>Medium</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className={isDark ? "text-gray-300" : "text-gray-600"}>Low</span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Grievance List Section */}
                    {grievances.length > 0 && (
                        <div className="lg:col-span-1 xl:col-span-2 order-1 lg:order-2">
                            <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg border flex-1 min-h-[60vh]`} style={{ backdropFilter: 'blur(15px)', backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.5)' }}>
                                <CardBody className="p-3 flex flex-col h-full">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`p-1.5 rounded-lg ${isDark ? 'bg-blue-600' : 'bg-blue-100'}`}>
                                            <ChartBarIcon className={`h-4 w-4 ${isDark ? 'text-white' : 'text-blue-600'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <Typography variant="h6" color={isDark ? "white" : "blue-gray"} className="font-medium text-sm">
                                                {listingTitle}
                                            </Typography>
                                            <Typography variant="small" color="gray" className="text-xs">
                                                Found {count} grievances | Total {typeof total === 'object' ? (total?.total_count || total?.count || 0) : (total || 0)} records
                                            </Typography>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 min-h-[50vh] overflow-hidden">
                                        <GrievanceList
                                            compactTitle={false}
                                            title=""
                                            grievances={grievances}
                                            count={count}
                                            pageno={pageno}
                                            setPageno={setPageno}
                                            total={total}
                                            noDataFound={noDataFound}
                                            download={download}
                                            downloading={downloading}
                                            scrollH={"70vh"}
                                            searching={searching}
                                        />
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    )}
                </div>
            )}

            {/* No Data State */}
            {/* Loading State */}
            {searching && (
                <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-xl border max-w-4xl mx-auto`} style={{ backdropFilter: 'blur(15px)', backgroundColor: isDark ? 'rgba(31, 41, 55, 0.4)' : 'rgba(255, 255, 255, 0.5)', boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                    <CardBody className="p-8 sm:p-12 text-center">
                        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-500 mx-auto mb-6"></div>
                        <Typography variant="h5" color={isDark ? "white" : "blue-gray"} className="mb-3 font-semibold">
                            Analyzing Spatial Data...
                        </Typography>
                        <Typography variant="small" color="gray" className="text-md">
                            Processing geographic distribution patterns
                        </Typography>
                    </CardBody>
                </Card>
            )}
        </div>
    )
}

export const createStateWiseArray = object => Object.keys(object)
    .map(state => ({
        state: state?.toLowerCase(),
        count: object[state]
    }))

const createStateDistrictTree = grievances => grievances.reduce((states, grievance) => {
    let stateIndex = states.findIndex(state => state.name == grievance.state)

    if (stateIndex == -1) {
        stateIndex = states.length
        states.push({
            name: grievance.state,
            grievances: [],
            districts: []
        })
    }

    let districtIndex = states[stateIndex].districts.findIndex(district => district.name == grievance.district)

    if (districtIndex == -1) {
        districtIndex = states[stateIndex].districts.length
        states[stateIndex].districts.push({
            name: grievance.district,
            grievances: []
        })
    }

    states[stateIndex].grievances.push(grievance)
    states[stateIndex].districts[districtIndex].grievances.push(grievance)

    return states
}, [])

const csvColumnNames = [
    {
        field: 'registration_no',
        title: "Registration No."
    },
    {
        field: 'state',
        title: "State"
    },
    {
        field: 'district',
        title: "District"
    },
    {
        field: 'recvd_date',
        title: "Received Date"
    },
    {
        field: 'closing_date',
        title: "Closing Date"
    },
    {
        field: 'name',
        title: "Name"
    },
    {
        field: 'ministry',
        title: "Ministry"
    }
]

export const downloadCSV = async (data, columns = [], filters = {}, additionalData = null, title = "Grievances") => {
    const csvText = json2csv(data, { keys: columns.length == 0 ? undefined : columns })

    const blob = new Blob([csvText], { type: 'text/csv' })

    const url = window.URL.createObjectURL(blob)

    const filterValues = Object.values(filters)

    const filename = 'IGMS2_' +
        title + '_' +
        formatDate(new Date(), 'd_MMM_yyyy') +
        (additionalData ? '_' + additionalData : '') +
        (filterValues.length > 0 ? '_' : '') +
        filterValues.join('_') +
        '.csv'

    const a = document.createElement('a')

    a.setAttribute('href', url)

    a.setAttribute('download', filename)

    a.click()
}

const getDistrictLatLong = (district, state = null) => {
    district = district.toLowerCase().trim()
    state = state.toLowerCase().trim()

    let latLongData =
        district_lat_long
            .find(districtObject => // Checking for simillarity in district and state
                districtObject.district == district
                && districtObject.state == state
            )
        ?? district_lat_long
            .find(districtObject => // Checking for simillarity in district name only if the above condition fails
                districtObject.district == district
            )

    return {
        latitude: latLongData?.latitude,
        longitude: latLongData?.longitude
    }
}

// Custom Ministry Filter Component for Spatial Search
const SpatialMinistryFilter = () => {
    const { filters, setFilters } = useFilter()
    const { isDark } = useTheme()
    
    const [selectedMinistry, setSelectedMinistry] = useState({
        text: filters.ministry === 'All' ? '' : filters.ministry,
        value: filters.ministry
    })

    const updateSelectedMinistry = (selection) => {
        setFilters({
            ...filters,
            ministry: selection?.value || 'All'
        })
        setSelectedMinistry(selection || { text: '', value: 'All' })
    }

    // Update local state when filter context changes
    useEffect(() => {
        setSelectedMinistry({
            text: filters.ministry === 'All' ? '' : filters.ministry,
            value: filters.ministry
        })
    }, [filters.ministry])

    return (
        <div className="relative z-20">
            <MinistryAutocomplete
                ministry={selectedMinistry}
                setMinistry={updateSelectedMinistry}
                className="!border-gray-300 !rounded-lg !bg-white !text-gray-700 z-20"
            />
        </div>
    )
}

// Search Type Selector Component
const SpatialSearchTypeSelector = () => {
    const { filters, setFilters } = useFilter()

    return (
        <div className="relative">
            <Select
                value={filters.type}
                onChange={(value) => setFilters({ ...filters, type: value })}
                className="!border-gray-300 !rounded-lg !bg-white !text-gray-700"
                labelProps={{
                    className: "before:content-none after:content-none"
                }}
            >
                <Option value="1">Semantic</Option>
                <Option value="2">Keyword</Option>
            </Select>
            <Typography variant="small" className="text-gray-500 mt-1 text-xs">
                Search Type
            </Typography>
        </div>
    )
}

// Search Input Component
const SpatialSearchInput = () => {
    const { filters, setFilters } = useFilter()
    const { isDark } = useTheme()

    return (
        <div className="flex-1">
            <Input
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                type="text"
                placeholder="Enter your query..."
                className="!border-gray-300 focus:!border-blue-500 !rounded-lg !bg-gray-50 !text-gray-900 placeholder:!text-gray-500"
                labelProps={{
                    className: "before:content-none after:content-none"
                }}
                containerProps={{
                    className: "min-w-0"
                }}
            />
        </div>
    )
}

// Search Button Component
const SpatialSearchButton = () => {
    const { filters, searching, startSearch, setPageno } = useFilter()
    const { isDark } = useTheme()

    const handleSearch = () => {
        setPageno(1)
        startSearch()
    }

    return (
        <Button 
            onClick={handleSearch}
            disabled={searching || !filters.query}
            className="!bg-gray-600 !text-white hover:!bg-gray-700 !rounded-lg flex items-center gap-2 px-6 py-3 !shadow-none uppercase !font-medium"
            size="md"
        >
            <MagnifyingGlassIcon className="h-4 w-4" />
            {searching ? 'Searching...' : 'Search'}
        </Button>
    )
}

// Simple Date Range Input Component
const SpatialDateRangeInput = () => {
    const { filters, setFilters } = useFilter()
    const [dateRange, setDateRange] = useState({
        startDate: null,
        endDate: null
    })

    const updateDateRange = (range) => {
        console.log('📅 Date range selected:', range)
        setFilters({
            ...filters,
            startDate: range.startDate,
            endDate: range.endDate
        })
        setDateRange(range)
    }

    return (
        <div className="w-full">
            <DateRangePicker
                value={dateRange}
                onChange={updateDateRange}
                showShortcuts={true}
                showFooter={true}
                placeholder="Select Date Range"
            />
        </div>
    )
}

// State District Picker Component
const SpatialStateDistrictPicker = () => {
    const { filters, setFilters } = useFilter()
    const [stateDistrict, setStateDistrict] = useState({
        text: filters.state === 'All' ? '' : filters.state,
        values: {
            state: filters.state,
            district: filters.district
        }
    })

    const updateStateDistrict = (newStateDistrict) => {
        if (newStateDistrict && newStateDistrict.values) {
            setFilters({
                ...filters,
                state: newStateDistrict.values.state,
                district: newStateDistrict.values.district
            })
        } else {
            setFilters({
                ...filters,
                state: 'All',
                district: 'All'
            })
        }
        setStateDistrict(newStateDistrict)
    }

    useEffect(() => {
        setStateDistrict({
            text: filters.state === 'All' ? '' : filters.state,
            values: {
                state: filters.state,
                district: filters.district
            }
        })
    }, [filters.state, filters.district])

    return (
        <div className="relative z-30">
            <StateDistrictAutocomplete
                stateDistrict={stateDistrict}
                setStateDistrict={updateStateDistrict}
                className="!border-gray-300 !rounded-lg !bg-white !text-gray-700 z-30"
            />
        </div>
    )
}

// Threshold Slider Component
const SpatialThresholdSlider = () => {
    const { filters, setFilters } = useFilter()
    const { isDark } = useTheme()

    return (
        <div>
            <Typography variant="small" color="gray" className="font-medium mb-2">
                Relevance Threshold
            </Typography>
            <div className="px-2">
                <input
                    type="range"
                    min="1.2"
                    max="2.0"
                    step="0.1"
                    value={filters.threshold || 1.2}
                    onChange={(e) => setFilters({ ...filters, threshold: parseFloat(e.target.value) })}
                    className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Less Relevant</span>
                    <span className="text-blue-600 font-medium">Current: {filters.threshold || 1.2}</span>
                    <span>More Relevant</span>
                </div>
            </div>
        </div>
    )
}

// Closed Checkbox Component
const SpatialClosedCheckbox = () => {
    const { filters, setFilters } = useFilter()

    return (
        <Checkbox
            id="closed"
            checked={filters.all_record === 1}
            onChange={(e) => setFilters({ ...filters, all_record: e.target.checked ? 1 : 0 })}
            color="blue"
            className="!rounded !border-2 !border-gray-300"
        />
    )
}