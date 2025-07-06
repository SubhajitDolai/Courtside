'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import {
  Clock,
  Users,
  Calendar,
  Loader,
  AlertCircle,
  Save,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Sport {
  id: string
  name: string
  is_active: boolean
}

interface SlotData {
  id: string
  sport_id: string
  start_time: string
  end_time: string
  gender: string
  allowed_user_type: string
  is_active: boolean
}

interface FormErrors {
  sport_id?: string
  start_time?: string
  end_time?: string
  gender?: string
  allowed_user_type?: string
  general?: string
}

// Type for fields that can have validation errors
type ValidatableField = keyof Omit<FormErrors, 'general'>

export default function EditSlotPage() {
  const params = useParams<{ id: string }>()
  const slotId = params.id
  const router = useRouter()

  // Page loading state
  const [pageLoading, setPageLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)

  // Data state
  const [slot, setSlot] = useState<SlotData | null>(null)
  const [sports, setSports] = useState<Sport[]>([])

  // UI state
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const [touched, setTouched] = useState<Partial<Record<keyof SlotData, boolean>>>({})

  const supabase = createClient()

  // Validation rules
  const validateForm = useCallback((data: SlotData): FormErrors => {
    const newErrors: FormErrors = {}

    // Sport validation
    if (!data.sport_id?.trim()) {
      newErrors.sport_id = 'Please select a sport'
    }

    // Start time validation
    if (!data.start_time?.trim()) {
      newErrors.start_time = 'Start time is required'
    }

    // End time validation
    if (!data.end_time?.trim()) {
      newErrors.end_time = 'End time is required'
    }

    // Time range validation
    if (data.start_time && data.end_time) {
      const startTime = new Date(`1970-01-01T${data.start_time}:00`)
      const endTime = new Date(`1970-01-01T${data.end_time}:00`)

      if (endTime <= startTime) {
        newErrors.end_time = 'End time must be after start time'
      }
    }

    // Gender validation
    if (!data.gender?.trim()) {
      newErrors.gender = 'Please select gender'
    }

    // User type validation
    if (!data.allowed_user_type?.trim()) {
      newErrors.allowed_user_type = 'Please select allowed user type'
    }

    return newErrors
  }, [])

  // Validate field on change
  const validateField = useCallback((field: ValidatableField, value: string | number | boolean) => {
    if (!slot) return

    const newSlotData = { ...slot, [field]: value }
    const fieldErrors = validateForm(newSlotData)

    setErrors(prev => ({
      ...prev,
      [field]: fieldErrors[field],
      general: undefined
    }))
  }, [slot, validateForm])

  // Handle form field changes
  const handleFieldChange = useCallback((field: keyof SlotData, value: string | number | boolean) => {
    if (!slot) return

    setSlot(prev => prev ? { ...prev, [field]: value } : null)

    if (touched[field] && (field === 'sport_id' || field === 'start_time' || field === 'end_time' || field === 'gender' || field === 'allowed_user_type')) {
      validateField(field, value)
    }
  }, [slot, touched, validateField])

  // Handle field blur (mark as touched)
  const handleFieldBlur = useCallback((field: ValidatableField) => {
    if (!slot) return

    setTouched(prev => ({ ...prev, [field]: true }))
    validateField(field, slot[field])
  }, [slot, validateField])

  // Form validation
  const isFormValid = useMemo(() => {
    if (!slot) return false
    const currentErrors = validateForm(slot)
    return Object.keys(currentErrors).length === 0
  }, [slot, validateForm])

  // Fetch slot and sports data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slotResponse, sportsResponse] = await Promise.all([
          supabase.from('slots').select('*').eq('id', slotId).single(),
          supabase.from('sports').select('id, name, is_active').eq('is_active', true).order('name')
        ])

        if (slotResponse.data) {
          setSlot(slotResponse.data)
        } else {
          setErrors({ general: slotResponse.error?.message || 'Slot not found' })
          toast.error(slotResponse.error?.message || 'Slot not found')
        }

        setSports(sportsResponse.data || [])
      } catch (error: unknown) {
        console.log('Error:', error)
        setErrors({ general: 'Failed to load slot data' })
        toast.error('Failed to load slot data')
      } finally {
        setInitialLoading(false)
        // Simulate page loading for skeleton
        setTimeout(() => setPageLoading(false), 500)
      }
    }

    if (slotId) {
      fetchData()
    }
  }, [slotId, supabase])

  // Handle save
  const handleSave = useCallback(async () => {
    if (!isFormValid || !slot) return

    setLoading(true)
    setErrors({})

    try {
      const { error } = await supabase
        .from('slots')
        .update({
          sport_id: slot.sport_id,
          start_time: slot.start_time,
          end_time: slot.end_time,
          gender: slot.gender,
          allowed_user_type: slot.allowed_user_type,
          is_active: slot.is_active,
        })
        .eq('id', slotId)

      if (error) {
        throw error
      }

      toast.success('Slot updated successfully!')
      router.push('/admin/slots')
    } catch (error: unknown) {
      console.error('Error updating slot:', error)

      const dbError = error as { code?: string; message?: string }
      if (dbError.code === '23505') {
        setErrors({ general: 'A slot with this configuration already exists' })
        toast.error('Slot configuration already exists')
      } else if (dbError.message?.includes('network')) {
        setErrors({ general: 'Network error. Please check your connection and try again.' })
        toast.error('Network error')
      } else {
        setErrors({ general: dbError.message || 'Failed to update slot. Please try again.' })
        toast.error('Failed to update slot')
      }
    } finally {
      setLoading(false)
      setSaveOpen(false)
    }
  }, [slot, isFormValid, slotId, supabase, router])

  // Handle delete
  const handleDelete = useCallback(async () => {
    setLoading(true)

    try {
      const { error } = await supabase
        .from('slots')
        .delete()
        .eq('id', slotId)

      if (error) {
        throw error
      }

      toast.success('Slot deleted successfully!')
      router.push('/admin/slots')
    } catch (error: unknown) {
      console.error('Error deleting slot:', error)
      const dbError = error as { message?: string }
      toast.error(dbError.message || 'Failed to delete slot')
    } finally {
      setLoading(false)
      setDeleteOpen(false)
    }
  }, [slotId, supabase, router])

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()

    if (!slot) return

    setTouched({
      sport_id: true,
      start_time: true,
      end_time: true,
      gender: true,
      allowed_user_type: true,
    })

    const formErrors = validateForm(slot)
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) {
      toast.error('Please fix the errors before saving')
      return
    }

    setSaveOpen(true)
  }, [slot, validateForm])

  // Loading skeleton
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-start justify-center p-4 pt-30 sm:pt-4 sm:items-center">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <CardHeader className="space-y-1 pb-6">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                {/* Sport Selection Skeleton */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded" />
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-3 w-2" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Time Range Skeleton */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-3 rounded" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-2" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-3 rounded" />
                      <Skeleton className="h-4 w-14" />
                      <Skeleton className="h-3 w-2" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>

                {/* Gender Selection Skeleton */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-3 w-2" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* User Type Selection Skeleton */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-2" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Active Status Skeleton */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>

                {/* Submit Buttons Skeleton - Responsive Layout */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Skeleton className="h-10 w-full sm:flex-1" />
                  <Skeleton className="h-10 w-full sm:flex-1" />
                  <Skeleton className="h-10 w-full sm:flex-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Error state
  if (initialLoading === false && errors.general && !slot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-start justify-center p-4 pt-30 sm:pt-4 sm:items-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Slot Not Found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  The slot you&apos;re looking for doesn&apos;t exist or has been deleted.
                </p>
              </div>
              <Button onClick={() => router.push('/admin/slots')} variant="outline">
                Go Back to Slots
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!slot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-start justify-center p-4 pt-30 sm:pt-4 sm:items-center">
        <div className="flex flex-col items-center space-y-2">
          <Loader className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading slot...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-start justify-center p-4 pt-30 sm:pt-4 sm:items-center">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold">Edit Slot</CardTitle>
            <p className="text-sm text-muted-foreground">
              Update the slot information below
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="p-4 border border-destructive/30 bg-destructive/5 rounded-lg flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errors.general}
                </div>
              )}

              {/* Sport Selection */}
              <div className="space-y-2">
                <Label htmlFor="sport_id" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Sport <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={slot.sport_id}
                  onValueChange={(value) => handleFieldChange('sport_id', value)}
                  onOpenChange={() => handleFieldBlur('sport_id')}
                  disabled={loading}
                >
                  <SelectTrigger
                    id="sport_id"
                    className={cn(
                      "transition-colors",
                      errors.sport_id && "border-destructive focus:ring-destructive"
                    )}
                  >
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">No active sports found</div>
                    ) : (
                      sports.map((sport) => (
                        <SelectItem key={sport.id} value={sport.id}>
                          {sport.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.sport_id && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.sport_id}
                  </p>
                )}
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time" className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Start Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={slot.start_time}
                    onChange={(e) => handleFieldChange('start_time', e.target.value)}
                    onBlur={() => handleFieldBlur('start_time')}
                    className={cn(
                      "transition-colors",
                      errors.start_time && "border-destructive focus-visible:ring-destructive"
                    )}
                    disabled={loading}
                    required
                  />
                  {errors.start_time && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.start_time}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time" className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    End Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={slot.end_time}
                    onChange={(e) => handleFieldChange('end_time', e.target.value)}
                    onBlur={() => handleFieldBlur('end_time')}
                    className={cn(
                      "transition-colors",
                      errors.end_time && "border-destructive focus-visible:ring-destructive"
                    )}
                    disabled={loading}
                    required
                  />
                  {errors.end_time && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.end_time}
                    </p>
                  )}
                </div>
              </div>

              {/* Gender Selection */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  Gender <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={slot.gender}
                  onValueChange={(value) => handleFieldChange('gender', value)}
                  onOpenChange={() => handleFieldBlur('gender')}
                  disabled={loading}
                >
                  <SelectTrigger
                    id="gender"
                    className={cn(
                      "transition-colors",
                      errors.gender && "border-destructive focus:ring-destructive"
                    )}
                  >
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="any">Any</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.gender}
                  </p>
                )}
              </div>

              {/* Allowed User Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="allowed_user_type" className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  Allowed Users <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={slot.allowed_user_type || 'any'}
                  onValueChange={(value) => handleFieldChange('allowed_user_type', value)}
                  onOpenChange={() => handleFieldBlur('allowed_user_type')}
                  disabled={loading}
                >
                  <SelectTrigger
                    id="allowed_user_type"
                    className={cn(
                      "transition-colors",
                      errors.allowed_user_type && "border-destructive focus:ring-destructive"
                    )}
                  >
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Students Only</SelectItem>
                    <SelectItem value="faculty">Faculty Only</SelectItem>
                    <SelectItem value="any">Anyone</SelectItem>
                  </SelectContent>
                </Select>
                {errors.allowed_user_type && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.allowed_user_type}
                  </p>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                <div className="space-y-0.5">
                  <Label htmlFor="active" className="text-sm font-medium">
                    Active Status
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {slot.is_active
                      ? "Slot is active and available for booking"
                      : "Slot is inactive and hidden from users"
                    }
                  </p>
                </div>
                <Switch
                  checked={slot.is_active}
                  onCheckedChange={(checked) => handleFieldChange('is_active', checked)}
                  id="active"
                  disabled={loading}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/slots')}
                  disabled={loading}
                  className="w-full sm:flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="w-full sm:flex-1"
                >
                  {loading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      <span className="sm:hidden">Saving...</span>
                      <span className="hidden sm:inline">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      <span className="sm:hidden">Save</span>
                      <span className="hidden sm:inline">Save Changes</span>
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                  disabled={loading}
                  className="w-full sm:flex-1"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={saveOpen} onOpenChange={(open) => !loading && setSaveOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Changes?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Please review the updated slot details before saving:</p>
                <div className="bg-muted/50 p-3 rounded-md text-sm space-y-1">
                  <div><strong>Sport:</strong> {sports.find(s => s.id === slot.sport_id)?.name || 'Unknown'}</div>
                  <div><strong>Time:</strong> {slot.start_time} - {slot.end_time}</div>
                  <div><strong>Gender:</strong> {slot.gender === 'any' ? 'Any' : slot.gender.charAt(0).toUpperCase() + slot.gender.slice(1)}</div>
                  <div><strong>Allowed Users:</strong> {
                    slot.allowed_user_type === 'student' ? 'Students Only' :
                      slot.allowed_user_type === 'faculty' ? 'Faculty Only' : 'Anyone'
                  }</div>
                  <div><strong>Status:</strong> {slot.is_active ? 'Active' : 'Inactive'}</div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Yes, Save Changes'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={(open) => !loading && setDeleteOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Slot?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p className="text-destructive font-medium">
                  This action cannot be undone!
                </p>
                <p>
                  This will permanently delete this slot and all associated data.
                </p>
                <div className="bg-destructive/10 p-3 rounded-md text-sm">
                  <strong>What will be deleted:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Slot time configuration</li>
                    <li>All bookings for this slot</li>
                    <li>Historical booking data</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Yes, Delete Permanently'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}