import { Select, Input, Button, Menu, MenuHandler, MenuList, MenuItem } from "@material-tailwind/react"
import { departmentData, getDepartmentName } from "@/data"
import { ExclamationCircleIcon, StarIcon, BookmarkSquareIcon, DocumentTextIcon, HandThumbUpIcon, HandThumbDownIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import grievanceService, { checkFinalReport, checkGradeReport, getClosureDetails } from '@/services/grievances'
import { useEffect, useMemo, useState } from "react";
import httpService from "@/services/httpService";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Loader, capitalize } from "@/pages/dashboard/CategoricalTree";
import { SmartRegistrationNo, ViewRepeatButton } from "./list";
import { BookmarkIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";
import { stringDate } from "@/helpers/date";
import { useFilter } from "@/context/FilterContext";

const Seperator = "-----------------------"

export function Modal({
    modalData = {},
    closureData,
    modalLoader = true,
    close,
    reload
}) {
    const [labelInput, setLableInput] = useState('')
    const [content, setContent] = useState(modalData?.subject_content)
    const [categories, setCategories] = useState([])
    // const [closureData, setClosureData] = useState(null)
    // const [currentRNO, setCurrentRNO] = useState(null)
    const [FRPDFExists, setFRPDFExists] = useState(null)
    const { filters } = useFilter()
    const [voteCount, setVoteCount] = useState(0)
    const [isFRPDFLoading, setIsFRPDFLoading] = useState(false)
    const [GRPDFExists, setGRPDFExists] = useState(null)
    const [isGRPDFLoading, setIsGRPDFLoading] = useState(false)

    useEffect(() => {
        if (modalData?.subject_content && modalData.subject_content.indexOf(Seperator) != -1) {
            let [category_string, content_string] = modalData.subject_content.split(Seperator)

            setCategories(category_string.split(' >> '))

            setContent(content_string)
        }
        else {
            setContent(modalData?.subject_content)
        }

    }, [modalData])

    const toggleSave = () => {
        grievanceService.toggleSave(modalData?.registration_no)
            .then(() => {
                reloadModal()
            })
    }
    const toggleSpam = () => {
        grievanceService.toggleSpam(modalData?.registration_no)
            .then(() => {
                reloadModal()
            })
    }
    const togglePriority = () => {
        grievanceService.togglePriority(modalData?.registration_no)
            .then(() => {
                reloadModal()
            })
    }
    const openPDF = (type = null) => {
        grievanceService.getPDFRoute(modalData?.registration_no, type)
            .then(response => {
                if (response.data.filename != "Not Found") {
                    window.open(httpService.baseURL + 'logs/documents/' + response.data.filename, '_blank')
                }
                else
                    toast("PDF not found!", {
                        type: 'error'
                    })
            })
            .catch(e => toast("PDF not found!"), { type: 'error' })
    }
    const addLabel = event => {
        if (event.key == "Enter") {
            grievanceService.addLabel(modalData?.registration_no, event.target.value)
                .then(() => {
                    reloadModal()
                    setLableInput('')
                })
        }
    }
    const deleteTag = tagId => {
        grievanceService.deleteTag(tagId)
            .then(() => reloadModal())
    }
    const closeGrievance = () => {
        grievanceService.readGrievance(modalData?.registration_no)
        close()
    }

    const thumbsUp = (vote) => {
        if (modalData?.registration_no)
            grievanceService.addVote(modalData?.idx, vote, filters.query)
                .then(reload)
    }

    const reloadModal = () => {
        reload({
            FRPDFExists,
            GRPDFExists,
            voteCount,
            preloaded: 'yes'
        })
    }

    const predictedMinistry = useMemo(() => {
        let ministries = modalData?.predict_ministries ?? ''

        if (ministries == 'STATE' && modalData?.state)
            return `Government of ${capitalize(modalData?.state)}`

        ministries = ministries.replace(/\(|\)|\'|\'/g, '')
            .split(', ')
            .map((ministry, index) =>
                <div key={index}>
                    {/* {index != 0 && ', '} {ministry} */}
                    {index != 0 && ', '} <MinistryWithToolTip ministry={ministry} bold={false} />
                </div>
            )

        return <span className="flex">
            {ministries}
        </span>
    }, [modalData])

    useEffect(() => {
        if (modalData && modalData?.registration_no) {
            if (modalData.preloaded == 'yes') {
                setFRPDFExists(modalData.FRPDFExists)
                setGRPDFExists(modalData.GRPDFExists)
                setVoteCount(modalData.voteCount)
            }
            else {
                setIsFRPDFLoading(true)
                setIsGRPDFLoading(true)

                checkFinalReport(modalData?.registration_no)
                    .then(({ data }) => {
                        if (data.found == 1)
                            setFRPDFExists(true)
                    })
                    .finally(() => setIsFRPDFLoading(false))


                checkGradeReport(modalData?.registration_no)
                    .then(({ data }) => {
                        if (data.found == 1)
                            setGRPDFExists(true)
                    })
                    .finally(() => setIsGRPDFLoading(false))

                grievanceService.getVotes(modalData?.idx)
                    .then(({ data: { count } }) => {
                        setVoteCount(count)
                    })
            }
        }
    }, [modalData])

    return (
        <div className="fixed  inset-0 flex items-center justify-center z-[1200] text-black">
            <div className="fixed inset-0 bg-black opacity-50"></div>

            <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center">

                {modalLoader ? (<>

                    <div>Loading ......</div>

                </>) : (<>



                    <div className="bg-white w-full md:w-10/12 h-full pt-2  p-8 rounded-lg shadow-lg relative">
                        {/* Close button */}


                        <div className="h-auto w-full justify-start flex flex-col sm:flex-row gap-2 my-2">
                            <div className="sm:w-1/2">
                                <div className="text-[16px] lg:text-[20px] mr-10 flex gap-2 items-center">
                                    {/* <div>Registration&nbsp;Number: </div> */}

                                    <strong><SmartRegistrationNo regNo={modalData?.registration_no ?? 'NA'} dir='bottom' /></strong>


                                    {
                                        modalData?.parent &&
                                        <p className="text-[12px]">
                                            Parent :

                                            <ViewRepeatButton
                                                filters={{ name: modalData?.name }}
                                                content={<span className="text-blue-700">{modalData?.parent}</span>}
                                            />
                                        </p>
                                    }


                                    {
                                        modalData?.closing_date &&
                                        <CheckBadgeIcon height={"20"} width={"20"} fill="#008900" title="Closed" />
                                    }

                                    {
                                        modalData?.save == 1 &&
                                        <BookmarkIcon height={"20"} width={"20"} fill="#ffeb3b" stroke="#999" title="Saved" />
                                    }

                                    {
                                        modalData?.spam == 1 &&
                                        <BookmarkIcon height={"20"} width={"20"} fill="#f44336" stroke="#999" title="Spam" />
                                    }

                                    {
                                        modalData?.priority == 1 &&
                                        <BookmarkIcon height={"20"} width={"20"} fill="#2196f3" stroke="#999" title="Priority" />
                                    }

                                    <HandThumbUpIcon height={'1.5rem'} width={'1.5rem'} className="self-center cursor-pointer hover:fill-green-300 hover:stroke-green-600" onClick={() => thumbsUp(1)} />

                                    <div>
                                        {
                                            voteCount
                                        }
                                    </div>

                                    <HandThumbDownIcon height={'1.5rem'} width={'1.5rem'} className="self-center cursor-pointer hover:fill-green-300 hover:stroke-green-600" onClick={() => thumbsUp(-1)} />
                                </div>
                                {/* <p><strong>By : &nbsp;</strong>{capitalize(modalData?.name ?? 'NA')} &nbsp; <strong>Date : &nbsp;</strong> {modalData?.recvd_date ?? 'NA'}</p>
                                <p><strong>Email : &nbsp;</strong>{modalData?.emailaddr ?? 'NA'} &nbsp; <strong>Phone No : &nbsp;</strong>{modalData?.mobile_no ?? 'NA'}</p> */}
                            </div>

                            <div className="sm:w-1/2 hidden">
                                <div className=" flex gap-2 justify-end mr-2">
                                    {
                                        modalData?.save
                                            ? <Button color="yellow" className="h-10 px-4 lg:h-[50px] lg:px-6" onClick={() => { toggleSave() }}>Unsave</Button>
                                            : <Button color="white" className="border-2 border-slate-500 h-10 px-4 lg:h-[50px] lg:px-6" onClick={() => { toggleSave() }}>Save</Button>
                                    }
                                    {
                                        modalData?.spam
                                            ? <Button color="red" className="h-10 px-4 lg:h-[50px] lg:px-6" onClick={() => { toggleSpam() }}>Unspam</Button>
                                            : <Button color="white" className="border-2 border-slate-500 h-10 px-4 lg:h-[50px] lg:px-6" onClick={() => { toggleSpam() }}>Spam</Button>
                                    }
                                    {
                                        modalData?.repeat == 1 &&
                                        <Link to={'/dashboard/grievances/repeat/' + modalData?.registration_no?.replace(/\//g, '-')}>
                                            <Button color="blue" className="flex items-center h-10 px-4 lg:h-[50px] lg:px-6">
                                                View Repeats
                                            </Button>
                                        </Link>
                                    }
                                    {
                                        modalData?.priority
                                            ? <Button color="green" className="h-10 px-4 lg:h-[50px] lg:px-6" onClick={() => { togglePriority() }}>Deprioritize</Button>
                                            : <Button color="white" className="border-2 border-slate-500 h-10 px-4 lg:h-[50px] lg:px-6" onClick={() => { togglePriority() }}>Prioritize</Button>
                                    }

                                </div>
                                {/* <div className="text-right">
                                    {
                                        modalData?.parent &&
                                        <p className="my-2">
                                            <strong>Parent : &nbsp;</strong>

                                            <ViewRepeatButton
                                                filters={{ name: modalData?.name }}
                                                content={<span className="text-blue-700">{modalData?.parent}</span>}
                                            />
                                        </p>
                                    }
                                </div> */}
                            </div>
                        </div>

                        <hr />

                        <div className="flex m-2 gap-2 flex-wrap md:flex-nowrap h-[96%]">
                            <div className="w-full overflow-y-auto grievance-modal-scroll">
                                <div className="relative h-0">
                                    <div className="absolute right-0">
                                        {
                                            GRPDFExists
                                                ? <DocumentTextIcon className="w-8 text-red-500 cursor-pointer -ml-2" onClick={() => openPDF()} title="Final Grievance Report Document" />
                                                : <DocumentTextIcon className={`w-8 text-gray-300 -ml-2 ${isGRPDFLoading ? 'animate-pulse' : ''}`} title="Unavailable: Final Grievance Report Document" />
                                        }
                                        {
                                            modalData?.pdf_found == 1 &&
                                            <DocumentTextIcon className="w-8 text-red-500 cursor-pointer -ml-2" onClick={() => openPDF()} title="Grievance Document" />
                                        }
                                    </div>
                                </div>

                                {
                                    modalData?.recvd_date &&
                                    <div className="text-[16px]">{stringDate(modalData?.recvd_date)}</div>
                                }

                                <div className="text-[16px] mt-3">From</div>

                                {
                                    modalData?.name &&
                                    <div className="text-[17px]">{capitalize(modalData.name)}</div>
                                }

                                {
                                    modalData?.address &&
                                    <div className="text-[16px] max-w-[300px]">{modalData.address}</div>
                                }

                                {
                                    modalData?.district &&
                                    <div className="text-[16px]">{capitalize(modalData.district)}</div>
                                }

                                {
                                    modalData?.state &&
                                    <div className="text-[16px]">{capitalize(modalData.state)}</div>
                                }

                                {
                                    modalData?.emailaddr &&
                                    <div className="text-[16px] max-w-[300px]">{modalData.emailaddr}</div>
                                }

                                {
                                    modalData?.mobile_no &&
                                    <div className="text-[16px] max-w-[300px]">{modalData.mobile_no}</div>
                                }

                                {
                                    categories.length > 0 &&
                                    <div className="text-[16px] mt-3">Subject</div>
                                }

                                <div className="text-[14px] -mt-1">
                                    {
                                        categories.slice(0, categories.length - 1).map((category, index) =>
                                            <span className={``} key={index}>
                                                {category}&nbsp;&gt;&nbsp;
                                            </span>
                                        )
                                    }
                                </div>

                                {
                                    categories.length > 0 &&
                                    <div className="text-[18px] -mt-1">{categories[categories.length - 1]}</div>
                                }

                                <div className="text-[18px] mt-3">
                                    <p
                                        dangerouslySetInnerHTML={{ __html: content }}
                                    />
                                </div>
                            </div>

                            <div className="border"></div>

                            <div className="w-full flex flex-col">
                                <div className="flex flex-col">
                                    <div className="relative h-0 z-[100]">
                                        <div className="absolute right-0 top-[4rem]">
                                            {
                                                FRPDFExists
                                                    ? <DocumentTextIcon className="w-8 text-red-500 cursor-pointer -ml-2" onClick={() => openPDF("FR")} title="Final Grievance Report Document" />
                                                    : <DocumentTextIcon className={`w-8 text-gray-300 -ml-2 ${isFRPDFLoading ? 'animate-pulse' : ''}`} title="Unavailable: Final Grievance Report Document" />
                                            }
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[14px]">Predicted Ministry</div>
                                        <div className="text-[20px] -mt-1">{predictedMinistry}</div>
                                    </div>

                                    {
                                        closureData ?
                                            <>
                                                <hr className="my-1" />

                                                {
                                                    closureData.GrievanceOfficerName &&
                                                    <div>
                                                        <div className="text-[14px]">GRO</div>
                                                        <div className="text-[20px] -mt-1">
                                                            {closureData.GrievanceOfficerName}

                                                            {
                                                                closureData.GrievanceOfficerDesignation &&
                                                                <span className="text-[16px]"> / {closureData.GrievanceOfficerDesignation}</span>
                                                            }
                                                        </div>
                                                    </div>
                                                }

                                                <div className=" overflow-y-auto max-h-[70vh] grievance-modal-scroll">
                                                    <ol className="relative border-l border-gray-200 ml-1">
                                                        <li className="mb-3 ml-4">
                                                            <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white"></div>
                                                            <time className="mb-1 text-sm font-normal leading-none text-gray-400">{stringDate(modalData?.recvd_date)}</time>
                                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Opened</h3>
                                                            {
                                                                closureData.CitizenDemand &&
                                                                <>
                                                                    <div className="text-[12px] font-normal text-gray-500">Demand</div>
                                                                    <div className="text-base font-normal text-gray-900">{closureData.CitizenDemand}</div>
                                                                </>
                                                            }
                                                        </li>

                                                        {
                                                            closureData.ResolutionInitiatedDate &&
                                                            <>
                                                                <li className="mb-3 ml-4">
                                                                    <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white"></div>
                                                                    {

                                                                        closureData.ResolutionInitiatedDate != "0001-01-01" &&
                                                                        <>
                                                                            <time className="mb-1 text-sm font-normal leading-none text-gray-400">{stringDate(closureData.ResolutionInitiatedDate)}</time>
                                                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Resolution Initiated</h3>

                                                                        </>
                                                                    }
                                                                    {
                                                                        closureData.GrievanceNature &&
                                                                        <>
                                                                            <div className="text-[12px] font-normal text-gray-500">Nature</div>
                                                                            <div className="text-base font-normal text-gray-900">{closureData.GrievanceNature}</div>
                                                                        </>
                                                                    }
                                                                </li>
                                                            </>
                                                        }

                                                        {
                                                            closureData.ResolutionDate &&
                                                            <>
                                                                <li className="mb-3 ml-4">
                                                                    <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white"></div>
                                                                    {

                                                                        closureData.ResolutionDate != "0001-01-01" &&
                                                                        <>
                                                                            <time className="mb-1 text-sm font-normal leading-none text-gray-400">{stringDate(closureData.ResolutionDate)}</time>
                                                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                                                {
                                                                                    closureData.DisposalType ??
                                                                                    "Resolved"
                                                                                }
                                                                            </h3>
                                                                        </>
                                                                    }
                                                                    {
                                                                        closureData.ResolutionDone &&
                                                                        <>
                                                                            <div className="text-[12px] font-normal text-gray-500">Resolution</div>
                                                                            <div className="text-base font-normal text-gray-900">{closureData.ResolutionDone}</div>
                                                                        </>
                                                                    }
                                                                    {
                                                                        closureData.GrievanceCause &&
                                                                        <>
                                                                            <div className="text-[12px] font-normal text-gray-500">Cause</div>
                                                                            <div className="text-base font-normal text-gray-900">{closureData.GrievanceCause}</div>
                                                                        </>
                                                                    }
                                                                </li>
                                                            </>
                                                        }

                                                        {
                                                            closureData.ClosingDate &&
                                                            <>
                                                                <li className="mb-3 ml-4">
                                                                    <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white"></div>
                                                                    {
                                                                        closureData.ClosingData != "0001-01-01" &&
                                                                        <>
                                                                            <time className="mb-1 text-sm font-normal leading-none text-gray-400">{stringDate(closureData.ClosingDate)}</time>
                                                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Closed</h3>
                                                                        </>
                                                                    }
                                                                    {
                                                                        closureData.ClosingRemarks &&
                                                                        <>
                                                                            <div className="text-[12px] font-normal text-gray-500">Remarks</div>
                                                                            <div className="text-base font-normal text-gray-900">{closureData.ClosingRemarks}</div>
                                                                        </>
                                                                    }
                                                                </li>
                                                            </>
                                                        }
                                                    </ol>
                                                </div>
                                            </>
                                            :
                                            <div className="p-10 flex justify-center">
                                                <Loader className="animate-spin" />
                                            </div>
                                    }
                                </div>

                                <div className="grow"></div>

                                <div className="justify-self-end mb-3">
                                    <div className="flex justify-end gap-2">
                                        {
                                            modalData?.save
                                                ? <Button color="white" className="border-2 border-yellow-500 h-10 px-4 lg:h-[40px] lg:px-6" onClick={() => { toggleSave() }}>Unsave</Button>
                                                : <Button color="white" className="border-2 border-slate-500 h-10 px-4 lg:h-[40px] lg:px-6" onClick={() => { toggleSave() }}>Save</Button>
                                        }
                                        {
                                            modalData?.spam
                                                ? <Button color="white" className="border-2 border-red-500 h-10 px-4 lg:h-[40px] lg:px-6" onClick={() => { toggleSpam() }}>Unspam</Button>
                                                : <Button color="white" className="border-2 border-slate-500 h-10 px-4 lg:h-[40px] lg:px-6" onClick={() => { toggleSpam() }}>Spam</Button>
                                        }
                                        {
                                            modalData?.repeat == 1 &&
                                            <Link to={'/dashboard/grievances/repeat/' + modalData?.registration_no?.replace(/\//g, '-')}>
                                                <Button color="blue" className="flex items-center h-10 px-4 lg:h-[40px] lg:px-6">
                                                    View Repeats
                                                </Button>
                                            </Link>
                                        }
                                        {
                                            modalData?.priority
                                                ? <Button color="white" className="border-2 border-blue-500 h-10 px-4 lg:h-[40px] lg:px-6" onClick={() => { togglePriority() }}>Deprioritize</Button>
                                                : <Button color="white" className="border-2 border-slate-500 h-10 px-4 lg:h-[40px] lg:px-6" onClick={() => { togglePriority() }}>Prioritize</Button>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* <div className="h-auto mt-2 mb-2 justify-center flex flex-col sm:flex-row">
                            <div className="sm:w-1/2">
                                <p><strong>Address : &nbsp;</strong>{modalData?.address ?? 'NA'}</p>
                                <p><strong>State : &nbsp;</strong>{capitalize(modalData?.state ?? 'NA')} &nbsp; <strong>District : &nbsp;</strong>{capitalize(modalData?.district ?? 'NA')}</p>
                            </div>

                            <div className="sm:w-1/2 text-right">
                                <div className="flex justify-end mr-2">
                                    {
                                        modalData?.pdf_found == 1 &&
                                        <DocumentTextIcon className="w-12 text-red-500 cursor-pointer -ml-2" onClick={() => openPDF()} title="PDF Document" />
                                    }
                                </div>
                            </div>
                        </div>
                        <hr></hr> */}
                        {/* <div className="mt-2"> */}
                        {/* <p className="flex gap-2">
                                <strong>Predicted Ministries:</strong> {predictedMinistry}
                            </p> */}
                        {/* </div> */}
                        {/* <br></br>
                        <div className="w-full h-auto mb-4 flex justify-between flex-col md:flex-row gap-2">
                            <div className="flex items-center justify-start flex-wrap gap-1"> */}
                        {/*
                                    Object.values(modalData?.tags_data).map((tag, key) =>
                                        <div className="bg-gray-200 inline-flex items-center text-sm rounded mr-1" key={key}>
                                            <span className="mx-2 leading-relaxed truncate max-w-xs" x-text="tag"> {tag.tag} </span>
                                            <button className="w-6 h-8 inline-block align-middle text-gray-500 hover:text-gray-600 focus:outline-none">
                                                <HandThumbUpIcon className="h-4 w-4 text-gray-500" />
                                            </button>
                                            <button className="w-6 h-8 inline-block align-middle text-gray-500 hover:text-gray-600 focus:outline-none">
                                                <HandThumbDownIcon className="h-4 w-4 text-gray-500" />
                                            </button>
                                            <button className="w-6 h-8 inline-block align-middle text-gray-500 hover:text-gray-600 focus:outline-none" onClick={() => deleteTag(tag.idx)}>
                                                <svg className="w-6 h-6 fill-current mx-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fillRule="evenodd" d="M15.78 14.36a1 1 0 0 1-1.42 1.42l-2.82-2.83-2.83 2.83a1 1 0 1 1-1.42-1.42l2.83-2.82L7.3 8.7a1 1 0 0 1 1.42-1.42l2.83 2.83 2.82-2.83a1 1 0 0 1 1.42 1.42l-2.83 2.83 2.83 2.82z" /></svg>
                                            </button>
                                        </div>
                                    )
                                */}
                        {/* </div> */}

                        {/* <div className="w-[20rem]">
                                <Input
                                    className="mr-10"
                                    type="text"
                                    label="Add a label"
                                    onKeyDown={addLabel}
                                    value={labelInput}
                                    onChange={(e) => setLableInput(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mb-10 h-[720px] overflow-y-auto bg-gray-100 p-4 rounded-lg shadow-inner">
                            <p
                                dangerouslySetInnerHTML={{ __html: modalData?.subject_content }}
                                className="text-base leading-8 pb-32"
                            />
                        </div>
                            */}
                        <button
                            onClick={closeGrievance}
                            className="absolute top-0 right-0 p-2 text-gray-600 hover:text-gray-800"
                        >
                            <svg
                                className="w-6 h-6 fill-current"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                            >
                                <path d="M0 0h24v24H0z" fill="none" />
                                <path d="M6.293 6.293a1 1 0 011.414 0L12 10.586l4.293-4.293a1 1 0 111.414 1.414L13.414 12l4.293 4.293a1 1 0 01-1.414 1.414L12 13.414l-4.293 4.293a1 1 0 01-1.414-1.414L10.586 12 6.293 7.707a1 1 0 010-1.414z" />
                            </svg>
                        </button>

                        {/* Modal content */}
                        {/* {children} */}
                    </div>


                </>)}

            </div >
        </div>
    )
}

export const MinistryWithToolTip = ({
    ministry,
    dir = "top",
    pulse = false,
    bold = true
}) => {
    const fullName = getDepartmentName(ministry)

    return <span className="has-tooltip h-0">
        <span className={`${pulse && 'animate-pulse'} ${bold && "font-bold"}`}>{ministry}</span>

        {
            fullName &&
            <div className={`tooltip ${dir == 'top' && '-top-14'} ${dir == 'bottom' && 'bottom-0'}`} ab={``}>
                <div className="h-max w-max bg-black rounded text-white px-2 overflow-visible">
                    {fullName}
                </div>
            </div>
        }
    </span>
}