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

export default function EditSportPage() {
  const params = useParams<{ id: string }>()
  const slotId = params.id
  const router = useRouter()
  const supabase = createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [slot, setSlot] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sports, setSports] = useState<any[]>([])

  // Fetch slot + sports data
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

    router.push('/admin/slots') // Redirect to slots list
  }

  if (!slot) return <p>Loading...</p>

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Edit Slot</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Sport Dropdown */}
            <div>
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
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={slot.start_time}
                  onChange={(e) => setSlot({ ...slot, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={slot.end_time}
                  onChange={(e) => setSlot({ ...slot, end_time: e.target.value })}
                />
              </div>
            </div>

            {/* Gender Dropdown */}
            <div>
              <Label>Gender</Label>
              <Select
                value={slot.gender}
                onValueChange={(val) => setSlot({ ...slot, gender: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="any">Any</SelectItem>
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
              onClick={async () => {
                const confirmDelete = confirm("Are you sure you want to delete this slot?")
                if (!confirmDelete) return

                // Delete from Supabase
                await supabase.from('slots').delete().eq('id', slotId)

                // Redirect back
                router.push('/admin/slots')
              }}
              className="w-full"
            >
              Delete Slot
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
