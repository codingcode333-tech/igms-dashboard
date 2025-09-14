import ReactApexChart from "react-apexcharts"
import { useEffect, useState } from "react"
import { getGrievancesUsingRegNos, getRCAData } from "@/services/rca"
import { 
  ChevronRightIcon, 
  ChartBarIcon, 
  AdjustmentsHorizontalIcon, 
  DocumentMagnifyingGlassIcon, 
  HomeIcon, 
  DocumentTextIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from "@heroicons/react/24/solid"
import GrievanceList from "@/widgets/grievance/list"
import { departmentData, getDefaultDepartment, getDepartmentList } from "@/data"
import { 
  Option, 
  Select, 
  Card, 
  CardBody, 
  CardHeader,
  Typography, 
  Button, 
  Chip, 
  IconButton,
  Alert,
  Progress
} from "@material-tailwind/react"
import { toast } from "react-toastify"
import { setLoading, useMaterialTailwindController, useTheme } from "@/context"


export function RCA() {
  const { isDark } = useTheme()
  const [tree, setTree] = useState([{ count: 0, topicname: 'root' }])
  const [series, setSeries] = useState([{ data: [] }])
  const emptyTreePath = { text: [], index: [] }
  const [treePath, setTreePath] = useState(emptyTreePath)
  const [grievances, setGrievances] = useState([])
  const defaultDepartment = getDefaultDepartment()
  const [ministry, setMinistry] = useState(defaultDepartment == 'All' ? 'AYUSH' : defaultDepartment)
  const [financialTerm, setFinancialTerm] = useState("2022-II")
  const [activeFilters, setActiveFilters] = useState({
    ministry: null,
    financialTerm: null
  })
  const financialTerms = [
    "2022-I",
    "2022-II"
  ]
  const [pageno, setPageno] = useState(1)
  const [regNos, setRegNos] = useState([])
  const rowsPerPage = 20

  const [, dispatch] = useMaterialTailwindController()

  const filteredDepartmentList = getDepartmentList().filter(item => item.value != 'All')

  const appendToTree = (depth, tree, value, prevTreePath = emptyTreePath) => {
    let indexes = depth.split('.')
    let currentIndex = parseInt(indexes[0])

    if (!tree[currentIndex]) {
      tree[currentIndex] = {}
    }

    if (indexes.length == 1) {
      tree[currentIndex] = {
        ...tree[currentIndex],
        ...value,
        treePath: {
          text: [...prevTreePath.text, value.topicname],
          index: [...prevTreePath.index, currentIndex]
        }
      }
      return [...tree]
    }

    if (!tree[currentIndex]['children'])
      tree[currentIndex]['children'] = []

    tree[currentIndex]['children'] = appendToTree(
      indexes.slice(1).join('.'),
      tree[currentIndex]['children'],
      value,
      tree[currentIndex].treePath
    )

    return [...tree]
  }

  const childClick = (e, p, opts) => {
    if (opts.dataPointIndex != -1) {
      let series = opts.config.series[opts.seriesIndex]
      let child = series.data[opts.dataPointIndex]
      changeChildTo(child)
    }
  }

  const options = {
    theme: {
      mode: isDark ? 'dark' : 'light'
    },
    legend: {
      show: false
    },
    chart: {
      height: 400,
      type: 'treemap',
      toolbar: {
        show: false
      },
      background: 'transparent',
      foreColor: isDark ? '#ffffff' : '#1f2937',
      events: {
        click: childClick
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '14px',
        fontWeight: 900,
        colors: ['#ffffff'],
        textShadow: '3px 3px 8px rgba(0,0,0,1), -1px -1px 2px rgba(0,0,0,0.8), 0 0 10px rgba(255,255,255,0.3)',
        fontFamily: 'Inter, system-ui, sans-serif'
      },
      formatter: function (val, opts) {
        const data = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex];
        const name = data.topicname;
        const count = data.count || data.y;
        
        if (name.length > 18) {
          return [name.substr(0, 18) + "...", `${count} cases`];
        }
        return [name, `${count} cases`];
      },
      offsetY: 0,
      distributed: false,
      textAnchor: 'middle'
    },
    states: {
      hover: {
        filter: {
          type: 'lighten',
          value: 0.15,
        }
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: 'darken',
          value: 0.35,
        }
      }
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      style: {
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif'
      },
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const data = w.config.series[seriesIndex].data[dataPointIndex];
        const name = data.topicname;
        const count = data.count || data.y;
        const totalCount = w.config.series[seriesIndex].data.reduce((sum, item) => sum + (item.y || 0), 0);
        const percentage = ((count / totalCount) * 100).toFixed(1);
        
        return `
          <div class="px-6 py-5 bg-gray-900 text-white border-2 border-white/20 rounded-xl shadow-2xl max-w-sm backdrop-blur-md" style="background: linear-gradient(135deg, rgba(30, 30, 30, 0.95), rgba(50, 50, 50, 0.95));">
            <div class="font-bold text-xl mb-4 text-white" style="text-shadow: 2px 2px 8px rgba(0,0,0,0.8), 0 0 15px rgba(255,255,255,0.3); line-height: 1.2;">${name}</div>
            <div class="space-y-3 text-base">
              <div class="flex justify-between items-center">
                <span class="text-white/90 font-semibold" style="text-shadow: 1px 1px 3px rgba(0,0,0,0.7);">Cases:</span>
                <span class="font-bold text-xl text-white" style="text-shadow: 2px 2px 6px rgba(0,0,0,0.8), 0 0 10px rgba(255,255,255,0.4);">${count.toLocaleString()}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-white/90 font-semibold" style="text-shadow: 1px 1px 3px rgba(0,0,0,0.7);">Percentage:</span>
                <span class="font-bold text-xl text-white" style="text-shadow: 2px 2px 6px rgba(0,0,0,0.8), 0 0 10px rgba(255,255,255,0.4);">${percentage}%</span>
              </div>
            </div>
            <div class="mt-3 pt-3 border-t border-white/20">
              <span class="text-white/80 text-sm font-medium" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.6);">Click to explore details</span>
            </div>
          </div>
        `;
      }
    },
    plotOptions: {
      treemap: {
        enableShades: true,
        shadeIntensity: 0.6,
        reverseNegativeShade: true,
        distributed: true,
        colorScale: {
          ranges: [
            { 
              from: 0, 
              to: 10, 
              color: isDark ? '#1e40af' : '#2563eb',
              name: 'Low (0-10)'
            },
            { 
              from: 11, 
              to: 50, 
              color: isDark ? '#1d4ed8' : '#1d4ed8',
              name: 'Medium (11-50)'
            },
            { 
              from: 51, 
              to: 200, 
              color: isDark ? '#2563eb' : '#1e40af',
              name: 'High (51-200)'
            },
            { 
              from: 201, 
              to: 1000, 
              color: isDark ? '#1e3a8a' : '#1e3a8a',
              name: 'Very High (200+)'
            }
          ]
        }
      }
    },
    colors: [
      isDark ? '#2563eb' : '#1e40af',
      isDark ? '#1e40af' : '#1d4ed8', 
      isDark ? '#1d4ed8' : '#2563eb',
      isDark ? '#1e3a8a' : '#1e3a8a',
      isDark ? '#4f46e5' : '#6366f1',
      isDark ? '#7c3aed' : '#8b5cf6'
    ]
  }

  const setSeriesData = (children) => {
    setSeries([
      {
        data: children.reduce((accumulator, child) => {
          if (child != undefined)
            accumulator.push({
              ...child,
              x: 'test',
              y: child.count
            })

          return accumulator
        }, [])
      }
    ])
  }

  const changeChildTo = child => {
    let children = child.children
    if (!children) {
      children = [child]
    }

    setSeriesData(children)
    setTreePath(child.treePath)
    setRegNos(child.regno)
    if (pageno != 1)
      setPageno(1)
    if (child.regno.length > 0)
      getGrievancesUsingRegNos(child.regno.slice(0, rowsPerPage)).then(response => {
        setGrievances(Object.values(response.data.data))
      })
  }

  const changeToBranchAt = index => {
    changeChildTo(getChild(treePath.index.slice(0, index + 1)))
  }

  const getChild = (path = [], branch = tree) => {
    return path.length > 1
      ? getChild(path.slice(1), branch[path[0]].children)
      : branch[path[0]]
  }

  const showData = () => tree[0].count != 0

  useEffect(() => {
    if (pageno != 1)
      setPageno(1)

    setLoading(dispatch, true)

    getRCAData(ministry, financialTerm).then(response => {
      let data = response.data
      if (data.count[0] == 0) {
        toast(`No data found for ${ministry} in ${financialTerm} quarter.`, {
          type: 'error'
        })
        setMinistry(activeFilters.ministry)
        setFinancialTerm(activeFilters.financialTerm)
        return
      }

      setActiveFilters({
        ministry: ministry,
        financialTerm: financialTerm
      })

      let treeData = Object.keys(data.topicname).reduce((accumulator, depth) => {
        return appendToTree(depth, accumulator, {
          'topicname': data.topicname[depth],
          'count': data.count[depth],
          'regno': data.regno[depth]
        })
      }, [])
      setTree(treeData)
      changeChildTo(treeData[0])
    })
      .finally(() => setLoading(dispatch, false))
  }, [ministry, financialTerm])

  useEffect(() => {
    if (regNos.length > 0)
      getGrievancesUsingRegNos(regNos.slice((pageno - 1) * rowsPerPage, pageno * rowsPerPage))
        .then(response => {
          setGrievances(Object.values(response.data.data))
        })
  }, [pageno])

  return (
    <div className={`min-h-screen transition-all duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
      
      {/* Modern Header Section */}
      <div className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-blue-900/20 via-purple-900/20 to-indigo-900/20' : 'from-blue-600/10 via-purple-600/10 to-indigo-600/10'}`}></div>
        <div className="relative px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <Card className={`${isDark ? 'bg-gray-800/95 border-gray-700 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm'} shadow-2xl border overflow-hidden`}>
              <div className={`h-1 bg-gradient-to-r ${isDark ? 'from-blue-500 via-purple-500 to-indigo-500' : 'from-blue-600 via-purple-600 to-indigo-600'}`}></div>
              <CardBody className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl shadow-lg ${isDark ? 'bg-gradient-to-br from-blue-600 to-purple-700' : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}>
                      <ChartBarIcon className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <Typography variant="h2" color={isDark ? "white" : "blue-gray"} className="font-bold mb-2">
                        Root Cause Analysis
                      </Typography>
                      <Typography variant="lead" color="gray" className="text-lg">
                        Advanced pattern discovery and intelligent grievance categorization
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-right">
                      <Typography variant="small" color="gray" className="text-sm font-medium">
                        Analysis Status
                      </Typography>
                      <Typography variant="h6" color={isDark ? "white" : "blue-gray"} className="font-bold">
                        {tree.length > 0 && showData() ? 'Active' : 'No Data'}
                      </Typography>
                    </div>
                    <Button
                      size="lg"
                      color="blue"
                      className="flex items-center gap-2 shadow-lg"
                      onClick={() => window.location.reload()}
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Advanced Filters Section */}
          <Card className={`${isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95'} shadow-xl border backdrop-blur-sm`}>
            <CardHeader 
              variant="gradient" 
              color="blue" 
              className="mb-4 p-6"
              floated={false}
            >
              <div className="flex items-center gap-3">
                <AdjustmentsHorizontalIcon className="h-6 w-6 text-white" />
                <Typography variant="h5" color="white" className="font-semibold">
                  Analysis Parameters
                </Typography>
              </div>
            </CardHeader>
            
            <CardBody className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Typography variant="small" color={isDark ? "white" : "blue-gray"} className="font-medium">
                    Financial Term
                  </Typography>
                  <Select
                    value={financialTerm}
                    onChange={value => setFinancialTerm(value)}
                    className={`${isDark ? 'text-white' : 'text-gray-900'}`}
                    containerProps={{ className: "min-w-0" }}
                  >
                    {financialTerms.map((value, key) => (
                      <Option value={value} key={key}>{value}</Option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Typography variant="small" color={isDark ? "white" : "blue-gray"} className="font-medium">
                    Ministry/Department
                  </Typography>
                  <Select
                    value={ministry}
                    onChange={value => setMinistry(value)}
                    className={`${isDark ? 'text-white' : 'text-gray-900'}`}
                    containerProps={{ className: "min-w-0" }}
                  >
                    {filteredDepartmentList.map((item, key) => (
                      <Option value={item.value} key={key}>{item.label}</Option>
                    ))}
                  </Select>
                </div>
              </div>
              
              {activeFilters.ministry && (
                <Alert 
                  color="blue" 
                  className="mt-4"
                  icon={<InformationCircleIcon className="h-5 w-5" />}
                >
                  <Typography variant="small" className="font-medium">
                    Currently analyzing: {activeFilters.ministry} ({activeFilters.financialTerm})
                  </Typography>
                </Alert>
              )}
            </CardBody>
          </Card>

          {tree.length > 0 && showData() ? (
            <>
              {/* Statistics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className={`${isDark ? 'bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700' : 'bg-gradient-to-br from-blue-500 to-blue-600'} shadow-xl border transform hover:scale-105 transition-transform`}>
                  <CardBody className="p-6 text-center">
                    <Typography variant="h3" color="white" className="font-bold mb-2">
                      {regNos.length.toLocaleString()}
                    </Typography>
                    <Typography variant="small" color="white" className="opacity-90 font-medium">
                      Total Cases
                    </Typography>
                  </CardBody>
                </Card>
                
                <Card className={`${isDark ? 'bg-gradient-to-br from-emerald-900 to-emerald-800 border-emerald-700' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'} shadow-xl border transform hover:scale-105 transition-transform`}>
                  <CardBody className="p-6 text-center">
                    <Typography variant="h3" color="white" className="font-bold mb-2">
                      {series[0]?.data?.length || 0}
                    </Typography>
                    <Typography variant="small" color="white" className="opacity-90 font-medium">
                      Active Topics
                    </Typography>
                  </CardBody>
                </Card>
                
                <Card className={`${isDark ? 'bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700' : 'bg-gradient-to-br from-purple-500 to-purple-600'} shadow-xl border transform hover:scale-105 transition-transform`}>
                  <CardBody className="p-6 text-center">
                    <Typography variant="h3" color="white" className="font-bold mb-2">
                      {treePath.text.length}
                    </Typography>
                    <Typography variant="small" color="white" className="opacity-90 font-medium">
                      Drill Depth
                    </Typography>
                  </CardBody>
                </Card>
                
                <Card className={`${isDark ? 'bg-gradient-to-br from-amber-900 to-amber-800 border-amber-700' : 'bg-gradient-to-br from-amber-500 to-amber-600'} shadow-xl border transform hover:scale-105 transition-transform`}>
                  <CardBody className="p-6 text-center">
                    <Typography variant="h3" color="white" className="font-bold mb-2">
                      {((regNos.length / (series[0]?.data?.reduce((sum, item) => sum + (item.y || 0), 0) || 1)) * 100).toFixed(0)}%
                    </Typography>
                    <Typography variant="small" color="white" className="opacity-90 font-medium">
                      Coverage
                    </Typography>
                  </CardBody>
                </Card>
              </div>

              {/* Topic Analysis Grid */}
              {series[0]?.data?.length > 0 && (
                <Card className={`${isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95'} shadow-xl border backdrop-blur-sm`}>
                  <CardHeader 
                    variant="gradient" 
                    color="purple" 
                    className="mb-4 p-6"
                    floated={false}
                  >
                    <div className="flex items-center gap-3">
                      <DocumentTextIcon className="h-6 w-6 text-white" />
                      <Typography variant="h5" color="white" className="font-semibold">
                        Topic Distribution Analysis
                      </Typography>
                    </div>
                  </CardHeader>
                  
                  <CardBody className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {series[0].data
                        .sort((a, b) => b.y - a.y)
                        .slice(0, 9)
                        .map((item, index) => {
                          const totalCount = series[0].data.reduce((sum, d) => sum + d.y, 0);
                          const percentage = ((item.y / totalCount) * 100).toFixed(1);
                          
                          return (
                            <Card 
                              key={index}
                              className={`cursor-pointer transform hover:scale-105 transition-all duration-300 group ${
                                isDark 
                                  ? 'bg-gray-700 border-gray-600 hover:bg-gradient-to-br hover:from-blue-900 hover:to-purple-900 hover:border-blue-500' 
                                  : 'bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:from-blue-600 hover:to-purple-600 hover:border-blue-400'
                              } border shadow-lg hover:shadow-2xl`}
                              onClick={() => changeChildTo(item)}
                            >
                              <CardBody className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <Typography 
                                      variant="small" 
                                      className={`font-bold leading-tight text-sm transition-colors duration-300 ${
                                        isDark ? 'text-white group-hover:text-white' : 'text-blue-gray-800 group-hover:text-white'
                                      }`}
                                      style={{
                                        textShadow: 'none',
                                        transition: 'all 0.3s ease'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.target.style.textShadow = '2px 2px 8px rgba(0,0,0,0.8), 0 0 10px rgba(255,255,255,0.3)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.style.textShadow = 'none';
                                      }}
                                    >
                                      {item.topicname.length > 40 
                                        ? item.topicname.substr(0, 40) + "..." 
                                        : item.topicname
                                      }
                                    </Typography>
                                    <Chip 
                                      value={`${percentage}%`} 
                                      size="sm" 
                                      className={`ml-2 flex-shrink-0 transition-colors duration-300 ${
                                        isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white group-hover:bg-white group-hover:text-blue-600'
                                      }`}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <Typography 
                                        variant="small" 
                                        className={`text-xs transition-colors duration-300 ${
                                          isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-white'
                                        }`}
                                      >
                                        Cases: 
                                      </Typography>
                                      <Typography 
                                        variant="small" 
                                        className={`font-bold transition-colors duration-300 ${
                                          isDark ? 'text-blue-400 group-hover:text-white' : 'text-blue-gray-800 group-hover:text-white'
                                        }`}
                                      >
                                        {item.y.toLocaleString()}
                                      </Typography>
                                    </div>
                                    
                                    <Progress 
                                      value={parseFloat(percentage)} 
                                      className={`h-2 transition-all duration-300 ${
                                        isDark ? 'bg-gray-600' : 'bg-gray-200 group-hover:bg-white/30'
                                      }`}
                                      barProps={{
                                        className: `transition-all duration-300 ${
                                          isDark ? 'bg-blue-500 group-hover:bg-white' : 'bg-blue-500 group-hover:bg-white'
                                        }`
                                      }}
                                    />
                                  </div>
                                </div>
                              </CardBody>
                            </Card>
                          );
                        })
                      }
                    </div>
                    
                    {series[0].data.length > 9 && (
                      <div className="mt-6 text-center">
                        <Typography variant="small" color="gray" className="text-sm">
                          Showing top 9 of {series[0].data.length} topics
                        </Typography>
                      </div>
                    )}
                  </CardBody>
                </Card>
              )}

              {/* Interactive Visualization */}
              <Card className={`${isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95'} shadow-xl border backdrop-blur-sm`}>
                <CardHeader 
                  variant="gradient" 
                  color="indigo" 
                  className="mb-4 p-6"
                  floated={false}
                >
                  <div className="flex items-center gap-3">
                    <DocumentMagnifyingGlassIcon className="h-6 w-6 text-white" />
                    <Typography variant="h5" color="white" className="font-semibold">
                      Interactive Topic Treemap
                    </Typography>
                  </div>
                </CardHeader>
                
                <CardBody className="p-6">
                  <div className={`rounded-2xl p-6 shadow-inner ${isDark ? 'bg-gray-900/50' : 'bg-gray-50/80'}`}>
                    <ReactApexChart 
                      options={options} 
                      series={series} 
                      type={options.chart.type} 
                      height={400} 
                    />
                  </div>
                </CardBody>
              </Card>

              {/* Navigation Breadcrumb */}
              {treePath.text.length > 0 && (
                <Card className={`${isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95'} shadow-xl border backdrop-blur-sm`}>
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Typography variant="small" color="gray" className="text-sm mb-3 font-medium">
                          Navigation Path:
                        </Typography>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          <IconButton
                            size="sm"
                            variant="gradient"
                            color="blue"
                            onClick={() => changeChildTo(tree[0])}
                            className="shadow-lg"
                          >
                            <HomeIcon className="h-4 w-4" />
                          </IconButton>
                          
                          {treePath.text.slice(0, treePath.text.length - 1).map((step, key) => (
                            <div className="flex items-center" key={key}>
                              <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
                              <Button
                                variant="text"
                                size="sm"
                                className={`font-medium normal-case transition-all duration-300 ${
                                  isDark 
                                    ? 'text-blue-400 hover:bg-blue-600 hover:text-white' 
                                    : 'text-blue-600 hover:bg-blue-600 hover:text-white'
                                } hover:shadow-lg`}
                                style={{
                                  textShadow: 'none',
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.textShadow = '1px 1px 4px rgba(0,0,0,0.5)';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.textShadow = 'none';
                                }}
                                onClick={() => changeToBranchAt(key)}
                              >
                                {step.length > 30 ? step.substr(0, 30) + "..." : step}
                              </Button>
                            </div>
                          ))}
                          
                          {treePath.text.length > 0 && (
                            <>
                              <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
                              <Chip 
                                value={treePath.text[treePath.text.length - 1]?.split(',')[0] || 'Current'} 
                                size="lg" 
                                color="blue"
                                className="font-medium"
                              />
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right ml-6">
                        <Typography variant="small" color="gray" className="text-sm mb-1">
                          Selected Cases:
                        </Typography>
                        <Typography variant="h4" color={isDark ? "white" : "blue-gray"} className="font-bold">
                          {regNos.length.toLocaleString()}
                        </Typography>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Enhanced Results Section */}
              {grievances.length > 0 && (
                <Card className={`${isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95'} shadow-xl border backdrop-blur-sm`}>
                  <CardHeader 
                    variant="gradient" 
                    color="emerald" 
                    className="mb-4 p-6"
                    floated={false}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <DocumentTextIcon className="h-6 w-6 text-white" />
                        <div>
                          <Typography variant="h5" color="white" className="font-semibold">
                            Related Grievances
                          </Typography>
                          <Typography variant="small" color="white" className="opacity-90">
                            Detailed case information for current selection
                          </Typography>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Typography variant="small" color="white" className="opacity-90">
                          Showing {grievances.length} of {regNos.length}
                        </Typography>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardBody className="p-4">
                    <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-900/30' : 'bg-gray-50/50'}`}>
                      <GrievanceList
                        titleBarHidden={true}
                        grievances={grievances}
                        pageno={pageno}
                        setPageno={setPageno}
                        count={regNos.length > 0 ? rowsPerPage : null}
                        total={regNos.length}
                        scrollH={'60vh'}
                      />
                    </div>
                  </CardBody>
                </Card>
              )}
            </>
          ) : (
            /* Enhanced No Data State */
            <Card className={`${isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95'} shadow-xl border backdrop-blur-sm`}>
              <CardBody className="p-16 text-center">
                <div className={`p-8 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'} inline-block mb-8 shadow-lg`}>
                  <ChartBarIcon className={`h-16 w-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <Typography variant="h3" color={isDark ? "white" : "blue-gray"} className="mb-4 font-bold">
                  No Analysis Data Available
                </Typography>
                <Typography variant="lead" color="gray" className="mb-8 max-w-md mx-auto">
                  Please select different analysis parameters to view the root cause analysis results
                </Typography>
                <Button 
                  variant="gradient" 
                  color="blue" 
                  size="lg"
                  className="shadow-lg"
                  onClick={() => window.location.reload()}
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2" />
                  Refresh Analysis
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default RCA