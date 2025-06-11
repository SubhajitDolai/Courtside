'use client'

import { useCallback, useState, useEffect } from 'react'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Search, RefreshCw, Filter, Target, Activity, X } from 'lucide-react'
import { DateRange } from "react-day-picker"

interface Sport {
  id: string
  name: string
}

interface FilterState {
  dateRange: DateRange | undefined
  search: string
  status: string
  sport: string
}

interface BookingHistoryFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  availableStatuses: string[]
  sports: Sport[]
  refreshing?: boolean
  onRefresh?: () => void
  loadingFilterOptions?: boolean
}

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

function BookingHistoryFilters({
  filters,
  onFiltersChange,
  availableStatuses,
  sports,
  refreshing = false,
  onRefresh,
  loadingFilterOptions = false
}: BookingHistoryFiltersProps) {
  // Local state for immediate UI updates
  const [localSearch, setLocalSearch] = useState(filters.search)
  
  // Debounce the search input
  const debouncedSearch = useDebounce(localSearch, 300)

  // Update parent when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ ...filters, search: debouncedSearch })
    }
  }, [debouncedSearch, filters, onFiltersChange])

  // Sync local search with prop changes (for reset functionality)
  useEffect(() => {
    setLocalSearch(filters.search)
  }, [filters.search])

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    // Handle search separately for immediate UI feedback
    if ('search' in newFilters) {
      setLocalSearch(newFilters.search || '')
      // Don't update parent immediately for search
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { search, ...otherFilters } = newFilters
      if (Object.keys(otherFilters).length > 0) {
        onFiltersChange({ ...filters, ...otherFilters })
      }
    } else {
      onFiltersChange({ ...filters, ...newFilters })
    }
  }, [filters, onFiltersChange])

  const handleReset = () => {
    const resetFilters = {
      dateRange: undefined,
      search: '',
      status: 'all',
      sport: 'all'
    }
    setLocalSearch('') // Reset local search immediately
    onFiltersChange(resetFilters)
  }

  // Helper function to format status labels
  const formatStatusLabel = (status: string) => {
    return status
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const hasActiveFilters = localSearch || filters.status !== 'all' || filters.sport !== 'all' || filters.dateRange

  return (
    <div className="space-y-4">
      {/* Main Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm">
        {/* Search Input */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search by booking ID, sport, or seat..."
              value={localSearch}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10 border-neutral-200 dark:border-neutral-700 focus:border-neutral-400 dark:focus:border-neutral-500"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Date Range */}
          <div className="min-w-[240px]">
            <DatePickerWithRange
              value={filters.dateRange}
              onChange={(range) => updateFilters({ dateRange: range })}
            />
          </div>

          {/* Status Filter */}
          <div className="min-w-[140px] w-full sm:w-auto md:w-auto">
            {loadingFilterOptions ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={filters.status}
                onValueChange={(value) => updateFilters({ status: value })}
              >
                <SelectTrigger className="border-neutral-200 dark:border-neutral-700 w-full">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-neutral-500" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {availableStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {formatStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Sport Filter */}
          <div className="min-w-[140px] w-full sm:w-auto md:w-auto">
            {loadingFilterOptions ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={filters.sport}
                onValueChange={(value) => updateFilters({ sport: value })}
              >
                <SelectTrigger className="border-neutral-200 dark:border-neutral-700 w-full">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-neutral-500" />
                    <SelectValue placeholder="Sport" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  {sports.map((sport) => (
                    <SelectItem key={sport.id} value={sport.id}>
                      {sport.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            size="default"
            onClick={onRefresh || handleReset}
            disabled={!hasActiveFilters && !onRefresh}
            className="border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 px-3"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-neutral-50 dark:bg-neutral-950/30 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <Filter className="h-4 w-4" />
            Active Filters:
          </div>

          {localSearch && (
            <Badge
              variant="secondary"
              className="bg-neutral-100 dark:bg-neutral-900/50 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-900/70 cursor-pointer"
              onClick={() => updateFilters({ search: '' })}
            >
              Search: &quot;{localSearch}&quot;
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}

          {filters.status !== 'all' && (
            <Badge
              variant="secondary"
              className="bg-neutral-100 dark:bg-neutral-900/50 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-900/70 cursor-pointer"
              onClick={() => updateFilters({ status: 'all' })}
            >
              Status: {formatStatusLabel(filters.status)}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}

          {filters.sport !== 'all' && (
            <Badge
              variant="secondary"
              className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-900/70 cursor-pointer"
              onClick={() => updateFilters({ sport: 'all' })}
            >
              Sport: {sports.find(s => s.id === filters.sport)?.name || filters.sport}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}

          {filters.dateRange?.from && (
            <Badge
              variant="secondary"
              className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900/70 cursor-pointer"
              onClick={() => updateFilters({ dateRange: undefined })}
            >
              Date: {filters.dateRange.from.toLocaleDateString()}
              {filters.dateRange.to && ` - ${filters.dateRange.to.toLocaleDateString()}`}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-6 px-2 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900/50"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(BookingHistoryFilters)

export type { FilterState, Sport }
