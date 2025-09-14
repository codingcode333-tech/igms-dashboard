import { FilterLayout, SearchButton } from "@/widgets/grievance/BasicFilters"
import { Input } from "@material-tailwind/react"
import { useEffect, useMemo, useState } from "react"
import { BreadCrumbs, Chart, DateRangePicker, GrievanceListBox, MinistryAutocomplete, StateDistrictAutocomplete, generateTreeFromRca, getBreadCrumbs } from "./CategoricalTree"
import { defaultFrom, defaultTo } from "@/helpers/env"
import { getCategorySearch, getCategoryTree } from "@/services/rca"
import { toast } from "react-toastify"
import { currentDate, firstDateOfTheYear, formatDate } from "@/helpers/date"

export const CategorySearch = () => {
    const [filters, setFilters] = useState({
        query: '',
        ministry: 'AYUSH',
        startDate: firstDateOfTheYear,
        endDate: currentDate,
        state: 'All',
        district: 'All',
        all_record: 1,
        search_type: 3,
        language: 3,
        value: 3
    })

    const [searching, setSearching] = useState(false)
    const [rca, setRca] = useState({})
    const [appendPath, setAppendPath] = useState(null)
    const [rcaPath, setRcaPath] = useState([])


    const currentBranch = (customPath = null) => {
        let path = customPath ?? rcaPath

        return path.reduce(
            (branch, childIndex) => {
                return branch.children[childIndex]
            },
            rca
        )
    }

    const updatePathLength = length => setRcaPath([...rcaPath.splice(0, length)])


    const series = useMemo(() => {
        let branch = currentBranch()

        let series = branch?.children?.map(child => ({
            x: child.title,
            y: child.count
        }))

        return [{
            data: series?.length > 0 ? series : [{
                x: branch.title,
                y: branch.count
            }]
        }]
    }, [rcaPath, rca])

    const breadcrumbs = useMemo(() => getBreadCrumbs(rca, rcaPath), [rca, rcaPath])


    const getCategories = async () => {
        setSearching(true)

        getCategorySearch(filters)
            .then(({ data }) => {
                if (data == 'No Data Found')
                    toast.warn('No Data Found')
                else {
                    if (data && Object.keys(data).length > 0) {
                        setRcaPath([])
                        setRca(generateTreeFromRca(data, 'Root'))
                    }
                    // else
                    //     toast("No data found!", { type: 'error' })
                }
            })
            .finally(() => setSearching(false))
    }

    useEffect(() => {
        getCategories()
    }, [filters])

    useEffect(() => {
        if (appendPath != null) {
            let new_path = [...rcaPath, appendPath]

            if (currentBranch(new_path))
                setRcaPath(new_path)

            setAppendPath(null)
        }
    }, [appendPath])


    return <div>
        <Filters filters={filters} setFilters={setFilters} searching={searching} />

        <Chart
            series={series}
            pushPath={setAppendPath}
        />

        <BreadCrumbs
            list={breadcrumbs}
            setPathLength={updatePathLength}
        />

        {
            currentBranch()?.reg_nos && currentBranch().reg_nos.length > 0 &&
            <GrievanceListBox reg_nos={currentBranch()?.reg_nos} />
        }
    </div>
}

const PDFOptions = {
    1: "Only With PDF",
    2: "Only Without PDF",
    3: "All"
}

const LanguageOptions = {
    'english': [1, 3],
    'hindi': [2, 3]
}

const SearchInsideOptions = {
    'content': [1, 3],
    'pdf': [2, 3]
}

const SearchType = {
    'semantic': 1,
    'keyword': 2,
    'normal': 3
}

const Filters = ({
    filters,
    setFilters,
    searching
}) => {
    const [searchType, setSearchType] = useState(SearchType.normal)

    return <div>
        <div className="flex gap-2 items-center">
            <span>Search Type</span>

            <div className="flex">
                <button
                    type="button"
                    className={`${buttonClasses} rounded-r-none border-r-0 ${searchType == SearchType.normal && buttonActiveClasses}`}
                    onClick={() => setSearchType(SearchType.normal)}>
                    Normal
                </button>

                <button
                    type="button"
                    className={`${buttonClasses} rounded-none border-x-0 ${searchType == SearchType.semantic && buttonActiveClasses}`}
                    onClick={() => setSearchType(SearchType.semantic)}>
                    Semantic
                </button>

                <button
                    type="button"
                    className={`${buttonClasses} rounded-l-none border-l-0 ${searchType == SearchType.keyword && buttonActiveClasses}`}
                    onClick={() => setSearchType(SearchType.keyword)}>
                    Keyword
                </button>
            </div>
        </div>

        <FilterBox
            filters={filters}
            setFilters={filters => setFilters({ ...filters, value: searchType })}
            searchType={searchType}
            searching={searching}
        />
    </div>
}

const FilterBox = ({
    filters,
    setFilters,
    searchType,
    searching
}) => {
    const [query, setQuery] = useState('')
    const [dateRange, setDateRange] = useState({
        startDate: filters.startDate,
        endDate: filters.endDate
    })
    const [selectedMinistry, setSelectedMinistry] = useState({
        text: filters.ministry == 'All' ? '' : (filters.ministry ?? 'All'),
        value: filters.ministry ?? 'All'
    })
    const [stateDistrict, setStateDistrict] = useState({
        text: filters.state == 'All' ? '' : (filters.state ?? 'All'),
        values: {
            state: filters.state ?? 'All',
            district: filters.district ?? 'All'
        }
    })
    const [threshold, setThreshold] = useState(filters.threshold ?? 1.2)
    const [pdfFilter, setPdfFilter] = useState(3)
    const [language, setLanguage] = useState(3)
    const [searchInside, setSearchInside] = useState(3)

    const updateDateRange = range => {
        // setFrom(range.startDate)
        // setTo(range.endDate)
        setDateRange(range)
    }

    const updateSelectedMinistry = selection => {
        // setFilters({ ...filters, ministry: selection?.value })

        setSelectedMinistry(selection)
    }

    const updateStateDistrict = newStateDistrict => {
        // setFilters({
        //     ...filters,
        //     state: newStateDistrict?.values.state,
        //     district: newStateDistrict?.values.district
        // })

        setStateDistrict(newStateDistrict)
    }

    const toggleHindi = () => {
        if (language == 1)
            setLanguage(3)
        else if (language == 2 || language == 3)
            setLanguage(1)
    }

    const toggleEnglish = () => {
        if (language == 2)
            setLanguage(3)
        else if (language == 1 || language == 3)
            setLanguage(2)
    }

    const toggleSubjectContent = () => {
        if (searchInside == 2)
            setSearchInside(3)
        else if (searchInside == 1 || searchInside == 3)
            setSearchInside(2)
    }

    const togglePdfContent = () => {
        if (searchInside == 1)
            setSearchInside(3)
        else if (searchInside == 2 || searchInside == 3)
            setSearchInside(1)
    }

    const startSearch = () => {
        setFilters({
            query,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            state: stateDistrict.values.state,
            district: stateDistrict.values.district,
            ministry: selectedMinistry.value,
            all_record: 1,
            threshold,
            pdf_exists: pdfFilter,
            language,
            search_type: searchInside
        })
    }


    return <FilterLayout className={`mt-2 p-2 border border-blue-700 rounded transition-all ${!searchType && 'h-0 overflow-hidden p-0'}`}>
        <div className={`${![SearchType.semantic, SearchType.keyword].includes(searchType) && 'hidden'}`}>
            <Input
                type="text"
                label="Search Query"
                value={query}
                className="bg-white-input basic-input font-bold"
                onChange={({ target: { value: query } }) => setQuery(query)}
                autoFocus
            />
        </div>

        <div>
            <DateRangePicker
                value={dateRange}
                onChange={updateDateRange}
            />
        </div>

        <div>
            <MinistryAutocomplete
                ministry={selectedMinistry}
                setMinistry={updateSelectedMinistry}
            />
        </div>

        <div>
            <StateDistrictAutocomplete
                stateDistrict={stateDistrict}
                setStateDistrict={updateStateDistrict}
            />
        </div>

        <div className={`-mt-1 ${(SearchType.semantic != searchType) && 'hidden'}`}>
            <div>
                Relevance: <span className="text-blue-900 font-bold">{threshold}</span>
            </div>

            <input type="range" value={threshold} min={1.2} max={2} step={0.1} onChange={e => setThreshold(e.target.value)} className="cursor-pointer border-t-0 shadow-none w-full" />
        </div>

        <div className="flex gap-2 hidden">
            <button type="button" className="text-red-700 border border-red-700 hover:bg-red-700 hover:text-white focus:outline-none font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:focus:ring-red-800 dark:hover:bg-red-500 h-10"
                onClick={() => setPdfFilter((pdfFilter % 3) + 1)}
            >
                <PDFIcon />

                <span className="ml-2 font-bold">
                    {PDFOptions[pdfFilter]}
                </span>

                <span className="sr-only">PDF Filter</span>
            </button>


            <div className={`flex ${![SearchType.semantic, SearchType.keyword].includes(searchType) && 'hidden'}`}>
                <button type="button"
                    className={`${buttonClasses} !ring-0 fill-blue-700 px-2 h-10 rounded-r-none ${LanguageOptions.hindi.includes(language) ? buttonActiveClasses : toggleButtonHoverClasses}`}
                    onClick={toggleHindi}
                    title="Hindi Content"
                >
                    <HindiIcon />
                </button>

                <button type="button"
                    className={`${buttonClasses} !ring-0 fill-blue-700 px-2 pt-2 h-10 rounded-l-none border-l-0 ${LanguageOptions.english.includes(language) ? buttonActiveClasses : toggleButtonHoverClasses}`}
                    onClick={toggleEnglish}
                    title="English Content"
                >
                    <span className="text-[1.7rem]">A</span>
                </button>
            </div>
        </div>

        <div className={`-mt-4 ${![SearchType.semantic, SearchType.keyword].includes(searchType) && 'hidden'} hidden`}>
            <span className="text-xs ml-1">Search Inside</span>

            <div className="flex">
                <button type="button"
                    className={`${buttonClasses} !ring-0 fill-blue-700 px-2 h-8 rounded-r-none ${SearchInsideOptions.content.includes(searchInside) ? buttonActiveClasses : toggleButtonHoverClasses}`}
                    onClick={toggleSubjectContent}
                    title="Search Subject Content"
                >
                    Subject Content
                </button>

                <button type="button"
                    className={`${buttonClasses} !ring-0 fill-blue-700 px-2 h-8 rounded-l-none border-l-0 ${SearchInsideOptions.pdf.includes(searchInside) ? buttonActiveClasses : toggleButtonHoverClasses}`}
                    onClick={togglePdfContent}
                    title="Search PDF Content"
                >
                    PDF Content
                </button>
            </div>
        </div>

        <div className="col-start-3 flex justify-end items-end m-2">
            <SearchButton searching={searching} startSearch={startSearch} />
        </div>
    </FilterLayout>
}

export default CategorySearch

const buttonClasses = "text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-1 text-center me-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800 h-8"
const buttonActiveClasses = "font-bold !text-white !bg-blue-800 !fill-white"
const toggleButtonHoverClasses = "hover:!text-blue-800 hover:!bg-white hover:!fill-blue-800"

const PDFIcon = () =>
    <svg height="25px" width="25px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 309.267 309.267" xmlSpace="preserve">
        <g>
            <path fill="#E2574C" d="M38.658,0h164.23l87.049,86.711v203.227c0,10.679-8.659,19.329-19.329,19.329H38.658c-10.67,0-19.329-8.65-19.329-19.329V19.329C19.329,8.65,27.989,0,38.658,0z" />
            <path fill="#B53629" d="M289.658,86.981h-67.372c-10.67,0-19.329-8.659-19.329-19.329V0.193L289.658,86.981z" />
            <path fill="#FFFFFF" d="M217.434,146.544c3.238,0,4.823-2.822,4.823-5.557c0-2.832-1.653-5.567-4.823-5.567h-18.44c-3.605,0-5.615,2.986-5.615,6.282v45.317c0,4.04,2.3,6.282,5.412,6.282c3.093,0,5.403-2.242,5.403-6.282v-12.438h11.153c3.46,0,5.19-2.832,5.19-5.644c0-2.754-1.73-5.49-5.19-5.49h-11.153v-16.903C204.194,146.544,217.434,146.544,217.434,146.544zM155.107,135.42h-13.492c-3.663,0-6.263,2.513-6.263,6.243v45.395c0,4.629,3.74,6.079,6.417,6.079h14.159c16.758,0,27.824-11.027,27.824-28.047C183.743,147.095,173.325,135.42,155.107,135.42z M155.755,181.946h-8.225v-35.334h7.413c11.221,0,16.101,7.529,16.101,17.918C171.044,174.253,166.25,181.946,155.755,181.946z M106.33,135.42H92.964c-3.779,0-5.886,2.493-5.886,6.282v45.317c0,4.04,2.416,6.282,5.663,6.282s5.663-2.242,5.663-6.282v-13.231h8.379c10.341,0,18.875-7.326,18.875-19.107C125.659,143.152,117.425,135.42,106.33,135.42z M106.108,163.158h-7.703v-17.097h7.703c4.755,0,7.78,3.711,7.78,8.553C113.878,159.447,110.863,163.158,106.108,163.158z" />
        </g>
    </svg>

const HindiIcon = () =>
    <svg height="25px" width="25px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
            d="m20.022 3h-5a1 1 0 0 0 0 2h1.5v6h-4.94992a4.95124 4.95124 0 0 0 1.02558-3 5 5 0 0 0 -9.33008-2.5.99974.99974 0 1 0 1.73142 1 3.00021 3.00021 0 1 1 2.59866 4.5 1 1 0 0 0 0 2 3 3 0 1 1 -2.59866 4.5.99974.99974 0 0 0 -1.73144 1 5 5 0 0 0 9.3301-2.5 4.95124 4.95124 0 0 0 -1.02558-3h4.94992v7a1 1 0 0 0 2 0v-15h1.5a1 1 0 0 0 0-2z" />
    </svg>
