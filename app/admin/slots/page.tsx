import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import SlotsTable from "./slotsTable";
import SlotsTableSkeleton from "./components/slotsTableSkeleton";

export default async function AdminSlotsPage() {
  const supabase = await createClient();

  // ✅ Fetch slots + joined sport name
  const { data: slots } = await supabase
    .from("slots")
    .select("*, sports(name)");

  // ✅ Sort: by sport name ➜ then by start time
  const sortedSlots = (slots || []).sort((a, b) => {
    const sportA = a.sports?.name?.toLowerCase() || '';
    const sportB = b.sports?.name?.toLowerCase() || '';
    if (sportA < sportB) return -1;
    if (sportA > sportB) return 1;
    return a.start_time.localeCompare(b.start_time);
  });

  return (
    <div className="flex flex-col min-h-screen items-center px-4 py-30 bg-muted/40">
      <div className="w-full max-w-5xl space-y-6">

        {/* ✅ Slots Table Client */}
        <Suspense fallback={<SlotsTableSkeleton />}>
          <SlotsTable slots={sortedSlots} />
        </Suspense>

      </div>
    </div>
  );
}