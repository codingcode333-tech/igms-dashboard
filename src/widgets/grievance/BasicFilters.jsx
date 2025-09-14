import { DateRangePicker, Loader, MinistryAutocomplete, MultipleMinistryAutocomplete } from "@/pages/dashboard/CategoricalTree";
import { Button, Typography, Chip } from "@material-tailwind/react"
import { useState } from "react";
import { useTheme } from "@/context";

export function BasicFilters({
  ministry,
  setMinistry,
  from,
  setFrom,
  to,
  setTo,
  searching = false,
  startSearch = () => '',
  ComplementaryInfo = ({ className }) => <div className={className}></div>
}) {
  const { isDark } = useTheme();
  const [dateRange, setDateRange] = useState({
    startDate: from,
    endDate: to
  })

  const [selectedMinistry, setSelectedMinistry] = useState({
    text: ministry == 'All' ? '' : ministry,
    value: ministry
  })

  const updateDateRange = range => {
    setFrom(range.startDate)
    setTo(range.endDate)
    setDateRange(range)
  }

  const updateSelectedMinistry = selection => {
    setMinistry(selection?.value)
    setSelectedMinistry(selection)
  }

  return (
    <FilterLayout>
      <DateRangePicker
        value={dateRange}
        onChange={updateDateRange}
      />

      <MultipleMinistryAutocomplete
        ministry={selectedMinistry}
        setMinistry={updateSelectedMinistry}
      />

      <div className="flex gap-2 flex-col justify-end md:flex-row md:col-start-2 xl:col-start-auto xl:justify-start">
        <SearchButton
          searching={searching}
          startSearch={startSearch}
          actionText="Analyze"
          loadingText="Analyzing..."
        />

        <ComplementaryInfo className={`order-auto md:order-first xl:order-last`} />
      </div>
    </FilterLayout >
  )
}

export function FilterLayout({
  children,
  className = ''
}) {
  return (
    <div className={`mb-6 grid grid-cols-1 gap-y-4 gap-x-6 md:grid-cols-2 xl:grid-cols-3 ${className}`}>
      {children}
    </div>
  )
}

export const SearchButton = ({
  searching = false,
  startSearch = () => '',
  actionText = 'Search',
  loadingText = 'Searching...',
  color = 'blue',
  className = '',
  icon = <div></div>,
  disabled = false
}) => {
  return <Button
    className={`h-[2.6rem] flex justify-center items-center select-none ${className}`}
    onClick={startSearch}
    disabled={searching || disabled}
    color={color}
  >
    {
      searching &&
      <Loader className="mr-2 animate-spin" color="#fff" />
    }

    {
      icon
    }

    <span>
      {
        searching
          ? loadingText
          : actionText
      }
    </span>
  </Button>
}