'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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

export default function AddSportPage() {
  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [seatLimit, setSeatLimit] = useState<number>(2)
  const [isActive, setIsActive] = useState(true)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async () => {
    if (!name || !seatLimit) {
      toast.error('Please fill all fields')
      return
    }

    setLoading(true)

    const { error } = await supabase.from('sports').insert({
      name,
      image_url: imageUrl,
      seat_limit: seatLimit,
      is_active: isActive,
    })

    if (!error) {
      toast.success('Sport added ✅')
      router.push('/admin/sports')
    } else {
      toast.error(error.message)
    }

    setLoading(false)
    setConfirmOpen(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Add New Sport</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setConfirmOpen(true)
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
              Add Sport
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ✅ Confirm Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={(open) => !loading && setConfirmOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Add Sport?</AlertDialogTitle>
            <AlertDialogDescription>
              This will add a new sport to the system. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={loading}>
              {loading ? 'Adding...' : 'Yes, Add'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}