import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer } from "react-leaflet"
import State from "./State"
import LegendItem from "./LegendItem"
import { mapUrl } from "@/helpers/env"
import { useCallback, useEffect, useMemo, useState } from "react"
import state_id_pair from '../../../data/json/india_state_id_pair.json'
import default_grievances from '../../../data/json/dummy/state_grevances.json'
import states from '../../../data/json/india_states.json'
import state_text_bounds from '../../../data/json/india_state_text_bounds.json'
import { center, colors, id_state_pair, reduceGrievances, textColor } from "./HeatMap"
import { Copyright } from "./copyright"
import { Loader } from "@/pages/dashboard/CategoricalTree"
import { toast } from "react-toastify"
import populations from "@/data/json/india_state_populations.json"
import { numberToWords } from "@/helpers/general"

const ZOOM = 5

export const HeatMap2 = ({
    grievances,
    className,
    getDistricts = null,
    focusDistrict = () => '',
    legendSuffix = "",
    noFocus = false
}) => {
    const [focusedState, setFocusedState] = useState(null)
    const [districtData, setDistrictData] = useState([])
    const [loading, setLoading] = useState(false)
    const [focusedDistrict, setFocusedDistrict] = useState(null)
    const [showDensityBased, setShowDensityBased] = useState(false)

    function getColor(grievance_count) {
        return colors
            .find(color => grievance_count > getThreshold(color.percentage))
            ?.color
            || "#fff0" // Default value
    }

    const getThreshold = percentage => Math.round(percentage * upperLimit())

    const populationGradient = useMemo(() => {
        const gradient = 10
        const max = Math.max(...grievances.map(({ count }) => count))

        return 10 ** (gradient - max.toString().length)
    }, [grievances])

    const simplifiedGrievances = useMemo(() => {
        let simple_grievances = getSimplifiedGrievances(grievances)
        if (showDensityBased) {

            simple_grievances = getSimplifiedGrievances(grievances.map(({ state, count }) => {

                const population_state_name = Object.keys(populations).find(state_name => state_name.toLowerCase() == state.toLowerCase())

                return ({
                    state,
                    count: population_state_name
                        ? Math.round((count / populations[population_state_name]) * populationGradient)
                        : 0
                })
            }))
        }


        return simple_grievances
    }, [grievances, showDensityBased])

    const upperLimit = useCallback(() => {
        let max = Math.max(...Object.values(simplifiedGrievances))
        let desiredZeros = parseInt(max).toString().length - 1

        return Math.round(max / 10 ** desiredZeros) * 10 ** desiredZeros
    }, [simplifiedGrievances])

    let options = state_id => (
        {
            fillColor: getColor(simplifiedGrievances[state_id]),
            weight: focusedState == state_id ? 2 : 1,
            opacity: 1,
            color: focusedState == state_id ? '#000' : '#36454F',
            dashArray: '3',
            fillOpacity: 0.7,
        }
    )

    const updateFoucsedDistrict = district => {
        if (focusDistrict(district))
            setFocusedDistrict(district)
    }

    useEffect(() => {
        setDistrictData([]) // Setting district data to default

        if (getDistricts && focusedState) {
            setLoading(true)

            getDistricts(id_state_pair[focusedState].trim())
                .then(setDistrictData)
                .catch(() => toast("Error encountered. Try again!", { type: 'error' }))
                .finally(() => setLoading(false))
        }
    }, [focusedState])

    useEffect(() => {
        setFocusedState(null)
        setDistrictData([])
    }, [grievances])

    return (
        <div className='map relative h-full'>
            <MapContainer className={`map h-full ${className}`} center={center} zoom={ZOOM} scrollWheelZoom={false} minZoom={ZOOM}>
                <TileLayer url={mapUrl} />

                {
                    states.features.map((state) =>
                        <State
                            state={state}
                            options={options(state.properties.id)}
                            textBounds={state_text_bounds[state.properties.id]}
                            text={simplifiedGrievances[state.properties.id]?.toLocaleString('en-US') + legendSuffix}
                            count={simplifiedGrievances[state.properties.id] ?? 0}
                            key={state.properties.id}
                            textColor={textColor}
                            index={state.properties.id}
                            focusedState={focusedState}
                            focus={() => !noFocus && setFocusedState(state.properties.id)}
                            districts={districtData}
                            loading={loading}
                            setDistrict={updateFoucsedDistrict}
                            focusedDistrict={focusedDistrict}
                        />
                    )
                }
            </MapContainer>

            {
                upperLimit() > 0 &&
                <div className='absolute top-3 sm:top-6 right-3 sm:right-6 z-[1] flex flex-col items-end select-none'>
                    {
                        upperLimit() > 8 &&
                        grievances.length > 1 && // Preventing Legend display when only one state is filtered
                        <Legend getThreshold={getThreshold} suffix={legendSuffix} />
                    }

                    <FocusedStateInfo focusedState={focusedState} grievances={simplifiedGrievances} districts={districtData} focusDistrict={updateFoucsedDistrict} />
                </div>
            }

            {
                showDensityBased &&
                <div className='absolute bottom-6 left-3 sm:right-6 z-[1] items-end select-none'>
                    Total grievances for {numberToWords(populationGradient)} state residents (2011 census)
                </div>
            }

            {
                <div className='absolute bottom-1 left-3 sm:right-6 z-[1] items-end select-none'>
                    <input 
                        type="checkbox" 
                        checked={showDensityBased} 
                        onChange={() => setShowDensityBased(!showDensityBased)}
                        onClick={() => setShowDensityBased(!showDensityBased)} 
                    />
                    <span onClick={() => setShowDensityBased(!showDensityBased)} className="cursor-pointer"> Show Population Density Based </span>
                </div>
            }

            <Copyright />
        </div>
    )
}

const Legend = ({
    getThreshold,
    suffix = ""
}) => {
    return (
        <div className='legend rounded-lg bg-white px-3 sm:px-5 py-2 sm:py-3'>
            <div className='text-[12px] text-black mb-2'>
                Grievances
            </div>

            {
                colors.map((color, index) =>
                    <LegendItem
                        className={color.className}
                        text={
                            color.percentage == 0
                                ? '&lt; ' + getThreshold(colors[index - 1].percentage).toLocaleString('en-US') + suffix
                                : '&gt; ' + getThreshold(colors[index].percentage).toLocaleString('en-US') + suffix
                        }
                        key={index}
                    />
                )
            }
        </div>
    )
}

const FocusedStateInfo = ({
    focusedState,
    grievances,
    districts,
    focusDistrict
}) => {
    return focusedState != null &&
        <div className='rounded-lg bg-white p-1 sm:p-3 mt-2 text-right'>
            <div className='font-bold text-sm'>
                {capitalize(id_state_pair[focusedState])} ({grievances[focusedState]?.toLocaleString('en-US')})
            </div>

            {
                grievances[focusedState] > 0 &&
                (
                    districts.length == 0
                        ? <div className="flex justify-center mt-3">
                            <Loader className="animate-spin" />
                        </div>
                        : districts
                            .sort((a, b) => b.count - a.count)
                            .slice(0, 5)
                            .map(district =>
                                <div className='text-sm cursor-pointer' key={district.district} onClick={() => focusDistrict(district.district)}>
                                    {capitalize(district.district)}: {district.count.toLocaleString('en-US')}
                                </div>
                            )
                )
            }
        </div >
}

const getSimplifiedGrievances = grievances => ({
    ...reduceGrievances(default_grievances),
    ...reduceGrievances(grievances)
})

const capitalize = sentance =>
    sentance
        .split(' ')
        .map(word =>
            word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase()
        )
        .join(' ')
