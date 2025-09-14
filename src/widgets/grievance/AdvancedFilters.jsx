import { Checkbox, Input, Option, Select } from "@material-tailwind/react"
import { FilterLayout, SearchButton } from "./BasicFilters"
import { getDepartmentList, stateData } from "@/data"
import stateMapping from '@/data/state-data'
import { useRef, useState } from "react"
import { DateRangePicker, MinistryAutocomplete, StateDistrictAutocomplete } from "@/pages/dashboard/CategoricalTree"

export function AdvancedFilters({
    ministry,
    setMinistry,
    from,
    setFrom,
    to,
    setTo,
    showClosed = 1,
    setShowClosed,
    state = 'All',
    setState,
    district = 'All',
    setDistrict,
    hideDates = false,
    searching = false,
    startSearch = () => ''
}) {
    const [dateRange, setDateRange] = useState({
        startDate: from,
        endDate: to
    })

    const [selectedMinistry, setSelectedMinistry] = useState({
        text: ministry == 'All' ? '' : ministry,
        value: ministry
    })

    const [stateDistrict, setStateDistrict] = useState({
        text: state == 'All' ? '' : state,
        values: {
            state: state,
            district: district
        }
    })

    const updateDateRange = range => {
        setFrom(range.startDate)
        setTo(range.endDate)
        setDateRange(range)
    }

    const updateSelectedMinistry = selection => {
        setMinistry(selection?.value)
        setSelectedMinistry(selection)
    }

    const updateStateDistrict = newStateDistrict => {
        setState(newStateDistrict?.values.state)
        setDistrict(newStateDistrict?.values.district)

        setStateDistrict(newStateDistrict)
    }

    const districtRef = useRef()
    const [districtList, setDistrictList] = useState(['All', ...stateMapping[state]])

    const setStateData = (stateName) => {
        setState(stateName)
        setDistrictList(['All', ...stateMapping[stateName]])
        // setDistrict('All')
    }

    const handelFromChange = (e) => {
        setFrom(e.target.value)
    }

    const handelToChange = (e) => {
        setTo(e.target.value)
    }

    return (
        <FilterLayout>
            {
                !hideDates &&
                <DateRangePicker
                    value={dateRange}
                    onChange={updateDateRange}
                />
            }

            <div>
                <MinistryAutocomplete
                    ministry={selectedMinistry}
                    setMinistry={updateSelectedMinistry}
                />
            </div>

            <div>
                <StateDistrictAutocomplete
                    stateDistrict={stateDistrict}
                    setStateDistrict={updateStateDistrict}
                />
            </div>

            <div className={"flex"}>
                <div className="w-[1rem] mr-2 pr-7 filter-checkbox">
                    <Checkbox color="blue" checked={showClosed == 1} onChange={(e) => setShowClosed(e.target.checked ? 1 : 0)} />
                </div>

                <label htmlFor="showClosed" className="pt-[0.35rem]">
                    <div>
                        Show closed
                    </div>
                </label>
            </div>

            <div className="flex justify-end col-span-2">
                <SearchButton
                    searching={searching}
                    startSearch={startSearch}
                />
            </div>
        </FilterLayout>
    )
}

export const RepeatFilters = ({
    filters,
    setFilters,
    searching = false,
    startSearch = () => ''
}) => {
    const [selectedMinistry, setSelectedMinistry] = useState({
        text: filters.ministry == 'All' ? '' : filters.ministry,
        value: filters.ministry
    })

    const [stateDistrict, setStateDistrict] = useState({
        text: filters.state == 'All' ? '' : filters.state,
        values: {
            state: filters.state,
            district: filters.district
        }
    })

    const updateSelectedMinistry = selection => {
        setFilters({ ...filters, ministry: selection?.value })

        setSelectedMinistry(selection)
    }

    const updateStateDistrict = newStateDistrict => {
        setFilters({
            ...filters,
            state: newStateDistrict?.values.state,
            district: newStateDistrict?.values.district
        })

        setStateDistrict(newStateDistrict)
    }

    return <FilterLayout>
        <div>
            <Input
                type="text"
                label="Name"
                value={filters.name}
                className="bg-white-input basic-input font-bold"
                onChange={({ target: { value: name } }) => setFilters({ ...filters, name })}
                autoFocus
            />
        </div>

        <div>
            <DateRangePicker
                value={{
                    startDate: filters.from,
                    endDate: filters.to
                }}
                onChange={({ startDate, endDate }) => setFilters({ ...filters, from: startDate, to: endDate })}
            />
        </div>

        <div>
            <MinistryAutocomplete
                ministry={selectedMinistry}
                setMinistry={updateSelectedMinistry}
            />
        </div>

        <div>
            <StateDistrictAutocomplete
                stateDistrict={stateDistrict}
                setStateDistrict={updateStateDistrict}
            />
        </div>

        <div className="flex justify-end col-span-2">
            <SearchButton
                searching={searching}
                startSearch={startSearch}
            />
        </div>
    </FilterLayout>
}

