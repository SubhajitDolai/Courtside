import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminSlotsPage() {
  const supabase = await createClient();

  const { data: slots } = await supabase
    .from("slots")
    .select("*, sports(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4 p-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Slots</h1>
        <Button asChild>
          <Link href="/admin/slots/add">+ Add Slot</Link>
        </Button>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">Sport</th>
              <th className="p-2 text-left">Time</th>
              <th className="p-2 text-left">Gender</th>
              <th className="p-2 text-left">Active</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slots?.map((slot) => (
              <tr key={slot.id} className="border-t">
                <td className="p-2">{slot.sports.name}</td>
                <td className="p-2">
                  {slot.start_time} - {slot.end_time}
                </td>
                <td className="p-2 capitalize">{slot.gender}</td>
                <td className="p-2">{slot.is_active ? "✅" : "❌"}</td>
                <td className="p-2 space-x-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/slots/edit/${slot.id}`}>Edit</Link>
                  </Button>
                  {/* Later: Add delete & toggle active buttons */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
