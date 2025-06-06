import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      {/* Enhanced Tab Skeleton */}
      <div className="flex justify-center">
        <div className="grid grid-cols-3 max-w-lg w-full bg-muted/50 p-1 rounded-lg">
          {['Overview', 'Bookings', 'Users'].map((tab, i) => (
            <div 
              key={tab}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-300 ${
                i === 0 ? 'bg-background shadow-sm' : 'opacity-60'
              }`}
            >
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* Enhanced Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-32 mt-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="col-span-1 animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${400 + i * 200}ms` }}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-4 w-40 mt-1" />
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="h-full w-full relative overflow-hidden bg-gradient-to-br from-muted/30 via-muted/20 to-muted/30 rounded-lg">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                  
                  {/* Chart controls skeleton */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  
                  {/* Simulated chart bars */}
                  <div className="h-full flex items-end justify-around p-6 gap-2">
                    {Array.from({ length: 6 }).map((_, barIndex) => (
                      <div
                        key={barIndex}
                        className="bg-muted/50 rounded-t animate-pulse"
                        style={{
                          height: `${30 + Math.random() * 50}%`,
                          width: '12%',
                          animationDelay: `${barIndex * 150}ms`,
                          animationDuration: '1.5s'
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Loading indicator */}
                  <div className="absolute bottom-4 left-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-3 h-3 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
                      Loading...
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Large Chart Skeleton */}
        <Card className="animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '800ms' }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-4 w-52 mt-1" />
          </CardHeader>
          <CardContent className="h-[400px]">
            <div className="h-full w-full relative overflow-hidden bg-gradient-to-br from-muted/30 via-muted/20 to-muted/30 rounded-lg">
              {/* Enhanced shimmer effect */}
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
              
              {/* Chart header with controls */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                <div className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-16 rounded-lg" />
                  ))}
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
              
              {/* Simulated line chart */}
              <div className="absolute inset-x-6 bottom-6 top-16">
                <svg className="w-full h-full opacity-30">
                  <path
                    d="M0,80 Q50,20 100,50 T200,40 T300,60 T400,30"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="animate-pulse"
                  />
                  {Array.from({ length: 6 }).map((_, i) => (
                    <circle
                      key={i}
                      cx={i * 60 + 20}
                      cy={40 + Math.random() * 40}
                      r="3"
                      fill="currentColor"
                      className="animate-pulse"
                      style={{ animationDelay: `${i * 200}ms` }}
                    />
                  ))}
                </svg>
              </div>
              
              {/* Loading indicator */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                  <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
                  Loading dashboard...
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}