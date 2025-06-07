import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import { Clock, Database } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-green-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-green-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg sm:shadow-xl md:shadow-2xl">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4 sm:mb-6">
            Manage
            <span className="bg-gradient-to-r from-green-600 to-green-500 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent"> Slots</span>
          </h1>

          {/* Stats */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-lg border border-white/20 dark:border-neutral-700/20">
              <Database className="h-4 w-4 text-green-600 dark:text-green-500" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {sortedSlots.length} Slots
              </span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto">
          {/* ✅ Slots Table Client */}
          <Suspense fallback={<SlotsTableSkeleton />}>
            <SlotsTable slots={sortedSlots} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}