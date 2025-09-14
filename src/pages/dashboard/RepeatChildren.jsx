import GrievanceList from '@/widgets/grievance/list'
import { useState, useEffect } from 'react'
import grievanceService from "@/services/grievances"
import { useNavigate, useParams } from 'react-router-dom'
import { defaultFrom, defaultTo } from '@/helpers/env'
import { getDefaultDepartment } from '@/data'
import { RepeatFilters } from '@/widgets/grievance/AdvancedFilters'

export function RepeatChildren(props) {
    const [grievances, setGrievances] = useState([])

    const [searching, setSeraching] = useState(false)
    const navigateTo = useNavigate()

    const params = new URLSearchParams(window.location.search)

    if (!params.get('name'))
        navigateTo('/')

    const [filters, setFilters] = useState({
        name: params.get('name') ?? '',
        from: params.get('from') ?? defaultFrom,
        to: params.get('to') ?? defaultTo,
        state: params.get('state') ?? 'All',
        district: params.get('district') ?? 'All',
        ministry: params.get('ministry') ?? getDefaultDepartment()
    })

    const [activeFilters, setActiveFilters] = useState(filters)

    useEffect(() => {
        const getGrievances = async () => {
            setGrievances(null)

            const { name, from, to, state, district, ministry } = filters

            const grievances = await grievanceService.getRepeatChildren(name, from, to, state, district, ministry)

            const data = grievances.data

            setGrievances(Object.values(data));

            setActiveFilters(filters)

            setSeraching(false)
        }

        if (searching)
            getGrievances()

        // Find the function with value 'value5' in the array
    }, [searching]);

    useEffect(() => {
        setSeraching(true)
    }, [])

    return <div>
        <RepeatFilters
            filters={filters}
            setFilters={setFilters}
            searching={searching}
            startSearch={() => setSeraching(true)}
        />

        <GrievanceList
            title={"Repeat Grievances"}
            grievances={grievances}
            parent_rno={activeFilters.name}
            searching={searching}
            total={grievances?.length}
            count={grievances?.length}
        />
    </div>
}

export default RepeatChildren;
