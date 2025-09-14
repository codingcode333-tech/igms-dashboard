import GrievanceList from '@/widgets/grievance/list'
import { useState, useEffect } from 'react'
import grievanceService from "@/services/grievances"
import { startLoading, stopLoading, useMaterialTailwindController } from '@/context';

export function Read(props) {
  const [grievances, setGrievances] = useState([])
  const [page_no, setPageno] = useState(1);
  const [count, setCount] = useState()
  const [, dispatch] = useMaterialTailwindController()

  useEffect(() => {
    startLoading(dispatch)

    const getGrievances = async () => {
      let data = (await grievanceService.readGrievances().finally(() => stopLoading(dispatch))).data
      setGrievances(data.read_list)
      setCount(data.count)
    }

    getGrievances()

    // Find the function with value 'value5' in the array
  }, []);

  return <>
    <GrievanceList title="Read Grievances" grievances={grievances} count={count} />
  </>
}