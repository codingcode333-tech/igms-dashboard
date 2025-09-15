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
import { GlobeAltIcon, MapPinIcon, ChartBarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid"
import { formatDate } from "@/helpers/date"
import { Card, CardBody, Typography, Button } from "@material-tailwind/react"
import { useTheme } from "@/context"
import { MinistryAutocomplete } from "@/pages/dashboard/CategoricalTree"

export const SpatialSearch = () => {
    const { filters, searching, startSearch, stopSearch, setFilters, setPageno } = useFilter()
    const [grievanceLength, setGrievanceLength] = useState(0)
    const { isDark } = useTheme()

    const initiateSearch = () => {
        setPageno(1)
        startSearch()
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
            {/* Header Section */}
            <div className="relative overflow-hidden">
                <div className={`absolute inset-0 ${isDark ? 'bg-gray-800' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700'} opacity-10`}></div>
                <div className="relative px-4 py-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className={`p-3 rounded-full ${isDark ? 'bg-blue-600' : 'bg-white'} shadow-lg`}>
                                    <GlobeAltIcon className={`h-8 w-8 ${isDark ? 'text-white' : 'text-blue-600'}`} />
                                </div>
                                <Typography variant="h2" color={isDark ? "white" : "blue-gray"} className="font-bold">
                                    Spatial Analysis
                                </Typography>
                            </div>
                            <Typography variant="lead" color="gray" className="max-w-2xl mx-auto">
                                Analyze grievance patterns across geographical regions with advanced spatial intelligence
                            </Typography>
                        </div>

                        {/* Search Filters Card */}
                        <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-sm'} shadow-lg border mb-4`}>
                            <CardBody className="p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <MagnifyingGlassIcon className="h-4 w-4 text-blue-500" />
                                    <Typography variant="h6" color={isDark ? "white" : "blue-gray"} className="font-medium text-sm">
                                        Search Parameters
                                    </Typography>
                                </div>
                                <SearchFilters
                                    startSearch={initiateSearch}
                                    types={basicQueryTypes}
                                    searchButtonColor="blue"
                                    buttonIcon={<GlobeAltIcon height={'1.2rem'} className="mr-2" />}
                                    disabled={!isValidBasicQueryType(filters.type)}
                                    showMinistry={false}
                                />
                                
                                {/* Custom Ministry Filter */}
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <SpatialMinistryFilter />
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Data Display Section */}
            <div className="px-4 pb-8">
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
                <div className={`grid ${grievances.length > 0 ? 'lg:grid-cols-5' : 'lg:grid-cols-1'} gap-6`}>
                    {/* Map Visualization Section */}
                    <div className={`${grievances.length > 0 ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
                        <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg border h-full`}>
                            <CardBody className="p-3">
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
                                
                                <div className="h-[70vh] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
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
                        <div className="lg:col-span-3">
                            <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg border h-full`}>
                                <CardBody className="p-3">
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
                                    
                                    <div className="h-[70vh] overflow-hidden">
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
            {stateWiseGrievances.length === 0 && !searching && (
                <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-xl border`}>
                    <CardBody className="p-12 text-center">
                        <div className={`p-4 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'} inline-block mb-4`}>
                            <GlobeAltIcon className={`h-12 w-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        </div>
                        <Typography variant="h4" color={isDark ? "white" : "blue-gray"} className="mb-2">
                            No Spatial Data Available
                        </Typography>
                        <Typography variant="lead" color="gray" className="mb-6">
                            Perform a search to view geographic distribution of grievances
                        </Typography>
                        <Button 
                            variant="gradient" 
                            color="blue" 
                            className="flex items-center gap-2 mx-auto"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            <MagnifyingGlassIcon className="h-4 w-4" />
                            Start Search Analysis
                        </Button>
                    </CardBody>
                </Card>
            )}

            {/* Loading State */}
            {searching && (
                <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-xl border`}>
                    <CardBody className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <Typography variant="h5" color={isDark ? "white" : "blue-gray"} className="mb-2">
                            Analyzing Spatial Data...
                        </Typography>
                        <Typography variant="small" color="gray">
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
        <div>
            <div className="flex items-center gap-2 mb-2">
                <Typography variant="small" color={isDark ? "white" : "blue-gray"} className="font-medium">
                    Ministry Filter
                </Typography>
            </div>
            <MinistryAutocomplete
                ministry={selectedMinistry}
                setMinistry={updateSelectedMinistry}
                className="w-full"
            />
        </div>
    )
}