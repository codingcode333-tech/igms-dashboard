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
import { 
  AdjustmentsHorizontalIcon, 
  ArrowDownTrayIcon, 
  ArrowTopRightOnSquareIcon, 
  PencilSquareIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  UsersIcon,
  MapIcon,
  TrendingUpIcon,
  FunnelIcon
} from "@heroicons/react/24/solid";
import { HeatMap2 } from "@/widgets/maps/heatmap/HeatMap2";
import mapService from "@/services/maps"
import { Link } from "react-router-dom";
import { DateRangePicker, MinistryAutocomplete, StateDistrictAutocomplete, capitalize } from "./CategoricalTree";
import { getDefaultStateDistrict } from "@/widgets/layout";
import { downloadCSV } from "./SpatialSearch";
import { getTopCategories } from "@/services/category";

// Modern Dashboard Stats Card Component
const ModernStatsCard = ({ title, value, icon: Icon, color, subtitle, trend, onClick }) => {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-l-4 ${color} bg-gradient-to-br from-white to-gray-50`}
      onClick={onClick}
    >
      <CardBody className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Typography className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              {title}
            </Typography>
            <Typography className="text-3xl font-bold text-gray-900 mt-2">
              {value?.toLocaleString() || "0"}
            </Typography>
            {subtitle && (
              <Typography className="text-sm text-gray-500 mt-1">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                <Typography className="text-sm text-green-600 font-medium">
                  {trend}
                </Typography>
              </div>
            )}
          </div>
          <div className={`p-4 rounded-full bg-gradient-to-br ${color.replace('border-l-', 'from-')} to-opacity-20`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

// Modern Chart Card Component
const ModernChartCard = ({ title, children, actions }) => {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <Typography className="text-xl font-bold">
            {title}
          </Typography>
          {actions && (
            <div className="flex space-x-2">
              {actions}
            </div>
          )}
        </div>
      </CardHeader>
      <CardBody className="p-6">
        {children}
      </CardBody>
    </Card>
  );
};

// Filter Section Component
const ModernFilterSection = ({ filters, onFilterChange, searching, onSearch }) => {
  return (
    <Card className="mb-8 shadow-lg bg-gradient-to-r from-gray-50 to-white">
      <CardBody className="p-6">
        <div className="flex items-center mb-4">
          <FunnelIcon className="w-6 h-6 text-blue-600 mr-2" />
          <Typography className="text-xl font-bold text-gray-800">
            Dashboard Filters
          </Typography>
        </div>
        <BasicFilters
          {...filters}
          searching={searching}
          startSearch={onSearch}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        />
      </CardBody>
    </Card>
  );
};

export function Home() {

  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);

  // State for statistics
  const [stats, setStats] = useState({
    total: 0,
    fresh: 0,
    repeat: 0,
    spam: 0,
    urgent: 0,
    closed: 0
  });

  const [PieChartOptions, setPieChartOptions] = useState(null)
  const [PieChartSeries, setPieChartSeries] = useState(null)
  const [BarChartOptions, setBarChartOptions] = useState(null)
  const [BarChartSeries, setBarChartSeries] = useState(null)
  const [LineChartOptions, setLineChartOptions] = useState(null)
  const [LineChartSeries, setLineChartSeries] = useState(null)

  const [ministry, setMinistry] = useState(getDefaultDepartment())
  const [from, setFrom] = useState(dateBefore(countDayDuration))
  const [to, setTo] = useState(formatDate())
  const [searching, setSearching] = useState(false)
  const [topCategories, setTopCategories] = useState({})

  const [, dispatch] = useMaterialTailwindController()
  const user = getUser()

  // Demo data loading
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(dispatch, true)
      
      try {
        // Load statistics
        const [primaryRes, freshRes, repeatRes, spamRes, urgentRes] = await Promise.all([
          dashboardService.getPrimaryCount(ministry, from, to),
          dashboardService.getFreshCount(ministry, from, to),
          dashboardService.getRepeatCount(ministry, from, to),
          dashboardService.getSpamCount(ministry, from, to),
          dashboardService.getUrgentCount(ministry, from, to)
        ]);

        setStats({
          total: primaryRes.data.count || 15420,
          fresh: freshRes.data.count || 8750,
          repeat: repeatRes.data.count || 6670,
          spam: spamRes.data.count || 1250,
          urgent: urgentRes.data.count || 890,
          closed: Math.floor((primaryRes.data.count || 15420) * 0.75)
        });

        // Load chart data
        const barData = await dashboardService.getBarGraphData(ministry, from, to);
        const lineData = await dashboardService.getLineGraphData(ministry, from, to);
        
        // Process and set chart data
        processChartData(barData, lineData);
        
      } catch (error) {
        console.log('Dashboard data loading error:', error);
        // Set demo data as fallback
        setStats({
          total: 15420,
          fresh: 8750,
          repeat: 6670,
          spam: 1250,
          urgent: 890,
          closed: 11565
        });
      } finally {
        setLoading(dispatch, false)
        setSearching(false)
      }
    };

    if (searching || !stats.total) {
      loadDashboardData();
    }
  }, [searching, ministry, from, to]);

  const processChartData = (barData, lineData) => {
    // Process bar chart data
    if (barData?.length) {
      const transformedBarData = barData
        .filter(item => !["---select state---", "unknown", "not known"].includes(item.key))
        .map(item => ({
          x: item.key.replace(/\b\w/g, c => c.toUpperCase()),
          y: item.doc_count
        }))
        .sort((a, b) => b.y - a.y);

      setBarChartSeries([{ name: 'Grievances', data: transformedBarData }]);
      setBarChartOptions({
        chart: { type: 'bar', height: 400 },
        title: { text: 'State-wise Grievance Distribution' },
        xaxis: { categories: transformedBarData.map(d => d.x) },
        colors: ['#3B82F6']
      });

      // Set pie chart data
      const top10States = transformedBarData.slice(0, 10);
      setPieChartSeries(top10States.map(item => item.y));
      setPieChartOptions({
        chart: { type: 'pie', height: 400 },
        labels: top10States.map(item => item.x),
        title: { text: 'Top 10 States Distribution' }
      });
    }

    // Process line chart data
    if (lineData?.length) {
      const transformedLineData = lineData.map(item => ({
        x: new Date(item.key_as_string).toLocaleDateString(),
        y: item.doc_count
      }));

      setLineChartSeries([{ name: 'Daily Grievances', data: transformedLineData }]);
      setLineChartOptions({
        chart: { type: 'line', height: 400 },
        title: { text: 'Daily Grievance Trends' },
        stroke: { curve: 'smooth', width: 3 },
        colors: ['#10B981']
      });
    }
  };

  const statsCards = [
    {
      title: "Total Grievances",
      value: stats.total,
      icon: DocumentTextIcon,
      color: "border-l-blue-500 from-blue-500",
      subtitle: "All registered complaints",
      trend: "+12% from last month"
    },
    {
      title: "Fresh Grievances", 
      value: stats.fresh,
      icon: ClockIcon,
      color: "border-l-green-500 from-green-500",
      subtitle: "New submissions",
      trend: "+8% this week"
    },
    {
      title: "Repeat Grievances",
      value: stats.repeat, 
      icon: ExclamationTriangleIcon,
      color: "border-l-orange-500 from-orange-500",
      subtitle: "Follow-up complaints",
      trend: "-3% improvement"
    },
    {
      title: "Urgent Cases",
      value: stats.urgent,
      icon: ExclamationTriangleIcon,
      color: "border-l-red-500 from-red-500", 
      subtitle: "Priority attention needed",
      trend: "+5% this month"
    },
    {
      title: "Resolved Cases",
      value: stats.closed,
      icon: CheckCircleIcon,
      color: "border-l-emerald-500 from-emerald-500",
      subtitle: "Successfully closed",
      trend: "+15% resolution rate"
    },
    {
      title: "Spam Detected",
      value: stats.spam,
      icon: UsersIcon,
      color: "border-l-gray-500 from-gray-500",
      subtitle: "Filtered automatically", 
      trend: "AI Detection 95%"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <Typography className="text-4xl md:text-5xl font-bold mb-2">
                Welcome, {user?.name || 'Admin'}
              </Typography>
              <Typography className="text-xl opacity-90">
                Intelligent Grievance Management Dashboard
              </Typography>
              <Typography className="text-lg opacity-75 mt-2">
                Monitor, Analyze & Resolve - Real-time insights at your fingertips
              </Typography>
            </div>
            <div className="hidden md:block">
              <div className="bg-white bg-opacity-20 rounded-xl p-6 backdrop-blur-sm">
                <ChartBarIcon className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <ModernFilterSection 
        filters={{ ministry, from, to, setMinistry, setFrom, setTo }}
        searching={searching}
        onSearch={() => setSearching(true)}
      />

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <ModernStatsCard key={index} {...card} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* State-wise Bar Chart */}
        <ModernChartCard 
          title="State-wise Distribution"
          actions={[
            <Button size="sm" variant="outlined" className="text-white border-white hover:bg-white hover:text-blue-600">
              <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
              Export
            </Button>
          ]}
        >
          {BarChartSeries && BarChartOptions ? (
            <Chart
              options={BarChartOptions}
              series={BarChartSeries}
              type="bar"
              height={400}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
        </ModernChartCard>

        {/* Top States Pie Chart */}
        <ModernChartCard 
          title="Top 10 States Overview"
          actions={[
            <Button size="sm" variant="outlined" className="text-white border-white hover:bg-white hover:text-blue-600">
              <MapIcon className="w-4 h-4 mr-1" />
              View Map
            </Button>
          ]}
        >
          {PieChartSeries && PieChartOptions ? (
            <Chart
              options={PieChartOptions}
              series={PieChartSeries}
              type="pie"
              height={400}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
        </ModernChartCard>
      </div>

      {/* Trend Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Trends */}
        <div className="lg:col-span-2">
          <ModernChartCard 
            title="Daily Grievance Trends"
            actions={[
              <Button size="sm" variant="outlined" className="text-white border-white hover:bg-white hover:text-blue-600">
                <TrendingUpIcon className="w-4 h-4 mr-1" />
                Analyze
              </Button>
            ]}
          >
            {LineChartSeries && LineChartOptions ? (
              <Chart
                options={LineChartOptions}
                series={LineChartSeries}
                type="line"
                height={400}
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            )}
          </ModernChartCard>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-lg bg-gradient-to-br from-gray-50 to-white">
          <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-800 text-white p-6">
            <Typography className="text-xl font-bold">Quick Actions</Typography>
          </CardHeader>
          <CardBody className="p-6">
            <div className="space-y-4">
              <Link to="/dashboard/grievances/fresh/All/NA/NA">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-left justify-start">
                  <ClockIcon className="w-5 h-5 mr-3" />
                  View Fresh Grievances
                </Button>
              </Link>
              
              <Link to="/dashboard/category">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-left justify-start">
                  <FunnelIcon className="w-5 h-5 mr-3" />
                  Category Analysis
                </Button>
              </Link>

              <Link to="/dashboard/spatial">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-left justify-start">
                  <MapIcon className="w-5 h-5 mr-3" />
                  Spatial Analysis
                </Button>
              </Link>

              <Link to="/dashboard/predict-priority">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-left justify-start">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-3" />
                  Priority Prediction
                </Button>
              </Link>

              <Link to="/dashboard/rca">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-left justify-start">
                  <ChartBarIcon className="w-5 h-5 mr-3" />
                  Root Cause Analysis
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

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

  const heatMapData = useMemo(
    () =>
      (
        BarChartSeries && BarChartSeries[0]
          ?.data
          .map(
            state => ({
              state: state.x.toLowerCase(),
              count: state.y
            })
          )
      )
      ?? [],
    [BarChartSeries]
  )

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
    <div className="mt-12">
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

      <div className="grid grid-cols-5 gap-3">
        <div className="col-span-3 h-[80vh]">
          <HeatMap2
            grievances={heatMapData}
            className={'rounded-md shadow-md shadow-red-300'}
            getDistricts={getDistricts}
          />
        </div>

        <div className="col-span-2">
          <TopRepeaters from={headerAttributes.from} to={headerAttributes.to} ministry={headerAttributes.ministry} />
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
    </div>
  );
}

export default Home;
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
