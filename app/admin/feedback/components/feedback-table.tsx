'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { CalendarIcon, Search, MessageSquare, User, Mail, Hash, Clock, ChevronDown, ChevronUp, Loader2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

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
  onFeedbackDeleted?: (deletedId: string) => void
}

export default function FeedbackTable({ initialFeedback, onFeedbackDeleted }: FeedbackTableProps) {
  const [feedback, setFeedback] = useState<Feedback[]>(initialFeedback)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  // ✅ PAGINATION STATE
  const [displayedItems, setDisplayedItems] = useState(5) // Start with 5 items
  const [isLoading, setIsLoading] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  // Filter and sort feedback
  const filteredFeedback = useMemo(() => {
    const filtered = feedback.filter((item) => {
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

  // ✅ GET CURRENT DISPLAYED ITEMS
  const currentItems = useMemo(() => {
    return filteredFeedback.slice(0, displayedItems)
  }, [filteredFeedback, displayedItems])

  // ✅ LOAD MORE FUNCTION
  const loadMore = useCallback(async () => {
    if (isLoading || displayedItems >= filteredFeedback.length) return

    setIsLoading(true)

    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))

    setDisplayedItems(prev => Math.min(prev + 5, filteredFeedback.length))
    setIsLoading(false)
  }, [isLoading, displayedItems, filteredFeedback.length])

  // ✅ INTERSECTION OBSERVER FOR INFINITE SCROLL
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && displayedItems < filteredFeedback.length) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [isLoading, displayedItems, filteredFeedback.length, loadMore])

  // ✅ RESET PAGINATION WHEN FILTERS CHANGE
  useEffect(() => {
    setDisplayedItems(5)
  }, [searchTerm, dateFrom, dateTo, sortBy])

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

  // Delete feedback function
  const deleteFeedback = async (feedbackId: string) => {
    try {
      setDeletingIds(prev => new Set([...prev, feedbackId]))

      const { error } = await supabase
        .from('user_feedback')
        .delete()
        .eq('id', feedbackId)

      if (error) {
        console.error('Error deleting feedback:', error)
        toast.error('Failed to delete feedback')
        return
      }

      // Remove from local state
      setFeedback(prev => prev.filter(item => item.id !== feedbackId))

      // Remove from selected if it was selected
      setSelectedIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(feedbackId)
        return newSet
      })

      // Call parent callback if provided
      onFeedbackDeleted?.(feedbackId)

      toast.success('Feedback deleted successfully')
    } catch (error) {
      console.error('Error deleting feedback:', error)
      toast.error('Failed to delete feedback')
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(feedbackId)
        return newSet
      })
    }
  }

  // Bulk delete function
  const deleteBulkFeedback = async () => {
    if (selectedIds.size === 0) return

    try {
      setIsDeleting(true)

      const { error } = await supabase
        .from('user_feedback')
        .delete()
        .in('id', Array.from(selectedIds))

      if (error) {
        console.error('Error deleting feedback:', error)
        toast.error('Failed to delete selected feedback')
        return
      }

      // Remove from local state
      setFeedback(prev => prev.filter(item => !selectedIds.has(item.id)))

      // Clear selections
      setSelectedIds(new Set())

      toast.success(`${selectedIds.size} feedback items deleted successfully`)
    } catch (error) {
      console.error('Error deleting feedback:', error)
      toast.error('Failed to delete selected feedback')
    } finally {
      setIsDeleting(false)
    }
  }

  // Toggle selection for individual item
  const toggleSelection = (feedbackId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(feedbackId)) {
        newSet.delete(feedbackId)
      } else {
        newSet.add(feedbackId)
      }
      return newSet
    })
  }

  // Select all visible items
  const toggleSelectAll = () => {
    const visibleIds = currentItems.map(item => item.id)
    const allSelected = visibleIds.every(id => selectedIds.has(id))

    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (allSelected) {
        // Deselect all visible
        visibleIds.forEach(id => newSet.delete(id))
      } else {
        // Select all visible
        visibleIds.forEach(id => newSet.add(id))
      }
      return newSet
    })
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

      {/* Filters Section - Same as before */}
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
                    Clear: &quot;{searchTerm}&quot;
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
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold">Feedback Submissions</h2>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {selectedIds.size} selected
                </Badge>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete Selected
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Selected Feedback</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedIds.size} feedback item{selectedIds.size === 1 ? '' : 's'}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={deleteBulkFeedback}
                        className={cn(buttonVariants({ variant: "destructive" }))}
                      >
                        Delete {selectedIds.size} Item{selectedIds.size === 1 ? '' : 's'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {filteredFeedback.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={currentItems.length > 0 && currentItems.every(item => selectedIds.has(item.id))}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all visible feedback"
                />
                <span className="text-sm text-muted-foreground">
                  Select all visible
                </span>
              </div>
            )}
            <Badge variant="secondary" className="text-sm px-3 py-1">
              Showing {currentItems.length} of {filteredFeedback.length} {filteredFeedback.length === 1 ? 'item' : 'items'}
            </Badge>
          </div>
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
            {/* ✅ RENDER ONLY CURRENT ITEMS */}
            {currentItems.map((item) => (
              <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={() => toggleSelection(item.id)}
                        aria-label={`Select feedback from ${item.user_name || 'Anonymous'}`}
                      />
                      <div className="p-2 bg-muted/50 rounded-full">
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <Badge variant="outline" className="font-mono text-sm">
                          {format(new Date(item.created_at), 'MMM dd, yyyy • h:mm a')}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
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

                      {/* Delete Button with Confirmation */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                            disabled={deletingIds.has(item.id)}
                          >
                            {deletingIds.has(item.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="sr-only sm:not-sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this feedback? This action cannot be undone.
                              <div className="mt-3 p-3 bg-muted/50 rounded-lg border">
                                <p className="text-sm font-medium mb-1">From: {item.user_name || 'Anonymous'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {truncateText(item.note, 100)}
                                </p>
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteFeedback(item.id)}
                              className={cn(buttonVariants({ variant: "destructive" }))}
                            >
                              Delete Feedback
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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

            {/* ✅ LOAD MORE TRIGGER & LOADING STATE */}
            {displayedItems < filteredFeedback.length && (
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm font-medium">Loading more feedback...</span>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    className="px-6 py-2 text-sm font-medium"
                  >
                    Load More ({filteredFeedback.length - displayedItems} remaining)
                  </Button>
                )}
              </div>
            )}

            {/* ✅ END OF RESULTS MESSAGE */}
            {displayedItems >= filteredFeedback.length && filteredFeedback.length > 5 && (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">You&apos;ve reached the end of the feedback list</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}