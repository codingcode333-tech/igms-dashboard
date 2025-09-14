import { useMemo, useState } from "react"
import { FilterLayout, SearchButton } from "../BasicFilters"
import { DateRangePicker, MinistryAutocomplete, StateDistrictAutocomplete, capitalize } from "@/pages/dashboard/CategoricalTree"
import { Card, CardBody, CardHeader, Typography } from "@material-tailwind/react"
import { Pagination, SmartRegistrationNo } from "../list"
import { ArrowsUpDownIcon } from "@heroicons/react/24/solid"
import { Modal } from "../modal"
import { formatDate } from "@/helpers/date"
import { defaultFrom, defaultTo } from "@/helpers/env"
import GrievancesRoutes, { getClosureDetails } from "@/services/grievances";
import { toast } from "react-toastify"

export const Filters = ({
    filters,
    setFilters
}) => {
    const [selectedMinistry, setSelectedMinistry] = useState({
        text: 'DOCAF',
        value: 'DOCAF'
    })
    const [dateRange, setDateRange] = useState({
        startDate: '2016-08-01',
        endDate: '2016-08-31'
    })
    const [stateDistrict, setStateDistrict] = useState({
        text: 'All',
        values: {
            state: 'All',
            district: 'All'
        }
    })
    const [threshold, setThreshold] = useState(filters.threshold)
    const [searchType, setSearchType] = useState(1) // 1=Semantic, 2=Keyword, 3=Hybrid
    const [searchQuery, setSearchQuery] = useState('')
    const searching = false;

    const startSearch = () => {
        setFilters({
            ministry: selectedMinistry.value,
            ...dateRange,
            ...stateDistrict.values,
            threshold,
            level: 2,
            // Add semantic search parameters
            searchQuery: searchQuery.trim(),
            searchType: searchType
        })
    }

    return <FilterLayout>
        <MinistryAutocomplete
            ministry={selectedMinistry}
            setMinistry={setSelectedMinistry}
            disabled={true}
        />

        <div>
            <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
            />
        </div>

        <div>
            <StateDistrictAutocomplete
                stateDistrict={stateDistrict}
                setStateDistrict={setStateDistrict}
            />
        </div>

        {/* Semantic Search Controls */}
        <div className="space-y-2">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Query
                </label>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter search terms for semantic analysis..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </div>

        <div className={`-mt-1`}>
            <div>
                Relevance: <span className="text-blue-900 font-bold">{filters.threshold}</span>
            </div>

            <input type="range" value={threshold} min={1.2} max={2} step={0.1} onChange={e => setThreshold(e.target.value)} className="cursor-pointer border-t-0 shadow-none w-full" />
        </div>

        <div className="col-start-3 flex justify-end items-end m-2">
            <SearchButton searching={searching} startSearch={startSearch} />
        </div>
    </FilterLayout>
}

export const THClass = "px-6 py-3 text-left text-xs text-white font-bold uppercase tracking-wider"
export const TDClass = "px-6 py-4 whitespace-nowrap"

export const GrievanceListBox = ({
    list,
    pageno,
    total,
    goTo,
    searching
}) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalLoader, setModalLoading] = useState(false);
    const [grievancesDesc, setGrievancesDesc] = useState({});
    const [closureData, setClosureData] = useState(null)

    const recordsPerPage = 20
    const from = pageno ? (((pageno - 1) * recordsPerPage) + 1) : 1
    const toRanged = pageno * recordsPerPage
    const to = useMemo(() => pageno ? (toRanged < total ? toRanged : total) : recordsPerPage, [pageno, total])
    const totalPages = Math.ceil(total / recordsPerPage)

    const rowSpam = " !text-red-600"
    const rowRead = " font-normal"
    const rowColor = " text-gray-800"

    const columns = [
        "Registration No",
        "Name",
        "State",
        "District",
        "Ministry",
        "Received Date",
        "Closing Date"
    ]

    const handleOpenModal = async (G_id) => {
        setModalIsOpen(true);
        setModalLoading(true);
        loadModalData(G_id)
            .catch((error) => {
                console.log(error)
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

    return <div className={`mt-8 mb-0 flex flex-col gap-12`}>
        <Card className={""}>
            <CardHeader variant="gradient" color="blue" className={`flex justify-between p-3`}>
                <div className="flex flex-col">
                    <div className={``}>
                        {
                            `${from}-${to} / ${total} records`
                        }
                    </div>
                </div>

                <div className="flex gap-2 md:gap-4 items-center flex-col sm:flex-row">
                    {
                        pageno != null &&
                        <Pagination
                            pageno={pageno}
                            setPageno={goTo}
                            totalPages={totalPages}
                            disabled={searching}
                        />
                    }

                    {/* {
                        download &&
                        <Button className="bg-white text-blue-800 focus:opacity-100 h-10 px-2 md:h-[50px] md:px-4" onClick={download}>
                            {
                                downloading
                                    ? <Loader className="animate-spin" color="#2196f3" />
                                    : <ArrowDownTrayIcon width={20} strokeWidth={3} />
                            }
                        </Button>
                    } */}
                </div>
            </CardHeader>

            <CardBody className={`overflow-x-scroll px-0 pt-0 pb-2 shadow-inner overflow-scroll h-[80vh]`}>
                <table className="w-full min-w-[640px] table-auto">
                    <thead>
                        <tr>
                            {columns.map((el, index) => (
                                <th
                                    key={el}
                                    className={"border-b border-blue-gray-50 py-3 px-2 text-left" + (scroll ? " sticky -top-1 bg-white shadow" : "")}
                                >
                                    <Typography
                                        variant="small"
                                        className={"text-[14px] font-bold uppercase text-blue-gray-400 flex gap-1 cursor-pointer hover:text-gray-800 "}
                                    // onClick={() => setSortColumn(index)}
                                    >
                                        {el}
                                        <ArrowsUpDownIcon width={14} />
                                    </Typography>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {
                            !(searching) &&
                            (
                                <>
                                    {
                                        list?.map(({
                                            registration_no,
                                            name,
                                            state,
                                            district,
                                            ministry,
                                            recvd_date,
                                            closing_date
                                        }, key) => {
                                            const className = `py-3 px-3 border-b border-blue-gray-50`;

                                            // Determine the text style based on the key
                                            const textStyle = rowColor + rowRead

                                            return (
                                                <tr className="text-md hover:cursor-pointer" onClick={() => handleOpenModal(registration_no)} key={key}>
                                                    <td className={className}>
                                                        <div className={`flex items-center gap-4`} >
                                                            <div className="flex gap-2 items-center whitespace-nowrap">
                                                                <div className={textStyle}>
                                                                    <SmartRegistrationNo regNo={registration_no} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className={className}>
                                                        <div className="flex items-center gap-4 w-[8rem]">
                                                            <div>
                                                                <div className={textStyle}>{capitalize(name)}</div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className={className}>
                                                        <div className="flex items-center gap-4 w-[10rem]">
                                                            <div>
                                                                <div className={textStyle}>{capitalize(state)}</div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className={className}>
                                                        <div className="flex items-center gap-4 w-[10rem]">
                                                            <div>
                                                                <div className={textStyle}>{capitalize(district)}</div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className={className}>
                                                        <div className="flex items-center gap-4 w-[10rem]">
                                                            <div>
                                                                <div className={textStyle}>{ministry}</div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className={className}>
                                                        <div className="flex items-center gap-4">
                                                            <div>
                                                                <div className={textStyle}>
                                                                    {recvd_date ? formatDate(recvd_date) : recvd_date}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className={className}>
                                                        <div className="flex items-center gap-4">
                                                            <div>
                                                                <div className={textStyle}>
                                                                    {closing_date ? formatDate(closing_date) : closing_date}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    }
                                </>
                            )
                        }
                    </tbody>
                </table>
            </CardBody>
        </Card>

        {
            modalIsOpen && (
                <Modal modalLoader={modalLoader} modalData={grievancesDesc} closureData={closureData} close={handleCloseModal} reload={() => loadModalData(grievancesDesc?.registration_no)} />
            )
        }
    </div >
}

export const AILoader = () => {
    return (
        <div className="flex justify-center items-center h-[70vh] bg-gray-100">
            <div className="relative">
                <div className="w-32 h-32 border-4 border-dashed border-blue-500 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-gradient-to-r from-yellow-500 via-blue-800 to-orange-500 opacity-20 blur-lg"></div>
                <div className="absolute top-2 left-2 w-28 h-28 rounded-full bg-[#fff3] flex justify-center items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-green-400 rounded-full animate-pulse"></div>
                </div>
            </div>
            <div className="ml-8 text-gray-800 text-lg">
                <p>Processing AI Tasks...</p>
                <p className="text-sm text-gray-900">This may take a few moments.</p>
            </div>
        </div>
    );
};