// components/slotsTableSkeleton.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SlotsTableSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-2xl font-bold">
          <Skeleton className="h-6 w-40" />
        </CardTitle>
        <div className="flex flex-col w-full gap-2 sm:flex-row sm:items-center sm:w-auto">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-[140px]" />
          ))}
        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto p-0">
        <div className="min-w-[700px]">
          <table className="w-full text-sm border rounded-md">
            <thead>
              <tr className="bg-muted text-muted-foreground">
                {[...Array(6)].map((_, i) => (
                  <th key={i} className="p-3 text-left">
                    <Skeleton className="h-4 w-24" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, rowIdx) => (
                <tr key={rowIdx} className="border-t">
                  {[...Array(6)].map((_, colIdx) => (
                    <td key={colIdx} className="p-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}