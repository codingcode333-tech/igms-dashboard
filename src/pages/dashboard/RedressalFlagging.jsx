import { defaultFrom, defaultTo } from "@/helpers/env";
import { DEFAULT_MINISTRY, DEFAULT_STATE_DISTRICT, DateRangePicker, Loader, MinistryAutocomplete, StateDistrictAutocomplete, capitalize, countOccurance, textIncludes } from "./CategoricalTree";
import { Button, Dialog, DialogBody, DialogFooter, DialogHeader, Input, Typography } from "@material-tailwind/react";
import { useEffect, useState } from "react";

import categoricalTree from '@/data/json/categorical_tree.json'
import Autosuggest from "react-autosuggest";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { getFlaggingData, getRedressalFlags } from "@/services/redressal";
import { HeatMap2 } from "@/widgets/maps/heatmap/HeatMap2";
import { createStateWiseArray } from "./SpatialSearch";
import { toast } from "react-toastify";
import { formatDate } from "@/helpers/date";
import { Modal } from "@/widgets/grievance/modal";
import GrievancesRoutes, { getClosureDetails } from "@/services/grievances";

export function RedressalFlagging() {
    const [searching, setSearching] = useState(false)
    const [filters, setFilters] = useState({
        from: defaultFrom,
        to: defaultTo,
        state: 'All',
        district: 'All',
        ministry: 'All',
        query: ''
    })
    const [ready, setReady] = useState(false)

    const [grievances, setGrievances] = useState([])
    const [lowerOutlier, setLowerOutlier] = useState([])
    const [upperOutlier, setUpperOutlier] = useState([])
    const [displayTypes, setDisplayTypes] = useState(['lower', 'upper'])
    const [averageRedressalTime, setAverageRedressalTime] = useState('')
    const [stateWiseRanking, setStateWiseRanking] = useState({})
    const [districtWiseRanking, setDistrictWiseRanking] = useState({})
    const [selectedStateForRanking, setSelectedStateForRanking] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [grievaneListData, setGrievanceListData] = useState(null)
    const [cache, setCache] = useState({})

    const search = () => {
        if (filters.query || filters.ministry) {
            setStateWiseRanking({})
            setAverageRedressalTime('')

            getRedressalFlags({
                ...filters,
                all_record: 1,
                distribution: 'state'
            })
                .then(response => {
                    if (typeof response.data == 'string') {
                        toast.error(response.data)
                        return
                    }

                    setLowerOutlier(createStateWiseArray(response.data.lower_outlier))
                    setUpperOutlier(createStateWiseArray(response.data.upper_outlier))
                    setAverageRedressalTime(response.data.average_time_days)
                    setStateWiseRanking(response.data.redressal_efficacy_ranking)
                    // setGrievances(createStateWiseArray(response.data.lower_outlier))
                })
                .finally(() => {
                    setSearching(false)
                    setReady(true)
                })
        }
    }

    const searchDistrictWiseRanking = () => {
        getRedressalFlags({
            ...filters,
            all_record: 1,
            state: selectedStateForRanking,
            distribution: 'district'
        })
            .then(response => {
                setDistrictWiseRanking(response.data)
                // setGrievances(createStateWiseArray(response.data.lower_outlier))
            })
    }

    const handleOpen = () => {
        if (isOpen) {
            setCache({
                ...cache,
                ranking: districtWiseRanking,
                state: selectedStateForRanking
            })

            setDistrictWiseRanking({})
            setSelectedStateForRanking('')
        }

        setIsOpen(!isOpen)
    }

    const showFlaggingData = async (district) => {
        console.log(
            await getFlaggingData(
                filters.query ? 'dynamic' : 'ministry',
                selectedStateForRanking,
                district
            ).then(({ data: grievances }) => {
                if (typeof grievances == 'string') {
                    toast.error(grievances)
                    return
                }

                setGrievanceListData({
                    state: selectedStateForRanking,
                    district,
                    grievances
                })
            })
        )
    }

    useEffect(() => {
        if (searching)
            search()
    }, [searching])

    // useEffect(() => {
    //     if (lowerOutlier.length == 0 && ready)
    //         toast.warn("No Grievance with Early Redressal found.")
    // }, [lowerOutlier, ready])

    // useEffect(() => {
    //     if (upperOutlier.length == 0 && ready)
    //         toast.warn("No Grievance with Late Redressal found.")
    // }, [upperOutlier, ready])

    useEffect(() => {
        if (selectedStateForRanking)
            searchDistrictWiseRanking()
    }, [selectedStateForRanking])

    return <div>
        <Filters
            filters={filters}
            setFilters={setFilters}
            searching={searching}
            startSearch={() => setSearching(true)}
            stateWiseRanking={stateWiseRanking}
            showRanking={() => setIsOpen(true)}
            averageRedressalTime={averageRedressalTime}
        />

        <div className="flex justify-between my-2 items-end">
        </div>

        <div className={``}>
            <div className="flex">
                <button type="button"
                    className={`${buttonClasses} !ring-0 fill-blue-700 px-2 h-8 rounded-r-none ${displayTypes.includes('lower') ? buttonActiveClasses : toggleButtonHoverClasses}`}
                    // onClick={() => displayTypes.includes('lower') ? setDisplayTypes(displayTypes.filter(type => type != 'lower')) : setDisplayTypes([...displayTypes, 'lower'])}
                    title="Search Subject Content"
                >
                    Early Redressal
                </button>

                <button type="button"
                    className={`${buttonClasses} !ring-0 fill-blue-700 px-2 h-8 rounded-l-none border-l-0 ${displayTypes.includes('upper') ? buttonActiveClasses : toggleButtonHoverClasses}`}
                    // onClick={() => displayTypes.includes('upper') ? setDisplayTypes(displayTypes.filter(type => type != 'upper')) : setDisplayTypes([...displayTypes, 'upper'])}
                    title="Search PDF Content"
                >
                    Late Redressal
                </button>
            </div>
        </div>

        <div className="flex gap-2">
            {/* {
                displayTypes.includes('lower') &&
                lowerOutlier.length > 0 && */}
            <div className="w-1/2 h-[80vh]">
                <HeatMap2
                    grievances={lowerOutlier}
                    className={"rounded-b-md"}
                    getDistricts={() => ''}
                    legendSuffix="%"
                    noFocus={true}
                />
            </div>
            {/* } */}

            {/* {
                displayTypes.includes('upper') &&
                upperOutlier.length > 0 && */}
            <div className="w-1/2 h-[80vh]">
                <HeatMap2
                    grievances={upperOutlier}
                    className={"rounded-b-md"}
                    getDistricts={() => ''}
                    legendSuffix="%"
                    noFocus={true}
                />
            </div>
            {/* } */}
        </div>

        <Dialog open={isOpen} handler={handleOpen} size="lg">
            <DialogHeader className="flex justify-between">
                <div>Efficacy Ranking with their location-level z-scores</div>
                <XMarkIcon height={'1rem'} width={'1rem'} onClick={handleOpen} className="cursor-pointer select-none" />
            </DialogHeader>
            <DialogBody className="grid grid-cols-2">
                {
                    Object.keys(stateWiseRanking).length > 0 &&
                    <div className="font-bold">States</div>
                }

                <div>
                    {
                        Object.keys(districtWiseRanking).length > 0 &&
                        <div className="font-bold ml-4">Districts ({capitalize(selectedStateForRanking)})</div>
                    }
                </div>

                <div className="h-[80vh] overflow-scroll">
                    {
                        Object.keys(stateWiseRanking).map(state =>
                            <div
                                onClick={() => setSelectedStateForRanking(state)}
                                className={`${state == selectedStateForRanking ? 'text-red-300' : ''} hover:text-red-300 cursor-pointer`}
                            >
                                {capitalize(state) + `(${stateWiseRanking[state]})` + (state == selectedStateForRanking ? ' >>' : '')}
                            </div>
                        )
                    }
                </div>

                <div className="h-[80vh] overflow-scroll ml-4">
                    {
                        Object.keys(districtWiseRanking).map(district =>
                            <div
                                className={`text-red-300 cursor-pointer`}
                                onClick={() => showFlaggingData(district)}
                            >
                                {capitalize(district) + `(${districtWiseRanking[district]})`}
                            </div>
                        )
                    }
                </div>
            </DialogBody>
        </Dialog>

        <GrievanceListDialog
            state={grievaneListData?.state ?? ''}
            district={grievaneListData?.district ?? ''}
            grievances={grievaneListData?.grievances ?? []}
            isOpen={grievaneListData}
            handleOpen={() => {
                setGrievanceListData(null);

                setTimeout(() => {
                    setSelectedStateForRanking(cache?.state ?? selectedStateForRanking)

                    setDistrictWiseRanking(cache?.ranking ?? districtWiseRanking)

                    setIsOpen(true)
                }, 10)
            }}
        />
    </div>
}

export const Filters = ({
    filters,
    setFilters,
    searching,
    startSearch = () => '',
    CustomActionButton = null,
    stateWiseRanking,
    showRanking = () => '',
    averageRedressalTime
}) => {
    const [dateRange, setDateRange] = useState({
        startDate: filters.from,
        endDate: filters.to
    });
    const [stateDistrict, setStateDistrict] = useState(DEFAULT_STATE_DISTRICT)
    const [ministry, setMinistry] = useState(DEFAULT_MINISTRY)
    const [node1, setNode1] = useState('')
    const [node2, setNode2] = useState('')
    const [node3, setNode3] = useState('')
    const [query, setQuery] = useState('')

    const [ready, setReady] = useState(false)

    useEffect(() => {
        if (ready)
            setFilters({
                ...filters,
                ...dateRange,
                ...(
                    stateDistrict?.values ?? DEFAULT_STATE_DISTRICT.values
                ),
                ministry: ministry?.value ?? DEFAULT_MINISTRY.value,
                // querycategory: `${node1}${node2 ? `, ${node2}${node3 ? `, ${node3}` : ''}` : ''}`
                query
            })
        else
            setReady(true)
    }, [dateRange, stateDistrict, ministry, query])

    // useEffect(() => setNode2(''), [node1])
    // useEffect(() => setNode3(''), [node2])

    return (
        <div className="grid md:grid-cols-3 gap-3">
            <div className="col-span-1">
                <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                />
            </div>

            <div className="col-span-1">
                <MinistryAutocomplete ministry={ministry} setMinistry={setMinistry} />
            </div>

            <div className="col-span-1">
                <StateDistrictAutocomplete stateDistrict={stateDistrict} setStateDistrict={setStateDistrict} />
            </div>

            <div className="col-span-1">
                <Input
                    type="text"
                    label="Search Query"
                    value={query}
                    className="bg-white-input basic-input font-bold"
                    onChange={({ target: { value } }) => setQuery(value)}
                    autoFocus
                />
                {/* <TreeAutocomplete value={node1} onChange={setNode1} options={Object.keys(categoricalTree)} placeholder={"Enter text to search inside it"} title={"Categories"} /> */}
            </div>

            <div className="col-span-2 flex flex-row-reverse justify-start items-end gap-2">
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

                {
                    Object.keys(stateWiseRanking).length > 0 &&
                    <button type="button" disabled={searching}
                        onClick={showRanking} className="text-white bg-blue-400 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-0 h-[2.5rem] me-2 focus:outline-none">
                        Show Efficacy Ranking
                    </button>
                }

                {
                    averageRedressalTime != '' && !searching &&
                    <div>Average Redressal Time: {averageRedressalTime} day{averageRedressalTime > 1 ? 's' : ''}</div>
                }
            </div>

            {/* {
                categoricalTree[node1] &&
                (Object.keys(categoricalTree[node1]).length > 0) &&
                <>
                    <div className="col-span-2">
                        <TreeAutocomplete value={node2} onChange={setNode2} options={Object.keys(categoricalTree[node1])} placeholder={"Enter text to search inside it"} title={""} />
                    </div>

                    {
                        categoricalTree[node1][node2] &&
                        (Object.keys(categoricalTree[node1][node2]).length > 0) &&
                        <div className="col-span-2">
                            <TreeAutocomplete value={node3} onChange={setNode3} options={Object.keys(categoricalTree[node1][node2])} placeholder={"Enter text to search inside it"} title={""} />
                        </div>
                    }
                </>
            } */}

            {/* <AutocompleteField
                label="Test label"
                {...frontendProps}
                name={nameWithMultipleValues}
                allowMultiple={true}
            /> */}
        </div>
    )
}

const TreeAutocomplete = ({
    options,
    value,
    onChange,
    placeholder,
    title
}) => {
    const [suggestions, setSuggestions] = useState([])
    const [defaultValue,] = useState(value)
    const [inputValue, setInputValue] = useState(value)

    const updateSuggestions = (search) => {
        if (typeof search == 'string') {
            // search = (typeof search == 'string') ? search : search.text
            search = search.toLowerCase().trim()

            console.log(search, options)

            let new_suggestions = options.filter(option => textIncludes(option, search))

            let alternate_suggestions = getAlternateSuggestions(options, search)

            new_suggestions = appendNonRepeatingSuggestions(new_suggestions, alternate_suggestions)

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
        <div className="relative w-full font-autosuggest">
            <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={({ value }) => updateSuggestions(value)}
                onSuggestionsClearRequested={() => setSuggestions([])}
                getSuggestionValue={suggestion => suggestion}
                renderSuggestion={suggestion => <div>{capitalize(suggestion)}</div>}
                shouldRenderSuggestions={shouldRenderSuggestions}
                inputProps={{
                    value: capitalize(inputValue?.text ?? inputValue),
                    onChange: async (e, { newValue }) => {
                        if (typeof newValue == 'string')
                            onChange(newValue)
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
                <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 translate-x-2 border-t-2 border-[#aaa] rounded-full scale-75 top-2 z-1 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 select-none">
                    {title}
                </label>
            }

            {
                value != '' &&
                <label
                    className="absolute text-sm text-gray-500 duration-300 transform rounded-full top-2 right-1 scale-90 z-1 origin-[0] bg-white px-2 start-1 select-none cursor-pointer"
                    onClick={clearInput}
                >
                    <XMarkIcon height={'1.55rem'} fill="#ccc" />
                </label>
            }

        </div>
    )
}

const getAlternateSuggestions = (options, search) => {
    let alternates = options.reduce((alternates, option) => {
        search.split(' ').forEach(word => {
            let occurances = countOccurance(option, word)

            if (occurances > 0) {
                if (alternates[option] == undefined)
                    alternates[option] = 0
                alternates[option] += occurances
            }
        })

        return alternates
    }, {})

    // Sorting from heighest to lowest occurances
    let alternate_texts = Object.keys(alternates)
        .sort((a, b) => alternates[b] - alternates[a])

    return alternate_texts.map(alternate_text =>
        options.find(option => option == alternate_text)
    )
}

const appendNonRepeatingSuggestions = (primary_suggestions, secondary_suggestions) => [
    ...primary_suggestions,
    ...secondary_suggestions
        .filter(secondary =>
            primary_suggestions
                .find(primary =>
                    primary == secondary
                )
            == undefined
        )
]

const percentagify = distributionArray => {
    const total = distributionArray.reduce((sum, { count }) => sum + count, 0)

    return distributionArray.map(({ state, count }) => ({ state, count: ((count / total) * 100).toFixed(2) }))
}

const buttonClasses = "text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-1 text-center me-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800 h-8 w-1/2"
const buttonActiveClasses = "font-bold !text-white !bg-blue-800 !fill-white"
const toggleButtonHoverClasses = "hover:!text-blue-800 hover:!bg-white hover:!fill-blue-800"

const GrievanceListDialog = ({
    state,
    district,
    grievances,
    isOpen,
    handleOpen
}) => {
    const Columns = ['Registration No', 'Time Taken', 'Date Range', 'Score', 'Outlier']
    const className = `py-3 px-3 border-b border-blue-gray-50`;

    // Determine the text style based on the key
    const textStyle = "text-gray-800 font-normal"

    const limitDecimals = (number, limit = 2) => parseInt(number * (10 ** limit)) / (10 ** limit)

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalLoader, setModalLoading] = useState(false);
    const [grievancesDesc, setGrievancesDesc] = useState({});
    const [closureData, setClosureData] = useState(null)

    const handleOpenModal = async (G_id) => {
        setModalIsOpen(true);
        setModalLoading(true);
        loadModalData(G_id)
            .catch(() => {
                toast.error('There was an error. Please try again!')
                setModalIsOpen(false)
            })
            .finally(() => {
                setModalLoading(false)
            })
    };

    const loadModalData = (id) => {
        return GrievancesRoutes.descGrievance(id)
            .then(async response => {
                if (response.data.repeat == 2) {
                    response.data.parent = (await GrievancesRoutes.getRepeatParent(response.data.registration_no)).data.parent_registration_no
                }

                setGrievancesDesc(response.data)

                getClosureDetails(id)
                    .then((response) => {
                        // console.log(response)
                        setClosureData(response.data)
                        // setCurrentRNO(modalData?.registration_no)
                    })
            })
    }

    const handleCloseModal = () => {
        setClosureData(null)
        setModalIsOpen(false);
    };

    return <Dialog open={isOpen} handler={handleOpen} size="lg">
        <DialogHeader className="flex justify-between">
            <div>Grievances ({capitalize(state)} &gt; {capitalize(district)})</div>

            <XMarkIcon height={'1rem'} width={'1rem'} onClick={handleOpen} className="cursor-pointer select-none" />
        </DialogHeader>

        <DialogBody className={"grid grid-cols-2 overflow-scroll" + (grievances.length > 4 ? ' h-[70vh] ' : '')}>
            <table className="w-full min-w-[640px] table-auto">
                <thead>
                    <tr>
                        {Columns.map((el, index) => (
                            <th
                                key={el}
                                className={"border-b border-blue-gray-50 py-3 px-2 text-left" + (scroll ? " sticky -top-1 bg-white shadow" : "")}
                            >
                                <Typography
                                    variant="small"
                                    className={"text-[14px] font-bold uppercase text-blue-gray-400 flex gap-1 cursor-pointer hover:text-gray-800 "}
                                >
                                    {el}
                                    {/* <ArrowsUpDownIcon width={14} /> */}
                                </Typography>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody >
                    {
                        grievances.map(({
                            registration_no,
                            recvd_date,
                            closing_date,
                            time_taken,
                            z_score,
                            outlier
                        }) =>
                            <tr className="text-md hover:cursor-pointer" onClick={() => handleOpenModal(registration_no)} >
                                <td className={className}>
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <div className={textStyle}>{registration_no}</div>
                                        </div>
                                    </div>
                                </td>

                                <td className={className}>
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <div className={textStyle}>{time_taken} days</div>
                                        </div>
                                    </div>
                                </td>

                                <td className={className + " w-[40rem]"}>
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <div className={textStyle}>{formatDate(recvd_date)} ~ {formatDate(closing_date)}</div>
                                        </div>
                                    </div>
                                </td>

                                <td className={className}>
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <div className={textStyle}>{limitDecimals(z_score)}</div>
                                        </div>
                                    </div>
                                </td>

                                <td className={className}>
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <div className={textStyle}>{outlier}</div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )
                    }
                </tbody>
            </table>

            {
                modalIsOpen && (
                    <Modal modalLoader={modalLoader} modalData={grievancesDesc} closureData={closureData} close={handleCloseModal} reload={() => loadModalData(grievancesDesc?.registration_no)} />
                )
            }
        </DialogBody>
    </Dialog>
}
