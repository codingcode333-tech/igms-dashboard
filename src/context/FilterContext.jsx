import { getDefaultDepartment } from '@/data';
import { dateBefore, formatDate } from '@/helpers/date';
import { countDayDuration } from '@/helpers/env';
import React, { createContext, useState, useContext } from 'react';

// const today = new Date(); // Get today's date
// const oneMonthAgo = new Date(today);
// oneMonthAgo.setMonth(today.getMonth() - 1);

export const defaultFilters = {
  startDate: null, // User will choose dates themselves
  endDate: null,   // User will choose dates themselves  
  state: 'All',
  district: 'All',
  ministry: 'All', // Don't preset DOCAF, let user choose from dropdown
  type: "1",
  query: '',
  threshold: 1.2,
  all_record: 1,
  page_req: 0
}

// Create a new context
const FilterContext = createContext();

// Create a provider component to wrap around the App
export function FilterProvider({ children }) {
  const [filters, setFilters] = useState(defaultFilters);
  const [tempFilters, setTempFilters] = useState(null)
  const [searching, setSearching] = useState(false)
  const [pageno, setPageno] = useState(1)

  return (
    <FilterContext.Provider value={{
      filters,
      setFilters,
      searching,
      tempFilters,
      startSearch: (tempFilterParams) => {
        setTempFilters(tempFilterParams)
        setSearching(true)
      },
      stopSearch: () => {
        setTempFilters(null)
        setSearching(false)
      },
      pageno,
      setPageno,
      setToDefault: () => setFilters(defaultFilters)
    }}>
      {children}
    </FilterContext.Provider>
  );
}

// Custom hook to access the context
export function useFilter() {
  return useContext(FilterContext);
}
