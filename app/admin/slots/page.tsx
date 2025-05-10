import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminSlotsPage() {
  const supabase = await createClient();

  const { data: slots } = await supabase
    .from("slots")
    .select("*, sports(name)")
    .order("created_at", { ascending: false });

  // ✅ Convert 24hr "HH:MM" to 12hr "h:mm AM/PM"
  const formatTime12hr = (time24: string) => {
    const [hour, minute] = time24.split(":");
    const date = new Date();
    date.setHours(Number(hour), Number(minute));
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  };

  return (
    <div className="flex flex-col min-h-screen items-center px-4 py-30 bg-muted/40">
      <div className="w-full max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manage Slots</h1>
          <Button asChild>
            <Link href="/admin/slots/add">+ Add Slot</Link>
          </Button>
        </div>

        {/* Slots Table */}
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm border rounded-md">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-3 text-left">Sport</th>
                  <th className="p-3 text-left">Time</th>
                  <th className="p-3 text-left">Gender</th>
                  <th className="p-3 text-left">Status</th>
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
                      {formatTime12hr(slot.start_time)} – {formatTime12hr(slot.end_time)}
                    </td>
                    <td className="p-3 capitalize">{slot.gender}</td>
                    <td className="p-3">
                      {slot.is_active ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </td>
                    <td className="p-3 space-x-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/slots/edit/${slot.id}`}>Edit</Link>
                      </Button>
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
    </div>
  );
}