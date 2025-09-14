import GrievanceList from '@/widgets/grievance/list'
import { useState, useEffect, useRef } from 'react'
import grievanceService from "@/services/grievances"
import { useFilter } from "@/context/FilterContext";
import { setLoading, useMaterialTailwindController } from '@/context';
import { downloadData } from '@/helpers/download';
import { useNavigate } from 'react-router-dom';
import { getUser } from '@/context/UserContext';
import { FilterLayout, SearchButton } from '@/widgets/grievance/BasicFilters';
import { SearchInput, ShowClosedCheckbox, ThresholdSlider, getDefaultDateRange, getDefaultMinistry, getDefaultStateDistrict, queryTypes } from '@/widgets/layout';
import { DateRangePicker, MinistryAutocomplete, MultipleMinistryAutocomplete, StateDistrictAutocomplete } from './CategoricalTree';
import { toast } from 'react-toastify';

export function QueryGrievances(props) {
  const [grievances, setGrievances] = useState([])
  const [pageno, setPageno] = useState(1);
  const [count, setCount] = useState()
  const [total, setTotal] = useState()
  const { filters, setFilters, searching, stopSearch, startSearch } = useFilter();
  const [noDataFound, setNoDataFound] = useState(false)
  const [, dispatch] = useMaterialTailwindController()
  const navigateTo = useNavigate()
  const user = getUser()
  const listingRef = useRef(null)
  const [isLocallySearching, setIsLocallySearching] = useState(false) // Creating a local search state to prevent multiple calls at initial load
  const [localFilters, setLocalFilters] = useState(filters)
  const [downloading, setDownloading] = useState(false)

  const download = async () => {
    setDownloading(true)

    const data = (await grievanceService.queryGrievances({
      ...localFilters,
      download_req: 1,
      size: 10000
    }, pageno)).data

    downloadData(data?.filename)

    setDownloading(false)
  }

  const getGrievances = async () => {
    let local_filters = { ...filters }

    if (local_filters.type == '5') {
      try {
        const subject_content = (await grievanceService.descGrievance(local_filters.query))?.data?.subject_content ?? ''

        local_filters = {
          ...local_filters,
          query: subject_content,
          type: '1',
          page_req: '1'
        }
      } catch {
        toast("Please enter a valid Registration number.", { type: 'error' })

        stopSearch()

        return
      }
    }

    try {
      const data = (await grievanceService.queryGrievances(local_filters, pageno)).data

      let list = data.data[0] == '{}' ? [] : data.data

      if (user.username == 'dpg') {
        setTimeout(async () => {
          const additional_data = (await grievanceService.queryGrievances({ ...local_filters, ministry: "DARPG/D" }, pageno)).data

          if (list && additional_data.data && additional_data.data[0] && (additional_data.data[0] != '{}'))
            list = list.concat(additional_data.data)

          if (data.count && additional_data.count)
            data.count += additional_data.count

          if (data.total_count?.total_count && additional_data.total_count?.total_count)
            data.total_count.total_count += additional_data.total_count?.

              setGrievances(list)
          setCount(data.count)
          setTotal(data.total_count?.total_count)
          setNoDataFound(data.count == 0)
        }, 2000)
      }

      stopSearch()

      setGrievances(list)
      setCount(data.count)
      setTotal(data.total_count?.total_count)
      setNoDataFound(data.count == 0)

      setLocalFilters(local_filters)

      listingRef.current.scrollIntoView({
        behavior: 'smooth'
      })
    } catch {
      toast("There was an error. Please try again.", { type: "error" })
      stopSearch()
    }
  }

  const initiateSearch = () => {
    setPageno(1)
    startSearch()
  }

  useEffect(() => {
    if (isLocallySearching) {
      if (filters.query.length == 0) {
        toast("Enter the text to search", { type: "error" })
        stopSearch()
      }
      else
        getGrievances()

    }
  }, [isLocallySearching])

  // Updating local search state to prevent multiple calls at initial load
  useEffect(() => {
    setIsLocallySearching(searching)
  }, [searching])

  useEffect(() => {
    startSearch()
  }, [pageno])

  return <div>
    <SearchFilters startSearch={initiateSearch} />

    <div ref={listingRef}>
      <GrievanceList
        title="Searched Grievances"
        grievances={grievances}
        count={count}
        pageno={pageno}
        setPageno={setPageno}
        total={total}
        noDataFound={noDataFound}
        download={download}
        scrollH={"80vh"}
        downloading={downloading}
        searching={searching}
      />
    </div>
  </div>
}

export const SearchFilters = ({
  startSearch = () => '',
  types = queryTypes,
  searchButtonColor = 'blue',
  buttonIcon = <div></div>,
  disabled = false,
  showQuery = true,
  showMinistry = true,
  className = ''
}) => {
  const { filters, setFilters, searching } = useFilter()
  const [dateRange, setDateRange] = useState(getDefaultDateRange(filters))
  const [selectedMinistry, setSelectedMinistry] = useState(getDefaultMinistry(filters))
  const [stateDistrict, setStateDistrict] = useState(getDefaultStateDistrict(filters))

  const updateDateRange = range => {
    setFilters({
      ...filters,
      startDate: range.startDate,
      endDate: range.endDate
    })

    setDateRange(range)
  }

  const updateSelectedMinistry = selection => {
    setFilters({
      ...filters,
      ministry: selection?.value
    })

    setSelectedMinistry(selection)
  }

  const updateStateDistrict = newStateDistrict => {

    if (newStateDistrict && newStateDistrict.values)
      setFilters({
        ...filters,
        state: newStateDistrict?.values.state,
        district: newStateDistrict?.values.district
      })
    else
      setFilters({
        ...filters,
        state: "All",
        district: "All"
      })

    setStateDistrict(newStateDistrict)
  }

  const updateFilter = (key, value) => setFilters({ ...filters, [key]: value })

  useEffect(() => {
    setDateRange(getDefaultDateRange(filters))
    setSelectedMinistry(getDefaultMinistry(filters))
    // setStateDistrict(getDefaultStateDistrict(filters))
  }, [filters])

  return (
    <FilterLayout
      className={`items-end ${className}`}
    >
      {
        showQuery &&
        <div className='col-span-3'>
          <SearchInput
            types={types}
            type={filters.type}
            setType={newType => updateFilter('type', newType)}
            query={filters.query}
            setQuery={newQuery => updateFilter('query', newQuery)}
            onEnterPress={() => !disabled && startSearch()}
          />
        </div>
      }

      <DateRangePicker
        value={dateRange}
        onChange={updateDateRange}
      />

      {
        showMinistry &&
        <MultipleMinistryAutocomplete
          ministry={selectedMinistry}
          setMinistry={updateSelectedMinistry}
        />
      }

      <StateDistrictAutocomplete
        stateDistrict={stateDistrict}
        setStateDistrict={updateStateDistrict}
      />

      <ThresholdSlider
        type={filters.type}
        threshold={filters.threshold}
        setThreshold={newThreshold => updateFilter('threshold', newThreshold)}
      />

      <ShowClosedCheckbox
        showClosed={filters.all_record}
        setShowClosed={newShowClosed => updateFilter('all_record', newShowClosed)}
      />

      <SearchButton
        searching={searching}
        startSearch={startSearch}
        color={searchButtonColor}
        className='col-span-1 md:col-start-2 xl:col-start-3'
        icon={buttonIcon}
        disabled={disabled}
      />
    </FilterLayout>
  )
}