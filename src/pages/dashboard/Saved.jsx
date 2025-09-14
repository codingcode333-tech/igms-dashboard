import GrievanceList from '@/widgets/grievance/list'
import { useState, useEffect } from 'react'
import grievanceService from "@/services/grievances"
import { downloadData } from '@/helpers/download';
import { startLoading, stopLoading, useMaterialTailwindController } from '@/context';
import { toast } from 'react-toastify';

export function Saved(props) {
  const [grievances, setGrievances] = useState([])
  const [pageno, setPageno] = useState(1);
  const [count, setCount] = useState()
  const [, dispatch] = useMaterialTailwindController()

  const download = async () => {
    const data = (await grievanceService.savedGrievances(pageno, true)).data
    downloadData(data?.filename)
  }

  useEffect(() => {
    const getGrievances = async () => {
      setGrievances(null)

      startLoading(dispatch)
      const grievances = await grievanceService.savedGrievances(pageno)
        .catch(error => {
          toast(error.message, {
            type: "error"
          })
        })
        .finally(() => stopLoading(dispatch))
      const data = grievances.data['data'][0]
      setCount(grievances.data.count)
      setGrievances(Object.values(data));
    }

    getGrievances()

    // Find the function with value 'value5' in the array
  }, []);

  return <>
    <GrievanceList title="Saved Grievances" grievances={grievances} count={count} download={download} />
  </>
}

export default Saved;
