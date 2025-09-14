import 'leaflet/dist/leaflet.css'
import styles from '../css/map.css'
import { MapContainer, TileLayer } from 'react-leaflet'
import states from '../../../data/json/india_states.json'// assert { type: 'json' }
import State from './State'
import state_id_pair from '../../../data/json/india_state_id_pair.json'// assert { type: 'json' }
import httpService from '../../../services/httpService'
import state_text_bounds from '../../../data/json/india_state_text_bounds.json'
import default_greivances from '../../../data/json/dummy/state_grevances.json'
// import default_greivances from '@/data/json/dummy/state_grevances_sample.json'
// import Image from 'next/image'
import LegendItem from './LegendItem'
import { useEffect, useState } from 'react'
// import { assert } from 'console'
import mapService from '../../../services/maps'
import { Copyright } from './copyright'
import { setLoading, useMaterialTailwindController } from '@/context'
import { sleep } from '@/helpers/general'
import { getUser } from '@/context/UserContext'

export const colors = [
    {
        percentage: 0.75,
        color: '#DC1C13',
        className: 'bg-legend-red-1'
    },
    {
        percentage: 0.5,
        color: '#EA4C46',
        className: 'bg-legend-red-2'
    },
    {
        percentage: 0.25,
        color: '#F07470',
        className: 'bg-legend-red-3'
    },
    {
        percentage: 0,
        color: '#F6BDC0',
        className: 'bg-legend-red-4'
    }
]

export const textColor = '#353839'
export const center = [23, 83];

export const reduceGrievances = grievance_data => grievance_data.reduce((accumulator, state_data) => {
    if (state_id_pair[state_data['state']]) {
        accumulator[state_id_pair[state_data['state']]] = state_data['count']
    }

    return accumulator
}, {})

export const id_state_pair = Object.keys(state_id_pair).reduce((accumulator, state) => {
    accumulator[state_id_pair[state]] = state
    return accumulator
}, {})

export default function Map({
    ministry,
    from,
    to,
    stateWiseGrievances = null,
    filterState,
    ...props
}) {
    const [focusedState, setFocusedState] = useState(null)
    const [districtData, setDistrictData] = useState([])
    const [district, setDistrict] = useState(null)
    const [districts, setDistricts] = useState([])
    const [, dispatch] = useMaterialTailwindController()
    const user = getUser()

    let updatedGrievances = [...default_greivances]

    if (stateWiseGrievances != null) {
        updatedGrievances = default_greivances.map(grv => {
            if (stateWiseGrievances[grv.state]) {
                grv.count = stateWiseGrievances[grv.state]
            }

            return grv
        })
    }
    const [grievances, setGrievances] = useState(reduceGrievances(updatedGrievances))
    const maxGrievances = () => Math.max(...Object.values(grievances))
    const desiredZeros = () => maxGrievances().toString().length - 1
    const upperLimit = () => Math.round(maxGrievances() / 10 ** desiredZeros()) * 10 ** desiredZeros()

    let loadIndex = 0;

    let options = (state_id) => {
        return {
            fillColor: getColor(grievances[state_id]),
            weight: focusedState == state_id ? 2 : 1,
            opacity: 1,
            color: focusedState == state_id ? '#000' : '#36454F',
            dashArray: '3',
            fillOpacity: 0.7,
        }
    }

    function getColor(grievance_count) {
        return colors.reduce((selected_color, color) => {
            if (!selected_color && grievance_count > getThreshold(color.percentage)) {
                selected_color = color.color
            }
            return selected_color
        }, null) ?? colors[colors.length - 1].color
    }

    const getThreshold = percentage => Math.round(percentage * upperLimit())

    const appendData = (initialData, newData, selector) => {
        newData.forEach(item => {
            let location = initialData.findIndex(o_item => o_item[selector] == item[selector])

            if (location == -1)
                initialData.push(item)
            else {
                initialData[location].count += item?.count ?? 0
            }
        })

        return initialData
    }

    const capitalize = sentance => sentance.split(' ').map(word => word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase()).join(' ')

    useEffect(() => {
        async function load() {
            if (stateWiseGrievances == null) {
                loadIndex++
                let relativeLoadIndex = loadIndex

                await sleep(400)

                setLoading(dispatch, true)
                mapService.getHeatmapGrievances(ministry, from, to)
                    .then(async response => {
                        if (relativeLoadIndex == loadIndex) {
                            let grievance_list = Object.values(response.data)

                            setGrievances({
                                ...reduceGrievances(default_greivances),
                                ...reduceGrievances(grievance_list)
                            })

                            if (user.username == 'dpg') {
                                await sleep(500)

                                let n_grievance_list = Object.values(
                                    (await mapService.getHeatmapGrievances('DARPG/D', from, to)).data
                                )

                                grievance_list = appendData(grievance_list, n_grievance_list, 'state')

                                setGrievances({
                                    ...reduceGrievances(default_greivances),
                                    ...reduceGrievances(grievance_list)
                                })
                            }
                        }
                    })
                    .finally(() => setLoading(dispatch, false))
            }
        }

        load()
    }, [ministry, from, to])

    useEffect(() => {
        if (focusedState != null) {
            if (stateWiseGrievances == null) {
                setDistrictData([])
                setDistrict(null)
                setLoading(dispatch, true)
                mapService.getDistrictCount(id_state_pair[focusedState].trim(), ministry, from, to)
                    .then(response => {
                        setDistrictData(
                            Object.values(response.data)
                                .sort((a, b) => a.count - b.count)
                        )
                        // console.log('district', Object.values(response.data)
                        // .sort((a, b) => a.count - b.count))
                    })
                    .finally(() => setLoading(dispatch, false))
            }
            else {
                if (filterState) {
                    filterState(id_state_pair[focusedState])
                }
            }
        }
    }, [focusedState, ministry, from, to])

    useEffect(() => {
        let dists = [...districtData]
        dists.reverse()
        setDistricts(dists)
    }, [districtData])

    useEffect(() => {
        if (stateWiseGrievances != null) {
            let updatedGrievances = default_greivances.map(grv => {
                if (stateWiseGrievances[grv.state]) {
                    grv.count = stateWiseGrievances[grv.state]
                }

                return grv
            })

            setGrievances(reduceGrievances(updatedGrievances))
        }
    }, [stateWiseGrievances])

    return (
        <div className='map relative'>
            <MapContainer className={"map " + props?.className} center={center} zoom={5} scrollWheelZoom={false} minZoom={5}>
                <TileLayer
                    // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    url="https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmlzaGVldGhzIiwiYSI6ImNrbDAzdWI1ejAxZWYycXQ3bWZreWNpbHMifQ.ERCOXWF81KOAgtBflWQrLg"
                />

                {
                    states.features.map((state) =>
                        <State
                            state={state}
                            options={options(state.properties.id)}
                            textBounds={state_text_bounds[state.properties.id]}
                            text={grievances[state.properties.id]?.toLocaleString('en-US')}
                            key={state.properties.id}
                            textColor={textColor}
                            index={state.properties.id}
                            focusedState={focusedState}
                            focus={() => setFocusedState(state.properties.id)}
                            districts={districtData}
                            showDistrictData={setDistrict}
                        />
                    )
                }
            </MapContainer>

            {
                upperLimit() &&
                <div className='absolute top-3 sm:top-6 right-3 sm:right-6 z-[1] flex flex-col items-end'>
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
                                            ? '&lt; ' + getThreshold(colors[index - 1].percentage).toLocaleString('en-US')
                                            : '&gt; ' + getThreshold(colors[index].percentage).toLocaleString('en-US')
                                    }
                                    key={index}
                                />
                            )
                        }
                    </div>

                    {
                        focusedState != null &&
                        <div className='rounded-lg bg-white p-1 sm:p-3 mt-2 text-right'>
                            <div className='font-bold text-sm'>
                                {capitalize(id_state_pair[focusedState])} ({grievances[focusedState]?.toLocaleString('en-US')})
                            </div>
                            {
                                district != null &&
                                <div className='text-sm'>
                                    {capitalize(district.district)}: {district.count.toLocaleString('en-US')}
                                </div>
                            }
                            {
                                districts.slice(0, 5).map(district =>
                                    <div className='text-sm' key={district}>
                                        {capitalize(district.district)}: {district.count.toLocaleString('en-US')}
                                    </div>
                                )
                            }
                        </div>
                    }
                </div>
            }

            <Copyright />
        </div>
    )
}
