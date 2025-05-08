'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useParams } from 'next/navigation'

export default function EditSportPage() {
  const params = useParams<{ id: string }>()
  const sportId = params.id
  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [seatLimit, setSeatLimit] = useState<number>(0)
  const [isActive, setIsActive] = useState(true)
  const router = useRouter()

  // Loads existing sport data
  useEffect(() => {
    async function fetchSport() {
      const supabase = createClient()
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
        alert(error?.message)
      }
    }
    fetchSport()
  }, [sportId])

  // handle submit function to update the parameter
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
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
      router.push('/admin/sports')
    } else {
      alert(error.message)
    }
  }

  // handle delete function to delete the sport
  async function handleDelete() {
    const confirmed = confirm('Are you sure you want to delete this sport? This action cannot be undone.')
    if (!confirmed) return
  
    const supabase = createClient()
    const { error } = await supabase
      .from('sports')
      .delete()
      .eq('id', sportId)
  
    if (!error) {
      router.push('/admin/sports')
    } else {
      alert(error.message)
    }
  }  

  return (
    <div className="flex flex-col min-h-screen max-w-md items-center justify-center p-4 mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Sport</h1>

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

        <Button type="submit">Save Changes</Button>

        <Button 
          type="button" 
          variant="destructive" 
          className="w-full mt-4" 
          onClick={handleDelete}
        >
          Delete Sport
        </Button>

      </form>
    </div>
  )
}
