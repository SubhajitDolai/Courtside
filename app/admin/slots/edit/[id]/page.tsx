'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'
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
import { Loader2 } from 'lucide-react'

export default function EditSportPage() {
  const params = useParams<{ id: string }>()
  const slotId = params.id
  const router = useRouter()
  const supabase = createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [slot, setSlot] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sports, setSports] = useState<any[]>([])

  const [deleteDialog, setDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: slotData } = await supabase.from('slots').select('*').eq('id', slotId).single()
      const { data: sportsData } = await supabase.from('sports').select('id, name')

      setSlot(slotData)
      setSports(sportsData ?? [])
    }
    fetchData()
  }, [slotId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await supabase.from('slots').update(slot).eq('id', slotId)

    toast.success('Slot updated ✅')
    router.push('/admin/slots')
  }

  const handleDelete = async () => {
    setDeleting(true)

    const { error } = await supabase.from('slots').delete().eq('id', slotId)

    if (!error) {
      toast.success('Slot deleted ❌')
      router.push('/admin/slots')
    } else {
      toast.error('Failed to delete')
    }

    setDeleting(false)
    setDeleteDialog(false)
  }

  // ✅ Smooth centered loading spinner
  if (!slot) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading slot...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Edit Slot</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Sport Dropdown */}
            <div className="space-y-2">
              <Label>Sport</Label>
              <Select
                value={slot.sport_id}
                onValueChange={(val) => setSlot({ ...slot, sport_id: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent>
                  {sports.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={slot.start_time}
                  onChange={(e) => setSlot({ ...slot, start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={slot.end_time}
                  onChange={(e) => setSlot({ ...slot, end_time: e.target.value })}
                />
              </div>
            </div>

            {/* Gender Dropdown */}
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                value={slot.gender}
                onValueChange={(val) => setSlot({ ...slot, gender: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="any">Any</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ✅ Allowed User Type Dropdown */}
            <div className="space-y-2">
              <Label>Allowed User Type</Label>
              <Select
                value={slot.allowed_user_type || 'any'}
                onValueChange={(val) => setSlot({ ...slot, allowed_user_type: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student Only</SelectItem>
                  <SelectItem value="faculty">Faculty Only</SelectItem>
                  <SelectItem value="any">Anyone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                checked={slot.is_active}
                onCheckedChange={(val) => setSlot({ ...slot, is_active: val })}
              />
              <Label>Active</Label>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full">
              Save Changes
            </Button>

            {/* Delete Button */}
            <Button
              variant="destructive"
              type="button"
              onClick={() => setDeleteDialog(true)}
              className="w-full mt-2"
            >
              Delete Slot
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ✅ Delete Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={(open) => !deleting && setDeleteDialog(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this slot?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All bookings in this slot will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Yes, delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
