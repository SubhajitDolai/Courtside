'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export default function EditSportPage() {
  const params = useParams<{ id: string }>()
  const sportId = params.id

  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [seatLimit, setSeatLimit] = useState<number>(0)
  const [isActive, setIsActive] = useState(true)

  const [loading, setLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchSport() {
      const { data, error } = await supabase
        .from('sports')
        .select('*')
        .eq('id', sportId)
        .single()

      if (data) {
        setName(data.name)
        setImageUrl(data.image_url)
        setSeatLimit(data.seat_limit)
        setIsActive(data.is_active)
      } else {
        toast.error(error?.message)
      }
    }
    fetchSport()
  }, [sportId])

  async function handleSave() {
    setLoading(true)

    const { error } = await supabase
      .from('sports')
      .update({
        name,
        image_url: imageUrl,
        seat_limit: seatLimit,
        is_active: isActive,
      })
      .eq('id', sportId)

    if (!error) {
      toast.success('Sport updated ✅')
      router.push('/admin/sports')
    } else {
      toast.error(error.message)
    }

    setLoading(false)
    setSaveOpen(false)
  }

  async function handleDelete() {
    setLoading(true)

    const { error } = await supabase
      .from('sports')
      .delete()
      .eq('id', sportId)

    if (!error) {
      toast.success('Sport deleted ❌')
      router.push('/admin/sports')
    } else {
      toast.error(error.message)
    }

    setLoading(false)
    setDeleteOpen(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Sport</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setSaveOpen(true)
            }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              {imageUrl && (
                <div className="mt-2 relative w-full h-48 rounded border overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt="Sport preview"
                    fill
                    className="object-cover rounded"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="seatLimit">Seat Limit</Label>
              <Input
                id="seatLimit"
                type="number"
                value={Number.isNaN(seatLimit) ? '' : seatLimit}
                onChange={(e) => setSeatLimit(parseInt(e.target.value))}
                min={1}
                required
              />
            </div>

            <div className="flex items-center space-x-3">
              <Switch checked={isActive} onCheckedChange={setIsActive} id="active" />
              <Label htmlFor="active">Active</Label>
            </div>

            <Button type="submit" className="w-full">
              Save Changes
            </Button>

            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={() => setDeleteOpen(true)}
            >
              Delete Sport
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ✅ Confirm Save Dialog */}
      <AlertDialog open={saveOpen} onOpenChange={(open) => !loading && setSaveOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will update the sport details. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Yes, Save'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ Confirm Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={(open) => !loading && setDeleteOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sport?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the sport.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              {loading ? 'Deleting...' : 'Yes, Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}