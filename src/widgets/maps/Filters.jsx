import {
    Input,
    Select,
    Option,
    Button,
    Checkbox
} from "@material-tailwind/react";
import { departmentData, getDepartmentList, stateData } from "@/data";
import stateMapping from '@/data/state-data'
import { useEffect, useMemo, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

export default function Filters({
    ministry,
    from,
    to,
    search,
    searchIt
}) {
    const [query, setQuery] = useState(search.value.query)
    const [state, setState] = useState(search.value.state)
    const [district, setDistrict] = useState(search.value.district)
    const [districtList, setDistrictList] = useState(['All', ...stateMapping[state]])
    const [type, setType] = useState(search.value.type)
    const [showClosed, setShowClosed] = useState(search.value.showClosed)
    const [threshold, setThreshold] = useState(search.value.threshold)
    const districtRef = useRef()

    function handleChange(event, setter) {
        setter(event.target.value)
    }

    const appendSearch = (show = false) => {
        search.setter({
            query: query,
            type: type,
            state: state,
            district: districtRef.current?.getElementsByTagName('button')[0]?.getElementsByTagName('span')[0].getAttribute('value') ?? 'All',
            showClosed: showClosed,
            threshold: threshold,
            show: show
        })
        // searchIt()
    }

    const setStateData = (stateName) => {
        setState(stateName)
        setDistrictList(['All', ...stateMapping[stateName]])
    }

    // const districtList = () => ['All', ...stateMapping['assam']]

    useEffect(() => {
        setQuery(search.value.query)
        setState(search.value.state)
        setDistrictList(['All', ...stateMapping[search.value.state]])
        // setDistrict(search.value.district)
        setType(search.value.type)
        setShowClosed(search.value.showClosed)
        setThreshold(search.value.threshold)
    }, [search])

    useEffect(() => {
        appendSearch()
    }, [query, type, state, showClosed, threshold])

    return (
        <div className="mb-6 mt-4 grid grid-cols-1 gap-y-6 gap-x-6 md:grid-cols-2 xl:grid-cols-4 ">
            <div>
                <Select
                    className=""
                    label="Select Ministry"
                    value={ministry.value}
                    onChange={ministry.setter}
                >
                    {
                        getDepartmentList().map((item, key) => {
                            return (
                                <Option value={item.value} key={key}>{item.label}</Option>
                            )
                        })
                    }
                </Select>
            </div>

            <div className="filter-date-box flex gap-2">
                <Input value={from.value} onChange={(e) => handleChange(e, from.setter)} type="date" label="From" size="md" />

                <Input value={to.value} onChange={(e) => handleChange(e, to.setter)} type="date" label="To" size="md" />
            </div>

            <Input value={query} onChange={(e) => handleChange(e, setQuery)} type="text" label="Search" size="md" />

            {
                (query.length > 0 || search.value.query.length > 0) &&
                <>
                    <div className="flex justify-between gap-2">
                        <div className="flex">
                            <div className="w-[1rem] mr-2 pr-7 filter-checkbox">
                                <Checkbox color="blue" onChange={(e) => setShowClosed(e.target.checked ? 1 : 0)} />
                            </div>

                            <label htmlFor="showClosed" className="pt-[0.35rem]">
                                <div>
                                    Show closed
                                </div>
                            </label>
                        </div>

                        <Button size="sm" className="h-[2.5rem] mr-2 pl-6 pr-8 flex py-3 z-1000" onClick={() => appendSearch(true)}>
                            <MagnifyingGlassIcon height={15} className="mr-2" />
                            Search
                        </Button>
                    </div>

                    <div>
                        <Select
                            className=""
                            label="Select State"
                            value={state}
                            onChange={setStateData}
                        >
                            {
                                stateData.map((item, key) =>
                                    <Option value={item.value} key={key}>{item.label}</Option>
                                )
                            }
                        </Select>
                    </div>

                    <div>
                        {
                            <Select
                                className=""
                                label="Select District"
                                value={district}
                                ref={districtRef}
                            // onChange={setDistrict}
                            >
                                {
                                    districtList.map((district, key) => {
                                        return (
                                            <Option value={district} key={key}>{district.toUpperCase()}</Option>
                                        )
                                    })
                                }
                            </Select>
                        }
                    </div>

                    <div>
                        <Select
                            value={type.toString()}
                            onChange={setType}
                            label="Select Type"
                        >
                            <Option value="1">Semantic</Option>
                            <Option value="2">Keyword</Option>
                        </Select>
                    </div>

                    <div className="-mt-1">
                        <div>
                            Relevance: {threshold}
                        </div>

                        <input type="range" value={threshold} min={1.2} max={2} step={0.1} onChange={(e) => handleChange(e, setThreshold)} className="cursor-pointer border-t-0 shadow-none w-full" />
                    </div>
                </>
            }
        </div>
    )
}