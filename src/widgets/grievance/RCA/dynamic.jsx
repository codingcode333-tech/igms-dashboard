import { defaultFrom, defaultTo } from "@/helpers/env"
import { useState } from "react"
import { FilterLayout, SearchButton } from "../BasicFilters"
import { DateRangePicker, MinistryAutocomplete, StateDistrictAutocomplete } from "@/pages/dashboard/CategoricalTree"
import { dateBefore } from "@/helpers/date"
import { getDefaultDepartment, getDepartmentList } from "@/data"

export const Filters = ({
    filters,
    setFilters
}) => {
    const [selectedMinistry, setSelectedMinistry] = useState({
        text: filters.ministry,
        value: filters.ministry
    })
    const [dateRange, setDateRange] = useState({
        startDate: dateBefore(120),
        endDate: defaultTo
    })
    const [stateDistrict, setStateDistrict] = useState({
        text: 'All',
        values: {
            state: 'All',
            district: 'All'
        }
    })
    const [clusters, setClusters] = useState(filters.clusters)
    const searching = false;

    const startSearch = () => {
        setFilters({
            ministry: selectedMinistry.value,
            ...dateRange,
            ...stateDistrict.values,
            clusters
        })
    }

    return <FilterLayout>
        <MinistryAutocomplete
            ministry={selectedMinistry}
            setMinistry={setSelectedMinistry}
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

        <div className={`-mt-1`}>
            <div>
                No of Clusters: <span className="text-blue-900 font-bold">{clusters}</span>
            </div>

            <input type="range" value={clusters} min={4} max={14} step={1} onChange={e => setClusters(e.target.value)} className="cursor-pointer border-t-0 shadow-none w-full" />
        </div>

        <div className="col-start-3 flex justify-end items-end m-2">
            <SearchButton searching={searching} startSearch={startSearch} />
        </div>
    </FilterLayout>
}

export const getDefaultDepartmentOrFiller = (fillter = "CBODT") => getDepartmentList().length == 1 ? getDefaultDepartment() : fillter