import { Button, Input } from "@material-tailwind/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Datepicker from "react-tailwindcss-datepicker"
import { useTheme } from "@/context";
import { getGrievancesUsingRegNos, getCategoryTree } from "@/services/rca";
import ReactApexChart from "react-apexcharts";
import { ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { defaultFrom, defaultTo, pageSize } from "@/helpers/env";
import GrievanceList from "@/widgets/grievance/list";
import { toast } from "react-toastify";
import Autosuggest from "react-autosuggest";
import stateList from "@/data/state-data"

import './css/autosuggest-theme.css'
import './css/categorical-tree.css'
import { departmentData, getDefaultDepartment, getDepartmentList } from "@/data";
import { endOfMonth, endOfQuarter, lastDayOfYear, setDayOfYear, startOfMonth, startOfQuarter, subMonths, subQuarters, subYears } from "date-fns";

export const CategoricalTree = () => {
    const [rca, setRca] = useState({})
    const [appendPath, setAppendPath] = useState(null)
    const [rcaPath, setRcaPath] = useState([])
    const [filters, setFilters] = useState({
        from: defaultFrom,
        to: defaultTo,
        state: 'All',
        district: 'All',
        ministry: getDefaultDepartment(),
        showAll: true
    })
    const [searching, setSearching] = useState(true)

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

    useEffect(() => {
        async function load() {
            let response = await getCategoryTree(filters).catch(console.log)

            if (response?.data && Object.keys(response?.data).length > 0) {
                setRcaPath([])
                setRca(generateTreeFromRca(response.data, 'Root'))
            }
            else
                toast("No data found!", { type: 'error' })
            setSearching(false)
        }

        if (searching) {
            load()
        }
    }, [searching])

    useEffect(() => {
        if (appendPath != null) {
            let new_path = [...rcaPath, appendPath]

            if (currentBranch(new_path))
                setRcaPath(new_path)

            setAppendPath(null)
        }
    }, [appendPath])

    return (
        <div>
            <Filters
                filters={filters}
                setFilters={setFilters}
                searching={searching}
                startSearch={() => setSearching(true)}
            />

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
    )
}

export const DEFAULT_STATE_DISTRICT = {
    text: '',
    values: {
        state: 'All',
        district: 'All'
    }
}

export const DEFAULT_MINISTRY = {
    text: '',
    value: getDefaultDepartment()
}

export const Filters = ({
    filters,
    setFilters,
    searching,
    startSearch = () => '',
    CustomActionButton = null
}) => {
    const [dateRange, setDateRange] = useState({
        startDate: filters.from,
        endDate: filters.to
    });
    const [stateDistrict, setStateDistrict] = useState(DEFAULT_STATE_DISTRICT)
    const [ministry, setMinistry] = useState(DEFAULT_MINISTRY)

    useEffect(() => {
        setFilters({
            ...filters,
            from: dateRange.startDate,
            to: dateRange.endDate,
            ...(
                stateDistrict?.values ?? DEFAULT_STATE_DISTRICT.values
            ),
            ministry: ministry?.value ?? DEFAULT_MINISTRY.value
        })
    }, [dateRange, stateDistrict, ministry])

    return (
        <div className="grid md:grid-cols-4 xl:grid-cols-7 gap-3">
            <div className="col-span-2">
                <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                />
            </div>

            <div className="col-span-2">
                <MinistryAutocomplete ministry={ministry} setMinistry={setMinistry} />
            </div>

            <div className="col-span-2">
                <StateDistrictAutocomplete stateDistrict={stateDistrict} setStateDistrict={setStateDistrict} />
            </div>

            <div className="col-span-2 xl:col-span-1 flex flex-col md:flex-row md:justify-end">
                {
                    CustomActionButton
                    ?? <Button
                        className="h-[2.6rem] flex justify-center items-center"
                        onClick={startSearch}
                        disabled={searching}
                    >
                        {
                            searching &&
                            <Loader className="mr-2 animate-spin" color="#fff" />
                        }

                        Search
                    </Button>
                }
            </div>

            {/* <AutocompleteField
                label="Test label"
                {...frontendProps}
                name={nameWithMultipleValues}
                allowMultiple={true}
            /> */}
        </div>
    )
}

export const Chart = ({
    series,
    pushPath
}) => {

    const childClick = (e, p, opts) => {
        if (opts.dataPointIndex != -1)
            pushPath(opts.dataPointIndex)
    }

    const options = {
        legend: {
            show: false
        },
        chart: {
            height: 250,
            type: 'treemap',
            toolbar: {
                show: false
            },
            events: {
                click: childClick
            }
        },
        dataLabels: {
            enabled: true,
            style: {
                fontSize: '12px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 'bold',
                colors: ['#fff']
            },
            background: {
                enabled: true,
                foreColor: '#fff',
                padding: 4,
                borderRadius: 2,
                borderWidth: 1,
                borderColor: '#fff',
                opacity: 0.9
            }
        },
        colors: [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
            '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
            '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'
        ],
        plotOptions: {
            treemap: {
                enableShades: true,
                shadeIntensity: 0.5,
                reverseNegativeShade: true,
                colorScale: {
                    ranges: [{
                        from: 0,
                        to: 0,
                        color: '#CD363A'
                    }]
                }
            }
        },
        tooltip: {
            enabled: true,
            theme: 'light',
            style: {
                fontSize: '12px',
                fontFamily: 'Helvetica, Arial, sans-serif'
            },
            fixed: {
                enabled: true,
                position: 'topRight',
                offsetX: 0,
                offsetY: 0,
            },
            custom: function({series, seriesIndex, dataPointIndex, w}) {
                const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
                return `<div style="padding: 8px; background: white; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <strong style="color: #1f2937;">${data.x}</strong><br/>
                    <span style="color: #6b7280;">Count: ${data.y}</span>
                </div>`;
            }
        }
    }

    return (
        <>
            {
                series[0]?.data?.length > 0 && series[0].data[0].x &&
                <div id="chart" className="border-2 border-black pb-1 rounded-lg border-sky treemap-fitting relative mt-4">
                    <ReactApexChart
                        options={options}
                        series={series}
                        type={options.chart.type}
                        height={(series[0]?.data?.length > 0) ? options.chart.height : 10}
                        className="test"
                    />
                </div>
            }
        </>
    )
}

export const BreadCrumbs = ({
    list,
    setPathLength
}) => {
    return (
        <div className="flex mt-3 justify-between align-center gap-4 mx-4">
            <div className="pathbox">
                <div className="flex flex-wrap">
                    {
                        list.slice(0, list.length - 1).map((step, key) =>
                            <div className="flex cursor-pointer" key={key} onClick={() => setPathLength(key)}>
                                <div className="text-blue-900 text-sm">{step}</div> <ChevronRightIcon color="#2254fa" width={18} />
                            </div>
                        )
                    }
                </div>
                <div className="text-lg font-bold text-blue-900 whitespace-break-spaces">
                    {list[list.length - 1]?.replace(/,/g, ', ')}
                </div>
            </div>
        </div>
    )
}

export const GrievanceListBox = ({
    reg_nos
}) => {
    const [grievances, setGrievances] = useState([])
    const [pageno, setPageno] = useState(1)
    const [first, setFirst] = useState(true)
    const [searching, setSearching] = useState(false)

    const getGrievances = useCallback(() => {
        let from = (pageno - 1) * pageSize
        let to = from + pageSize

        setSearching(true)

        getGrievancesUsingRegNos(reg_nos?.slice(from, to))
            .then(response => {
                setGrievances(Object.values(response.data.data))
            })
            .finally(() => setSearching(false))
    }, [reg_nos, pageno])

    useEffect(() => {
        if (pageno != 1)
            setPageno(1)
        else
            getGrievances()
    }, [reg_nos])

    useEffect(() => {
        if (first)
            setFirst(false)
        else
            getGrievances()
    }, [pageno])

    return (
        <GrievanceList
            titleBarHidden={true}
            grievances={grievances}
            pageno={pageno}
            setPageno={setPageno}
            count={reg_nos.length > pageSize ? pageSize : reg_nos.length}
            total={reg_nos.length}
            scrollH={'80vh'}
            searching={searching}
        />
    )
}

export const StateDistrictAutocomplete = ({
    stateDistrict,
    setStateDistrict
}) => {
    return (
        <Autocomplete
            options={getStateDistrictOptions()}
            value={stateDistrict}
            onChange={setStateDistrict}
            placeholder="Enter State or District"
            title={"State > District"}
        />
    )
}

export const MultipleMinistryAutocomplete = ({
    ministry,
    setMinistry,
    className = ''
}) => {
    const { isDarkMode } = useTheme();
    const [multipleMinistry, setMultipleMinistry] = useState([])
    // const multipleTitle = useMemo(() => `Ministry${multipleMinistry.length > 0 ? `: ${multipleMinistry.map(({ value }) => value).join(',')}` : ''}`, [multipleMinistry])
    const [value, setValue] = useState(ministry)

    const addMultipleMinistry = (ministry) => {
        if (ministry && ministry.value) {
            if (multipleMinistry.findIndex(({ value }) => value == ministry.value) == -1) {
                if (ministry.value != 'All')
                    setMultipleMinistry([...multipleMinistry, ministry])

                setValue({
                    text: '',
                    value: 'All'
                })
            }
        }
    }

    const removeMinistry = (index) => {
        setMultipleMinistry([...multipleMinistry.slice(0, index), ...multipleMinistry.slice(index + 1)])
    }

    useEffect(() => {
        const ministries = multipleMinistry
            .filter((ministry) => (ministry?.text?.length > 0 && ministry?.value && ministry?.value?.length > 0))
            .map(({ value }) => value).join(',')

        setMinistry({
            text: '',
            value: ministries.length > 0 ? ministries : 'All'
        })
    }, [multipleMinistry])

    // useEffect(() => {
    //     if (ministry.value && ministry.value.length > 0) {
    //         setMultipleMinistry(
    //             ministry.value.split(',').map((minis) => ({
    //                 text: '',
    //                 value: minis
    //             }))
    //         )
    //     }
    // }, [ministry])

    return (
        <div className="relative">
            <div className="absolute -top-6 left-0 flex gap-2 z-10 overflow-scroll w-[100%] scrollbar-none scrollbar-thumb-rounded scrollbar-thumb-gray-500 scrollbar-track-gray-300">
                {
                    multipleMinistry
                        // .filter(({ value, text }) => text.length > 0 && value.length > 0)
                        .map(({ value }, index) =>
                            <div className={`${isDarkMode ? 'bg-red-900 border-red-600 text-red-100' : 'bg-red-50 border-red-300'} rounded-full text-sm border px-1 group flex gap-1 items-center select-none cursor-default`} key={index}>
                                {value}

                                <XMarkIcon height={'1rem'} width={'1rem'} className="hidden group-hover:block cursor-pointer" onClick={() => removeMinistry(index)} />
                            </div>
                        )
                }
            </div>

            <Autocomplete
                options={getMinistryOptions()}
                value={value}
                onChange={addMultipleMinistry}
                placeholder="Enter Ministry"
                title={'Ministry'}
                className={className}
            />
        </div>
    )
}

export const MinistryAutocomplete = ({
    ministry,
    setMinistry,
    className = ''
}) => {
    return (
        <Autocomplete
            options={getMinistryOptions()}
            value={ministry}
            onChange={setMinistry}
            placeholder="Enter Ministry"
            title="Ministry"
            className={className}
        />
    )
}

export const Autocomplete = ({
    options,
    value,
    onChange,
    placeholder,
    title,
    className = '',
    xMarkClassName = ''
}) => {
    const { isDarkMode } = useTheme();
    const [suggestions, setSuggestions] = useState([])
    const [inputValue, setInputValue] = useState(value)

    const updateSuggestions = async (search) => {
        if (typeof search == 'string') {
            // search = (typeof search == 'string') ? search : search.text
            search = search.toLowerCase().trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

            let new_suggestions = []
            if (options instanceof Function) {
                new_suggestions = await options(search)
            }
            else {
                new_suggestions = options.filter(option => textIncludes(option.text, search))

                const alternate_suggestions = getAlternateSuggestions(options, search)

                new_suggestions = appendNonRepeatingSuggestions(new_suggestions, alternate_suggestions)
            }

            setSuggestions([...new_suggestions])
        }

        // Starts With, Includes Search and exact search for the entire search and then the words in the search
    }

    const clearInput = () => {
        setInputValue('')
        onChange(undefined)
    }

    const shouldRenderSuggestions = value => typeof value != 'object'

    useEffect(() => {
        setInputValue(value ?? '')
    }, [value])

    return (
        <div className={`relative w-full font-autosuggest z-[20] ${className}`}>
            <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={async ({ value }) => await updateSuggestions(value)}
                onSuggestionsClearRequested={() => setSuggestions([])}
                getSuggestionValue={suggestion => suggestion}
                renderSuggestion={suggestion => <div>{capitalize(suggestion.text)}</div>}
                shouldRenderSuggestions={shouldRenderSuggestions}
                inputProps={{
                    value: capitalize(((typeof inputValue == 'string') ? inputValue : inputValue?.text) ?? ''),
                    onChange: async (e, { newValue }) => {
                        if (typeof newValue == 'object')
                            onChange(newValue)
                        else if (typeof newValue == 'string')
                            onChange({
                                text: newValue
                            })
                        else
                            onChange(undefined)

                        setInputValue(newValue)
                    },
                    placeholder: placeholder,
                    spellCheck: false,
                    onBlur: () => {
                        if (typeof stateDistrict == 'string')
                            onChange(DEFAULT_STATE_DISTRICT)
                    }
                }}
            />

            {
                title &&
                <label className={`absolute text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} duration-300 transform -translate-y-4 translate-x-2 border-t-2 border-[#aaa] rounded-full scale-75 top-2 z-1 origin-[0] ${isDarkMode ? 'bg-blue-gray-900' : 'bg-white'} px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 select-none`}>
                    {title}
                </label>
            }

            {
                value != '' &&
                <label
                    className={`absolute text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} duration-300 transform rounded-full top-2 right-1 scale-90 z-1 origin-[0] ${isDarkMode ? 'bg-blue-gray-900' : 'bg-white'} px-2 start-1 select-none cursor-pointer`}
                    onClick={clearInput}
                >
                    <XMarkIcon height={'1.53rem'} className={xMarkClassName} fill={isDarkMode ? "#9ca3af" : "#ccc"} />
                </label>
            }

        </div>
    )
}

export const DateRangePicker = ({
    value,
    onChange,
    shortPopup = false
}) => {
    const { isDarkMode } = useTheme();
    
    // Force update datepicker styles when theme changes
    useEffect(() => {
        if (isDarkMode) {
            // Apply dark theme styles to any existing datepicker popups
            const timer = setTimeout(() => {
                const popups = document.querySelectorAll('[role="dialog"], div[style*="position: absolute"], div[class*="z-"][class*="absolute"]');
                popups.forEach(popup => {
                    if (popup.textContent?.includes('Today') || popup.textContent?.includes('Yesterday') || popup.querySelector('button')) {
                        popup.style.backgroundColor = '#1e293b';
                        popup.style.borderColor = '#374151';
                        popup.style.color = 'white';
                        
                        const elements = popup.querySelectorAll('*');
                        elements.forEach(el => {
                            el.style.color = 'white';
                        });
                        
                        const buttons = popup.querySelectorAll('button');
                        buttons.forEach(btn => {
                            btn.style.color = 'white';
                            btn.addEventListener('mouseenter', () => {
                                btn.style.backgroundColor = '#374151';
                            });
                            btn.addEventListener('mouseleave', () => {
                                btn.style.backgroundColor = 'transparent';
                            });
                        });
                    }
                });
            }, 100);
            
            return () => clearTimeout(timer);
        }
    }, [isDarkMode]);
    
    // Add custom styles for dark theme
    const darkModeStyles = isDarkMode ? `
        <style>
            body.dark div[class*="bg-white"],
            body.dark .bg-white,
            html.dark div[class*="bg-white"],
            html.dark .bg-white {
                background-color: #1e293b !important;
            }
            
            body.dark div[class*="text-gray"],
            body.dark .text-gray-900,
            html.dark div[class*="text-gray"],
            html.dark .text-gray-900 {
                color: white !important;
            }
            
            body.dark [role="dialog"] *,
            html.dark [role="dialog"] * {
                color: white !important;
            }
            
            body.dark [role="dialog"],
            html.dark [role="dialog"] {
                background-color: #1e293b !important;
                border-color: #374151 !important;
            }
            
            body.dark [role="dialog"] button:hover,
            html.dark [role="dialog"] button:hover {
                background-color: #374151 !important;
            }
        </style>
    ` : '';
    
    return (
        <div className="relative w-full">
            {isDarkMode && (
                <div dangerouslySetInnerHTML={{ __html: darkModeStyles }} />
            )}
            <Datepicker
                value={value}
                onChange={onChange}
                placeholder="Select Date Range*"
                inputId="DateRange"
                displayFormat="D MMM, YY"
                showShortcuts={true}
                configs={{
                    shortcuts: dateRangeShortcuts
                }}
                containerClassName={`relative w-full ${isDarkMode ? 'text-white' : 'text-gray-700'} input-date child-font-bold ${shortPopup && 'short-popup'} z-[100]`}
                readOnly={true}
                maxDate={new Date()}
                useRange={false}
                popoverDirection="down"
            />

            <label className={`absolute text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} duration-300 transform -translate-y-4 translate-x-2 border-t-2 border-[#aaa] rounded-full scale-75 top-2 z-[101] origin-[0] ${isDarkMode ? 'bg-blue-gray-900' : 'bg-white'} px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 select-none`}>
                Date Range
            </label>
        </div>
    )
}


export const generateTreeFromRca = (rca_object, title) => {
    let reg_nos = rca_object?.registration_no ?? []
    let branch = {
        reg_nos: reg_nos,
        count: reg_nos.length,
        title: title.trim(),
        children: []
    }

    for (let branch_title in rca_object) {
        if (!['count', 'registration_no'].includes(branch_title)) {
            let child_tree = generateTreeFromRca(rca_object[branch_title], branch_title)

            branch.reg_nos = [...branch.reg_nos, ...child_tree.reg_nos]
            branch.count += child_tree.reg_nos.length
            branch.children.push(child_tree)
        }
    }

    return branch
}

export const getBreadCrumbs = (tree, path = []) => [
    tree.title,
    ...(
        path.length > 0
            ? getBreadCrumbs(tree.children[path[0]], path.slice(1))
            : []
    )
]

export const capitalize = sentence => {
    // Only log non-empty sentences for debugging
    if (sentence && sentence.trim()) {
        console.log(sentence)
    }
    return sentence?.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase() ?? letter)
}


const getStateDistrictOptions = () => {
    let states = Object.keys(stateList)

    let state_options = states.map(state => ({
        text: state,
        values: {
            state: state,
            district: 'All'
        }
    }))

    let district_options = states.reduce((options, state) => {
        return [
            ...options,
            ...stateList[state].map(district => ({
                text: `${state} > ${district}`,
                values: {
                    state: state,
                    district: district
                }
            }))
        ]
    }, [])

    return [
        ...state_options,
        ...district_options
    ]
}

const getMinistryOptions = () => getDepartmentList().map(department => ({
    text: department.label,
    value: department.value
}))

export const textIncludes = (text, search) => text.toLowerCase().trim().includes(search)

// Count the occurnace of a search/word in a string
export const countOccurance = (text, search) => text.match(new RegExp(search, 'g'))?.length ?? 0

const getAlternateSuggestions = (options, search) => {
    let alternates = options.reduce((alternates, option) => {
        search.split(' ').forEach(word => {
            let occurances = countOccurance(option.text, word)

            if (occurances > 0) {
                if (alternates[option.text] == undefined)
                    alternates[option.text] = 0
                alternates[option.text] += occurances
            }
        })

        return alternates
    }, {})

    // Sorting from heighest to lowest occurances
    let alternate_texts = Object.keys(alternates)
        .sort((a, b) => alternates[b] - alternates[a])

    return alternate_texts.map(alternate_text =>
        options.find(option => option.text == alternate_text)
    )
}

const appendNonRepeatingSuggestions = (primary_suggestions, secondary_suggestions) => [
    ...primary_suggestions,
    ...secondary_suggestions
        .filter(secondary =>
            primary_suggestions
                .find(primary =>
                    primary.text == secondary.text
                )
            == undefined
        )
]

export const Loader = ({
    color = "#2196f3",
    className = "",
    height = "20px"
}) =>
    <div className={className}>
        <svg width={height} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12 3C10.22 3 8.47991 3.52784 6.99987 4.51677C5.51983 5.50571 4.36628 6.91131 3.68509 8.55585C3.0039 10.2004 2.82567 12.01 3.17294 13.7558C3.5202 15.5016 4.37737 17.1053 5.63604 18.364C6.89472 19.6226 8.49836 20.4798 10.2442 20.8271C11.99 21.1743 13.7996 20.9961 15.4442 20.3149C17.0887 19.6337 18.4943 18.4802 19.4832 17.0001C20.4722 15.5201 21 13.78 21 12"
                stroke={color} strokeWidth="2" strokeLinecap="round" />
            <path d="M19.7942 7.5C19.8905 7.66673 19.9813 7.83651 20.0667 8.00907" stroke={color} strokeWidth="2"
                strokeLinecap="round" />
        </svg>
    </div>

const dateRangeShortcuts = {
    today: "Today",
    yesterday: "Yesterday",
    past: period => `Last ${period} Days`,
    currentMonth: "This Month",
    pastMonth: "Last Month",
    last2Months: {
        text: "Last 2 Months",
        period: {
            start: startOfMonth(subMonths(new Date(), 2)),
            end: endOfMonth(subMonths(new Date(), 1))
        }
    },
    last3Months: {
        text: "Last 3 Months",
        period: {
            start: startOfMonth(subMonths(new Date(), 3)),
            end: endOfMonth(subMonths(new Date(), 1))
        }
    },
    last4Months: {
        text: "Last 4 Months",
        period: {
            start: startOfMonth(subMonths(new Date(), 4)),
            end: endOfMonth(subMonths(new Date(), 1))
        }
    },
    last6Months: {
        text: "Last 6 Months",
        period: {
            start: startOfMonth(subMonths(new Date(), 6)),
            end: endOfMonth(subMonths(new Date(), 1))
        }
    },
    thisQuarter: {
        text: "This Quarter",
        period: {
            start: startOfQuarter(new Date()),
            end: endOfQuarter(new Date())
        }
    },
    lastQuarter: {
        text: "Last Quarter",
        period: {
            start: startOfQuarter(subQuarters(new Date(), 1)),
            end: endOfQuarter(subQuarters(new Date(), 1))
        }
    },
    thisYear: {
        text: "This Year",
        period: {
            start: setDayOfYear(new Date(), 1),
            end: lastDayOfYear(new Date())
        }
    },
    lastYear: {
        text: "Last Year",
        period: {
            start: setDayOfYear(subYears(new Date(), 1), 1),
            end: lastDayOfYear(subYears(new Date(), 1))
        }
    }
}
