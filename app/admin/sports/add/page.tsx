'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import Image from 'next/image'
import { 
  ImageIcon, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Upload,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormData {
  name: string
  imageUrl: string
  seatLimit: number
  isActive: boolean
}

interface FormErrors {
  name?: string
  imageUrl?: string
  seatLimit?: string
  general?: string
}

interface ImageState {
  loading: boolean
  error: boolean
  loaded: boolean
}

// Type for fields that can have validation errors
type ValidatableField = keyof Omit<FormErrors, 'general'>

// Helper function to validate if URL is valid for Next.js Image
const isValidImageUrl = (url: string): boolean => {
  if (!url || !url.trim()) return false
  
  try {
    const parsedUrl = new URL(url)
    // Check if it's a valid absolute URL (http/https)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    // Check if it's a valid relative path starting with /
    return url.startsWith('/')
  }
}

export default function AddSportPage() {
  // Page loading state
  const [pageLoading, setPageLoading] = useState(true)
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    imageUrl: '',
    seatLimit: 2,
    isActive: true,
  })
  
  // UI state
  const [errors, setErrors] = useState<FormErrors>({})
  const [imageState, setImageState] = useState<ImageState>({
    loading: false,
    error: false,
    loaded: false,
  })
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({})

  const router = useRouter()
  const supabase = createClient()

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 800) // Simulate loading time

    return () => clearTimeout(timer)
  }, [])

  // Validation rules
  const validateForm = useCallback((data: FormData): FormErrors => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!data.name.trim()) {
      newErrors.name = 'Sport name is required'
    } else if (data.name.trim().length < 2) {
      newErrors.name = 'Sport name must be at least 2 characters'
    } else if (data.name.trim().length > 50) {
      newErrors.name = 'Sport name must be less than 50 characters'
    }

    // Seat limit validation
    if (!data.seatLimit || data.seatLimit < 1) {
      newErrors.seatLimit = 'Spot limit must be at least 1'
    } else if (data.seatLimit > 1000) {
      newErrors.seatLimit = 'Spot limit cannot exceed 1000'
    }

    // Image URL validation (optional but if provided, should be valid)
    if (data.imageUrl && data.imageUrl.trim()) {
      if (!isValidImageUrl(data.imageUrl)) {
        newErrors.imageUrl = 'Please provide a valid absolute URL (http:// or https://)'
      } else {
        try {
          new URL(data.imageUrl)
          // Additional check for image format
          const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
          const hasValidExtension = validExtensions.some(ext => 
            data.imageUrl.toLowerCase().includes(ext)
          )
          if (!hasValidExtension && !data.imageUrl.includes('unsplash.com') && !data.imageUrl.includes('imgur.com')) {
            newErrors.imageUrl = 'Please provide a valid image URL'
          }
        } catch {
          newErrors.imageUrl = 'Please provide a valid URL'
        }
      }
    }

    return newErrors
  }, [])

  // Validate field on change
  const validateField = useCallback((field: ValidatableField, value: any) => {
    const newFormData = { ...formData, [field]: value }
    const fieldErrors = validateForm(newFormData)
    
    setErrors(prev => ({
      ...prev,
      [field]: fieldErrors[field],
      general: undefined // Clear general error when user starts fixing issues
    }))
  }, [formData, validateForm])

  // Handle form field changes
  const handleFieldChange = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Validate only if field has been touched and is validatable
    if (touched[field] && (field === 'name' || field === 'imageUrl' || field === 'seatLimit')) {
      validateField(field, value)
    }
  }, [touched, validateField])

  // Handle field blur (mark as touched)
  const handleFieldBlur = useCallback((field: ValidatableField) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    validateField(field, formData[field])
  }, [formData, validateField])

  // Image loading handlers
  const handleImageLoad = useCallback(() => {
    setImageState({
      loading: false,
      error: false,
      loaded: true,
    })
  }, [])

  const handleImageError = useCallback(() => {
    setImageState({
      loading: false,
      error: true,
      loaded: false,
    })
    if (touched.imageUrl) {
      setErrors(prev => ({
        ...prev,
        imageUrl: 'Failed to load image. Please check the URL.'
      }))
    }
  }, [touched.imageUrl])

  const handleImageLoadStart = useCallback(() => {
    if (formData.imageUrl && isValidImageUrl(formData.imageUrl)) {
      setImageState({
        loading: true,
        error: false,
        loaded: false,
      })
      // Clear previous image errors
      setErrors(prev => ({ ...prev, imageUrl: undefined }))
    }
  }, [formData.imageUrl])

  // Clear image
  const clearImage = useCallback(() => {
    setFormData(prev => ({ ...prev, imageUrl: '' }))
    setImageState({ loading: false, error: false, loaded: false })
    setErrors(prev => ({ ...prev, imageUrl: undefined }))
  }, [])

  // Form validation
  const isFormValid = useMemo(() => {
    const currentErrors = validateForm(formData)
    return Object.keys(currentErrors).length === 0
  }, [formData, validateForm])

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Mark all validatable fields as touched
    setTouched({
      name: true,
      imageUrl: true,
      seatLimit: true,
      isActive: true,
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
      const { data, error } = await supabase
        .from('sports')
        .insert({
          name: formData.name.trim(),
          image_url: formData.imageUrl.trim() || null,
          seat_limit: formData.seatLimit,
          is_active: formData.isActive,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      toast.success('Sport added successfully!')
      router.push('/admin/sports')
    } catch (error: any) {
      console.error('Error adding sport:', error)
      
      // Handle specific database errors
      if (error.code === '23505') {
        setErrors({ general: 'A sport with this name already exists' })
        toast.error('Sport name already exists')
      } else if (error.message?.includes('network')) {
        setErrors({ general: 'Network error. Please check your connection and try again.' })
        toast.error('Network error')
      } else {
        setErrors({ general: error.message || 'Failed to add sport. Please try again.' })
        toast.error('Failed to add sport')
      }
    } finally {
      setSubmitting(false)
      setConfirmOpen(false)
    }
  }, [formData, isFormValid, supabase, router])

  // Loading skeleton
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="shadow-lg border-0 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <CardHeader className="space-y-1 pb-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-80" />
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                {/* Sport Name Skeleton */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Image URL Skeleton */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Seat Limit Skeleton */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-3 w-96" />
                </div>

                {/* Active Status Skeleton */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                  <div className="space-y-0.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-80" />
                  </div>
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>

                {/* Submit Button Skeleton */}
                <div className="flex gap-3 pt-6">
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold">Sport Details</CardTitle>
            <p className="text-sm text-muted-foreground">
              Fill in the information below to add a new sport
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

              {/* Sport Name */}
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-medium">
                  Sport Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  onBlur={() => handleFieldBlur('name')}
                  placeholder="e.g., Basketball, Tennis, Soccer"
                  className={cn(
                    "transition-colors",
                    errors.name && "border-destructive focus-visible:ring-destructive"
                  )}
                  disabled={submitting}
                />
                {errors.name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Image URL */}
              <div className="space-y-3">
                <Label htmlFor="imageUrl" className="text-sm font-medium">
                  Sport Image URL
                  <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
                </Label>
                <div className="relative">
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => {
                      handleFieldChange('imageUrl', e.target.value)
                      if (e.target.value && isValidImageUrl(e.target.value)) {
                        handleImageLoadStart()
                      } else {
                        setImageState({ loading: false, error: false, loaded: false })
                      }
                    }}
                    onBlur={() => handleFieldBlur('imageUrl')}
                    placeholder="https://example.com/sport-image.jpg"
                    className={cn(
                      "pr-10 transition-colors",
                      errors.imageUrl && "border-destructive focus-visible:ring-destructive"
                    )}
                    disabled={submitting}
                  />
                  {formData.imageUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearImage}
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      disabled={submitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {errors.imageUrl && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.imageUrl}
                  </p>
                )}

                {/* Image Preview */}
                {formData.imageUrl && (
                  <div className="mt-4">
                    <div className="relative w-full h-48 rounded-lg border-2 border-dashed border-muted-foreground/25 overflow-hidden bg-muted/20">
                      {imageState.loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Loading image...</span>
                          </div>
                        </div>
                      )}
                      
                      {imageState.error && !imageState.loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <AlertCircle className="h-8 w-8" />
                            <span className="text-sm">Failed to load image</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (formData.imageUrl && isValidImageUrl(formData.imageUrl)) {
                                  handleImageLoadStart()
                                }
                              }}
                            >
                              Retry
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {formData.imageUrl && !imageState.error && isValidImageUrl(formData.imageUrl) && (
                        <Image
                          src={formData.imageUrl}
                          alt="Sport preview"
                          fill
                          className={cn(
                            "object-cover transition-opacity duration-200",
                            imageState.loading ? "opacity-0" : "opacity-100"
                          )}
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                          onLoadStart={handleImageLoadStart}
                        />
                      )}
                      
                      {!isValidImageUrl(formData.imageUrl) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <ImageIcon className="h-8 w-8" />
                            <span className="text-sm">Invalid image URL format</span>
                          </div>
                        </div>
                      )}
                      
                      {imageState.loaded && !imageState.loading && !imageState.error && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Loaded
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Seat Limit */}
              <div className="space-y-3">
                <Label htmlFor="seatLimit" className="text-sm font-medium">
                  Spot Limit <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="seatLimit"
                  type="number"
                  value={formData.seatLimit || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : parseInt(e.target.value)
                    handleFieldChange('seatLimit', value)
                  }}
                  onBlur={() => handleFieldBlur('seatLimit')}
                  placeholder="Maximum number of spots available"
                  min={1}
                  max={1000}
                  className={cn(
                    "transition-colors",
                    errors.seatLimit && "border-destructive focus-visible:ring-destructive"
                  )}
                  disabled={submitting}
                />
                {errors.seatLimit && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.seatLimit}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  This determines how many people can book this sport at the same time
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                <div className="space-y-0.5">
                  <Label htmlFor="active" className="text-sm font-medium">
                    Active Status
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {formData.isActive 
                      ? "Sport is active and available for booking" 
                      : "Sport is inactive and hidden from users"
                    }
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleFieldChange('isActive', checked)}
                  id="active"
                  disabled={submitting}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/sports')}
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
                      <Upload className="mr-2 h-4 w-4" />
                      Add Sport
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
            <AlertDialogTitle>Confirm Sport Creation</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Please review the details before adding this sport:</p>
                <div className="bg-muted/50 p-3 rounded-md text-sm space-y-1">
                  <div><strong>Name:</strong> {formData.name}</div>
                  <div><strong>Spot Limit:</strong> {formData.seatLimit}</div>
                  <div><strong>Status:</strong> {formData.isActive ? 'Active' : 'Inactive'}</div>
                  {formData.imageUrl && <div><strong>Has Image:</strong> Yes</div>}
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
                  Creating...
                </>
              ) : (
                'Create Sport'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}