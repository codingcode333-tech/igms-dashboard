import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Avatar,
  Chip,
  Tooltip,
  Progress,
  Input,
  Select,
  Option
} from "@material-tailwind/react";

import { ExclamationCircleIcon, StarIcon, BookmarkSquareIcon, DocumentTextIcon, HandThumbUpIcon, HandThumbDownIcon, ArrowDownTrayIcon, ArrowsUpDownIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { authorsTableData, grievanceTableData, projectsTableData, departmentData } from "@/data";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  useTheme
} from "@/context";
import { useFilter } from "@/context/FilterContext";
import GrievancesRoutes, { getClosureDetails } from "@/services/grievances";
// import { Modal } from "@/pages/dashboard";
import { MinistryWithToolTip, Modal } from "./modal";
import { Link, useNavigate } from "react-router-dom";
import { ArrowTopRightOnSquareIcon, CheckBadgeIcon, CheckIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { Loader } from "@/pages/dashboard/CategoricalTree";
import { toast } from "react-toastify";

export function GrievanceList({
  title = '',
  titleBarHidden = false,
  compactTitle = false,
  grievances = [],
  count = null,
  total = null,
  pageno = null,
  setPageno = null,
  isRepeat = false,
  parent_rno = null,
  download = null,
  noDataFound = false,
  scroll = false,
  scrollH = null,
  additionalCountText,
  max = 20,
  downloading = false,
  searching = false,
  startDate = null,
  endDate = null
}) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { isDark } = useTheme();
  //   const [grievances, setGrievances] = useState(null);
  const [modalLoader, setModalLoading] = useState(false);
  const [grievancesDesc, setGrievancesDesc] = useState({});
  const [closureData, setClosureData] = useState(null)
  const { filters, setFilters } = useFilter();
  const recordsPerPage = max
  const from = pageno ? (((pageno - 1) * recordsPerPage) + 1) : 1
  const toRanged = pageno * recordsPerPage
  const to = useMemo(() => pageno ? (toRanged < total ? toRanged : total) : recordsPerPage, [pageno, total])
  const disableNextButton = useMemo(
    () => count < recordsPerPage || (total != null && total <= to),
    [count, recordsPerPage, total, to]
  )
  const totalPages = Math.ceil(total / max)

  const isLoading = grievances === null;
  const rowSpam = " !text-red-600"
  const rowRead = " font-normal"
  const rowUnread = " font-bold"
  const rowColor = isDark ? " text-gray-100" : " text-gray-800"
  const colors = [
    "text-red-600 font-bold", 
    isDark ? "text-white font-bold" : "text-black font-bold", 
    isDark ? "text-gray-200 font-normal" : "text-gray-800 font-normal"
  ];
  const columns = [
    ...(isRepeat ? ['S No.'] : []),
    "Registration No",
    ...(isRepeat ? ['Count'] : []),
    "State",
    "District",
    "Received Date",
    "Closing Date",
    "Name"
  ]
  const columnNames = [
    ...(isRepeat ? ['s_no'] : []),
    "registration_no",
    ...(isRepeat ? ['count'] : []),
    "state",
    "district",
    "recvd_date",
    "closing_date",
    "name"
  ]

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [sortOrder, setSortOrder] = useState(null)
  const [filteredGrievances, setFilteredGrievances] = useState([])

  const handleOpenModal = async (G_id) => {
    setModalLoading(true);
    loadModalData(G_id)
      .catch(() => {
        toast.error('There was an error. Please try again!')
        setModalIsOpen(false)
      })
      .finally(() => {
        setModalIsOpen(true);
        setModalLoading(false)
      })
  };

  const loadModalData = (id, isReload = false, preload = {}) => {
    return GrievancesRoutes.descGrievance(id)
      .then(async response => {
        if (response.data.repeat == 2) {
          response.data.parent = (await GrievancesRoutes.getRepeatParent(response.data.registration_no)).data.parent_registration_no
        }

        setGrievancesDesc({
          ...response.data,
          ...preload
        })

        if (!isReload)
          getClosureDetails(id)
            .then((response) => {
              // console.log(response)
              console.log(response.data)
              setClosureData(response.data)
              // setCurrentRNO(modalData?.registration_no)
            })
      })
  }

  const handleCloseModal = () => {
    setClosureData(null)
    setModalIsOpen(false);
  };


  const PrevGrievances = () => {
    setPageno(pageno - 1)

  }

  const NextGrievances = () => {
    setPageno(pageno + 1)
  }

  const capitalize = sentance => {
    if (!sentance || typeof sentance !== 'string') {
      return ''; // Return empty string for invalid input
    }
    return sentance.trim().split(' ').map(word => word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase()).join(' ');
  }

  const formatDate = (date, full = false) => {
    if (!date || date === 'nan' || date === 'null' || date === 'undefined' || date === '') {
      return "";
    }
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return "";
      }
      
      if (full) {
        return dateObj.toLocaleString('en-IN');
      } else {
        return dateObj.toLocaleDateString("en-IN");
      }
    } catch (error) {
      console.warn('Date formatting error:', date, error);
      return "";
    }
  }

  const setSortColumn = index => {
    let column = columnNames[index]
    let order = 'asc'

    if (column == sortOrder?.column && sortOrder.type == 'asc')
      order = 'desc'

    setSortOrder({
      column: column,
      type: order,
      index: index
    })

    let filtered = grievances

    if (columnNames.includes(column)) {
      filtered = grievances.sort((a, b) => {
        // isRepeat is used on Repeat grievances parent listing
        if (column == "registration_no" && isRepeat) {
          column = "parent_rno"
        }

        let current = a[column]
        let next = b[column]

        if (column.endsWith('_date')) {
          current = (new Date(current)).getTime()
          next = (new Date(next)).getTime()
        }

        return (
          (order == 'desc')
            ? (current > next ? -1 : 1)
            : (next > current ? -1 : 1)
        )
      })
    }

    setFilteredGrievances(filtered)
  }

  const getRno = item => (item.registration_no ?? item.parent_rno ?? item.parent_registration_no ?? '')

  useEffect(() => {
    setFilteredGrievances(grievances)
  }, [grievances])

  return (
    <div className={`mb-0 flex flex-col gap-12 ${((titleBarHidden || compactTitle) ? "mt-10" : "mt-12")} ${compactTitle && "mt-3"} ${(scroll ? " h-[100%]" : "")}`}>
      <Card className={`${scroll ? "h-[100%]" : ""} ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg border`}>
        <CardHeader variant="gradient" color="blue" className={`flex justify-between ${((titleBarHidden || compactTitle) ? "mb-3" : "mb-8")} ${compactTitle ? 'p-4 mx-1' : 'p-6'}`}>
          <div className="flex flex-col">
            <Typography variant="h6" color="white" className={(titleBarHidden ? "hidden" : "")}>
              {capitalize(title)}
              {
                parent_rno &&
                <>
                  &nbsp;for
                  <br />
                  <span className="text-xl">{parent_rno}</span>
                </>
              }
            </Typography>
            <div className={`${noDataFound && 'hidden'}`}>
              {
                count
                  ? total && pageno && total != count
                    ? `${from}-${to} / ${total} records`
                    : `${count} records` + (pageno ? ` / Page ${pageno}` : '')
                  : ''
              }
              {
                additionalCountText
              }
            </div>
          </div>
          <div className="flex gap-2 md:gap-4 items-center flex-col sm:flex-row">
            {
              pageno != null &&
              <Pagination
                pageno={pageno}
                setPageno={setPageno}
                totalPages={totalPages}
                disabled={searching}
              />
            }

            {
              download &&
              <Button className="bg-white text-blue-800 focus:opacity-100 h-10 px-2 md:h-[50px] md:px-4" onClick={download}>
                {
                  downloading
                    ? <Loader className="animate-spin" color="#2196f3" />
                    : <ArrowDownTrayIcon width={20} strokeWidth={3} />
                }
              </Button>
            }
          </div>
        </CardHeader>

        <CardBody className={`overflow-x-scroll px-0 pt-0 pb-2 ${(scroll ? "overflow-scroll h-[100%]" : '')} ${(scrollH ? `overflow-scroll h-[${scrollH}]` : '')} shadow-inner ${isDark ? 'bg-gray-800' : ''}`}>
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {columns.map((el, index) => (
                  <th
                    key={el}
                    className={`border-b ${isDark ? 'border-gray-600' : 'border-blue-gray-50'} py-3 px-2 text-left` + (scroll ? ` sticky -top-1 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow` : "")}
                  >
                    <Typography
                      variant="small"
                      className={`text-[14px] font-bold uppercase ${isDark ? 'text-gray-300 hover:text-white' : 'text-blue-gray-400 hover:text-gray-800'} flex gap-1 cursor-pointer ` + (sortOrder?.index == index ? (isDark ? 'text-white' : 'text-gray-800') : '')}
                      onClick={() => setSortColumn(index)}
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
                !(isLoading || searching) &&
                (
                  <>
                    {
                      !noDataFound &&
                      filteredGrievances?.map((item, key) => {
                        const className = `py-3 px-3 ${key === authorsTableData.length - 1 ? "" : `border-b ${isDark ? 'border-gray-600' : 'border-blue-gray-50'}`}`;

                        // Determine the text style based on the key
                        const textStyle = rowColor + rowRead + ((item?.spam == 1 || title.startsWith('spam')) ? rowSpam : '')
                        return (
                          <tr className={`text-md ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} hover:cursor-pointer transition-colors`} onClick={() => handleOpenModal(getRno(item))} key={key}>
                            {
                              isRepeat &&
                              <td className={`${className}`}>
                                <div className="flex items-center gap-4">
                                  <div>
                                    <div className={textStyle}>{((pageno - 1) * max) + key + 1}</div>
                                  </div>
                                </div>
                              </td>
                            }
                            <td className={className}>
                              <div className={`flex items-center gap-4 ${isRepeat ? 'min-w-[22rem]' : (item?.closing_date ? 'min-w-[17rem]' : 'min-w-[14rem]')}`} >
                                <div className="flex gap-2 items-center whitespace-nowrap">
                                  <div className={textStyle}>
                                    <SmartRegistrationNo regNo={getRno(item)} />
                                  </div>

                                  {
                                    item?.closing_date && item.closing_date.length > 0 && item.closing_date.toUpperCase() != 'NAT' &&
                                    <div className="mr-10">
                                      <CheckBadgeIcon height={"20"} width={"20"} fill="#008900" />
                                    </div>
                                  }
                                </div>

                                {
                                  isRepeat &&
                                  <div>
                                    <ViewRepeatButton
                                      filters={{
                                        name: item?.name,
                                        ministry: item?.ministry,
                                        state: item?.state,
                                        district: item?.district,
                                        from: startDate,
                                        to: endDate
                                      }}
                                    />
                                  </div>
                                }
                              </div>
                            </td>
                            {
                              isRepeat &&
                              <td className={className}>
                                <div className="flex items-center gap-4">
                                  <div>
                                    <div className={textStyle}>{item.count}</div>
                                  </div>
                                </div>
                              </td>
                            }
                            <td className={className}>
                              <div className="flex items-center gap-4 w-[8rem]">
                                <div>
                                  <div className={textStyle}>{capitalize(item.state)}</div>
                                </div>
                              </div>
                            </td>
                            <td className={className}>
                              <div className="flex items-center gap-4 w-[10rem]">
                                <div>
                                  <div className={textStyle}>{capitalize(item.district)}</div>
                                </div>
                              </div>
                            </td>
                            <td className={className}>
                              <div className="flex items-center gap-4">
                                <div>
                                  <div className={textStyle}>
                                    {formatDate(item.recvd_date, true)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className={className}>
                              <div className="flex items-center gap-4">
                                <div>
                                  <div className={textStyle}>
                                    {formatDate(item.closing_date)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className={className}>
                              <div className="flex items-center gap-4 w-[10rem] max-w-[20rem]">
                                <div>
                                  <div className={textStyle}>{capitalize(item.name)}</div>
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

          {
            (isLoading || searching) &&
            <div className={`text-center my-8 font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Loading...
            </div>
          }

          {
            noDataFound && (!grievances || grievances.length == 0) &&
            <div className={`text-center my-8 font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              No Data Found
            </div>
          }
        </CardBody>
      </Card>

      {
        modalIsOpen && (
          <Modal modalLoader={modalLoader} modalData={grievancesDesc} closureData={closureData} close={handleCloseModal} reload={(preload) => loadModalData(grievancesDesc?.registration_no, true, preload)} />
        )
      }
    </div >
  );
}

export const Pagination = ({
  pageno,
  setPageno,
  totalPages,
  disabled = false
}) => {
  const { isDark } = useTheme()
  const VISIBLE_PAGES = 5
  const DISTANCE_FROM_EDGES = Math.ceil(VISIBLE_PAGES / 2)

  const startPage = Math.max(pageno - DISTANCE_FROM_EDGES, 1)
  const endPage = Math.min(pageno + DISTANCE_FROM_EDGES, totalPages)

  return <div className="flex gap-1 group">
    <Button
      className={`${isDark ? 'bg-gray-700 text-blue-400 hover:bg-gray-600' : 'bg-white text-blue-800'} focus:opacity-100 h-10 px-1 md:h-[50px] rounded-r-sm invisible group-hover:visible transition-colors`}
      disabled={pageno == 1 || disabled}
      onClick={() => setPageno(1)}
    >
      <ChevronDoubleLeftIcon height={"100%"} />
    </Button>

    <Button
      className={`${isDark ? 'bg-gray-700 text-blue-400 hover:bg-gray-600' : 'bg-white text-blue-800'} focus:opacity-100 h-10 px-1 md:h-[50px] rounded-r-sm group-hover:rounded-sm transition-colors`}
      disabled={pageno == 1 || disabled}
      onClick={() => setPageno(pageno - 1)}
    >
      <ChevronLeftIcon height={"100%"} />
    </Button>

    {
      (new Array(VISIBLE_PAGES)).fill('')
        .map((value, index) => {
          // Page Number for the current button
          let btn_page_no = pageno + index + 1 - DISTANCE_FROM_EDGES

          if (btn_page_no >= startPage && btn_page_no <= endPage) {
            return <Button
              className={`${pageno == btn_page_no 
                ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-800 text-white') 
                : (isDark ? 'bg-gray-700 text-blue-400 hover:bg-gray-600' : 'bg-white text-blue-800')
              } focus:opacity-100 h-10 px-2 text-lg md:h-[50px] rounded-sm transition-colors`}
              onClick={() => setPageno(btn_page_no)}
              key={index}
              disabled={disabled}
            >
              {btn_page_no}
            </Button>
          }

          return ""
        })
    }

    <Button
      className={`${isDark ? 'bg-gray-700 text-blue-400 hover:bg-gray-600' : 'bg-white text-blue-800'} focus:opacity-100 h-10 px-1 md:h-[50px] rounded-l-sm ${totalPages != 0 ? 'group-hover:rounded-sm' : ''} transition-colors`}
      disabled={pageno == totalPages || disabled}
      onClick={() => setPageno(pageno + 1)}
    >
      <ChevronRightIcon height={"100%"} />
    </Button>

    {
      totalPages != 0 &&
      <Button
        className={`${isDark ? 'bg-gray-700 text-blue-400 hover:bg-gray-600' : 'bg-white text-blue-800'} focus:opacity-100 h-10 px-1 md:h-[50px] rounded-l-sm invisible group-hover:visible transition-colors`}
        disabled={pageno == totalPages || disabled}
        onClick={() => setPageno(totalPages)}
      >
        <ChevronDoubleRightIcon height={"100%"} />
      </Button>
    }
  </div>
}

export default GrievanceList;

export const SmartRegistrationNo = ({
  regNo,
  dir = "top"
}) => {
  const ministry = regNo.substring(0, regNo.indexOf('/'))

  const copyRegistrationNo = async (event) => {
    event.stopPropagation()

    await copyText(regNo)

    toast.success(`${regNo} copied!`)
  }

  return <div className="flex group">
    <MinistryWithToolTip ministry={ministry} dir={dir} />

    {regNo.replace(ministry, '')}

    <div className="hidden group-hover:block self-center cursor-pointer ml-1" onClick={copyRegistrationNo}>
      <DocumentDuplicateIcon height="1.2rem" width="1.2rem" />
    </div>
  </div>
}

export const ViewRepeatButton = ({
  filters,
  content = null
}) => {
  const repeatChildrenRoute = useMemo(() => `/dashboard/grievances/repeat-children?${(new URLSearchParams(filters)).toString()}`, [filters])

  return <Link to={repeatChildrenRoute}>
    {
      content ??
      <Button color="blue" size='sm' className="flex items-center h-[28px] px-2 lg:h-[32px] lg:px-2 flex gap-1">
        View&nbsp;Repeats <ArrowTopRightOnSquareIcon height={'1.3rem'} />
      </Button>
    }
  </Link>
}


const copyText = async (text) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text)
  } else {
    const input = document.createElement("textarea")
    input.value = text
    input.style.position = "fixed"
    input.style.opacity = "0"
    document.body.appendChild(input)
    input.focus()
    input.select()
    const success = document.execCommand("copy")
    document.body.removeChild(input)
    if (!success) throw new Error("Fallback copy failed")
  }
};