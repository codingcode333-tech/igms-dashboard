import React, { useCallback, useEffect, useState } from "react";
import { formatDate, dateBefore } from "@/helpers/date";
import mapService from "@/services/maps"
import { getDefaultDepartment } from "@/data";
import { countDayDuration, defaultThreshold } from "@/helpers/env";
import { BasicFilters } from "@/widgets/grievance/BasicFilters";
import { HeatMap2 } from "@/widgets/maps/heatmap/HeatMap2";
import { toast } from "react-toastify";
import { Button } from "@material-tailwind/react";
import { ArrowUpRightIcon } from "@heroicons/react/24/solid";
import { setOpenConfigurator, useMaterialTailwindController } from "@/context";

export function Spatial() {
  const [ministry, setMinistry] = React.useState(getDefaultDepartment())
  const [from, setFrom] = React.useState(dateBefore(countDayDuration))
  const [to, setTo] = React.useState(formatDate())
  const [searching, setSearching] = useState(true)
  const [savedSearch, setSavedSearch] = useState({ ministry, from, to })
  const [grievances, setGrievances] = useState([])
  // Add state for filters
  const [stateFilter, setStateFilter] = useState('All')
  const [districtFilter, setDistrictFilter] = useState('All')

  const getDistricts = useCallback(async state => {
    const response = await mapService
      .getDistrictCount(state, savedSearch.ministry, savedSearch.from, savedSearch.to)
      .catch(error => {
        toast(error.message, { type: 'error' })
        return { data: {} }
      })

    return Object.values(response.data).sort((a, b) => a.count - b.count)
  }, [savedSearch])

  useEffect(() => {
    if (searching)
      mapService.getHeatmapGrievances(ministry, from, to, stateFilter, districtFilter)
        .then(response => {
          let grievances = response.data || []

          setGrievances(grievances)

          setSavedSearch({ ...{ ministry, from, to } })

          setSearching(false)

          if (grievances.length == 0) {
            toast("No grivance found!", { type: 'error' })
          }
        })
        .catch(error => toast(error.message, { type: 'error' }))
  }, [searching])

  // Add effect to trigger search when filters change
  useEffect(() => {
    setSearching(true)
  }, [stateFilter, districtFilter, ministry, from, to])

  return (
    <div style={{
      backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Blank_Map_of_India.svg/800px-Blank_Map_of_India.svg.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      backgroundBlendMode: 'soft-light',
      minHeight: '100vh', // Ensure the background covers the entire viewport height
      opacity: 0.9
    }}>
      <BasicFilters
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.4)', // Reduced opacity for more transparency
          backdropFilter: 'blur(15px)', // Increased blur radius for better effect
          borderRadius: '10px', // Optional: Add rounded corners
          padding: '15px', // Increased padding for better spacing
          boxShadow: '0 8px 15px rgba(0, 0, 0, 0.15)', // Enhanced shadow for more depth
          border: '1px solid rgba(255, 255, 255, 0.3)' // Added subtle border
        }}
        from={from}
        setFrom={setFrom}
        to={to}
        setTo={setTo}
        ministry={ministry}
        setMinistry={setMinistry}
        searching={searching}
        startSearch={() => setSearching(true)}
        // Add state and district filter props
        state={stateFilter}
        setState={setStateFilter}
        district={districtFilter}
        setDistrict={setDistrictFilter}
        ComplementaryInfo={SpatialSearchLinkButton}
      />

      <div className="grid grid-cols-5 gap-3">
        <div className="col-span-5 h-[80vh]">
          <div style={{ 
            backdropFilter: 'blur(15px)', 
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            borderRadius: '0.5rem',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <HeatMap2
              grievances={grievances}
              className={'rounded-md'}
              getDistricts={getDistricts}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Spatial;

const SpatialSearchLinkButton = ({
  className
}) => {
  const [controller, dispatch] = useMaterialTailwindController();

  return (
    <Button
      color="green"
      className={`${className} h-[2.6rem] flex justify-center items-center gap-2`}
      onClick={() => setOpenConfigurator(dispatch, true)}
    >
      Go to Spatial Search
      <ArrowUpRightIcon className="h-[1.2rem]" />
    </Button>
  )
}