import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function AdminSportsPage() {
  const supabase = await createClient()
  const { data: sports } = await supabase.from('sports').select('*')

  return (
    <div className="flex flex-col min-h-screen max-w-full items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Sports</h1>

      <Link href="/admin/sports/add" className="bg-blue-500 text-white px-4 py-2 m-2 rounded">+ Add Sport</Link>

      <div className="mt-6 space-y-4">
        {sports?.map((sport) => (
          <div key={sport.id} className="border p-4 rounded flex items-center justify-between">
            <div>
              <h2 className="font-semibold">{sport.name}</h2>
              <p>Seats: {sport.seat_limit}</p>
              <p>Status: {sport.is_active ? 'Active' : 'Inactive'}</p>
            </div>
            <Link href={`/admin/sports/edit/${sport.id}`} className="text-blue-600">Edit</Link>
          </div>
        ))}
      </div>
    </div>
  )
}
