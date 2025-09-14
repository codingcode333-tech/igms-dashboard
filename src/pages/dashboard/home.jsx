import React, { useCallback, useContext, useMemo } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Input,
  Select,
  Option,
  Avatar,
  Tooltip,
  Progress,
  Menu,
  MenuItem,
  MenuList,
  MenuHandler,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
} from "@material-tailwind/react";
import { StatisticsChart } from "@/widgets/charts";
import {
  getDefaultDepartment, getDepartmentNameWithShortCode
} from "@/data";
import Chart from 'react-apexcharts'
import { useEffect } from "react";
import { useState } from "react";
import dashboardService, { getRepeaters } from '@/services/dashboard'
import { useTheme } from "@/context";
import { themeClasses } from "@/utils/themeUtils";
import { UserContext, getUser } from "@/context/UserContext";
import { formatDate, dateBefore, stringDate } from "@/helpers/date";
import { StatsHeader } from "@/widgets/cards/stats-header";
import { cacheable } from "@/helpers/cache";
import { countDayDuration, defaultFrom, defaultTo } from "@/helpers/env";
import populations from "@/data/json/india_state_populations.json"
import { BarChartNav } from "@/widgets/charts/BarChartNav";
import { numberToWords } from "@/helpers/general";
import { BasicFilters } from "@/widgets/grievance/BasicFilters";
import { setLoading, useMaterialTailwindController } from "@/context";
import { AdjustmentsHorizontalIcon, ArrowDownTrayIcon, ArrowTopRightOnSquareIcon, PencilSquareIcon } from "@heroicons/react/24/solid";
import { HeatMap2 } from "@/widgets/maps/heatmap/HeatMap2";
import EnhancedHeatmap from "@/widgets/maps/EnhancedHeatmap";
import mapService from "@/services/maps"
import { Link } from "react-router-dom";
import { DateRangePicker, MinistryAutocomplete, StateDistrictAutocomplete, capitalize } from "./CategoricalTree";
import { getDefaultStateDistrict } from "@/widgets/layout";
import { downloadCSV } from "./SpatialSearch";
import { getTopCategories } from "@/services/category";
import GrievanceTrends from "@/widgets/charts/GrievanceTrends";
import StateDistribution from "@/widgets/charts/StatusDistribution";

export function Home() {
  const { isDark } = useTheme();

  const today = new Date(); // Get today's date
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);

  const [PieChartOptions, setPieChartOptions] = useState(null)
  const [PieChartSeries, setPieChartSeries] = useState(null)

  const [BarChartOptions, setBarChartOptions] = useState(null)
  const [BarChartSeries, setBarChartSeries] = useState(null)
  const BarChartTypes = [
    {
      name: "top-10",
      text: "Top 10"
    },
    {
      name: "bottom-10",
      text: "Bottom 10"
    },
    {
      name: "all-states",
      text: "All States"
    }
  ]
  const [BarChartType, setBarChartType] = useState('top-10')
  const [populationGradient, setPopulationGradient] = useState(1e5)

  const [LineChartOptions, setLineChartOptions] = useState(null)
  const [LineChartSeries, setLineChartSeries] = useState(null)

  const [ministry, setMinistry] = useState(getDefaultDepartment()) // Will now default to DOCAF
  const [from, setFrom] = useState("2016-08-01") // Fixed start date
  const [to, setTo] = useState("2016-08-30") // Fixed end date
  const [headerAttributes, setHeaderAttributes] = useState({
    ministry: getDefaultDepartment(), // Will be DOCAF
    from: "2016-08-01",
    to: "2016-08-30"
  })

  const [searching, setSearching] = useState(false)

  const [topCategories, setTopCategories] = useState({})

  const [, dispatch] = useMaterialTailwindController()

  const user = getUser()

  // const handelMinistryChange = (e) => {
  //   setMinistry(e)
  // }

  const getBarChartSeries = (populationBased = false, type = null) => {
    let seriesData = BarChartSeries[0].data

    if (!type)
      type = BarChartType

    if (populationBased) {
      seriesData = seriesData
        .map(state => ({
          x: state.x,
          y: Math.round((state.y / populations[state.x]) * populationGradient),
          total: state.y
        }))
        .sort((a, b) => b.y - a.y)
    }

    switch (type) {
      case 'top-10':
        seriesData = seriesData.slice(0, 10)
        break
      case 'bottom-10':
        seriesData = seriesData.slice(-10)
        break
      case 'all-states':
      default:
        seriesData = seriesData
    }

    return [{
      name: "Grievances",
      data: seriesData
    }]
  }

  // const getBarChartOptions = console.log
  const getBarChartOptions = (max, populationBased = false) => ({
    chart: {
      type: 'bar',
      height: 500,
      background: "#fff0",
      events: {
        click: (a, b, c, d) => {
          // console.log(a, b, c, d)
        }
      }
    },
    title: {
      text: populationBased
        ? "Total grievances per " + numberToWords(populationGradient) + " state residents*"
        : "Total state grievances",
      align: 'left',
      style: {
        color: '#444',
      },

    },
    yaxis: {
      title: {
        text: 'Number of Grievances',
        style: {
          color: '#444',
        },
      },
      labels: {
        style: {
          colors: '#444',
        },
      },
    },
    plotOptions: {
      bar: {
        colors: {
          ranges: [
            { from: 1, to: max / 5, color: '#3E66F0' },
            { from: max / 5, to: max * 2 / 5, color: '#0F40C5' },
            { from: max * 2 / 5, to: max * 3 / 5, color: '#0135A7' },
            { from: max * 3 / 5, to: max * 4 / 5, color: '#002688' },
            { from: max * 4 / 5, to: max, color: '#001657' },
          ],
          // backgroundBarColors: ["#3E66F0", "#0F40C5", "#0135A7", "#002688", "#001657"]
        },
        dataLabels: {
          total: {
            style: {
              color: "#444"
            }
          }
        }
      },
    },
    tooltip: {
      y: {
        formatter: (y, { seriesIndex, dataPointIndex, w: { config: { series } }, }) => {
          if (populationBased)
            return y + " / " + numberToWords(populationGradient) + " (" + series[seriesIndex].data[dataPointIndex].total + ")"
          return y
        }
      },
      x: {
        formatter: (x, { seriesIndex, dataPointIndex, w: { config: { series } }, }) => {
          // if (populationBased)
          //   return x + " / " + numberToWords(populationGradient) + " (" + series[seriesIndex].data[dataPointIndex].total + ") <span>abc</span>"
          return x
        }
      },
      followCursor: true
    }
  })

  const getMaxOfSeries = series => Math.max(...series[0].data.map(s => s.y))

  const appendStateData = (initialData, newData, selector) => {
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

  const saveBarChartData = jsonData => {
    // Ensure jsonData is an array and handle different data structures
    if (!Array.isArray(jsonData)) {
      console.warn('BarChart data is not an array:', jsonData);
      return;
    }

    jsonData = jsonData
      .filter(item => !["---select state---", "unknown", "not known"].includes(item.key))

    const transformedData = jsonData
      .map(item => ({
        state: item.key.replace(/\b\w/g, c => c.toUpperCase()),
        count: item.doc_count
      }))
      .sort((stateA, stateB) => stateB.doc_count - stateA.doc_count);

    const states = transformedData.map(item => item.key);
    const counts = transformedData.map(item => item.doc_count);
    const seriesData = transformedData.map(({ state, count }) => ({ x: state, y: count }))
    const max = Math.max(...counts)
    const chartOptions = {};

    setBarChartOptions(chartOptions);
    setBarChartSeries([{ name: 'Grievances', data: seriesData }]);

    setPieChartData(jsonData)
  }

  const setPieChartData = jsonData => {
    const transformedData = jsonData
      .filter(item => item.state !== "---select state---" || item.state !== "Unknown" || item.state !== "Not Known")
      .map(item => ({
        state: item.key.replace(/\b\w/g, c => c.toUpperCase()),
        count: item.doc_count
      }));

    // Sort the transformedData array in descending order based on count
    transformedData.sort((a, b) => b.count - a.count);

    // Select the top 15 states with the most grievances
    const top15States = transformedData.slice(0, 20);

    const pieChartData = top15States.map(item => ({
      name: item.state,
      data: item.count
    }));

    const chartOptions = {
      chart: {
        type: 'pie', // Change the chart type to pie
        height: 500,
      },
      title: {
        text: "Top 20-States / UT's Grievances",
        align: 'left'
      },
      labels: pieChartData.map(item => item.name), // Set labels for pie slices
      plotOptions: {
        pie: {
          expandOnClick: false,
        },
      },
    };

    setPieChartOptions(chartOptions);
    setPieChartSeries(pieChartData.map(item => item.data));
  }

  const setLineChartData = jsonData => {
    // Ensure jsonData is an array and handle different data structures
    if (!Array.isArray(jsonData)) {
      console.warn('LineChart data is not an array:', jsonData);
      return;
    }

    const transformedData = jsonData
      //.filter(item => item.state !== "---select state---" || item.state !== "Unknown" || item.state !== "Not Known")
      .map(item => ({
        recvd_date: new Date(item.key_as_string).toLocaleDateString("en-IN"),
        count: item.doc_count
      }));

    const recvd_date = transformedData.map(item => item.recvd_date);
    const counts = transformedData.map(item => item.count);
    const chartOptions = {
      chart: {
        type: 'line',
        height: 500,
      },
      title: {
        text: 'Daily Grievances',
        align: 'left',
      },
      xaxis: {
        categories: recvd_date,
        labels: {
          // rotate: -45,
          // offsetY: 10,
          style: {
            fontSize: '12px',
            colors: ['#000'],
          },
        },
      },
      yaxis: {
        title: {
          text: 'Number of Grievances',
          style: {
            color: '#333',
          },
        },
        labels: {
          style: {
            color: '#333',
          },
        },
      },
      plotOptions: {
        bar: {
          colors: {
            ranges: [
              { from: 1, to: 10, color: '#3B93A5' },
              { from: 11, to: 20, color: '#F7B844' },
              { from: 21, to: 30, color: '#ADD8C7' },
            ],
          },
        },
      },
    };


    setLineChartOptions(chartOptions);
    setLineChartSeries([{ name: 'Grievances', data: counts }]);
  }

  const getDistricts = useCallback(async state => {
    const response = await mapService
      .getDistrictCount(state, headerAttributes.ministry, headerAttributes.from, headerAttributes.to)
      .catch(error => {
        toast(error.message, { type: 'error' })
        return { data: {} }
      })

    return Object.values(response.data).sort((a, b) => a.count - b.count)
  }, [headerAttributes])

  // Enhanced heatmap data with CDIS integration
  const [heatMapData, setHeatMapData] = useState([
    // Default states to show map immediately
    { state: 'maharashtra', count: 0, cities: {} },
    { state: 'uttar pradesh', count: 0, cities: {} },
    { state: 'karnataka', count: 0, cities: {} },
    { state: 'tamil nadu', count: 0, cities: {} },
    { state: 'gujarat', count: 0, cities: {} },
    { state: 'rajasthan', count: 0, cities: {} },
    { state: 'west bengal', count: 0, cities: {} },
    { state: 'punjab', count: 0, cities: {} }
  ]);
  const [heatMapLoading, setHeatMapLoading] = useState(false); // Show map immediately

  // Add state distribution data for sharing between chart and heatmap
  const [stateDistributionData, setStateDistributionData] = useState(null);

  // Fetch state distribution data once and share it
  useEffect(() => {
    const loadStateDistributionData = async () => {
      try {
        console.log('🗺️ Loading shared state distribution data...');
        const stateData = await dashboardService.getCDISStateData(
          headerAttributes.ministry, 
          headerAttributes.from, 
          headerAttributes.to
        );
        
        setStateDistributionData(stateData);
        
        // Convert to heatmap format
        if (stateData && stateData.stateDetails) {
          const heatmapData = stateData.stateDetails.map(state => ({
            state: state.name.toLowerCase(),
            count: state.count,
            cities: {} // Will be populated when user clicks
          }));
          
          setHeatMapData(heatmapData);
          console.log('✅ Heatmap data loaded from shared state data:', heatmapData.length, 'states');
        }
      } catch (error) {
        console.error('❌ Error loading state distribution data:', error);
      }
    };

    loadStateDistributionData();
  }, [headerAttributes.ministry, headerAttributes.from, headerAttributes.to]);

  useEffect(() => {
    // This useEffect is now simplified since we handle data fetching above
    console.log('📊 BarChartSeries:', BarChartSeries);
    
    // Only use BarChartSeries as backup if state distribution data is not available
    if (!stateDistributionData && BarChartSeries && BarChartSeries[0] && BarChartSeries[0].data && BarChartSeries[0].data.length > 0) {
      const existingData = BarChartSeries[0].data.map(state => ({
        state: state.x.toLowerCase(),
        count: state.y,
        cities: {} // Cities will be populated when user clicks on state
      }));
      
      setHeatMapData(existingData);
      console.log('✅ Heatmap data loaded from BarChartSeries backup:', existingData.length, 'states');
    }
  }, [BarChartSeries, stateDistributionData]);

  useEffect(() => {
    const BarChart = async () => {
      setLoading(dispatch, true)
      let jsonData = await cacheable(async () => await dashboardService.getBarGraphData(ministry, from, to), `bar-chart-${ministry}-${from}-${to}-data`, () => setLoading(dispatch, false))
      // let jsonData = Object.values(data)

      if (user.username == 'dpg') {
        setTimeout(async () => {
          let additional_jsonData = await cacheable(async () => await dashboardService.getBarGraphData("DARPG/D", from, to), `bar-chart-${ministry}-${from}-${to}-additional-data`, () => setLoading(dispatch, false))
          // let additional_jsonData = Object.values(additional_data)

          jsonData = appendStateData(jsonData, additional_jsonData, 'key')
          saveBarChartData(jsonData)
        }, 2000)
      }

      saveBarChartData(jsonData)
      setSearching(false)
    }

    const LineChart = async () => {
      setLoading(dispatch, true)
      let jsonData = await cacheable(async () => await dashboardService.getLineGraphData(ministry, from, to), `line-chart-${ministry}-${from}-${to}-data`, () => setLoading(dispatch, false))
      // let jsonData = Object.values(data)

      if (user.username == 'dpg') {
        setTimeout(async () => {
          let additional_jsonData = await cacheable(async () => await dashboardService.getLineGraphData("DARPG/D", from, to), `line-chart-${ministry}-${from}-${to}-additional-data`, () => setLoading(dispatch, false))
          // let additional_jsonData = Object.values(additional_data)

          jsonData = appendStateData(jsonData, additional_jsonData, 'recvd_date')

          setLineChartData(jsonData)
        }, 2500)
      }

      setLineChartData(jsonData)
      setSearching(false)
    }

    const loadTopCategories = async () => {
      setTopCategories(
        await cacheable(async () => await getTopCategories({ ministry, startDate: from, endDate: to }), `categories-${ministry}-${from}-${to}-data`)
      )
    }

    if (searching) {
      BarChart();
      LineChart();

      // loadTopCategories()

      setHeaderAttributes({
        ministry,
        from,
        to
      })
    }
  }, [searching])

  useEffect(() => {
    if (BarChartSeries) {
      let max = getMaxOfSeries(BarChartSeries)
      let gradient = 10
      setPopulationGradient(10 ** (gradient - max.toString().length))
    }
  }, [BarChartSeries])

  useEffect(() => {
    setSearching(true)
  }, [])

  return (
    <div className={`mt-12 transition-colors duration-300 ${isDark ? 'text-white' : ''}`}>
      <StatsHeader {...headerAttributes} />

      <BasicFilters
        ministry={ministry}
        setMinistry={setMinistry}
        from={from}
        setFrom={setFrom}
        to={to}
        setTo={setTo}
        searching={searching}
        startSearch={() => setSearching(true)}
      />

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 h-[80vh]">
          <EnhancedHeatmap
            grievances={heatMapData}
            className={`rounded-md shadow-md ${isDark ? 'shadow-gray-700' : 'shadow-red-300'}`}
            getDistricts={getDistricts}
            loading={heatMapLoading}
          />
        </div>

        <div className="col-span-2 space-y-4">
          {/* Curved Line Chart - Half height */}
          <div className="h-[38vh]">
            <GrievanceTrends 
              from={headerAttributes.from} 
              to={headerAttributes.to} 
              ministry={headerAttributes.ministry} 
            />
          </div>
          
          {/* Circular Data Visualization - Half height */}
          <div className="h-[38vh]">
            <StateDistribution 
              from={headerAttributes.from} 
              to={headerAttributes.to} 
              ministry={headerAttributes.ministry}
              stateDistData={stateDistributionData} 
            />
          </div>
        </div>
      </div>

      <br></br>

      <div className="flex gap-5 flex-col md:flex-row">
        {PieChartOptions && PieChartSeries && (
          <Chart options={PieChartOptions} series={PieChartSeries} type="pie" height={400} className="md:w-1/2" />
        )}

        {LineChartOptions && LineChartSeries && (
          <Chart options={LineChartOptions} series={LineChartSeries} type="line" height={400} className="md:w-1/2" />
        )}
      </div>

      <br></br>

      {BarChartOptions && BarChartSeries && (
        <div className="flex flex-col w-full">
          <BarChartNav tabs={BarChartTypes} selectedTab={BarChartType} setTab={setBarChartType} />

          <div className={"flex flex-col " + (BarChartType != 'all-states' ? "md:flex-row" : "")}>
            <Chart
              options={getBarChartOptions(
                getMaxOfSeries(getBarChartSeries(false, 'all-states'))
              )}
              series={getBarChartSeries()}
              type="bar"
              className={BarChartType != 'all-states' ? "md:w-1/2" : ""}
              height={400}
            />

            <Chart
              options={getBarChartOptions(
                getMaxOfSeries(getBarChartSeries(true, 'all-states')),
                true
              )}
              series={getBarChartSeries(true)}
              type="bar"
              className={BarChartType != 'all-states' ? "md:w-1/2" : ""}
              height={400}
            />
          </div>

          <div className="text-xs">
            * As per <a href="https://censusindia.gov.in/census.website/data/census-tables" className="text-blue-900">Census 2011</a>
          </div>
        </div>
      )}

      {/* <TopCategoryBox topCategories={topCategories} /> */}
    </div >
  );
}

export default Home;

const TopRepeaters = ({
  from,
  to,
  ministry
}) => {
  const [searching, setSearching] = useState(false)
  const [repeaters, setRepeaters] = useState([])
  const [filters, setFilters] = useState({
    from: defaultFrom,
    to: defaultTo,
    ministry: getDefaultDepartment(),
    state: "All",
    district: "All",
    skip: 0
  })

  const [showDateRangePicker, setShowDateRangePicker] = useState(false)
  const [showMinistryPicker, setShowMinistryPicker] = useState(false)
  const [showStateDistrictPicker, setShowStateDistrictPicker] = useState(false)

  const DummyItemCount = 15

  const updateRepeaters = async () => {
    const updatedRepeaters = [...repeaters.slice(0, filters.skip)]

    setRepeaters(updatedRepeaters)

    const { data: { count, data } } = await getRepeaters(filters.from, filters.to, filters.ministry, filters.state, filters.district, filters.skip)

    if (count > 0)
      setRepeaters([
        ...updatedRepeaters,
        ...Object.values(data[0])
      ])

    setSearching(false)
  }

  const updateDateRange = dateRange => {
    setFilters({
      ...filters,
      from: dateRange.startDate,
      to: dateRange.endDate
    })

    setShowDateRangePicker(false)
  }

  const updateMinistry = ministry => {
    setFilters({
      ...filters,
      ministry: ministry
    })

    setShowMinistryPicker(false)
  }

  const updateStateDistrict = ({ state, district }) => {
    setFilters({
      ...filters,
      state,
      district
    })

    setShowStateDistrictPicker(false)
  }

  const downloadRepeaters = async () => {
    if (repeaters.length > 0) {
      await downloadCSV(repeaters, [], {}, null, 'Top Repeaters')
    }
  }

  useEffect(() => {
    if (searching)
      updateRepeaters()
  }, [searching])

  useEffect(() => {
    setFilters({
      ...filters,
      from,
      to,
      ministry,
      size: 0
    })
  }, [from, to, ministry])

  useEffect(() => {
    setSearching(true)
  }, [filters])

  return <div>
    <div className="bg-[#ffe6d3] p-3 rounded-t-md w-full top-repeater">
      <div className="flex justify-between">
        <div>
          Top Repeaters
        </div>

        <div className={"flex gap-1"}>
          <ArrowDownTrayIcon
            height={'1.5rem'}
            color="#b30000"
            className={`action-icon ${repeaters.length == 0 && 'disabled'}`}
            onClick={downloadRepeaters}
          />

          <Menu dismiss={{
            itemPress: false,
          }}>
            <MenuHandler >
              <AdjustmentsHorizontalIcon height={'1.5rem'} color="#b30000" className="action-icon" />
            </MenuHandler>

            <MenuList>
              <MenuItem onClick={() => setShowDateRangePicker(true)}>
                <div className="flex justify-between gap-2">
                  <div>
                    {stringDate(filters.from)} ~ {stringDate(filters.to)}
                  </div>

                  <PencilSquareIcon height={'1rem'} width={'1rem'} />
                </div>
              </MenuItem>

              <MenuItem onClick={() => setShowMinistryPicker(true)}>
                <div className="flex justify-between gap-2">
                  <div>
                    Ministry: {filters.ministry}
                  </div>

                  <PencilSquareIcon height={'1rem'} width={'1rem'} />
                </div>
              </MenuItem>

              <MenuItem onClick={() => setShowStateDistrictPicker(true)}>
                <div className="flex justify-between gap-2">
                  <div>
                    State &gt; District:&nbsp;

                    {capitalize(filters.state)}

                    {filters.district != 'All' && <> &gt; {capitalize(filters.district)}</>}
                  </div>

                  <PencilSquareIcon height={'1rem'} width={'1rem'} />
                </div>
              </MenuItem>
            </MenuList>
          </Menu>

          <DateRangePickerDialog
            open={showDateRangePicker}
            close={() => setShowDateRangePicker(false)}
            from={filters.from}
            to={filters.to}
            save={updateDateRange}
          />

          <MinistryPickerDialog
            open={showMinistryPicker}
            close={() => setShowMinistryPicker(false)}
            ministry={filters.ministry}
            save={updateMinistry}
          />

          <StateDistrictPickerDialog
            open={showStateDistrictPicker}
            close={() => setShowStateDistrictPicker(false)}
            state={filters.state}
            district={filters.district}
            save={updateStateDistrict}
          />

          <Link to={`/dashboard/grievances/repeat/${filters.ministry}/${filters.from}/${filters.to}`}>
            <ArrowTopRightOnSquareIcon height={'1.5rem'} color="#b30000" className="action-icon" title="Show all Repeaters" />
          </Link>
        </div>
      </div>

      <div className="text-sm text-[#4c4c4c] mt-1">
        {stringDate(filters.from)} ~ {stringDate(filters.to)}

        {filters.ministry && filters.ministry != 'All' && `, ${filters.ministry}`}

        {filters.state != 'All' && `, ${capitalize(filters.state)}`}

        {filters.district != 'All' && <> &gt; {capitalize(filters.district)} </>}
      </div>
    </div>

    <ul className="col-span-2 w-full max-h-[70vh] divide-y divide-[#ffe6d3] border-gray border rounded-b-md py-1 border-4 border-[#ffe6d3] border-b-[#ffbbb6] border-t-0 bg-[#fdfdfd] shadow-inner overflow-y-scroll">
      {
        repeaters.map(
          (repeater, index) =>
            <li className="py-3 sm:py-4 cursor-pointer" key={index} onClick={() => ''}>
              <Link to={`/dashboard/grievances/repeat-children?${(new URLSearchParams({ ...repeater, ...filters })).toString()}`}>
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="inline-flex items-center justify-end text-red-500 font-semibold min-w-[4rem]" title="1,392 Repeat Grievances">
                    {repeater.count.toLocaleString()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-md font-medium text-gray-900 truncate">
                      {repeater.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {repeater.ministry} | {capitalize(repeater.state)} &gt; {capitalize(repeater.district)}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
        )
      }

      {
        searching &&
        [...Array(DummyItemCount)].map(
          (temp, index) => <li className="py-3 sm:pb-4" key={`temp-${index}`}>
            <div className="flex items-center space-x-4 rtl:space-x-reverse animate-pulse">
              <div className="inline-flex items-center justify-end text-red-500 font-semibold min-w-[4rem]">
                <div className="h-6 w-12 bg-red-200 rounded-sm"></div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="h-5 w-32 bg-gray-700 rounded-sm"></div>

                <div className="h-5 w-64 bg-gray-400 rounded-sm mt-1"></div>
              </div>
            </div>
          </li>
        )
      }

      {
        !searching && repeaters.length == 0 &&
        <li className="text-center px-2 py-3">
          No Data Found
        </li>
      }
    </ul>
  </div>
}

const DateRangePickerDialog = ({
  open,
  save = () => '',
  close,
  from,
  to
}) => {
  const [dateRange, setDateRange] = useState({
    startDate: from,
    endDate: to
  })

  return <InputDialog
    open={open}
    close={close}
    save={() => save(dateRange)}
    title="Enter the Date Range"
    content={
      <DateRangePicker value={dateRange} onChange={setDateRange} shortPopup />
    }
    disabled={!(dateRange.startDate && dateRange.endDate)}
  />
}

const MinistryPickerDialog = ({
  open = false,
  close,
  save,
  ministry
}) => {
  const [selectedMinistry, setSelectedMinistry] = useState({
    text: getDepartmentNameWithShortCode(ministry),
    value: ministry
  })

  return <InputDialog
    open={open}
    close={close}
    save={() => save(selectedMinistry.value)}
    title="Enter the Ministry"
    content={
      <MinistryAutocomplete ministry={selectedMinistry} setMinistry={setSelectedMinistry} />
    }
    disabled={!selectedMinistry}
  />
}

const StateDistrictPickerDialog = ({
  open = false,
  close,
  save,
  state,
  district
}) => {
  const [stateDistrict, setStateDistrict] = useState(getDefaultStateDistrict({ state, district }))

  return <InputDialog
    open={open}
    close={close}
    save={() => save(stateDistrict.values)}
    title="Enter the State and/or District"
    content={
      <StateDistrictAutocomplete stateDistrict={stateDistrict} setStateDistrict={setStateDistrict} />
    }
    disabled={!stateDistrict}
  />
}

const InputDialog = ({
  title = "",
  content,
  open,
  close,
  save,
  disabled = false
}) => <Dialog
  open={open}
  handler={save}
  className="overflow-visible"
>
    {
      title &&
      <DialogHeader>
        {title}
      </DialogHeader>
    }

    <DialogBody>
      {content}
    </DialogBody>

    <DialogFooter className="gap-2">
      <Button
        variant="text"
        size="sm"
        color="gray"
        className="h-[2.5rem]"
        onClick={close}
      >
        Cancel
      </Button>

      <Button
        size="sm"
        className="h-[2.5rem]"
        disabled={disabled}
        onClick={save}
      >
        Submit
      </Button>
    </DialogFooter>
  </Dialog>

const TopCategoryBox = ({
  topCategories
}) =>
  Object.keys(topCategories).length > 0 &&
  <div>
    <div className="text-lg font-bold mt-4">
      Top Categories
    </div>

    <div className="grid grid-cols-4">
      {
        Object.keys(topCategories).map((ministry, index) =>
          <div className="p-2" key={index}>
            <div className="font-bold border-b border-gray-400 mb-2 pb-2 pl-1">
              {ministry}
            </div>

            {
              Object.keys(topCategories[ministry]).map((category, key) =>
                <div className="grid grid-cols-3 p-1 hover:text-blue-800" key={key}>
                  <div className="col-span-2 whitespace-nowrap" title={category}>
                    <p className="overflow-ellipsis overflow-hidden  cursor-default">{category}</p>
                  </div>

                  <div className="text-right">
                    {topCategories[ministry][category]}
                  </div>
                </div>
              )
            }
          </div>
        )
      }
    </div>
  </div>
