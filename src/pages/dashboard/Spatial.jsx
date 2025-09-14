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
  // const [ministry, setMinistry] = React.useState('AYUSH')
  const [from, setFrom] = React.useState(dateBefore(countDayDuration))
  const [to, setTo] = React.useState(formatDate())
  const [searching, setSearching] = useState(true)
  const [savedSearch, setSavedSearch] = useState({ ministry, from, to })
  const [grievances, setGrievances] = useState([])

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
      mapService.getHeatmapGrievances(ministry, from, to)
        .then(response => {
          let grievances = Object.values(response.data)

          setGrievances(grievances)

          setSavedSearch({ ...{ ministry, from, to } })

          setSearching(false)

          if (grievances.length == 0) {
            toast("No grivance found!", { type: 'error' })
          }
        })
        .catch(error => toast(error.message, { type: 'error' }))
  }, [searching])

  return (
    <div>
      <BasicFilters
        from={from}
        setFrom={setFrom}
        to={to}
        setTo={setTo}
        ministry={ministry}
        setMinistry={setMinistry}
        searching={searching}
        startSearch={() => setSearching(true)}
        ComplementaryInfo={SpatialSearchLinkButton}
      />

      <div className="grid grid-cols-5 gap-3">
        <div className="col-span-5 h-[80vh]">
          <HeatMap2
            grievances={grievances}
            className={'rounded-md'}
            getDistricts={getDistricts}
          />
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
