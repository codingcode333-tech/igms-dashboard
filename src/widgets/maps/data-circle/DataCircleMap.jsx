import 'leaflet/dist/leaflet.css'
import styles from '../css/map.css'
import { MapContainer, TileLayer, SVGOverlay } from 'react-leaflet'
import states from '../../../data/json/india_states.json'
import state_centers from '../../../data/json/india_state_circle_bounds.json'
import state_text_bounds from '../../../data/json/india_state_text_bounds.json'
import state_grievances_sample from '../../../data/json/dummy/state_grevances_sample.json'
import state_id_pair from '../../../data/json/india_state_id_pair.json'
// import states from '../../../data/json/india_states.json'
import State from '../heatmap/State'
import { Copyright } from '../heatmap/copyright'
import { useEffect, useMemo, useState } from 'react'
import mapService from '@/services/maps'
import { stopLoading, startLoading, useMaterialTailwindController } from '@/context'
import { sleep } from '@/helpers/general'


const textColor = '#353839'

export default function Map({
    className,
    query,
    ministry,
    from,
    to,
    search
}) {
    const center = [23, 83];
    const zoom = 4;
    const bounds = [
        [23, 83],
        [19, 87],
    ]
    const [maxGrievances, setMaxGrievances] = useState(null)
    const [minGrievances, setMinGrievances] = useState(null)
    const maxRadius = 15
    const circleBoxDimension = 4

    const [, dispatch] = useMaterialTailwindController()

    const circleData = useMemo(async () => {
        await sleep(400)

        startLoading(dispatch)

        let response = await mapService.searchSpatiallyAndSilently(query, 1, ministry, from, to)
        let data = response.data

        stopLoading(dispatch)

        let dataObject = {}

        if (data.count > 0)
            dataObject = data.state_wise_count

        return getCircleData(dataObject)
    }, [query, ministry, from, to])

    const getCircleData = data => {
        let max = null
        let min = null

        let cData = Object.keys(data).reduce((accumulator, state) => {
            let count = data[state]
            let state_id = state_id_pair[state]

            if (state_id) {
                accumulator[state_id] = count

                if (!max && !min)
                    max = min = count

                if (count > max)
                    max = count

                if (count < min)
                    min = count
            }

            return accumulator
        }, {})

        setMaxGrievances(max)
        setMinGrievances(min)

        return cData
    }

    const createBounds = bounds => [
        ...bounds,
        [
            bounds[0][0] - circleBoxDimension,
            bounds[0][1] + circleBoxDimension
        ]
    ]

    const getRadius = grievanceCount => grievanceCount
        ? ((grievanceCount - (minGrievances - 1)) / (maxGrievances - minGrievances)) * maxRadius
        : 0

    const options = {
        weight: 1,
        opacity: 1,
        dashArray: '3',
        fillOpacity: 0.7,
        color: "#444",
        fillColor: "#ddd"
    }

    return (
        <>
            {
                circleData &&
                <div className='map relative'>
                    <MapContainer className={'map ' + className} center={center} zoom={zoom} minZoom={zoom} scrollWheelZoom={false}>
                        <TileLayer
                            // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            url="https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmlzaGVldGhzIiwiYSI6ImNrbDAzdWI1ejAxZWYycXQ3bWZreWNpbHMifQ.ERCOXWF81KOAgtBflWQrLg"
                        />

                        {/* Circles */}
                        {
                            Object.keys(state_centers).map(state_id => {
                                let radius = getRadius(circleData[state_id])

                                return <SVGOverlay bounds={createBounds(state_centers[state_id])} key={state_id}>
                                    <circle r={radius} cx={radius + 1} cy={radius + 1} fill="#f007" stroke="red" strokeWidth={2} />
                                </SVGOverlay>
                            }
                            )
                        }

                        {/* Boundaries */}
                        {
                            states.features.map((state) =>
                                <State
                                    state={state}
                                    options={options}
                                    key={state.properties.id}
                                    textBounds={state_text_bounds[state.properties.id]}
                                    text={circleData[state.properties.id]?.toLocaleString('en-US')}
                                    textColor={textColor}
                                    index={state.properties.id}
                                />
                            )
                        }
                    </MapContainer>

                    {
                        query &&
                        <div className='absolute top-6 right-6 z-[1000] bg-white p-2 rounded font-bold text-sm cursor-pointer' onClick={search}>
                            <span className='font-normal'>Grievances for</span> {query}
                        </div>
                    }

                    <Copyright />
                </div>
            }
        </>
    )
}