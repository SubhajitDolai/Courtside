'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

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
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Add New Sport</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                <img
                  src={imageUrl}
                  alt="Sport preview"
                  className="mt-2 max-h-48 w-full object-cover rounded border"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
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
    </div>
  )
}
