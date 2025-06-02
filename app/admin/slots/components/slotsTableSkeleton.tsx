import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";

export default function SlotsTableSkeleton() {
  return (
    <Card className="shadow-xl border-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
      <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 bg-gradient-to-r from-white to-neutral-50/50 dark:from-neutral-900 dark:to-neutral-800/50">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Clock className="h-5 w-5 text-green-600 dark:text-green-500" />
            <Skeleton className="h-6 w-40 bg-neutral-200 dark:bg-neutral-700" />
          </CardTitle>
          <div className="flex flex-col w-full gap-2 sm:flex-row sm:items-center sm:w-auto">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-[140px] bg-neutral-200 dark:bg-neutral-700" />
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="overflow-x-auto bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-lg">
          <div className="min-w-[700px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 border-b border-neutral-200 dark:border-neutral-600">
                  {['Sport', 'Time', 'Gender', 'User Type', 'Status', 'Actions'].map((_, i) => (
                    <th key={i} className="p-3 text-left">
                      <Skeleton className="h-4 w-24 bg-neutral-200 dark:bg-neutral-600" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, rowIdx) => (
                  <tr 
                    key={rowIdx} 
                    className={`
                      ${rowIdx % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-50/50 dark:bg-neutral-800/30'}
                      border-t border-neutral-200 dark:border-neutral-700
                    `}
                  >
                    {[...Array(6)].map((_, colIdx) => (
                      <td key={colIdx} className="p-3">
                        <Skeleton className="h-4 w-full bg-neutral-200 dark:bg-neutral-700" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}