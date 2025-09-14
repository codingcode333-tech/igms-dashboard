import GrievanceList from '@/widgets/grievance/list'
import { useState, useEffect, useRef } from 'react'
import grievanceService from "@/services/grievances"
import { useParams } from 'react-router-dom'
import { downloadData } from '@/helpers/download'
import { BasicFilters } from '@/widgets/grievance/BasicFilters'
import { setLoading, useMaterialTailwindController } from '@/context'
import { AdvancedFilters } from '@/widgets/grievance/AdvancedFilters'
import { getUser } from '@/context/UserContext'
import { toast } from 'react-toastify'
import { Button } from '@material-tailwind/react'
// import { useFilter } from "@/context/FilterContext";

export function Grievances() {
  const [grievances, setGrievances] = useState([])
  const [pageno, setPageno] = useState(1);
  const [count, setCount] = useState()
  const [total, setTotal] = useState()
  var { id, ministry, from, to } = useParams()
  const type = id
  const isFresh = type == 'fresh'
  if (isFresh) {
    from = to = 'NA'
  }

  const [currentMinistry, setCurrentMinistry] = useState(ministry)
  const [currentFrom, setCurrentFrom] = useState(from)
  const [currentTo, setCurrentTo] = useState(to)
  const [, dispatch] = useMaterialTailwindController()
  const [showClosed, setShowClosed] = useState(1)
  const [state, setState] = useState("All")
  const [district, setDistrict] = useState("All")
  const user = getUser()
  const [firstLoad, setFirstLoad] = useState(true)
  const [searching, setSearching] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const listingRef = useRef(null)

  const download = async () => {
    setDownloading(true)

    const data = (await grievanceService.getGrievancesOfType(type, pageno, currentMinistry, currentFrom, currentTo, showClosed, state, district, true)).data

    const route = downloadData(data?.filename)

    setDownloading(false)

    toast(<DownloadMessage route={route} />, {
      type: 'info',
      autoClose: 10000,
      closeOnClick: false,

    })
  }

  const getGrievances = async (resetPageNo = false) => {
    let currentPage = pageno
    if (firstLoad) {
      setFirstLoad(true)
      currentPage = 1
      setPageno(1)
    }

    let data = (await grievanceService.getGrievancesOfType(type, currentPage, currentMinistry, currentFrom, currentTo, showClosed, state, district)).data
    let list = []

    list = ['{}', undefined, null].includes(data.data[0]) ? [] : Object.values(data.data[0])


    if (user.username == 'dpg' && type != 'repeat') {
      setTimeout(async () => {
        const additional_data = (await grievanceService.getGrievancesOfType(type, currentPage, 'DARPG/D', currentFrom, currentTo, showClosed, state, district)).data

        if (list && additional_data.data && additional_data.data[0])
          setGrievances([
            ...list,
            ...Object.values(additional_data.data[0])
          ])

        if (data.count && additional_data.count)
          data.count += additional_data.count

        if (data.total_count?.total_count && additional_data.total_count?.total_count)
          data.total_count.total_count += additional_data.total_count?.total_count

        setCount(data.count)
        setTotal(data.total_count?.total_count)
      }, 1000)
    }


    setSearching(false)

    setGrievances(list)

    setCount(data.count)
    setTotal(data.total_count?.total_count)

    if (data.count && data.count > 0)
      listingRef.current.scrollIntoView({
        behavior: 'smooth'
      })
  }

  const startSearch = () => {
    setFirstLoad(true)
    setSearching(true)
  }

  const isRepeat = type == 'repeat'

  useEffect(() => {
    if (!searching) {
      // getGrievances(false, true)
      setFirstLoad(false)
      setSearching(true)
    }
  }, [pageno]);

  useEffect(() => {
    if (searching)
      getGrievances(true)
  }, [searching])

  return <div>
    <div className='mx-4 mt-4'>
      <AdvancedFilters
        ministry={currentMinistry}
        setMinistry={setCurrentMinistry}
        from={currentFrom}
        setFrom={setCurrentFrom}
        to={currentTo}
        setTo={setCurrentTo}
        hideDates={isFresh}
        showClosed={showClosed}
        setShowClosed={setShowClosed}
        setState={setState}
        setDistrict={setDistrict}
        searching={searching}
        startSearch={startSearch}
      />
    </div>

    <div ref={listingRef}>
      <GrievanceList
        title={id + " Grievances"}
        grievances={grievances}
        count={count}
        total={total}
        pageno={pageno}
        setPageno={setPageno}
        download={download}
        downloading={downloading}
        scrollH={'80vh'}
        isRepeat={isRepeat}
        noDataFound={count == 0 && !searching}
        searching={searching}
        startDate={isRepeat && from}
        endDate={isRepeat && to}
      />
    </div>
  </div>
}


const DownloadMessage = ({
  route
}) => <div>
    <div>
      <p>Your download should start shortly, if it does not starts you can click on the following link to download.</p>

      <Button size='sm' className='h-[2rem] mt-2'>
        <a href={route} download>Download CSV</a>
      </Button>
    </div>
  </div>


export default Grievances
