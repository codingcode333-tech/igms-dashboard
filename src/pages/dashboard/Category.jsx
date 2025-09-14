import React, { useEffect, useState } from "react";
import { StatisticsChart } from "@/widgets/charts";
import { getCategories, getTopSuggestions, getTrendyKeywords } from "@/services/category";
// import ReactWordcloud from "react-wordcloud";
import { useFilter, defaultFilters } from "@/context/FilterContext";
import { useNavigate } from "react-router-dom";
import { StatsHeader } from "@/widgets/cards/stats-header";
import { cacheable } from "@/helpers/cache";
import { startLoading, stopLoading, useMaterialTailwindController } from "@/context";
import { Card, CardBody, Menu, MenuHandler, MenuItem, MenuList } from "@material-tailwind/react";
import { DEFAULT_MINISTRY, MinistryAutocomplete } from "./CategoricalTree";
import { SearchFilters } from ".";
import { SpatialDataDisplay } from "./SpatialSearch";
import { toast } from "react-toastify";


const DEFAULT_TREE = {
  children: []
}


export function Category() {
  const { filters, setFilters, setPageno, startSearch, setToDefault, searching } = useFilter()
  const [ministry, setMinistry] = useState(DEFAULT_MINISTRY)
  const [tree, setTree] = useState(DEFAULT_TREE)
  const [level, setLevel] = useState(1)
  const [breadcrumbs, setBreadcrumbs] = useState([])

  const updateTree = (newData, branch = tree) => {
    let newChildren = newData.filter(({ parent, code }) => branch.code == parent)

    if (!branch.children)
      branch.children = []

    const oldChilrenCodes = branch.children.map(({ code }) => code)

    if (newChildren)
      branch.children = [
        ...branch.children,
        ...newChildren.filter(({ code }) => !oldChilrenCodes.includes(code))
      ]

    return {
      ...branch,
      children: branch.children.map(child => updateTree(newData, child))
    }
  }

  const digDown = (index) => {
    setLevel(level + 1)

    setBreadcrumbs([...breadcrumbs, index])
  }

  const goTo = (level, index) => {
    setLevel(level)
    setBreadcrumbs([...breadcrumbs.slice(0, level - 1), index])
  }

  const loadTreeData = (level) => {
    if (ministry?.value.toLowerCase() == 'all') {
      setTree(DEFAULT_TREE)
      setLevel(1)

      return
    }

    if (ministry)
      getCategories(ministry.value, level)
        .then(({ data }) => {
          if (data.length > 0)
            if (level == 1) {
              setTree({
                children: data.map((child) => ({ ...child, children: [] }))
              })

              setBreadcrumbs([0])

              setLevel(2)
            }
            else {
              setTree(updateTree(data))
            }
          else if (level == 1)
            toast.warn('No categories found!')
        })
  }

  const initiateSearch = () => {
    setPageno(1)
    setFilters({
      ...filters,
      query: breadcrumbs.map((_, index) => getBreadcrumbCategoryAt(index)?.description).join(' ')
    })

    startSearch()
  }

  const updateMinistry = (ministryData) => {
    if (ministryData && ministryData.text && ministryData.value)
      setMinistry(ministryData)
  }

  const getBreadcrumbCategoryAt = (index) => breadcrumbs.slice(0, index + 1).reduce((category, crumb_index) => category.children[crumb_index], tree)

  useEffect(() => {
    loadTreeData(level)
  }, [level])

  useEffect(() => {
    if (level != 1)
      setLevel(1)
    else
      loadTreeData(1)
  }, [ministry])

  useEffect(initiateSearch, [breadcrumbs])

  useEffect(() => {
    // setToDefault()

    // setFilters({
    //   ...filters,
    //   threshold: 1.4
    // })

    setMinistry({
      text: "CBODT",
      value: "CBODT"
    })
  }, [])

  return (
    <div className="mt-5">
      <div className="col-span-2">
        <MinistryAutocomplete ministry={ministry} setMinistry={updateMinistry} className={`z-50`} />
      </div>

      {
        breadcrumbs.length > 0 &&
        <SearchFilters startSearch={initiateSearch} showQuery={false} showMinistry={false} className="mt-2 !mb-2" />
      }

      <nav className="flex justify-between mt-2" aria-label="Breadcrumb">
        <ol className="inline-flex items-center mb-3 sm:mb-0 flex-wrap gap-y-2">
          {
            breadcrumbs.map((crumb_index, index) => {
              const category = getBreadcrumbCategoryAt(index)
              const prevCategory = getBreadcrumbCategoryAt(index - 1)

              return <li key={index}>
                <span>
                  <Menu>
                    <MenuHandler>
                      <button
                        id="dropdownProject"
                        data-dropdown-toggle="dropdown-project"
                        className={`inline-flex items-center px-3 py-2 h-10 text-sm font-normal text-center text-gray-900 bg-white rounded-lg hover:bg-blue-100 focus:ring-2 focus:outline-none focus:ring-blue-400 gap-2 ${breadcrumbs.length == index + 1 ? 'ring-blue-400 ring-2' : ''}`}
                      >
                        {category?.description}
                        <ChevronDown />
                      </button>
                    </MenuHandler>
                    <MenuList className="p-1 ml-7 min-w-[20px]">
                      {
                        prevCategory.children.map((child, branch_index) =>
                          <MenuItem className="relative" onClick={() => goTo(index + 1, branch_index)} disabled={searching} key={branch_index}>
                            {/* <div className="absolute h-full w-1/2 top-0 left-0 -z-10 transition-all">
                              <div className="h-full w-full bg-blue-400 rounded-l"></div>
                            </div> */}
                            <a href="#" className="block px-2 py-2 mix-blend-difference text-[#747474]">{child?.description}</a>
                          </MenuItem>
                        )
                      }
                    </MenuList>
                  </Menu>
                </span>

                {
                  (index + 1 < breadcrumbs.length) &&
                  <span className="mx-2 text-gray-400">/</span>
                }
              </li>
            })
          }
        </ol>
      </nav>

      <div className="p-2 flex gap-2 flex-wrap">
        {
          breadcrumbs.reduce((category, crumb_index) => category.children[crumb_index], tree)
            .children.map((child, index) =>
              <span
                className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border-blue-400 cursor-pointer select-none"
                onClick={() => !searching && digDown(index)}
                key={index}
              >
                {child.description}
              </span>
            )
        }
      </div>

      <SpatialDataDisplay />
    </div>
  )
}

export function KeywordBasedCategory() {
  const [trendyKeywords, setTrendyKeywords] = useState([])
  const [topSuggestions, setTopSuggestions] = useState([])
  const navigateTo = useNavigate()
  const { filters, setFilters } = useFilter();
  const wordCloudOptions = {
    rotationAngles: [0, 0],
    rotations: 1,
    fontSizes: [16, 44]
  }

  const [, dispatch] = useMaterialTailwindController()

  const queryText = textData => {
    setFilters({
      ...defaultFilters,
      query: textData.text
    })

    navigateTo('/dashboard/search-grievances')
  }

  useEffect(() => {
    async function getKeywords() {
      startLoading(dispatch)

      let trendyList = (await cacheable(getTrendyKeywords, "trendy-keyword-data")).trendy_keywords
      setTrendyKeywords(Object.keys(trendyList).map((keyword, index) => {
        return {
          text: keyword,
          value: index
        }
      }))

      let suggestionList = (await cacheable(getTopSuggestions, "top-suggestion-data")).top_suggestion
      setTopSuggestions(suggestionList.reverse().map((keyword, index) => {
        return {
          text: keyword,
          value: index
        }
      }))

      stopLoading(dispatch)
    }

    getKeywords()
  }, [])

  return (
    <div className="mt-12">
      <StatsHeader />

      <div className=" mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2">
        {/* <div className="p-2">
          <Select
            className=""
            label="Select Ministry"
          >
            {getDepartmentList().map((item, key)=>{
                return(
                  <Option value={item.value} key={key}>{item.label}</Option>
                )
              })
            }
          </Select>
        </div> */}
        <Card>
          <CardBody>
            <div className="text-xl mb-2 text-center">
              Trendy keywords
            </div>
            <div className="my-14">
              {/* <ReactWordcloud
                words={trendyKeywords}
                options={wordCloudOptions}
                className="cursor-pointer svg-text-pointer"
                callbacks={{
                  onWordClick: queryText
                }}
              // size={[500, 500]}
              /> */}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xl mb-2 text-center">
              Top suggestions
            </div>
            <div className="my-14">
              {/* <ReactWordcloud
                words={topSuggestions}
                options={wordCloudOptions}
                className="cursor-pointer svg-text-pointer"
                callbacks={{
                  onWordClick: queryText
                }}
              // size={[500, 500]}
              /> */}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

const ChevronDown = () => <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
</svg>

export default Category;
