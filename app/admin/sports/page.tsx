import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function AdminSportsPage() {
  const supabase = await createClient()

  // ✅ Fetch & sort sports by name
  const { data: sports } = await supabase
    .from('sports')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div className="flex flex-col min-h-screen items-center px-4 py-30 bg-muted/40">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manage Sports</h1>
          <Button asChild>
            <Link href="/admin/sports/add">+ Add Sport</Link>
          </Button>
        </div>

        {/* Sports List */}
        <div className="grid gap-4">
          {sports?.map((sport) => (
            <Card key={sport.id} className="hover:shadow-md transition">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>{sport.name}</CardTitle>
                  <Badge variant={sport.is_active ? 'default' : 'destructive'}>
                    {sport.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/sports/edit/${sport.id}`}>Edit</Link>
                </Button>
              </CardHeader>

              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>Spots: {sport.seat_limit}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
