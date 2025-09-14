import { useEffect, useMemo, useState } from "react"
import { Filters, Loader } from "./CategoricalTree"
import { getDefaultDepartment } from "@/data"
import { defaultFrom, defaultTo } from "@/helpers/env"
import { getHistoricalCounts, getTimeWiseDistribution } from "@/services/graph"
import Chart from "react-apexcharts"
import { format, subDays } from "date-fns"
import { dateFormat } from "@/helpers/date"
import { Button, Menu, MenuHandler, MenuItem, MenuList } from "@material-tailwind/react"
import { ChevronDownIcon } from "@heroicons/react/24/solid"
import { sleep } from "@/helpers/general"

const types = {
    "1": "day",
    "2": "month",
    "3": "year"
}

export const GraphicalAnalysis = () => {
    const [filters, setFilters] = useState({
        from: format(subDays(new Date(), 30), dateFormat),
        to: defaultTo,
        state: 'All',
        district: 'All',
        ministry: getDefaultDepartment(),
        showAll: true
    })
    const [searching, setSearching] = useState(false)
    const [type, setType] = useState('day')

    const [dataDistribution, setDataDistribution] = useState([])

    const selectedType = useMemo(() => actionTypes.find(t => t.value == type))

    useEffect(() => {
        if (searching)
            getTimeWiseDistribution(filters, type)
                .then(({ data }) => {
                    setDataDistribution(
                        data.map(({ key_as_string, doc_count }) => ({
                            x: doc_count,
                            y: key_as_string
                        }))
                    )

                    setSearching(false)
                })
    }, [searching])

    useEffect(() => setSearching(true), [])

    return <div>
        <Filters
            filters={filters}
            setFilters={setFilters}
            searching={searching}
            startSearch={() => setSearching(true)}
            CustomActionButton={
                <ActionMenu
                    type={type}
                    setType={setType}
                    searching={searching}
                    startSearch={() => setSearching(true)}
                />
            }
        />

        <div className="mt-5">
            <BarChartBox searching={searching} dataDistribution={dataDistribution} />

            <div className="grid md:grid-cols-5 gap-y-5">
                <div className="md:col-span-2">
                    <PieChartBox searching={searching} dataDistribution={dataDistribution} />
                </div>

                <div className="md:col-span-3">
                    <LineChartBox searching={searching} dataDistribution={dataDistribution} />
                </div>
            </div>
        </div>
    </div>
}

const BarChartBox = ({
    searching,
    dataDistribution
}) => <>
        {
            searching
                ? <PulseBox>
                    <BarChartSVG />
                </PulseBox>
                : <Chart
                    series={[{
                        name: 'Grievances',
                        data: getKeys(dataDistribution, 'x')
                    }]}
                    options={getBarChartOptions(getKeys(dataDistribution, 'y'), Math.max(getKeys(dataDistribution, 'x')))}
                    type="bar"
                    height={'300vh'}
                />
        }

    </>

const PieChartBox = ({
    searching,
    dataDistribution
}) => {
    const orderedDataDistribution = useMemo(() => [...dataDistribution].sort((a, b) => b.x - a.x).slice(0, PieChartLimit), [dataDistribution])

    return <>
        {
            searching
                ? <PulseBox>
                    <PieChartSVG />
                </PulseBox>
                : <Chart
                    series={getKeys(orderedDataDistribution, 'x')}
                    options={getPieChartOptions(getKeys(orderedDataDistribution, 'y'))}
                    type="pie"
                    height={'450vh'}
                />
        }
    </>
}

const LineChartBox = ({
    searching,
    dataDistribution
}) => <>
        {
            searching
                ? <PulseBox>
                    <LineChartSVG />
                </PulseBox>
                : <Chart
                    series={[{
                        name: 'Grievances',
                        data: getKeys(dataDistribution, 'x')
                    }]}
                    options={getLineChartOptions(getKeys(dataDistribution, 'y'))}
                    type="line"
                    height={'300vh'}
                />
        }
    </>

const PulseBox = ({
    children
}) => <div className="w-[100%] h-[350px] flex justify-center items-center animate-pulse">
        {children}
    </div>

const ActionMenu = ({
    type,
    setType,
    searching,
    startSearch = () => ''
}) => {
    const selectedType = useMemo(() => actionTypes.find(t => t.value == type))

    return <Menu>
        <MenuHandler>
            <Button
                className="h-[2.6rem] flex justify-center items-center"
                disabled={searching}
            >
                {
                    searching &&
                    <Loader className="mr-2 animate-spin" color="#fff" />
                }

                {
                    selectedType?.text
                }

                <ChevronDownIcon height={'1.5rem'} />
            </Button>
        </MenuHandler>
        <MenuList>
            {
                actionTypes.map(type =>
                    <MenuItem
                        onClick={async () => {
                            setType(type.value)
                            await sleep(200) // Waiting for type to update
                            startSearch()
                        }}
                        key={type.value}
                    >
                        {type.text}
                    </MenuItem>
                )
            }
        </MenuList>
    </Menu>
}

const actionTypes = [
    {
        text: "Day Wise Analysis",
        value: "day",
        getY: (collection) => {
            let [year, month, date] = collection.date.split("-")

            return format(new Date(year, parseInt(month) - 1, parseInt(date)), "dd MMM, yy")
        }
    },
    {
        text: "Weekly Analysis",
        value: "week",
        getY: (collection) => `Week ${collection.week}`
    },
    {
        text: "Monthly Analysis",
        value: "month",
        getY: (collection) => format(new Date(collection.year, collection.month - 1), "MMMM yyyy")
    },
    {
        text: "Yearly Analysis",
        value: "year",
        getY: (collection) => `Week ${collection.week}`
    }
]

const getBarChartOptions = (categories, max) => ({
    chart: {
        type: 'bar',
        height: 500
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded',
            colors: {
                ranges: [
                    { from: 1, to: max / 5, color: '#3E66F0' },
                    { from: max / 5, to: max * 2 / 5, color: '#0F40C5' },
                    { from: max * 2 / 5, to: max * 3 / 5, color: '#0135A7' },
                    { from: max * 3 / 5, to: max * 4 / 5, color: '#002688' },
                    { from: max * 4 / 5, to: max, color: '#001657' },
                ],
            }
        },
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        show: false,
        width: 2,
        colors: ['transparent']
    },
    xaxis: {
        categories: categories.map(category => category.split(" "))
    },
    yaxis: {
        title: {
            text: 'Grievances'
        }
    }
})

const PieChartLimit = 15

const getPieChartOptions = (categories) => ({
    chart: {
        width: '100%',
        type: 'pie',
        toolbar: {
            tools: {
                download: true,
                selection: true,
                zoom: true,
                zoomin: true,
                zoomout: true,
                pan: true,
                reset: true | '<img src="/static/icons/reset.png" width="20">',
                customIcons: []
            }
        }
    },
    fill: {
        type: 'gradient',
        gradient: {
            shade: 'light',
            type: 'horizontal',
            shadeIntensity: 0.9,
            gradientToColors: new Array(PieChartLimit).fill(null).map((_, index) => `#2E93fA${(255 * index / PieChartLimit).toString(16).padStart(2, '0')}`).reverse(),
            inverseColors: true,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 100]
        }
    },
    colors: new Array(PieChartLimit).fill(null).map((_, index) => `#2E93fA${(255 * index / PieChartLimit).toString(16).padStart(2, '0')}`).reverse(),
    labels: categories,
    theme: {
        palette: 'palette1'
    },
    plotOptions: {
        pie: {
            dataLabels: {
                offset: -5
            }
        }
    },
    // title: {
    //     text: "Monochrome Pie"
    // },
    dataLabels: {
        formatter(val, opts) {
            const name = opts.w.globals.labels[opts.seriesIndex]
            return [name, val.toFixed(1) + '%']
        },
        style: {
            colors: ["#000"]
        },
        dropShadow: {
            enabled: false
        }
    },
    legend: {
        show: false
    }
})

const getLineChartOptions = (categories) => ({
    chart: {
        height: 350,
        type: 'line',
        zoom: {
            enabled: false
        }
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'smooth',
        lineCap: 'round'
    },
    // title: {
    //     text: 'Product Trends by Month',
    //     align: 'left'
    // },
    grid: {
        row: {
            colors: ['#f3f3f3'], // takes an array which will be repeated on columns
            opacity: 0.5
        },
    },
    xaxis: {
        categories
    },
    markers: {
        size: [4]
    }
})

const getKeys = (array, key) => array.map(object => object[key])

const BarChartSVG = () => <svg width="200" height="188" viewBox="0 0 200 188" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="187.89" rx="5" fill="#d9d9d9" />
    <rect x="19.4495" y="31.7432" width="42.5688" height="124.587" rx="5" fill="#B7B7B7" />
    <rect x="78.7156" y="90.2753" width="42.5688" height="66.055" rx="5" fill="#B7B7B7" />
    <rect x="137.982" y="53.578" width="42.5688" height="102.752" rx="5" fill="#B7B7B7" />
</svg>

const PieChartSVG = () => <svg width="200" height="188" viewBox="0 0 200 188" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="187.89" rx="5" fill="#D9D9D9" />
    <path d="M100.5 33C115.144 33 129.29 38.3111 140.316 47.9482C151.341 57.5853 158.497 70.8941 160.456 85.4061L100.5 93.5L100.5 33Z" fill="#818181" />
    <path d="M120.586 150.568C109.299 154.541 97.0871 155.077 85.4951 152.11C73.9032 149.142 63.4516 142.804 55.4621 133.896C47.4725 124.988 42.3038 113.912 40.6095 102.066C38.9153 90.2211 40.7716 78.1395 45.9437 67.3493L100.5 93.5L120.586 150.568Z" fill="#B9B9B9" />
    <path d="M120.586 150.568C109.299 154.541 97.0871 155.077 85.4951 152.11C73.9032 149.142 63.4516 142.804 55.4621 133.896C47.4725 124.988 42.3038 113.912 40.6095 102.066C38.9153 90.2211 40.7716 78.1395 45.9437 67.3493L100.5 93.5L120.586 150.568Z" fill="#B9B9B9" />
    <path d="M120.586 150.568C109.299 154.541 97.0871 155.077 85.4951 152.11C73.9032 149.142 63.4516 142.804 55.4621 133.896C47.4725 124.988 42.3038 113.912 40.6095 102.066C38.9153 90.2211 40.7716 78.1395 45.9437 67.3493L100.5 93.5L120.586 150.568Z" fill="#B9B9B9" />
    <path d="M120.586 150.568C109.299 154.541 97.0871 155.077 85.4951 152.11C73.9032 149.142 63.4516 142.804 55.4621 133.896C47.4725 124.988 42.3038 113.912 40.6095 102.066C38.9153 90.2211 40.7716 78.1395 45.9437 67.3493L100.5 93.5L120.586 150.568Z" fill="#B9B9B9" />
    <path d="M45.7575 67.7413C50.7266 57.181 58.6441 48.2833 68.5556 42.121C78.4671 35.9586 89.9495 32.7946 101.619 33.0103L100.5 93.5L45.7575 67.7413Z" fill="#B9B9B9" />
    <path d="M45.7575 67.7413C50.7266 57.181 58.6441 48.2833 68.5556 42.121C78.4671 35.9586 89.9495 32.7946 101.619 33.0103L100.5 93.5L45.7575 67.7413Z" fill="#B9B9B9" />
    <path d="M45.7575 67.7413C50.7266 57.181 58.6441 48.2833 68.5556 42.121C78.4671 35.9586 89.9495 32.7946 101.619 33.0103L100.5 93.5L45.7575 67.7413Z" fill="#B9B9B9" />
    <path d="M45.7575 67.7413C50.7266 57.181 58.6441 48.2833 68.5556 42.121C78.4671 35.9586 89.9495 32.7946 101.619 33.0103L100.5 93.5L45.7575 67.7413Z" fill="#C3C3C3" />
    <path d="M160.484 85.6164C162.301 99.4392 159.288 113.465 151.955 125.322C144.621 137.18 133.418 146.14 120.239 150.689L100.5 93.5L160.484 85.6164Z" fill="#9E9D9D" />
</svg>

const LineChartSVG = () => <svg width="200" height="188" viewBox="0 0 200 188" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="187.89" rx="5" fill="#D9D9D9" />
    <path d="M37 128.945C46.2 110.945 58.1667 102.778 63 100.945C66.8333 98.4449 76.6541 97.956 90.5 94C108 89 120.667 81 125.5 74.5C128.5 71 136.1 62.7448 144.5 59.9449C150.5 57.9449 155 57.0001 163.5 58.5001" stroke="#838383" />
    <circle cx="53.5" cy="107.5" r="1.5" fill="#838383" />
    <circle cx="75.5" cy="97.5" r="1.5" fill="#838383" />
    <circle cx="98.5" cy="91.5" r="1.5" fill="#838383" />
    <circle cx="119.5" cy="80.5" r="1.5" fill="#838383" />
    <circle cx="137.5" cy="63.5" r="1.5" fill="#838383" />
    <circle cx="163.5" cy="58.5" r="1.5" fill="#838383" />
    <circle cx="37.5" cy="128.5" r="1.5" fill="#838383" />
</svg>


