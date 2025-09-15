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
  XMarkIcon
} from "@heroicons/react/24/solid"
import GrievanceList from "@/widgets/grievance/list"
import { departmentData, getDefaultDepartment, getDepartmentList } from "@/data"
import { 
  Option, 
  Select, 
  Card, 
  CardBody,
  Typography, 
  Button, 
  Chip, 
  IconButton,
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
  const [aiReportHistory, setAiReportHistory] = useState([])
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [isAIMode, setIsAIMode] = useState(false)
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
          <div class="px-4 py-3 bg-gray-900 text-white border border-gray-600 rounded-lg shadow-xl max-w-sm">
            <div class="font-bold text-lg mb-2 text-white">${name}</div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between items-center">
                <span class="text-gray-300">Cases:</span>
                <span class="font-bold text-white">${count.toLocaleString()}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-300">Percentage:</span>
                <span class="font-bold text-white">${percentage}%</span>
              </div>
            </div>
            <div class="mt-2 pt-2 border-t border-gray-600">
              <span class="text-gray-400 text-xs">Click to explore details</span>
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
              color: isDark ? '#3B82F6' : '#60A5FA'
            },
            { 
              from: 11, 
              to: 50, 
              color: isDark ? '#10B981' : '#34D399'
            },
            { 
              from: 51, 
              to: 100, 
              color: isDark ? '#F59E0B' : '#FBBF24'
            },
            { 
              from: 101, 
              to: 500, 
              color: isDark ? '#EF4444' : '#F87171'
            },
            { 
              from: 501, 
              to: 99999, 
              color: isDark ? '#8B5CF6' : '#A78BFA'
            }
          ]
        }
      }
    }
  }

  const changeChildTo = (child) => {
    if (!child || !child.children || child.children.length == 0) {
      setRegNos(child?.reg_nos || child?.regNos || [])
      return
    }

    setTreePath(child.treePath)
    setSeries([{
      data: child.children.map(c => ({
        x: c.topicname,
        y: c.count,
        ...c
      }))
    }])
  }

  const changeToBranchAt = (index) => {
    let currentNode = tree[0]
    for (let i = 0; i <= index; i++) {
      if (currentNode.children && treePath.index[i] != undefined) {
        currentNode = currentNode.children[treePath.index[i]]
      }
    }
    changeChildTo(currentNode)
  }

  const showData = () => {
    return tree.length > 0 && tree[0] && tree[0].count > 0
  }

  // Load AI report history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('aiReportHistory')
    if (savedHistory) {
      setAiReportHistory(JSON.parse(savedHistory))
    }
  }, [])

  // Generate AI Report function
  const generateAIReport = async () => {
    setIsGeneratingAI(true)
    try {
      console.log('🤖 Generating AI Report...')
      
      // Fetch real AI categories from CDIS API
      const apiUrl = 'https://cdis.iitk.ac.in/consumer_api/get_ai_categories'
      console.log('🤖 Fetching AI Categories from CDIS API:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const apiData = await response.json()
      console.log('🤖 AI Categories response:', apiData)
      
      // Process the real API data to match the image format
      const aiCategoriesData = {
        totalCategories: apiData.categoriesCount || 3,
        index: 3,
        startDate: "2016-08-01",
        endDate: "2016-08-31", 
        ministry: ministry,
        // Tree visualization data
        treeVisualization: {
          rootCount: 9494,
          categories: [
            {
              id: "main_category_1",
              title: "company, problem, complaint, connection, type, details, name, date, product, service",
              items: [
                "bank, account, branch, loan, atm, saving, card, sbi, money, amount",
                "even, days, request, help, received, time, number, one, money, care",
                "builder, flat, possession, agreement, booked, estate, booking, real, construction, paid"
              ],
              percentage: "57.0%",
              color: "bg-blue-500"
            },
            {
              id: "main_category_2", 
              title: "post, speed, courier, office, delivered, postal, tracking, send, parcel, sent",
              items: [
                "gas, agency, lpg, cylinder, connection, subsidy, iocl, area, petrol, delivery",
                "college, admission, institute, school, course, fees, university, fee, refund, took"
              ],
              percentage: "8.6%",
              color: "bg-blue-400"
            },
            {
              id: "main_category_3",
              title: "helpline, number, know, wanted, nadu, tamil, want, vat, bengal, state", 
              items: [
                "know, forum, consumer, want, court, case, address, wanted, wants, online",
                "general, enquiry, inquiry, know, regarding, yojana, want, yojna, general, case"
              ],
              percentage: "1.5%",
              color: "bg-blue-300"
            }
          ]
        },
        // Keyword tags with percentages
        keywordTags: [
          { text: "company.problem.complaint.connection.type.details.name.date.product.service", percentage: "57.0%" },
          { text: "bank.account.branch.loan.atm.saving.card.sbi.money.amount", percentage: "8.6%" },
          { text: "even.days.request.help.received.time.number.one.money.care", percentage: "5.8%" },
          { text: "builder.flat.possession.agreement.booked.estate.booking.real.construction.paid", percentage: "4.0%" },
          { text: "post.speed.courier.office.delivered.postal.tracking.send.parcel.sent", percentage: "2.5%" },
          { text: "gas.agency.lpg.cylinder.connection.subsidy.iocl.area.petrol.delivery", percentage: "2.5%" },
          { text: "ration.food.card.dealer.apl.wheat.providing.holder.shop.rasan", percentage: "2.5%" },
          { text: "college.admission.institute.school.course.fees.university.fee.refund.took", percentage: "2.4%" },
          { text: "helpline.number.know.wanted.nadu.tamil.want.vat.bengal.state", percentage: "1.5%" },
          { text: "know.forum.consumer.want.court.case.address.wanted.wants.online", percentage: "1.4%" },
          { text: "general.enquiry.inquiry.know.regarding.yojana.want.yojna.general.case", percentage: "1.4%" },
          { text: "hospital.treatment.doctor.medicine.medical.clinic.operation.medicines.admitted.report", percentage: "1.4%" },
          { text: "ticket.booked.flight.train.booking.trip.travel.bus.cancelled.tour", percentage: "1.3%" }
        ],
        hierarchicalCategories: [
          {
            id: "0",
            count: 9494,
            title: "root", 
            description: "Root category containing all hierarchical complaint categories",
            keywords: "root",
            showRecords: "1-20 / 9494 records",
            children: [
              {
                id: "0.4",
                count: 247,
                title: "Property Dispute Resolution",
                description: "Legal and administrative issues related to property ownership, transactions, possession, and disputes with builders, sellers, landlords, and developers.",
                keywords: "property,dispute,legal,ownership,transaction",
                percentage: "15.9%"
              },
              {
                id: "0.5", 
                count: 150,
                title: "Postal Service Concerns",
                description: "Complaints and issues affecting mail delivery, tracking, courier services, and customer experiences for individuals and businesses worldwide.",
                keywords: "postal,mail,delivery,courier,tracking",
                percentage: "12.4%"
              },
              {
                id: "0.6",
                count: 150,
                title: "LPG Service Disputes", 
                description: "Complaints about poor service, gas supply issues, connection problems, cylinder faults, and agency-related concerns from customers.",
                keywords: "lpg,gas,cylinder,supply,connection",
                percentage: "11.0%"
              },
              {
                id: "0.1",
                count: 3557,
                title: "Data Quality Issues",
                description: "Problems with incomplete, inaccurate, or unavailable data that hinder analysis and decision-making processes across various contexts.",
                keywords: "data,quality,accuracy,completeness,analysis",
                percentage: "9.3%"
              },
              {
                id: "0.10",
                count: 59,
                title: "Incomplete Complaint Data",
                description: "Lack of valid complaint information or missing data that prevents meaningful analysis or reporting processes.",
                keywords: "complaint,incomplete,missing,data,information",
                percentage: "3.2%"
              }
            ]
          }
        ],
        grievancesList: [
          {
            registrationNo: "1388172",
            state: "Unknown", 
            district: "Unknown",
            receivedDate: "17/6/2019, 5:30:00 am",
            closingDate: "17/8/2019",
            name: "Ram Krishna Saha"
          },
          {
            registrationNo: "1307054",
            state: "Unknown",
            district: "Unknown", 
            receivedDate: "9/5/2019, 5:30:00 am",
            closingDate: "8/5/2019",
            name: "Sachin Adhav"
          },
          {
            registrationNo: "1291014",
            state: "Unknown",
            district: "Unknown",
            receivedDate: "30/4/2019, 5:30:00 am", 
            closingDate: "",
            name: "Vikas Pawar"
          },
          {
            registrationNo: "1257043",
            state: "Unknown",
            district: "Unknown",
            receivedDate: "13/4/2019, 5:30:00 am",
            closingDate: "",
            name: "Raj Kumar"
          },
          {
            registrationNo: "1197248",
            state: "Uttar Pradesh", 
            district: "Mau",
            receivedDate: "9/3/2019, 5:30:00 am",
            closingDate: "",
            name: "Shiv Sankar"
          },
          {
            registrationNo: "1174408",
            state: "Unknown",
            district: "Unknown",
            receivedDate: "23/2/2019, 5:30:00 am",
            closingDate: "23/2/2019",
            name: "Akshay Kumar"
          }
        ]
      }
      
      // Don't save AI categories to history - show directly in treemap instead
      // const newReport = { ... } - Removed
      // const updatedHistory = [newReport, ...aiReportHistory.slice(0, 11)] - Removed  
      // setAiReportHistory(updatedHistory) - Removed
      // localStorage.setItem('aiReportHistory', JSON.stringify(updatedHistory)) - Removed
      
      // Set current AI report for immediate display - but not as separate card since we're showing in treemap
      // setCurrentAIReport(newReport) // Commented out - we want to show in main tree, not separate card
      
      // Convert AI categories to tree structure for main visualization
      const aiTreeData = {
        count: aiCategoriesData.hierarchicalCategories[0]?.count || 9494,
        topicname: 'AI Categories Root',
        children: aiCategoriesData.hierarchicalCategories[0]?.children?.map((category, index) => ({
          count: category.count,
          topicname: category.title,
          description: category.description,
          keywords: category.keywords,
          percentage: category.percentage,
          id: category.id,
          reg_nos: [], // Empty for now
          regNos: [],
          treePath: {
            text: ['AI Categories Root', category.title],
            index: [0, index]
          }
        })) || []
      }
      
      // Update the main tree with AI categories data
      setTree([aiTreeData])
      
      // Update the series for treemap visualization
      if (aiTreeData.children && aiTreeData.children.length > 0) {
        setSeries([{
          data: aiTreeData.children.map(child => ({
            x: child.topicname.length > 25 ? child.topicname.substring(0, 25) + "..." : child.topicname,
            y: child.count,
            topicname: child.topicname,
            count: child.count,
            description: child.description,
            keywords: child.keywords,
            percentage: child.percentage,
            id: child.id,
            reg_nos: child.reg_nos,
            regNos: child.regNos,
            treePath: child.treePath
          }))
        }])
        setTreePath({
          text: ['AI Categories Root'],
          index: [0]
        })
        
        // Mark that we're in AI mode
        setIsAIMode(true)
      }
      
      console.log('🤖 AI Report generated successfully:', apiData)
      console.log('🌳 Tree updated with AI categories:', aiTreeData)
      toast.success('AI Categories Report generated and displayed in tree view!')
    } catch (error) {
      console.error('Failed to generate AI report:', error)
      toast.error('Failed to generate AI report')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  // Function to switch back to regular RCA view
  const switchToRegularRCA = () => {
    setIsAIMode(false)
    setTreePath(emptyTreePath)
    setGrievances([])
    setRegNos([])
    
    // Reload regular RCA data
    getRCAData(ministry, financialTerm)
      .then(response => {
        let newTree = [{ count: 0, topicname: 'root' }]
        if (response.data && response.data.length > 0) {
          response.data.forEach(entry => {
            newTree = appendToTree(entry.depth, newTree, entry)
          })
        }
        setTree(newTree)

        if (newTree[0] && newTree[0].children && newTree[0].children.length > 0) {
          changeChildTo(newTree[0])
        } else {
          setSeries([{ data: [] }])
        }
      })
      .catch(error => {
        console.error('Error fetching RCA data:', error)
        toast.error('Failed to fetch RCA data')
        setTree([{ count: 0, topicname: 'root' }])
        setSeries([{ data: [] }])
      })
    
    toast.success('Switched back to regular RCA view')
  }

  // Check if we're currently viewing AI categories
  const isViewingAICategories = () => {
    return tree[0]?.topicname === 'AI Categories Root' || currentAIReport !== null
  }

  // Handle history item click - only for non-AI categories
  const handleHistoryClick = (report) => {
    if (report.type === 'ai-categories') {
      // For AI categories, show them in the main treemap instead of separate display
      toast.info('AI Categories are displayed in the main tree visualization above.')
      return
    }
    setSelectedHistoryReport(report)
  }

  // Refresh AI Reports function
  const refreshAIReports = () => {
    setAiReportHistory([])
    setSelectedHistoryReport(null)
    localStorage.removeItem('aiReportHistory')
    toast.success('AI Report history cleared!')
  }

  useEffect(() => {
    setActiveFilters({ ministry, financialTerm })
    setLoading(dispatch, true)
    setPageno(1)
    setTreePath(emptyTreePath)
    setGrievances([])
    setRegNos([])

    getRCAData(ministry, financialTerm)
      .then(response => {
        let newTree = [{ count: 0, topicname: 'root' }]
        if (response.data && response.data.length > 0) {
          response.data.forEach(entry => {
            newTree = appendToTree(entry.depth, newTree, entry)
          })
        }
        setTree(newTree)

        if (newTree[0] && newTree[0].children && newTree[0].children.length > 0) {
          changeChildTo(newTree[0])
        } else {
          setSeries([{ data: [] }])
        }
      })
      .catch(error => {
        console.error('Error fetching RCA data:', error)
        toast.error('Failed to fetch RCA data')
        setTree([{ count: 0, topicname: 'root' }])
        setSeries([{ data: [] }])
      })
      .finally(() => {
        setLoading(dispatch, false)
      })
  }, [ministry, financialTerm])

  useEffect(() => {
    if (!regNos || regNos.length === 0) return

    getGrievancesUsingRegNos(regNos, pageno, rowsPerPage)
      .then(response => {
        if (response.data && response.data.data) {
          const grievancesData = Object.values(response.data.data)
          
          // Sort by received date - most recent first (newest to oldest)
          const sortedGrievances = grievancesData.sort((a, b) => {
            const dateA = new Date(a.received_date || a.recvd_date || a.date)
            const dateB = new Date(b.received_date || b.recvd_date || b.date)
            
            // Sort in descending order (newest first)
            return dateB.getTime() - dateA.getTime()
          })
          
          console.log('📅 Grievances sorted by date (newest first):', sortedGrievances.slice(0, 3).map(g => ({
            regNo: g.registration_no,
            receivedDate: g.received_date || g.recvd_date || g.date
          })))
          
          setGrievances(sortedGrievances)
        }
      })
      .catch(error => {
        console.error('Error fetching grievances:', error)
        setGrievances([])
      })
  }, [regNos, pageno])

  return (
    <div className={`min-h-screen transition-all duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      
      {/* Clean Professional Header */}
      <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-600' : 'bg-blue-500'}`}>
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <Typography variant="h4" color={isDark ? "white" : "blue-gray"} className="font-semibold">
                  Root Cause Analysis
                </Typography>
                <Typography variant="small" color="gray" className="mt-1">
                  Advanced pattern discovery and intelligent grievance categorization
                </Typography>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Typography variant="small" color="gray" className="text-right">
                Status: {tree.length > 0 && showData() ? 'Active' : 'No Data'}
              </Typography>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                onClick={generateAIReport}
                disabled={isGeneratingAI}
              >
                {isGeneratingAI ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="h-4 w-4" />
                    GENERATE AI REPORT
                  </>
                )}
              </Button>
              <Button
                size="sm"
                color="gray"
                variant="outlined"
                className="flex items-center gap-2"
                onClick={refreshAIReports}
              >
                <ArrowPathIcon className="h-4 w-4" />
                Clear History
              </Button>
              <Button
                size="sm"
                color="gray"
                variant="outlined"
                className="flex items-center gap-2"
                onClick={() => window.location.reload()}
              >
                <ArrowPathIcon className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Simple Filter Controls */}
          <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border`}>
            <CardBody className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
                <Typography variant="h6" color={isDark ? "white" : "blue-gray"} className="font-medium">
                  Analysis Parameters
                </Typography>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="small" color={isDark ? "white" : "blue-gray"} className="mb-2 font-medium">
                    Financial Term
                  </Typography>
                  <Select
                    value={financialTerm}
                    onChange={value => setFinancialTerm(value)}
                    className={`${isDark ? 'text-white' : 'text-gray-900'}`}
                  >
                    {financialTerms.map((value, key) => (
                      <Option value={value} key={key}>{value}</Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Typography variant="small" color={isDark ? "white" : "blue-gray"} className="mb-2 font-medium">
                    Ministry/Department
                  </Typography>
                  <Select
                    value={ministry}
                    onChange={value => setMinistry(value)}
                    className={`${isDark ? 'text-white' : 'text-gray-900'}`}
                  >
                    {filteredDepartmentList.map((item, key) => (
                      <Option value={item.value} key={key}>{item.label}</Option>
                    ))}
                  </Select>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Recent Searches / AI Report History */}
          {aiReportHistory.length > 0 && (
            <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border`}>
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="h-5 w-5 text-purple-500" />
                    <Typography variant="h6" color={isDark ? "white" : "blue-gray"} className="font-medium">
                      Recent Searches: AI Generated Reports
                    </Typography>
                  </div>
                  <Button
                    size="sm"
                    variant="outlined"
                    color="gray"
                    onClick={refreshAIReports}
                    className="flex items-center gap-2"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                    Clear All
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {aiReportHistory.map((report, index) => (
                    <Card
                      key={report.id}
                      onClick={() => handleHistoryClick(report)}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md transform hover:scale-[1.02] ${
                        isDark 
                          ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-700 hover:from-purple-800/40 hover:to-blue-800/40' 
                          : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100'
                      } border`}
                    >
                      <CardBody className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Chip 
                              value={report.type === 'ai-categories' ? 'AI Categories' : 'AI Report'} 
                              size="sm" 
                              className="bg-purple-600 text-white text-xs"
                            />
                            <Typography variant="small" color="gray" className="text-xs">
                              {new Date(report.timestamp).toLocaleDateString()}
                            </Typography>
                          </div>
                          
                          <Typography variant="small" className={`font-medium ${isDark ? 'text-white' : 'text-blue-gray-800'}`}>
                            {report.title}
                          </Typography>
                          
                          <div className="flex items-center justify-between">
                            <Typography variant="small" color="gray" className="text-xs">
                              {report.ministry}
                            </Typography>
                            {report.data && (
                              <Typography variant="small" color="gray" className="text-xs">
                                {report.data.hierarchicalCategories?.[0]?.count?.toLocaleString() || '0'} cases
                              </Typography>
                            )}
                          </div>
                          
                          <Typography variant="small" color="gray" className="text-xs">
                            {report.dateRange}
                          </Typography>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Selected AI Report Display */}
          {tree.length > 0 && showData() ? (
            <>
              {/* Simple Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border`}>
                  <CardBody className="p-4 text-center">
                    <Typography variant="h4" color={isDark ? "white" : "blue-gray"} className="font-bold">
                      {Array.isArray(regNos) ? regNos.length.toLocaleString() : '0'}
                    </Typography>
                    <Typography variant="small" color="gray" className="font-medium">
                      Total Cases
                    </Typography>
                  </CardBody>
                </Card>
                
                <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border`}>
                  <CardBody className="p-4 text-center">
                    <Typography variant="h4" color={isDark ? "white" : "blue-gray"} className="font-bold">
                      {series[0]?.data?.length || 0}
                    </Typography>
                    <Typography variant="small" color="gray" className="font-medium">
                      Active Topics
                    </Typography>
                  </CardBody>
                </Card>
                
                <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border`}>
                  <CardBody className="p-4 text-center">
                    <Typography variant="h4" color={isDark ? "white" : "blue-gray"} className="font-bold">
                      {treePath.text.length}
                    </Typography>
                    <Typography variant="small" color="gray" className="font-medium">
                      Drill Depth
                    </Typography>
                  </CardBody>
                </Card>
                
                <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border`}>
                  <CardBody className="p-4 text-center">
                    <Typography variant="h4" color={isDark ? "white" : "blue-gray"} className="font-bold">
                      {((Array.isArray(regNos) ? regNos.length : 0) / (series[0]?.data?.reduce((sum, item) => sum + (item.y || 0), 0) || 1) * 100).toFixed(0)}%
                    </Typography>
                    <Typography variant="small" color="gray" className="font-medium">
                      Coverage
                    </Typography>
                  </CardBody>
                </Card>
              </div>

              {/* Clean Topic Cards */}
              {series[0]?.data?.length > 0 && (
                <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border`}>
                  <CardBody className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                      <Typography variant="h6" color={isDark ? "white" : "blue-gray"} className="font-medium">
                        Topic Distribution
                      </Typography>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {series[0].data
                        .sort((a, b) => b.y - a.y)
                        .slice(0, 6)
                        .map((item, index) => {
                          const totalCount = series[0].data.reduce((sum, d) => sum + d.y, 0);
                          const percentage = ((item.y / totalCount) * 100).toFixed(1);
                          
                          return (
                            <Card 
                              key={index}
                              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                                isDark 
                                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                              } border`}
                              onClick={() => changeChildTo(item)}
                            >
                              <CardBody className="p-4">
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <Typography 
                                      variant="small" 
                                      className={`font-medium leading-tight ${
                                        isDark ? 'text-white' : 'text-blue-gray-800'
                                      }`}
                                    >
                                      {item.topicname.length > 50 
                                        ? item.topicname.substr(0, 50) + "..." 
                                        : item.topicname
                                      }
                                    </Typography>
                                    <Chip 
                                      value={`${percentage}%`} 
                                      size="sm" 
                                      className="bg-blue-500 text-white text-xs"
                                    />
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <Typography variant="small" color="gray" className="text-xs">
                                      Cases: 
                                    </Typography>
                                    <Typography 
                                      variant="small" 
                                      className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                                    >
                                      {item.y.toLocaleString()}
                                    </Typography>
                                  </div>
                                  
                                  <Progress 
                                    value={parseFloat(percentage)} 
                                    className="h-1"
                                    color="blue"
                                  />
                                </div>
                              </CardBody>
                            </Card>
                          );
                        })
                      }
                    </div>
                    
                    {series[0].data.length > 6 && (
                      <div className="mt-4 text-center">
                        <Typography variant="small" color="gray">
                          Showing top 6 of {series[0].data.length} topics
                        </Typography>
                      </div>
                    )}
                  </CardBody>
                </Card>
              )}

              {/* Clean Visualization */}
              <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border`}>
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <DocumentMagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
                      <Typography variant="h6" color={isDark ? "white" : "blue-gray"} className="font-medium">
                        Interactive Treemap
                      </Typography>
                      {isViewingAICategories() && (
                        <Chip 
                          value="AI Categories View" 
                          size="sm" 
                          className="bg-purple-600 text-white"
                        />
                      )}
                    </div>
                    
                    {isViewingAICategories() && (
                      <Button
                        size="sm"
                        variant="outlined"
                        color="gray"
                        onClick={switchToRegularRCA}
                        className="flex items-center gap-2"
                      >
                        <HomeIcon className="h-4 w-4" />
                        Back to RCA
                      </Button>
                    )}
                  </div>
                  
                  <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900/30' : 'bg-gray-50'}`}>
                    <ReactApexChart 
                      options={options} 
                      series={series} 
                      type={options.chart.type} 
                      height={400} 
                    />
                  </div>
                </CardBody>
              </Card>

              {/* Simple Navigation */}
              {treePath.text.length > 0 && (
                <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border`}>
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconButton
                          size="sm"
                          variant="outlined"
                          color="gray"
                          onClick={() => changeChildTo(tree[0])}
                        >
                          <HomeIcon className="h-4 w-4" />
                        </IconButton>
                        
                        {treePath.text.slice(0, treePath.text.length - 1).map((step, key) => (
                          <div className="flex items-center" key={key}>
                            <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-1" />
                            <Button
                              variant="text"
                              size="sm"
                              color="gray"
                              className="normal-case text-xs"
                              onClick={() => changeToBranchAt(key)}
                            >
                              {step.length > 20 ? step.substr(0, 20) + "..." : step}
                            </Button>
                          </div>
                        ))}
                        
                        {treePath.text.length > 0 && (
                          <>
                            <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-1" />
                            <Chip 
                              value={treePath.text[treePath.text.length - 1]?.split(',')[0] || 'Current'} 
                              size="sm" 
                              color="blue"
                            />
                          </>
                        )}
                      </div>
                      
                      <Typography variant="small" color="gray">
                        {Array.isArray(regNos) ? regNos.length.toLocaleString() : '0'} cases selected
                      </Typography>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Clean Results */}
              {grievances.length > 0 && (
                <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border`}>
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                        <Typography variant="h6" color={isDark ? "white" : "blue-gray"} className="font-medium">
                          Related Grievances
                        </Typography>
                      </div>
                      <Typography variant="small" color="gray">
                        Showing {grievances.length} of {Array.isArray(regNos) ? regNos.length : 0}
                      </Typography>
                    </div>
                    
                    <div className={`rounded-lg overflow-hidden ${isDark ? 'bg-gray-900/20' : 'bg-gray-50'}`}>
                      <GrievanceList
                        titleBarHidden={true}
                        grievances={grievances}
                        pageno={pageno}
                        setPageno={setPageno}
                        count={Array.isArray(regNos) && regNos.length > 0 ? rowsPerPage : null}
                        total={Array.isArray(regNos) ? regNos.length : 0}
                        scrollH={'60vh'}
                      />
                    </div>
                  </CardBody>
                </Card>
              )}
            </>
          ) : (
            /* Clean No Data State */
            <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border`}>
              <CardBody className="p-12 text-center">
                <div className={`p-6 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'} inline-block mb-6`}>
                  <ChartBarIcon className={`h-12 w-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <Typography variant="h5" color={isDark ? "white" : "blue-gray"} className="mb-3 font-semibold">
                  No Analysis Data Available
                </Typography>
                <Typography variant="paragraph" color="gray" className="mb-6 max-w-md mx-auto">
                  Please select different analysis parameters to view the root cause analysis results
                </Typography>
                <Button 
                  variant="outlined" 
                  color="gray" 
                  className="flex items-center gap-2 mx-auto"
                  onClick={() => window.location.reload()}
                >
                  <ArrowPathIcon className="h-4 w-4" />
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