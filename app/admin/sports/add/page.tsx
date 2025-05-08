'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export default function AddSportPage() {
  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [seatLimit, setSeatLimit] = useState<number>(2)
  const [isActive, setIsActive] = useState(true)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    const { error } = await supabase.from('sports').insert({
      name,
      image_url: imageUrl,
      seat_limit: seatLimit,
      is_active: isActive,
    })
    if (!error) {
      router.push('/admin/sports')
    } else {
      alert(error.message)
    }
  }

  return (
    <div className="flex flex-col min-h-screen max-w-md items-center justify-center p-4 mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Sport</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <Label>Image URL</Label>
          <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </div>

        <div>
          <Label>Seat Limit</Label>
          <Input
            type="number"
            value={Number.isNaN(seatLimit) ? '' : seatLimit}
            onChange={(e) => setSeatLimit(parseInt(e.target.value))}
            min={1}
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          <Label>Active</Label>
        </div>

        <Button type="submit">Add Sport</Button>
      </form>
    </div>
  )
}
