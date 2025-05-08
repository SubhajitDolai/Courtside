'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
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

  // fetch slot + sports on mount
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

    router.push('/admin/slots') // back to slots list
  }

  if (!slot) return <p>Loading...</p>

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col min-h-screen max-w-full items-center justify-center p-4 space-y-4">

        {/* Sport */}
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

        {/* Start Time */}
        <div>
          <Label>Start Time</Label>
          <Input
            type="time"
            value={slot.start_time}
            onChange={(e) => setSlot({ ...slot, start_time: e.target.value })}
            />
        </div>

        {/* End Time */}
        <div>
          <Label>End Time</Label>
          <Input
            type="time"
            value={slot.end_time}
            onChange={(e) => setSlot({ ...slot, end_time: e.target.value })}
            />
        </div>

        {/* Gender */}
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
              <SelectItem value="select">Select</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
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

        {/* Submit */}
        <Button type="submit">Save Changes</Button>

        {/* Delete Button */}
        <Button
          variant="destructive"
          onClick={async () => {
            const confirmDelete = confirm("Are you sure you want to delete this slot?")
            if (!confirmDelete) return

            // delete from supabase
            await supabase.from('slots').delete().eq('id', slotId)

            // redirect back
            router.push('/admin/slots')
          }}
        >
          Delete Slot
        </Button>

      </form>
    </>
  )
}
