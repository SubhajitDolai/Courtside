'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { CalendarIcon, Search, MessageSquare, User, Mail, Hash, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Feedback {
  id: string
  note: string
  created_at: string
  email: string | null
  profile_id: string | null
  user_name: string | null
  user_prn: string | null
}

interface FeedbackTableProps {
  initialFeedback: Feedback[]
}

export default function FeedbackTable({ initialFeedback }: FeedbackTableProps) {
  const [feedback, setFeedback] = useState<Feedback[]>(initialFeedback)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Filter and sort feedback
  const filteredFeedback = useMemo(() => {
    let filtered = feedback.filter((item) => {
      const searchMatch =
        item.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user_prn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase())

      const dateMatch = (!dateFrom && !dateTo) ||
        (dateFrom && dateTo &&
          new Date(item.created_at) >= dateFrom &&
          new Date(item.created_at) <= dateTo)

      return searchMatch && dateMatch
    })

    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB
    })
  }, [feedback, searchTerm, dateFrom, dateTo, sortBy])

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const truncateText = (text: string, maxLength: number = 120) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const shouldShowExpandButton = (text: string) => {
    return text.length > 120
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview - Very Small Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="py-4 border-0 shadow-sm bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
          <CardContent className='px-4'>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Total Feedback</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{feedback.length}</p>
              </div>
              <div className="p-1.5 bg-blue-200 dark:bg-blue-800 rounded-md">
                <MessageSquare className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-4 border-0 shadow-sm bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
          <CardContent className='px-4'>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700 dark:text-green-300">Current Month</p>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">
                  {feedback.filter(f => new Date(f.created_at).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
              <div className="p-1.5 bg-green-200 dark:bg-green-800 rounded-md">
                <Clock className="h-3.5 w-3.5 text-green-700 dark:text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-4 border-0 shadow-sm bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50">
          <CardContent className='px-4'>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Filtered Results</p>
                <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{filteredFeedback.length}</p>
              </div>
              <div className="p-1.5 bg-purple-200 dark:bg-purple-800 rounded-md">
                <Search className="h-3.5 w-3.5 text-purple-700 dark:text-purple-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section - Slim */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search feedback, name, PRN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-sm"
              />
            </div>

            {/* Date From */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("justify-start text-left font-normal h-10 text-sm", !dateFrom && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span className="truncate">
                    {dateFrom ? format(dateFrom, "MMM dd, yyyy") : "From date"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
              </PopoverContent>
            </Popover>

            {/* Date To */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("justify-start text-left font-normal h-10 text-sm", !dateTo && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span className="truncate">
                    {dateTo ? format(dateTo, "MMM dd, yyyy") : "To date"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
              </PopoverContent>
            </Popover>

            {/* Sort & Clear All */}
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'newest' | 'oldest')}>
                <SelectTrigger className="h-10 flex-1 text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || dateFrom || dateTo) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setDateFrom(undefined)
                    setDateTo(undefined)
                  }}
                  className="h-10 px-3 text-xs whitespace-nowrap"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Individual Clear Buttons */}
          {(searchTerm || dateFrom || dateTo) && (
            <>
              <Separator className="my-3" />
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Button onClick={() => setSearchTerm('')} variant="secondary" size="sm" className="text-sm">
                    Clear: "{searchTerm}"
                  </Button>
                )}
                {dateFrom && (
                  <Button onClick={() => setDateFrom(undefined)} variant="secondary" size="sm" className="text-sm">
                    From: {format(dateFrom, "MMM dd, yyyy")}
                  </Button>
                )}
                {dateTo && (
                  <Button onClick={() => setDateTo(undefined)} variant="secondary" size="sm" className="text-sm">
                    To: {format(dateTo, "MMM dd, yyyy")}
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Feedback List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Feedback Submissions</h2>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {filteredFeedback.length} {filteredFeedback.length === 1 ? 'item' : 'items'}
          </Badge>
        </div>

        {filteredFeedback.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-3 bg-muted/50 rounded-full mb-3">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No feedback found</h3>
              <p className="text-muted-foreground text-base">No feedback matches your current search criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredFeedback.map((item) => (
              <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted/50 rounded-full">
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <Badge variant="outline" className="font-mono text-sm">
                          {format(new Date(item.created_at), 'MMM dd, yyyy • h:mm a')}
                        </Badge>
                      </div>
                    </div>

                    {/* Dynamic Expand Button - Only show for long messages */}
                    {shouldShowExpandButton(item.note) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(item.id)}
                        className="gap-2 text-muted-foreground hover:text-foreground text-sm"
                      >
                        {expandedRows.has(item.id) ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Collapse
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            Expand
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="text-base font-medium">{item.user_name || 'Anonymous'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Hash className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">PRN</p>
                        <p className="text-base font-medium font-mono">{item.user_prn || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="text-base font-medium">{item.email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Feedback Content - Neutral */}
                  <div>
                    <p className="text-base font-medium mb-3">Feedback Message</p>
                    <div className="bg-muted/20 border border-border rounded-lg p-4">
                      <p className="text-base leading-relaxed whitespace-pre-wrap text-foreground">
                        {expandedRows.has(item.id) ? item.note : truncateText(item.note)}
                      </p>
                      {!expandedRows.has(item.id) && shouldShowExpandButton(item.note) && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => toggleRowExpansion(item.id)}
                          className="mt-3 p-0 h-auto text-sm font-medium"
                        >
                          Read more...
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}