import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminSlotsPage() {
  const supabase = await createClient();

  const { data: slots } = await supabase
    .from("slots")
    .select("*, sports(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="pt-30 p-6 min-h-screen bg-muted/40">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Manage Slots</CardTitle>
          <Button asChild>
            <Link href="/admin/slots/add">+ Add Slot</Link>
          </Button>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm border rounded-md">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Sport</th>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">Gender</th>
                <th className="p-3 text-left">Active</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots?.map((slot) => (
                <tr
                  key={slot.id}
                  className="border-t hover:bg-accent transition-colors"
                >
                  <td className="p-3">{slot.sports?.name}</td>
                  <td className="p-3">
                    {slot.start_time} – {slot.end_time}
                  </td>
                  <td className="p-3 capitalize">{slot.gender}</td>
                  <td className="p-3">{slot.is_active ? "✅" : "❌"}</td>
                  <td className="p-3 space-x-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/slots/edit/${slot.id}`}>Edit</Link>
                    </Button>
                    {/* Future: Add delete/toggle */}
                  </td>
                </tr>
              ))}
              {!slots?.length && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    No slots available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
