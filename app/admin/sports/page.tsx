import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminSportsPage() {
  const supabase = await createClient()
  const { data: sports } = await supabase.from('sports').select('*')

  return (
    <div className="flex flex-col min-h-screen items-center px-4 py-30 bg-muted">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Manage Sports</h1>
          <Link href="/admin/sports/add">
            <Button>+ Add Sport</Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {sports?.map((sport) => (
            <Card key={sport.id} className="hover:shadow-md transition">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{sport.name}</CardTitle>
                <Link
                  href={`/admin/sports/edit/${sport.id}`}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Edit
                </Link>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Seats: {sport.seat_limit}</p>
                <p>Status: {sport.is_active ? 'Active' : 'Inactive'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
