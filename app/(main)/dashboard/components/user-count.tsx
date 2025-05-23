import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function UserCount({ profiles }: { profiles: any[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Users</CardTitle>
        <CardDescription>Total registered users</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="text-3xl font-bold">{profiles.length}</div>
        <div className="flex items-center pt-1">
          <Users className="h-4 w-4 text-muted-foreground mr-1" />
          <span className="text-xs text-muted-foreground">Active accounts</span>
        </div>
      </CardContent>
    </Card>
  );
}