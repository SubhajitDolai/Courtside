'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, RefreshCw, Filter, Target, Activity, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Badge } from '@/components/ui/badge'
import { DateRange } from "react-day-picker"
import { createClient } from '@/utils/supabase/client'

interface FilterState {
  dateRange: DateRange | undefined
  search: string
  status: string
  sport: string
}

interface BookingsHistoryFiltersProps {
  onFiltersChange?: (filters: FilterState) => void
}

interface Sport {
  id: string
  name: string
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

export default function BookingsHistoryFilters({ onFiltersChange }: BookingsHistoryFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: undefined,
    search: '',
    status: 'all',
    sport: 'all'
  })

  const [sports, setSports] = useState<Sport[]>([])
  const [statuses, setStatuses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  // Notify parent when debounced filters change
  const debouncedFilters = useDebounce(filters, 300)

  useEffect(() => {
    onFiltersChange?.(debouncedFilters)
  }, [debouncedFilters, onFiltersChange])

  // Fetch sports and statuses from database
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch sports
        const { data: sportsData, error: sportsError } = await supabase
          .from('sports')
          .select('id, name')
          .order('name')

        if (sportsError) throw sportsError
        setSports(sportsData || [])

        // Fetch unique statuses from bookings_history
        const { data: statusData, error: statusError } = await supabase
          .from('bookings_history')
          .select('status')
          .not('status', 'is', null)

        if (statusError) throw statusError

        // Get unique statuses
        const uniqueStatuses = [...new Set(statusData?.map(item => item.status) || [])]
        setStatuses(uniqueStatuses.sort())

      } catch (error) {
        console.error('Error fetching filter options:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilterOptions()
  }, [supabase])

  const handleReset = () => {
    const resetFilters = {
      dateRange: undefined,
      search: '',
      status: 'all',
      sport: 'all'
    }
    setFilters(resetFilters)
  }

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Helper function to format status labels
  const formatStatusLabel = (status: string) => {
    return status
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.sport !== 'all' || filters.dateRange

  return (
    <div className="space-y-4 mb-6">
      {/* Main Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm">
        {/* Search Input */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search by name, PRN, or booking ID..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10 border-neutral-200 dark:border-neutral-700 focus:border-green-500 dark:focus:border-green-400"
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
            <Select
              value={filters.status}
              onValueChange={(value) => updateFilters({ status: value })}
              disabled={loading}
            >
              <SelectTrigger className="border-neutral-200 dark:border-neutral-700 w-full">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-neutral-500" />
                  <SelectValue placeholder={loading ? "Loading..." : "Status"} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sport Filter */}
          <div className="min-w-[140px] w-full sm:w-auto md:w-auto">
            <Select
              value={filters.sport}
              onValueChange={(value) => updateFilters({ sport: value })}
              disabled={loading}
            >
              <SelectTrigger className="border-neutral-200 dark:border-neutral-700 w-full">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-neutral-500" />
                  <SelectValue placeholder={loading ? "Loading..." : "Sport"} />
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
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            size="default"
            onClick={handleReset}
            disabled={!hasActiveFilters}
            className="border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 px-3"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
            <Filter className="h-4 w-4" />
            Active Filters:
          </div>

          {filters.search && (
            <Badge
              variant="secondary"
              className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/70 cursor-pointer"
              onClick={() => updateFilters({ search: '' })}
            >
              Search: "{filters.search}"
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
            className="h-6 px-2 text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 hover:bg-green-100 dark:hover:bg-green-900/50"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  )
}

export type { FilterState }