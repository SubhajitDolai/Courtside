'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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
  Loader2,
  AlertCircle,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Sport {
  id: string
  name: string
  is_active: boolean
}

interface FormData {
  sport_id: string
  start_time: string
  end_time: string
  gender: string
  allowed_user_type: string
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

export default function AddSlotPage() {
  // Page loading state
  const [pageLoading, setPageLoading] = useState(true)
  const [sportsLoading, setSportsLoading] = useState(true)

  // Data state
  const [sports, setSports] = useState<Sport[]>([])

  // Form state
  const [formData, setFormData] = useState<FormData>({
    sport_id: '',
    start_time: '',
    end_time: '',
    gender: '',
    allowed_user_type: 'student'
  })

  // UI state
  const [errors, setErrors] = useState<FormErrors>({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({})

  const router = useRouter()
  const supabase = createClient()

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  // Fetch sports list
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const { data, error } = await supabase
          .from('sports')
          .select('id, name, is_active')
          .eq('is_active', true)
          .order('name')

        if (error) {
          throw error
        }

        setSports(data || [])
      } catch (error: unknown) {
        console.error('Error fetching sports:', error)
        setErrors({ general: 'Failed to load sports list' })
        toast.error('Failed to load sports list')
      } finally {
        setSportsLoading(false)
      }
    }

    fetchSports()
  }, [supabase])

  // Validation rules
  const validateForm = useCallback((data: FormData): FormErrors => {
    const newErrors: FormErrors = {}

    // Sport selection validation
    if (!data.sport_id.trim()) {
      newErrors.sport_id = 'Please select a sport'
    }

    // Start time validation
    if (!data.start_time.trim()) {
      newErrors.start_time = 'Start time is required'
    }

    // End time validation
    if (!data.end_time.trim()) {
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
    if (!data.gender.trim()) {
      newErrors.gender = 'Please select gender'
    }

    // User type validation
    if (!data.allowed_user_type.trim()) {
      newErrors.allowed_user_type = 'Please select allowed user type'
    }

    return newErrors
  }, [])

  // Validate field on change
  const validateField = useCallback((field: ValidatableField, value: string | number | boolean) => {
    const newFormData = { ...formData, [field]: value }
    const fieldErrors = validateForm(newFormData)

    setErrors(prev => ({
      ...prev,
      [field]: fieldErrors[field],
      general: undefined
    }))
  }, [formData, validateForm])

  // Handle form field changes
  const handleFieldChange = useCallback((field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    if (touched[field]) {
      validateField(field as ValidatableField, value)
    }
  }, [touched, validateField])

  // Handle field blur (mark as touched)
  const handleFieldBlur = useCallback((field: ValidatableField) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    validateField(field, formData[field])
  }, [formData, validateField])

  // Form validation
  const isFormValid = useMemo(() => {
    const currentErrors = validateForm(formData)
    return Object.keys(currentErrors).length === 0 && !sportsLoading
  }, [formData, validateForm, sportsLoading])

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched
    setTouched({
      sport_id: true,
      start_time: true,
      end_time: true,
      gender: true,
      allowed_user_type: true,
    })

    const formErrors = validateForm(formData)
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) {
      toast.error('Please fix the errors before submitting')
      return
    }

    setConfirmOpen(true)
  }, [formData, validateForm])

  // Handle confirmed submission
  const handleConfirmedSubmit = useCallback(async () => {
    if (!isFormValid) return

    setSubmitting(true)
    setErrors({})

    try {
      const { error } = await supabase
        .from('slots')
        .insert([{
          sport_id: formData.sport_id,
          start_time: formData.start_time,
          end_time: formData.end_time,
          gender: formData.gender,
          allowed_user_type: formData.allowed_user_type,
        }])

      if (error) {
        throw error
      }

      toast.success('Slot added successfully!')
      router.push('/admin/slots')
    } catch (error: unknown) {
      console.error('Error adding slot:', error)

      // Handle specific database errors
      const dbError = error as { code?: string; message?: string }
      if (dbError.code === '23505') {
        setErrors({ general: 'A slot with this configuration already exists' })
        toast.error('Slot already exists')
      } else if (dbError.message?.includes('network')) {
        setErrors({ general: 'Network error. Please check your connection and try again.' })
        toast.error('Network error')
      } else {
        setErrors({ general: dbError.message || 'Failed to add slot. Please try again.' })
        toast.error('Failed to add slot')
      }
    } finally {
      setSubmitting(false)
      setConfirmOpen(false)
    }
  }, [formData, isFormValid, supabase, router])

  // Loading skeleton
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-start justify-center p-4 pt-30 sm:pt-4 sm:items-center">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <CardHeader className="space-y-1 pb-6">
              <Skeleton className="h-7 w-36" />
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

                {/* Submit Buttons Skeleton */}
                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 flex-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-start justify-center p-4 pt-30 sm:pt-4 sm:items-center">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold">Add New Slot</CardTitle>
            <p className="text-sm text-muted-foreground">
              Create a new time slot for sports activities
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
                  value={formData.sport_id}
                  onValueChange={(value) => handleFieldChange('sport_id', value)}
                  onOpenChange={() => handleFieldBlur('sport_id')}
                  disabled={submitting || sportsLoading}
                >
                  <SelectTrigger
                    id="sport_id"
                    className={cn(
                      "transition-colors",
                      errors.sport_id && "border-destructive focus:ring-destructive"
                    )}
                  >
                    <SelectValue placeholder={sportsLoading ? "Loading sports..." : "Select sport"} />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.length === 0 && !sportsLoading ? (
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
                    value={formData.start_time}
                    onChange={(e) => handleFieldChange('start_time', e.target.value)}
                    onBlur={() => handleFieldBlur('start_time')}
                    className={cn(
                      "transition-colors",
                      errors.start_time && "border-destructive focus-visible:ring-destructive"
                    )}
                    disabled={submitting}
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
                    value={formData.end_time}
                    onChange={(e) => handleFieldChange('end_time', e.target.value)}
                    onBlur={() => handleFieldBlur('end_time')}
                    className={cn(
                      "transition-colors",
                      errors.end_time && "border-destructive focus-visible:ring-destructive"
                    )}
                    disabled={submitting}
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
                  value={formData.gender}
                  onValueChange={(value) => handleFieldChange('gender', value)}
                  onOpenChange={() => handleFieldBlur('gender')}
                  disabled={submitting}
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
                  value={formData.allowed_user_type}
                  onValueChange={(value) => handleFieldChange('allowed_user_type', value)}
                  onOpenChange={() => handleFieldBlur('allowed_user_type')}
                  disabled={submitting}
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

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/slots')}
                  disabled={submitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isFormValid || submitting}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Slot
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={(open) => !submitting && setConfirmOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Slot Creation</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Please review the slot details before adding:</p>
                <div className="bg-muted/50 p-3 rounded-md text-sm space-y-1">
                  <div><strong>Sport:</strong> {sports.find(s => s.id === formData.sport_id)?.name || 'Unknown'}</div>
                  <div><strong>Time:</strong> {formData.start_time} - {formData.end_time}</div>
                  <div><strong>Gender:</strong> {formData.gender === 'any' ? 'Any' : formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1)}</div>
                  <div><strong>Allowed Users:</strong> {
                    formData.allowed_user_type === 'student' ? 'Students Only' :
                      formData.allowed_user_type === 'faculty' ? 'Faculty Only' : 'Anyone'
                  }</div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Yes, Add Slot'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}