import { capitalize } from '@/pages/dashboard/CategoricalTree'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { GeoJSON, useMap, SVGOverlay } from 'react-leaflet'


const CIRCLE_BOX_DIMENSION = 4

export default function State(props) {
    const map = useMap()
    const [showCount, setShowCount] = useState(false)
    const [districts, setDistricts] = useState([])

    useEffect(() => {
        if (props.focusedState != undefined && props.focusedState == props.index)
            setDistricts(props.districts)
        else
            setDistricts([])
    }, [props.districts])

    return (
        <>
            <GeoJSON
                data={props.state}
                pathOptions={props.options}
                eventHandlers={{
                    click(e) {
                        if (!props.loading) {
                            map.fitBounds(e.layer._bounds)
                            props.focus()
                        }
                    },
                    mouseover() {
                        setShowCount(true)
                    },
                    mouseout() {
                        setShowCount(false)
                    }
                }}
            />

            {
                props.text != undefined && showCount && props.focusedState != props.index &&
                <SVGOverlay className="number" attributes={{ stroke: 'red' }} bounds={props.textBounds}>
                    <text x="0%" y="50%" stroke={props.textColor ?? "#3B444B"}>
                        {props.text}
                    </text>
                </SVGOverlay>
            }

            {
                props.count > 0
                && <DistrictCircles districts={districts} setDistrict={props.setDistrict} focusedDistrict={props.focusedDistrict} />
            }
        </>
    )
}

const DistrictCircles = ({
    districts,
    setDistrict = () => '',
    focusedDistrict
}) => {
    const districtCounts = useMemo(() => districts.map(district => district.count), [districts])
    const min = useMemo(() => Math.min(...districtCounts), [districtCounts])
    const max = useMemo(() => Math.max(...districtCounts), [districtCounts])
    const map = useMap()

    const getRadius = useCallback(grievanceCount => {
        const relativeMaxRadius = 1 / (map._zoom - 3)

        return grievanceCount
            ? (
                min == max
                    ? relativeMaxRadius
                    : Math.sqrt(
                        (
                            ((grievanceCount - min) / (max - min)) *  // Relative Count as per max count
                            (relativeMaxRadius ** 2) // Multiplying by max radius squared to get the area of the final circle
                        ) /
                        Math.PI // Divided by PI to get the square of the final Radius
                    ) // Getting the final radius of the circle by getting the square root.=
            )
            : 0
    }
        , [districtCounts]
    )

    const createCircle = (center, radius) => {
        const feature = {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [[]]
            },
            properties: {}
        }

        const no_of_points = 250

        for (let i = 0; i < no_of_points; i++) {
            let angle = (360 / no_of_points) * i
            const x = center[0] + radius * Math.cos((angle * Math.PI) / 180)
            const y = center[1] + radius * Math.sin((angle * Math.PI) / 180)

            feature.geometry.coordinates[0].push([x, y])
        }

        feature.geometry.coordinates[0].push(feature.geometry.coordinates[0][0])

        return feature
    }

    return districts.map((district, key) => {
        let radius = getRadius(district.count)

        return district?.latitude && district?.longitude &&
            <GeoJSON
                data={createCircle([parseFloat(district.longitude), parseFloat(district.latitude)], radius)}
                pathOptions={{
                    fillColor: district.district == focusedDistrict ? "#00f7" : "white",
                    color: district.district == focusedDistrict ? "blue" : "red",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 1
                }}
                smoothFactor={0}
                key={key}
                eventHandlers={{
                    click(e) {
                        if (district?.district)
                            setDistrict(district.district)
                    },
                    mouseover({ layer }, b, c) {
                        // console.log('aaaa', a, b, c)
                        layer.bindPopup(
                            `<strong>${capitalize(district.district)} (${district.count})</strong>`
                        ).openPopup();
                    },
                    mouseout({ layer }) {
                        layer.closePopup();
                    }
                }}
            />
    }
    )
}
